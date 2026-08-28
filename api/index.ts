import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sql, { initializeDb } from './db.js';
import { auth as firebaseAuth } from './firebase-admin.js';
import Groq from 'groq-sdk';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import { Resend } from 'resend';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY || 'MISSING_KEY');

// --- Security: Strict API key loading ---
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || (() => { console.warn('WARNING: GROQ_API_KEY not set'); return 'MISSING_KEY'; })()
});

const geminiAi = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || (() => { console.warn('WARNING: GEMINI_API_KEY not set'); return 'MISSING_KEY'; })()
});

const app = express();

// Required when deploying to Vercel/proxies so rate limiters use the correct client IP
app.set('trust proxy', 1);

// JWT handled by Firebase Admin SDK

// LOW-1: Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CRIT-1: Strict CORS — no wildcard in production
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://studyos-snowy.vercel.app',
  'capacitor://localhost',
  'http://localhost',
  'https://localhost',
  'ionic://localhost'
];

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? allowedOrigins
    : '*',
  credentials: true,
}));

// MED-4: Reduce default body size limit
app.use(express.json({ limit: '5mb' }));

// HIGH-2: Global rate limiter
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 attempts per 15 minutes
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
});

// Rate limiter for AI endpoints (prevent API bill abuse)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  message: { error: 'AI rate limit reached. Please wait a moment.' },
});

// --- Zod Validation Schemas ---
// Auth schemas managed by Firebase

const examSchema = z.object({
  name: z.string().min(1).max(255),
  date: z.string().min(1).max(20),
  confidence: z.number().int().min(0).max(100).optional().default(50),
});

const homeworkSchema = z.object({
  title: z.string().min(1).max(255),
  subject: z.string().min(1).max(255),
  due_date: z.string().min(1).max(20),
});

const noteSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().max(100000).optional().default(''),
  folder: z.string().max(255).optional().default('General'),
  tags: z.array(z.string().max(50)).max(20).optional().default([]),
});

const plannerSchema = z.object({
  name: z.string().min(1).max(255),
  start_time: z.string().min(1).max(20),
  end_time: z.string().min(1).max(20),
});

const aiChatSchema = z.object({
  prompt: z.string().min(1).optional(),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system', 'tool', 'ai']),
    content: z.string().nullable().optional(),
    tool_calls: z.any().optional(),
    tool_call_id: z.string().optional(),
  })).optional(),
  customSystemPrompt: z.string().optional(),
  userContext: z.string().optional(),
  providerInfo: z.object({
    provider: z.enum(['groq', 'openrouter', 'nvidia']),
    apiKey: z.string().max(256).optional(),
    model: z.string().max(128).optional(),
  }).optional(),
}).refine(data => data.prompt || data.messages, {
  message: "Either prompt or messages must be provided"
});

// Initialize DB schema on cold start
let dbInitialized = false;
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await initializeDb();
      dbInitialized = true;
    } catch (e) {
      console.error('Failed to initialize DB schema:', e);
    }
  }
  next();
});

// --- Authentication Routes ---

const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  try {
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    if (!decodedToken.email) return res.sendStatus(403);
    
    let users = await sql`SELECT id, email, is_2fa_enabled, verified_auth_times FROM users WHERE email = ${decodedToken.email}`;
    
    // Auto-create user in Postgres if they just signed up via Firebase
    if (users.length === 0) {
      const result = await sql`
        INSERT INTO users (email, password_hash) 
        VALUES (${decodedToken.email}, 'firebase_auth_managed') 
        RETURNING id, email, is_2fa_enabled, verified_auth_times
      `;
      users = result;
    }
    
    const user = users[0];

    // Check 2FA
    if (user.is_2fa_enabled) {
      // Allow 2fa/verify to bypass the block so they can actually submit the code
      if (req.path !== '/api/2fa/verify' && req.path !== '/api/user/me') {
        const authTime = decodedToken.auth_time;
        const verifiedTimes = user.verified_auth_times || [];
        if (!verifiedTimes.includes(authTime)) {
          return res.status(403).json({ error: '2fa_required' });
        }
      }
    }
    
    req.user = { userId: user.id, email: user.email, auth_time: decodedToken.auth_time, is_2fa_enabled: user.is_2fa_enabled, verified_auth_times: user.verified_auth_times || [] };
    next();
  } catch (error) {
    console.error("Firebase auth error:", error);
    return res.sendStatus(403);
  }
};

app.post('/api/user/onboarding', authenticateToken, async (req: any, res: any) => {
  try {
    const { class_level, board } = req.body;
    await sql`
      UPDATE users 
      SET class_level = ${class_level}, board = ${board} 
      WHERE id = ${req.user.userId}
    `;
    
    const updatedUsers = await sql`SELECT id, email, class_level, board FROM users WHERE id = ${req.user.userId}`;
    res.json({ message: 'Onboarding completed', user: updatedUsers[0] });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ error: 'Failed to save onboarding data' });
  }
});

