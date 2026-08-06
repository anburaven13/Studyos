import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import sql, { initializeDb } from './db.js';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || 'MISSING_KEY'
});

dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'studyos_super_secret_key_for_dev' : (() => { throw new Error('JWT_SECRET is required in production') })());

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? (process.env.FRONTEND_URL || '*') : '*'
}));
app.use(express.json());

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

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const existingUsers = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existingUsers.length > 0) return res.status(400).json({ error: 'Email already in use' });

    const passwordHash = bcrypt.hashSync(password, 10);
    const result = await sql`
      INSERT INTO users (email, password_hash) 
      VALUES (${email}, ${passwordHash}) 
      RETURNING id, email
    `;
    
    const user = result[0];
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    
    if (users.length === 0) return res.status(400).json({ error: 'Invalid credentials' });
    const user = users[0];
    
    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    delete user.password_hash;
    res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Middleware to verify JWT
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
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
    const users = await sql`SELECT id, email, class_level, board FROM users WHERE id = ${req.user.userId}`;
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ user: users[0] });
  } catch (error) {
    console.error('Fetch user error:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
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

app.post('/api/exams', authenticateToken, async (req: any, res: any) => {
  try {
    const { name, date, confidence } = req.body;
    const result = await sql`
      INSERT INTO exams (user_id, name, date, confidence) 
      VALUES (${req.user.userId}, ${name}, ${date}, ${confidence || 50})
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
    const { title, subject, due_date } = req.body;
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
    const { name, start_time, end_time } = req.body;
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
    const progress = await sql`SELECT progress FROM routine_progress WHERE user_id = ${req.user.userId} AND date = ${date}`;
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
      INSERT INTO routine_progress (user_id, date, progress) 
      VALUES (${req.user.userId}, ${date}, ${progress})
      ON CONFLICT (user_id, date) DO UPDATE SET progress = EXCLUDED.progress
      RETURNING progress
    `;
    res.json(result[0].progress);
  } catch (error) {
    console.error('Save routine progress error:', error);
    res.status(500).json({ error: 'Failed to save routine progress' });
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
    const { title, content, folder, tags } = req.body;
    const result = await sql`
      INSERT INTO notes (user_id, title, content, folder, tags) 
      VALUES (${req.user.userId}, ${title}, ${content}, ${folder || 'General'}, ${tags ? JSON.stringify(tags) : '[]'})
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
app.post('/api/ai/chat', authenticateToken, async (req: any, res: any) => {
  try {
    const { prompt, customSystemPrompt, userContext, providerInfo } = req.body;
    const baseSystemPrompt = customSystemPrompt || "You are a highly capable, versatile AI assistant. You can be an excellent tutor, but you are happy to discuss ANY topic, answer any question, or assist with any task the user requests, whether it is study-related or not.";
    const fullSystemPrompt = userContext 
      ? `${baseSystemPrompt}\n\nIf the user asks an educational or study-related question, consider that they are a student in: ${userContext}.`
      : baseSystemPrompt;

    if (providerInfo && providerInfo.provider === 'nvidia') {
      const apiKey = providerInfo.apiKey;
      const model = providerInfo.model || 'nvidia/nemotron-4-340b-instruct'; // nemotron-3-ultra-550b isn't a standard NIM model id usually, but keeping user preference
      if (!apiKey) return res.status(400).json({ error: 'NVIDIA API Key required' });

      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: fullSystemPrompt },
            { role: 'user', content: prompt }
          ]
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'NVIDIA NIM API Error');
      return res.json({ result: data.choices[0]?.message?.content || 'No response generated.' });
    }

    // Default Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: fullSystemPrompt },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 1024,
    });

    res.json({ result: chatCompletion.choices[0]?.message?.content || 'No response generated.' });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: `[Error] Failed to connect to AI: ${error.message}` });
  }
});

app.post('/api/ai/flashcards', authenticateToken, async (req: any, res: any) => {
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
      model: 'llama-3.3-70b-versatile',
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

app.post('/api/ai/quiz', authenticateToken, async (req: any, res: any) => {
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
      model: 'llama-3.3-70b-versatile',
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
      model: 'llama-3.3-70b-versatile',
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