app.get('/api/user/me', authenticateToken, async (req: any, res: any) => {
  try {
    const users = await sql`SELECT id, email, class_level, board, is_2fa_enabled, verified_auth_times FROM users WHERE id = ${req.user.userId}`;
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const user = users[0];
    let requires2FA = false;
    if (user.is_2fa_enabled) {
      const verifiedTimes = user.verified_auth_times || [];
      if (!verifiedTimes.includes(req.user.auth_time)) {
        requires2FA = true;
      }
    }
    
    res.json({ user, requires2FA });
  } catch (error) {
    console.error('Fetch user error:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// --- 2FA Endpoints ---
app.post('/api/2fa/generate', authenticateToken, async (req: any, res: any) => {
  try {
    const secret = speakeasy.generateSecret({ name: `StudyOS (${req.user.email})` });
    
    // Store temporarily in DB
    await sql`UPDATE users SET totp_secret = ${secret.base32} WHERE id = ${req.user.userId}`;
    
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);
    res.json({ qrCodeUrl, secret: secret.base32 });
  } catch (error) {
    console.error('2FA generate error:', error);
    res.status(500).json({ error: 'Failed to generate 2FA secret' });
  }
});

app.post('/api/2fa/enable', authenticateToken, async (req: any, res: any) => {
  try {
    const { token } = req.body;
    const users = await sql`SELECT totp_secret FROM users WHERE id = ${req.user.userId}`;
    const secret = users[0].totp_secret;
    
    if (!secret) return res.status(400).json({ error: '2FA secret not generated' });

    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1 // Allow +/- 30 seconds
    });

    if (verified) {
      // Enable 2FA and trust this current device immediately
      const verifiedTimes = req.user.verified_auth_times || [];
      if (!verifiedTimes.includes(req.user.auth_time)) {
        verifiedTimes.push(req.user.auth_time);
      }
      
      await sql`
        UPDATE users 
        SET is_2fa_enabled = true, verified_auth_times = ${verifiedTimes}
        WHERE id = ${req.user.userId}
      `;
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Invalid 2FA code' });
    }
  } catch (error) {
    console.error('2FA enable error:', error);
    res.status(500).json({ error: 'Failed to enable 2FA' });
  }
});

app.post('/api/2fa/verify', authenticateToken, async (req: any, res: any) => {
  try {
    const { token } = req.body;
    const users = await sql`SELECT totp_secret, verified_auth_times FROM users WHERE id = ${req.user.userId}`;
    const secret = users[0].totp_secret;
    
    if (!secret) return res.status(400).json({ error: '2FA is not enabled' });

    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1
    });

    if (verified) {
      const verifiedTimes = users[0].verified_auth_times || [];
      if (!verifiedTimes.includes(req.user.auth_time)) {
        verifiedTimes.push(req.user.auth_time);
        await sql`
          UPDATE users 
          SET verified_auth_times = ${verifiedTimes}
          WHERE id = ${req.user.userId}
        `;
      }
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Invalid 2FA code' });
    }
  } catch (error) {
    console.error('2FA verify error:', error);
    res.status(500).json({ error: 'Failed to verify 2FA code' });
  }
});

// --- Exams Routes ---
app.get('/api/exams', authenticateToken, async (req: any, res: any) => {
  try {
    const exams = await sql`SELECT * FROM exams WHERE user_id = ${req.user.userId} ORDER BY date ASC`;
    res.json(exams);
  } catch (error) {
    console.error('Fetch exams error:', error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
});
// MED-4: Allow larger body for image uploads only
app.post('/api/exams/extract', express.json({ limit: '5mb' }), authenticateToken, aiLimiter, async (req: any, res: any) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'No image provided' });
    }
    // Limit image size to 4MB base64
    if (imageBase64.length > 4 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image too large. Max 4MB.' });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract the exams list from this image. Return a JSON array of objects with "name" (string) and "date" in YYYY-MM-DD format (string). Do not include any markdown, just the raw JSON array.'
            },
            {
              type: 'image_url',
              image_url: { url: imageBase64 }
            }
          ]
        }
      ],
      model: 'qwen/qwen3.6-27b',
    });

    const resultText = completion.choices[0]?.message?.content || '[]';
    
    const startIndex = resultText.indexOf('[');
    const endIndex = resultText.lastIndexOf(']');
    
    let jsonStr = '[]';
    if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
      jsonStr = resultText.substring(startIndex, endIndex + 1);
    } else {
      jsonStr = resultText.replace(/^\s*```json/m, '').replace(/```\s*$/m, '').trim();
    }

    try {
      const exams = JSON.parse(jsonStr);
      res.json(exams);
    } catch (parseError) {
      console.error("JSON Parse Error. AI returned:", resultText);
      res.status(422).json({ error: 'AI returned invalid format. Please try a clearer image.' });
    }
  } catch (error: any) {
    // HIGH-4: Don't leak error.message to client
    console.error('Extract exams error:', error);
    res.status(500).json({ error: 'Failed to extract exams' });
  }
});

app.post('/api/exams', authenticateToken, async (req: any, res: any) => {
  try {
    const parsed = examSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { name, date, confidence } = parsed.data;
    const result = await sql`
      INSERT INTO exams (user_id, name, date, confidence) 
      VALUES (${req.user.userId}, ${name}, ${date}, ${confidence})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({ error: 'Failed to create exam' });
  }
});

app.put('/api/exams/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { confidence } = req.body;
    const result = await sql`
      UPDATE exams SET confidence = ${confidence} 
      WHERE id = ${req.params.id} AND user_id = ${req.user.userId}
      RETURNING *
    `;
    res.json(result[0]);
  } catch (error) {
    console.error('Update exam error:', error);
    res.status(500).json({ error: 'Failed to update exam' });
  }
});

app.delete('/api/exams/:id', authenticateToken, async (req: any, res: any) => {
  try {
    await sql`DELETE FROM exams WHERE id = ${req.params.id} AND user_id = ${req.user.userId}`;
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete exam error:', error);
    res.status(500).json({ error: 'Failed to delete exam' });
  }
});

// --- Homework Routes ---
app.get('/api/homework', authenticateToken, async (req: any, res: any) => {
  try {
    const homework = await sql`SELECT * FROM homework WHERE user_id = ${req.user.userId} ORDER BY due_date ASC`;
    res.json(homework);
  } catch (error) {
    console.error('Fetch homework error:', error);
    res.status(500).json({ error: 'Failed to fetch homework' });
  }
});

app.post('/api/homework', authenticateToken, async (req: any, res: any) => {
  try {
    const parsed = homeworkSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { title, subject, due_date } = parsed.data;
    const result = await sql`
      INSERT INTO homework (user_id, title, subject, due_date) 
      VALUES (${req.user.userId}, ${title}, ${subject}, ${due_date})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Create homework error:', error);
    res.status(500).json({ error: 'Failed to create homework' });
  }
});

app.put('/api/homework/:id/toggle', authenticateToken, async (req: any, res: any) => {
  try {
    const { completed } = req.body;
    const result = await sql`
      UPDATE homework SET completed = ${completed} 
      WHERE id = ${req.params.id} AND user_id = ${req.user.userId}
      RETURNING *
    `;
    res.json(result[0]);
  } catch (error) {
    console.error('Toggle homework error:', error);
    res.status(500).json({ error: 'Failed to update homework' });
  }
});

app.delete('/api/homework/:id', authenticateToken, async (req: any, res: any) => {
  try {
    await sql`DELETE FROM homework WHERE id = ${req.params.id} AND user_id = ${req.user.userId}`;
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete homework error:', error);
    res.status(500).json({ error: 'Failed to delete homework' });
  }
});

// --- Planner Routes ---
app.get('/api/planner', authenticateToken, async (req: any, res: any) => {
  try {
    const events = await sql`SELECT * FROM planner_events WHERE user_id = ${req.user.userId} ORDER BY start_time ASC`;
    res.json(events);
  } catch (error) {
    console.error('Fetch planner error:', error);
    res.status(500).json({ error: 'Failed to fetch planner events' });
  }
});

app.post('/api/planner', authenticateToken, async (req: any, res: any) => {
  try {
    const parsed = plannerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { name, start_time, end_time } = parsed.data;
    const result = await sql`
      INSERT INTO planner_events (user_id, name, start_time, end_time) 
      VALUES (${req.user.userId}, ${name}, ${start_time}, ${end_time})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Create planner event error:', error);
    res.status(500).json({ error: 'Failed to create planner event' });
  }
});

app.delete('/api/planner/:id', authenticateToken, async (req: any, res: any) => {
  try {
    await sql`DELETE FROM planner_events WHERE id = ${req.params.id} AND user_id = ${req.user.userId}`;
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete planner event error:', error);
    res.status(500).json({ error: 'Failed to delete planner event' });
  }
});

// --- Merged Planner + Routine Endpoint ---
app.get('/api/planner/merged', authenticateToken, async (req: any, res: any) => {
  try {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()];

    // Fetch manual planner events
    const plannerEvents = await sql`SELECT * FROM planner_events WHERE user_id = ${req.user.userId} AND source = 'manual' ORDER BY start_time ASC`;

    // Fetch today's routine blocks
    const routines = await sql`SELECT schedule FROM routines WHERE user_id = ${req.user.userId}`;
    let routineBlocks: any[] = [];
    if (routines.length > 0 && routines[0].schedule && routines[0].schedule[todayName]) {
      routineBlocks = routines[0].schedule[todayName].map((block: any) => ({
        id: `routine-${block.id}`,
        name: block.title,
        start_time: block.start,
        end_time: block.end,
        source: 'routine',
        routine_type: block.type
      }));
    }

    // Merge and sort by start_time
    const merged = [...plannerEvents.map((e: any) => ({ ...e, source: e.source || 'manual' })), ...routineBlocks];
    merged.sort((a: any, b: any) => a.start_time.localeCompare(b.start_time));

    res.json(merged);
  } catch (error) {
    console.error('Fetch merged planner error:', error);
    res.status(500).json({ error: 'Failed to fetch merged planner' });
  }
});

// --- Sync Routine → Planner ---
app.post('/api/routines/sync-planner', authenticateToken, async (req: any, res: any) => {
  try {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()];

    const routines = await sql`SELECT schedule FROM routines WHERE user_id = ${req.user.userId}`;
    if (routines.length === 0) {
      return res.json({ synced: 0 });
    }

    const schedule = routines[0].schedule;
    const todayBlocks = schedule[todayName] || [];

    // Only sync school and class type blocks
    const syncableBlocks = todayBlocks.filter((b: any) => b.type === 'school' || b.type === 'class');

    // Remove old routine-synced events for this user
    await sql`DELETE FROM planner_events WHERE user_id = ${req.user.userId} AND source = 'routine'`;

    // Insert fresh synced blocks
    let synced = 0;
    for (const block of syncableBlocks) {
      await sql`
        INSERT INTO planner_events (user_id, name, start_time, end_time, source) 
        VALUES (${req.user.userId}, ${block.title}, ${block.start}, ${block.end}, 'routine')
      `;
      synced++;
    }

    res.json({ synced, day: todayName });
  } catch (error) {
    console.error('Sync routine to planner error:', error);
    res.status(500).json({ error: 'Failed to sync routine to planner' });
  }
});

// --- Routines Routes ---
const defaultRoutine = {
  "Monday": [],
  "Tuesday": [],
  "Wednesday": [],
  "Thursday": [],
  "Friday": [],
  "Saturday": [],
  "Sunday": []
};

app.get('/api/routines', authenticateToken, async (req: any, res: any) => {
  try {
    const routines = await sql`SELECT schedule FROM routines WHERE user_id = ${req.user.userId}`;
    if (routines.length > 0) {
      res.json(routines[0].schedule);
    } else {
      res.json(defaultRoutine);
    }
  } catch (error) {
    console.error('Fetch routines error:', error);
    res.status(500).json({ error: 'Failed to fetch routines' });
  }
});

app.post('/api/routines', authenticateToken, async (req: any, res: any) => {
  try {
    const { schedule } = req.body;
    const result = await sql`
      INSERT INTO routines (user_id, schedule) 
      VALUES (${req.user.userId}, ${schedule})
      ON CONFLICT (user_id) DO UPDATE SET schedule = EXCLUDED.schedule
      RETURNING schedule
    `;
    res.json(result[0].schedule);
  } catch (error) {
    console.error('Save routines error:', error);
    res.status(500).json({ error: 'Failed to save routines' });
  }
});

app.get('/api/routines/progress', authenticateToken, async (req: any, res: any) => {
  try {
    const { date } = req.query;
    const progress = await sql`SELECT progress, notified_blocks FROM routine_progress WHERE user_id = ${req.user.userId} AND date = ${date}`;
    if (progress.length > 0) {
      res.json(progress[0].progress);
    } else {
      res.json({});
    }
  } catch (error) {
    console.error('Fetch routine progress error:', error);
    res.status(500).json({ error: 'Failed to fetch routine progress' });
  }
});

app.post('/api/routines/progress', authenticateToken, async (req: any, res: any) => {
  try {
    const { date, progress } = req.body;
    const result = await sql`
      INSERT INTO routine_progress (user_id, date, progress, notified_blocks) 
      VALUES (${req.user.userId}, ${date}, ${progress}, '[]')
      ON CONFLICT (user_id, date) DO UPDATE SET progress = EXCLUDED.progress
      RETURNING progress
    `;
    res.json(result[0].progress);
  } catch (error) {
    console.error('Save routine progress error:', error);
    res.status(500).json({ error: 'Failed to save routine progress' });
  }
});

// --- Automated Cron Emails (Missed Routines) ---
app.get('/api/cron/routines', async (req: any, res: any) => {
  // 1. Verify Vercel Cron Secret
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized cron request' });
  }

  try {
    const timeZone = 'Asia/Kolkata'; // Force Indian Standard Time
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long', timeZone });
    
    // format YYYY-MM-DD
    const todayDate = new Date().toLocaleDateString('en-CA', { timeZone });
    const nowTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone });
    const nowTimeDate = new Date(new Date().toLocaleString('en-US', { timeZone }));

    // Fetch all users and their routines
    const routines = await sql`
      SELECT r.user_id, r.schedule, u.email 
      FROM routines r
      JOIN users u ON u.id = r.user_id
    `;

    let emailsSent = 0;

    for (const routine of routines) {
      const todayBlocks = routine.schedule[todayName] || [];
      
      // Calculate yesterday's date & name for overnight blocks
      const yesterday = new Date();
      // Adjust yesterday using the timezone
      const formatter = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: 'numeric', day: 'numeric' });
      // To get yesterday safely, just subtract 24 hours
      const yesterdayDateObj = new Date(new Date().toLocaleString('en-US', { timeZone }));
      yesterdayDateObj.setDate(yesterdayDateObj.getDate() - 1);
      const yesterdayName = yesterdayDateObj.toLocaleDateString('en-US', { weekday: 'long' });
      const yesterdayDateStr = yesterdayDateObj.toLocaleDateString('en-CA');
      const yesterdayBlocks = routine.schedule[yesterdayName] || [];

      // Filter for blocks that have already ended TODAY
      const missedBlocks = todayBlocks.filter((block: any) => {
        // If overnight block (starts today, ends tomorrow), it hasn't ended today!
        if (block.start > block.end) return false;
        return block.end < nowTime;
      }).map((b: any) => ({ ...b, targetDate: todayDate })); // Tag with the date it belongs to

      // Filter for blocks starting within the next 10 minutes TODAY
      const upcomingBlocks = todayBlocks.filter((block: any) => {
        const [hours, minutes] = block.start.split(':').map(Number);
        const blockStartDate = new Date(nowTimeDate);
        blockStartDate.setHours(hours, minutes, 0, 0);
        
        const diffMs = blockStartDate.getTime() - nowTimeDate.getTime();
        const diffMins = diffMs / 60000;
        
        return diffMins > 0 && diffMins <= 10;
      });

      // Filter for overnight blocks that started YESTERDAY and ended TODAY
      const yesterdayMissedBlocks = yesterdayBlocks.filter((block: any) => {
        // Only care about overnight blocks from yesterday
        if (block.start > block.end) {
          return block.end < nowTime;
        }
        return false;
      }).map((b: any) => ({ ...b, targetDate: yesterdayDateStr })); // Belongs to yesterday's progress

      const allMissedBlocks = [...missedBlocks, ...yesterdayMissedBlocks];

      if (allMissedBlocks.length > 0 || upcomingBlocks.length > 0) {
        // Get the progress and notified blocks for this user for today and yesterday
        const todayProgressRes = await sql`SELECT progress, notified_blocks, upcoming_notified_blocks FROM routine_progress WHERE user_id = ${routine.user_id} AND date = ${todayDate}`;
        const yesterdayProgressRes = await sql`SELECT progress, notified_blocks, upcoming_notified_blocks FROM routine_progress WHERE user_id = ${routine.user_id} AND date = ${yesterdayDateStr}`;
        
        let progressMapToday = todayProgressRes.length > 0 ? (todayProgressRes[0].progress || {}) : {};
        let notifiedListToday = todayProgressRes.length > 0 ? (todayProgressRes[0].notified_blocks || []) : [];
        let upcomingNotifiedListToday = todayProgressRes.length > 0 ? (todayProgressRes[0].upcoming_notified_blocks || []) : [];
        
        let progressMapYesterday = yesterdayProgressRes.length > 0 ? (yesterdayProgressRes[0].progress || {}) : {};
        let notifiedListYesterday = yesterdayProgressRes.length > 0 ? (yesterdayProgressRes[0].notified_blocks || []) : [];

        if (todayProgressRes.length === 0 && todayBlocks.length > 0) {
          // Create empty progress row for today so we can track notifications
          await sql`
            INSERT INTO routine_progress (user_id, date, progress, notified_blocks, upcoming_notified_blocks) 
            VALUES (${routine.user_id}, ${todayDate}, '{}', '[]', '[]')
            ON CONFLICT DO NOTHING
          `;
        }

        if (yesterdayProgressRes.length === 0 && yesterdayBlocks.length > 0) {
          // Create empty progress row for yesterday so we can track notifications
          await sql`
            INSERT INTO routine_progress (user_id, date, progress, notified_blocks, upcoming_notified_blocks) 
            VALUES (${routine.user_id}, ${yesterdayDateStr}, '{}', '[]', '[]')
            ON CONFLICT DO NOTHING
          `;
        }

        let updatedToday = false;
        let updatedYesterday = false;

        for (const block of allMissedBlocks) {
          const isYesterday = block.targetDate === yesterdayDateStr;
          const progressMap = isYesterday ? progressMapYesterday : progressMapToday;
          const notifiedList = isYesterday ? notifiedListYesterday : notifiedListToday;

          // If block is not checked off AND we haven't notified them yet
          if (!progressMap[block.id] && !notifiedList.includes(block.id)) {
            // Send email
            await resend.emails.send({
              from: 'StudyOS <onboarding@resend.dev>',
              to: routine.email,
              subject: `Missed Study Block: ${block.title}`,
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 12px;">
                  <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <div style="text-align: center; margin-bottom: 24px;">
                      <h1 style="color: #4f46e5; margin: 0; font-size: 24px;">StudyOS Reminder</h1>
                    </div>
                    <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 16px;">
                      Hi there,
                    </p>
                    <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
                      Your scheduled study block <strong>${block.title}</strong> (${block.start} - ${block.end}) just finished, but you haven't checked it off in StudyOS.
                    </p>
                    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
                      <p style="color: #1e3a8a; margin: 0; font-weight: 500;">
                        Did you complete it? If so, don't forget to tick it off to keep your streak going!
                      </p>
                    </div>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 32px; text-align: center;">
                      Keep up the great work!<br>
                      — The StudyOS Automation Team
                    </p>
                  </div>
                </div>
              `
            });
            emailsSent++;
            notifiedList.push(block.id);
            if (isYesterday) updatedYesterday = true;
            else updatedToday = true;
          }
        }

        // Handle upcoming block emails
        for (const block of upcomingBlocks) {
          if (!upcomingNotifiedListToday.includes(block.id)) {
            // Send upcoming reminder email
            await resend.emails.send({
              from: 'StudyOS <onboarding@resend.dev>',
              to: routine.email,
              subject: `Upcoming: ${block.title} starts soon!`,
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 12px;">
                  <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <div style="text-align: center; margin-bottom: 24px;">
                      <h1 style="color: #4f46e5; margin: 0; font-size: 24px;">StudyOS Reminder</h1>
                    </div>
                    <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 16px;">
                      Hi there,
                    </p>
                    <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
                      Get ready! Your study block <strong>${block.title}</strong> is starting soon (${block.start} - ${block.end}).
                    </p>
                    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
                      <p style="color: #1e3a8a; margin: 0; font-weight: 500;">
                        Grab some water, clear your desk, and get ready to crush this session!
                      </p>
                    </div>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 32px; text-align: center;">
                      You got this!<br>
                      — The StudyOS Automation Team
                    </p>
                  </div>
             </div>
              `
            });
            emailsSent++;
            upcomingNotifiedListToday.push(block.id);
            updatedToday = true;
          }
        }

        // Update the DB arrays
        if (updatedToday) {
          await sql`
            UPDATE routine_progress 
            SET notified_blocks = ${JSON.stringify(notifiedListToday)},
                upcoming_notified_blocks = ${JSON.stringify(upcomingNotifiedListToday)}
            WHERE user_id = ${routine.user_id} AND date = ${todayDate}
          `;
        }
        if (updatedYesterday) {
          await sql`
            UPDATE routine_progress 
            SET notified_blocks = ${JSON.stringify(notifiedListYesterday)}
            WHERE user_id = ${routine.user_id} AND date = ${yesterdayDateStr}
          `;
        }
      }
    }

    res.json({ success: true, emailsSent });
  } catch (error: any) {
    console.error('Cron Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- Notes Routes ---
app.get('/api/notes', authenticateToken, async (req: any, res: any) => {
  try {
    const notes = await sql`SELECT * FROM notes WHERE user_id = ${req.user.userId} ORDER BY updated_at DESC`;
    res.json(notes);
  } catch (error) {
    console.error('Fetch notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

app.post('/api/notes', authenticateToken, async (req: any, res: any) => {
  try {
    const parsed = noteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { title, content, folder, tags } = parsed.data;
    const result = await sql`
      INSERT INTO notes (user_id, title, content, folder, tags) 
      VALUES (${req.user.userId}, ${title}, ${content}, ${folder}, ${JSON.stringify(tags)})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

app.put('/api/notes/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { title, content, folder, tags } = req.body;
    const result = await sql`
      UPDATE notes SET title = ${title}, content = ${content}, folder = ${folder || 'General'}, tags = ${tags ? JSON.stringify(tags) : '[]'}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${req.params.id} AND user_id = ${req.user.userId}
      RETURNING *
    `;
    res.json(result[0]);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

app.delete('/api/notes/:id', authenticateToken, async (req: any, res: any) => {
  try {
    await sql`DELETE FROM notes WHERE id = ${req.params.id} AND user_id = ${req.user.userId}`;
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// --- Analytics Routes ---
app.get('/api/analytics', authenticateToken, async (req: any, res: any) => {
  try {
    // Get last 7 days of study sessions
    const sessions = await sql`
      SELECT date, SUM(duration_minutes) as total_minutes 
      FROM study_sessions 
      WHERE user_id = ${req.user.userId}
      GROUP BY date
      ORDER BY date DESC
      LIMIT 7
    `;
    res.json(sessions);
  } catch (error) {
    console.error('Fetch analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

app.post('/api/study_sessions', authenticateToken, async (req: any, res: any) => {
  try {
    const { duration_minutes, date } = req.body;
    const result = await sql`
      INSERT INTO study_sessions (user_id, duration_minutes, date) 
      VALUES (${req.user.userId}, ${duration_minutes}, ${date})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Create study session error:', error);
    res.status(500).json({ error: 'Failed to log study session' });
  }
});

// --- AI Routes ---

const aiVisionSchema = z.object({
  imageBase64: z.string().min(1)
});

app.post('/api/ai/vision', authenticateToken, aiLimiter, async (req: any, res: any) => {
  try {
    const parsed = aiVisionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { imageBase64 } = parsed.data;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract all text from this image precisely. If there are diagrams, describe them. Do not add conversational filler.' },
            { type: 'image_url', image_url: { url: imageBase64 } }
          ]
        }
      ],
      model: 'qwen/qwen3.6-27b',
      temperature: 0.2,
    });

    res.json({ result: chatCompletion.choices[0]?.message?.content || 'No text extracted.' });
  } catch (error: any) {
    console.error('AI Vision Error:', error);
    res.status(500).json({ error: 'Failed to extract text from image.' });
  }
});
app.post('/api/ai/chat', authenticateToken, aiLimiter, async (req: any, res: any) => {
  try {
    // MED-6 + HIGH-1: Validate and limit prompt size
    const parsed = aiChatSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { prompt, customSystemPrompt, userContext, providerInfo } = parsed.data;

    const baseSystemPrompt = customSystemPrompt || "You are a highly capable, versatile AI assistant. You can be an excellent tutor, but you are happy to discuss ANY topic, answer any question, or assist with any task the user requests, whether it is study-related or not.";
    const fullSystemPrompt = userContext 
      ? `${baseSystemPrompt}\n\nIf the user asks an educational or study-related question, consider that they are a student in: ${userContext}.`
      : baseSystemPrompt;

    let apiMessages: any[] = [{ role: 'system', content: fullSystemPrompt }];
    if (parsed.data.messages && parsed.data.messages.length > 0) {
      const recentMessages = parsed.data.messages.slice(-20);
      let totalChars = 0;
      const MAX_TOTAL_CHARS = 10000;
      // Start from newest messages and keep them until we hit the char limit
      const keptMessages = [];
      for (let i = recentMessages.length - 1; i >= 0; i--) {
        const m = recentMessages[i];
        const contentStr = m.content || "";
        if (totalChars + contentStr.length > MAX_TOTAL_CHARS) {
          const remaining = MAX_TOTAL_CHARS - totalChars;
          if (remaining > 0) {
            keptMessages.unshift({
              role: m.role === 'ai' ? 'assistant' : m.role,
              content: contentStr.slice(-remaining)
            });
          }
          break;
        }
        keptMessages.unshift({
          role: m.role === 'ai' ? 'assistant' : m.role,
          content: contentStr
        });
        totalChars += contentStr.length;
      }
      apiMessages = apiMessages.concat(keptMessages);
    } else if (prompt) {
      apiMessages.push({ role: 'user', content: prompt });
    }

    if (providerInfo && providerInfo.provider === 'nvidia') {
      const apiKey = providerInfo.apiKey;
      const model = providerInfo.model || 'nvidia/nemotron-4-340b-instruct';
      if (!apiKey) return res.status(400).json({ error: 'NVIDIA API Key required' });

      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: apiMessages
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'NVIDIA NIM API Error');
      return res.json({ result: data.choices[0]?.message?.content || 'No response generated.' });
    }

    const tools = [
      {
        type: "function",
        function: {
          name: "create_note",
          description: "Creates a new study note in the user's workspace",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Title of the note" },
              content: { type: "string", description: "Content of the note" },
              folder: { type: "string", description: "Folder name" },
              tags: { type: "array", items: { type: "string" } }
            },
            required: ["title", "content"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_homework",
          description: "Adds a homework assignment to the user's list",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Task description" },
              subject: { type: "string", description: "Subject name" },
              due_date: { type: "string", description: "YYYY-MM-DD format" }
            },
            required: ["title", "subject", "due_date"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_planner_event",
          description: "Adds an event to the user's planner/schedule",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string", description: "Name of the event" },
              start_time: { type: "string", description: "HH:MM format in 24hr time" },
              end_time: { type: "string", description: "HH:MM format in 24hr time" }
            },
            required: ["name", "start_time", "end_time"]
          }
        }
      }
    ];

    let chatCompletion = await groq.chat.completions.create({
      messages: apiMessages,
      model: 'openai/gpt-oss-120b',
      temperature: 0.5,
      tools: tools as any,
      tool_choice: "auto",
    });

    let responseMessage = chatCompletion.choices[0]?.message;

    if (responseMessage?.tool_calls) {
      apiMessages.push(responseMessage);
      
      for (const toolCall of responseMessage.tool_calls) {
        try {
          if (toolCall.function.name === 'create_note') {
            const args = JSON.parse(toolCall.function.arguments);
            await sql`INSERT INTO notes (user_id, title, content, folder, tags) VALUES (${req.user.userId}, ${args.title}, ${args.content}, ${args.folder || 'General'}, ${JSON.stringify(args.tags || [])})`;
            apiMessages.push({ tool_call_id: toolCall.id, role: "tool", name: toolCall.function.name, content: "Note created successfully." });
          } else if (toolCall.function.name === 'create_homework') {
            const args = JSON.parse(toolCall.function.arguments);
            await sql`INSERT INTO homework (user_id, title, subject, due_date) VALUES (${req.user.userId}, ${args.title}, ${args.subject}, ${args.due_date})`;
            apiMessages.push({ tool_call_id: toolCall.id, role: "tool", name: toolCall.function.name, content: "Homework added successfully." });
          } else if (toolCall.function.name === 'create_planner_event') {
            const args = JSON.parse(toolCall.function.arguments);
            await sql`INSERT INTO planner_events (user_id, name, start_time, end_time, source) VALUES (${req.user.userId}, ${args.name}, ${args.start_time}, ${args.end_time}, 'ai')`;
            apiMessages.push({ tool_call_id: toolCall.id, role: "tool", name: toolCall.function.name, content: "Planner event added successfully." });
          } else {
            apiMessages.push({ tool_call_id: toolCall.id, role: "tool", name: toolCall.function.name, content: "Unknown tool." });
          }
        } catch (e: any) {
          apiMessages.push({ tool_call_id: toolCall.id, role: "tool", name: toolCall.function.name, content: "Error executing tool: " + e.message });
        }
      }
      
      chatCompletion = await groq.chat.completions.create({
        messages: apiMessages,
        model: 'openai/gpt-oss-120b',
        temperature: 0.5,
        tools: tools as any,
      });
      responseMessage = chatCompletion.choices[0]?.message;
    }

    res.json({ result: responseMessage?.content || 'No response generated.' });
  } catch (error: any) {
    // HIGH-4: Don't leak internal error details to client
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: `Failed to connect to AI service: ${error.message}` });
  }
});

app.post('/api/ai/flashcards', authenticateToken, aiLimiter, async (req: any, res: any) => {
  try {
    const { content, userContext } = req.body;
    const prompt = `Generate 3-5 flashcards based on these notes:\n\n${content}`;
    const fullSystemPrompt = userContext 
      ? `You are an AI that generates educational flashcards from study notes. The user is in: ${userContext}. Ensure flashcards are appropriate for this grade level. Return ONLY a valid JSON array of objects with "front" and "back" string properties. Do not include markdown formatting like \`\`\`json. Just the raw JSON array.`
      : `You are an AI that generates educational flashcards from study notes. Return ONLY a valid JSON array of objects with "front" and "back" string properties. Do not include markdown formatting like \`\`\`json. Just the raw JSON array.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: fullSystemPrompt },
        { role: 'user', content: prompt }
      ],
      model: 'openai/gpt-oss-120b',
      temperature: 0.3,
    });

    const resultText = completion.choices[0]?.message?.content || '[]';
    const jsonStr = resultText.replace(/^\s*```json/m, '').replace(/```\s*$/m, '').trim();
    res.json(JSON.parse(jsonStr));
  } catch (error) {
    console.error("Groq API Error during flashcard generation:", error);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
});

app.post('/api/ai/quiz', authenticateToken, aiLimiter, async (req: any, res: any) => {
  try {
    const { content, userContext } = req.body;
    const prompt = `Generate a 5-question multiple-choice quiz based on these notes:\n\n${content}`;
    const fullSystemPrompt = userContext 
      ? `You are an AI that generates multiple-choice quizzes from study notes. The user is in: ${userContext}. Ensure the quiz is appropriate for this grade level. Return ONLY a valid JSON array of objects. Each object must have: "question" (string), "options" (array of 4 strings), "correctAnswer" (string, exact match to one of the options), and "explanation" (string). Do not include markdown formatting like \`\`\`json. Just the raw JSON array.`
      : `You are an AI that generates multiple-choice quizzes from study notes. Return ONLY a valid JSON array of objects. Each object must have: "question" (string), "options" (array of 4 strings), "correctAnswer" (string, exact match to one of the options), and "explanation" (string). Do not include markdown formatting like \`\`\`json. Just the raw JSON array.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: fullSystemPrompt },
        { role: 'user', content: prompt }
      ],
      model: 'openai/gpt-oss-120b',
      temperature: 0.3,
    });

    const resultText = completion.choices[0]?.message?.content || '[]';
    const jsonStr = resultText.replace(/^\s*```json/m, '').replace(/```\s*$/m, '').trim();
    res.json(JSON.parse(jsonStr));
  } catch (error) {
    console.error("Groq API Error during quiz generation:", error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

app.post('/api/ai/gemini-vision', authenticateToken, aiLimiter, async (req: any, res: any) => {
  try {
    const { images } = req.body;
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Images array is required' });
    }

    const parts: any[] = [
      { text: "Extract all the visible text from this document accurately. IMPORTANT: This document may contain a corrupted text layer or repeated watermarks (e.g., 'PARVEJ MALLIK'). YOU MUST COMPLETELY IGNORE the embedded text layer and watermarks. Rely ONLY on the visual image of the pages to extract the actual meaningful content (like questions, answers, headers). Maintain formatting if possible. Do not include watermarks in the output." }
    ];

    for (const img of images) {
      if (img.base64Data && img.mimeType) {
        parts.push({
          inlineData: {
            data: img.base64Data.replace(/^data:.*?;base64,/, ''),
            mimeType: img.mimeType
          }
        });
      }
    }

    const response = await geminiAi.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: [
            { role: 'user', parts: parts }
        ]
    });

    const result = response.text || 'No text could be extracted.';
    res.json({ result });
  } catch (error: any) {
    console.error("Gemini Vision API Error:", error);
    res.status(500).json({ error: 'Failed to process document/image' });
  }
});

app.post('/api/ai/extract-routine', authenticateToken, aiLimiter, async (req: any, res: any) => {
  try {
    const { rawData } = req.body;
    if (!rawData || typeof rawData !== 'string' || rawData.trim().length === 0) {
      return res.status(400).json({ error: 'No data provided to extract from.' });
    }

    const systemPrompt = `You are a schedule extraction engine. The user will paste raw data in any format — it could be:
- A JSON object or array (possibly from a database query)
- A SQL query result or INSERT statements
- A CSV or table
- A plain text description like "I wake up at 7am, go to school at 8, study from 3-5pm..."
- Or any other format

Your job: Extract a weekly routine schedule from this data and return it as a strict JSON object.

OUTPUT FORMAT (return ONLY this JSON, no markdown, no explanation):
{
  "Monday": [
    { "id": "mon-1", "title": "Activity Name", "start": "HH:MM", "end": "HH:MM", "type": "study" }
  ],
  "Tuesday": [...],
  "Wednesday": [...],
  "Thursday": [...],
  "Friday": [...],
  "Saturday": [...],
  "Sunday": [...]
}

RULES:
- "type" must be one of: "school", "study", "class", "break", "sleep"
- "start" and "end" must be in 24-hour HH:MM format
- "id" should be a unique string per block (e.g. "mon-1", "tue-2")
- Sort blocks by start time within each day
- If data only describes some days, leave other days as empty arrays []
- If the data describes a single day's pattern, replicate it across all weekdays unless context says otherwise
- If the input is already valid routine JSON, clean it up and return it in the correct format
- NEVER include any text outside the JSON object. Return ONLY the raw JSON.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: rawData }
      ],
      model: 'openai/gpt-oss-120b',
      temperature: 0.1,
      max_tokens: 4096,
    });

    const resultText = completion.choices[0]?.message?.content || '{}';
    // Clean potential markdown fencing
    const jsonStr = resultText.replace(/^\s*```json/m, '').replace(/```\s*$/m, '').trim();
    const parsed = JSON.parse(jsonStr);

    // Validate structure: must have at least one day key
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hasDays = validDays.some(day => Array.isArray(parsed[day]));
    if (!hasDays) {
      return res.status(422).json({ error: 'AI could not extract a valid routine from the provided data. Try providing more structured input.' });
    }

    // Ensure all days exist
    const schedule: Record<string, any[]> = {};
    for (const day of validDays) {
      schedule[day] = Array.isArray(parsed[day]) ? parsed[day] : [];
    }

    res.json({ schedule });
  } catch (error: any) {
    console.error("AI Routine Extraction Error:", error);
    if (error instanceof SyntaxError) {
      return res.status(422).json({ error: 'AI returned an invalid response. Please try again with clearer data.' });
    }
    res.status(500).json({ error: 'Failed to extract routine. Please try again.' });
  }
});

// --- Knowledge DNA Routes ---
app.get('/api/dna', authenticateToken, async (req: any, res: any) => {
  try {
    const dna = await sql`SELECT * FROM knowledge_dna WHERE user_id = ${req.user.userId}`;
    res.json(dna);
  } catch (error) {
    console.error('Fetch DNA error:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge DNA' });
  }
});

app.delete('/api/dna/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const result = await sql`
      DELETE FROM knowledge_dna 
      WHERE id = ${req.params.id} AND user_id = ${req.user.userId}
      RETURNING *
    `;
    if (result.length === 0) {
      return res.status(404).json({ error: 'DNA gene not found' });
    }
    res.json({ message: 'Gene deleted successfully' });
  } catch (error) {
    console.error('Delete DNA error:', error);
    res.status(500).json({ error: 'Failed to delete knowledge DNA' });
  }
});

app.post('/api/dna/compile', authenticateToken, async (req: any, res: any) => {
  try {
    const { content, source_id } = req.body;
    
    const prompt = `Extract the core educational concepts from this text and map their "Knowledge DNA". 
Return ONLY a valid JSON array of objects. Do not include markdown formatting like \`\`\`json. Just the raw JSON array.
Each object MUST have these EXACT keys and types:
- "concept_name" (string)
- "requires" (array of strings: names of prerequisite concepts)
- "leads_to" (array of strings: concepts this enables)
- "abstractness" (number 0.0 to 1.0: how abstract it is)
- "calculation_load" (number 0.0 to 1.0: how much math/logic is needed)
- "visualization_need" (number 0.0 to 1.0: how much visual spatial thinking is needed)
- "memory_difficulty" (number 0.0 to 1.0: how hard it is to memorize)
- "misconceptions" (array of strings: common pitfalls)
- "real_world_uses" (array of strings: practical applications)

Text to compile:
${content}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a Cognitive Compiler. Extract genetic knowledge concepts purely as JSON.' },
        { role: 'user', content: prompt }
      ],
      model: 'openai/gpt-oss-120b',
      temperature: 0.1,
    });

    const resultText = completion.choices[0]?.message?.content || '[]';
    const jsonStr = resultText.replace(/^\s*```json/m, '').replace(/```\s*$/m, '').trim();
    const concepts = JSON.parse(jsonStr);

    const insertedConcepts = [];
    for (const concept of concepts) {
      const result = await sql`
        INSERT INTO knowledge_dna (
          user_id, source_id, concept_name, requires, leads_to, 
          abstractness, calculation_load, visualization_need, memory_difficulty, 
          misconceptions, real_world_uses
        ) VALUES (
          ${req.user.userId}, ${source_id || null}, ${concept.concept_name}, 
          ${JSON.stringify(concept.requires || [])}, ${JSON.stringify(concept.leads_to || [])},
          ${concept.abstractness || 0.5}, ${concept.calculation_load || 0.5}, 
          ${concept.visualization_need || 0.5}, ${concept.memory_difficulty || 0.5},
          ${JSON.stringify(concept.misconceptions || [])}, ${JSON.stringify(concept.real_world_uses || [])}
        )
        RETURNING *
      `;
      insertedConcepts.push(result[0]);
    }

    res.status(201).json(insertedConcepts);
  } catch (error) {
    console.error("Groq DNA Compile Error:", error);
    res.status(500).json({ error: 'Failed to compile Knowledge DNA' });
  }
});

// Do not listen on a port when running on Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
  // Keep the event loop alive in development
  setInterval(() => {}, 1000 * 60 * 60);
}

// Export the app for Vercel serverless function
export default app;
