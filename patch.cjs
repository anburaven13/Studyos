const fs = require('fs');
let code = fs.readFileSync('api/index.ts', 'utf8');

// Fix 1, 2, 3, 4, 5, 6
code = code.replace(
  `import Groq from 'groq-sdk';\r\n\r\nconst groq = new Groq({\r\n  apiKey: process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || 'MISSING_KEY'\r\n});\r\n\r\ndotenv.config();\r\n\r\nconst app = express();\r\nconst JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'studyos_super_secret_key_for_dev' : (() => { throw new Error('JWT_SECRET is required in production') })());\r\n\r\napp.use(cors({\r\n  origin: process.env.NODE_ENV === 'production' ? (process.env.FRONTEND_URL || '*') : '*'\r\n}));\r\napp.use(express.json({ limit: '10mb' }));`,
  `import Groq from 'groq-sdk';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'MISSING_KEY'
});

dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'studyos_super_secret_key_for_dev' : (() => { throw new Error('JWT_SECRET is required in production') })());

app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.FRONTEND_URL || 'https://studyos-snowy.vercel.app')
    : '*',
  credentials: true,
}));
app.use(express.json({ limit: '100kb' }));

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests, please try again later.' } }));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Too many login attempts. Please try again in 15 minutes.' } });

const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 15, message: { error: 'AI rate limit reached. Please wait a moment.' } });

const registerSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  password: z.string().min(1, 'Password is required').max(128),
});

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
  content: z.string().max(100000).optional(),
  folder: z.string().max(255).optional().default('General'),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

const plannerSchema = z.object({
  name: z.string().min(1).max(255),
  start_time: z.string().min(1).max(20),
  end_time: z.string().min(1).max(20),
});

const aiChatSchema = z.object({
  prompt: z.string().min(1).max(8000),
  customSystemPrompt: z.string().max(4000).optional(),
  userContext: z.string().max(500).optional(),
  providerInfo: z.object({
    provider: z.enum(['groq', 'openrouter', 'nvidia']),
    apiKey: z.string().max(256).optional(),
    model: z.string().max(128).optional(),
  }).optional(),
});`
);

// Fallback if \r\n wasn't used:
code = code.replace(
  `import Groq from 'groq-sdk';\n\nconst groq = new Groq({\n  apiKey: process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || 'MISSING_KEY'\n});\n\ndotenv.config();\n\nconst app = express();\nconst JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'studyos_super_secret_key_for_dev' : (() => { throw new Error('JWT_SECRET is required in production') })());\n\napp.use(cors({\n  origin: process.env.NODE_ENV === 'production' ? (process.env.FRONTEND_URL || '*') : '*'\n}));\napp.use(express.json({ limit: '10mb' }));`,
  `import Groq from 'groq-sdk';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'MISSING_KEY'
});

dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'studyos_super_secret_key_for_dev' : (() => { throw new Error('JWT_SECRET is required in production') })());

app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.FRONTEND_URL || 'https://studyos-snowy.vercel.app')
    : '*',
  credentials: true,
}));
app.use(express.json({ limit: '100kb' }));

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests, please try again later.' } }));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Too many login attempts. Please try again in 15 minutes.' } });

const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 15, message: { error: 'AI rate limit reached. Please wait a moment.' } });

const registerSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  password: z.string().min(1, 'Password is required').max(128),
});

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
  content: z.string().max(100000).optional(),
  folder: z.string().max(255).optional().default('General'),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

const plannerSchema = z.object({
  name: z.string().min(1).max(255),
  start_time: z.string().min(1).max(20),
  end_time: z.string().min(1).max(20),
});

const aiChatSchema = z.object({
  prompt: z.string().min(1).max(8000),
  customSystemPrompt: z.string().max(4000).optional(),
  userContext: z.string().max(500).optional(),
  providerInfo: z.object({
    provider: z.enum(['groq', 'openrouter', 'nvidia']),
    apiKey: z.string().max(256).optional(),
    model: z.string().max(128).optional(),
  }).optional(),
});`
);

// Fix 7 - Auth routes
code = code.replace(
  `app.post('/api/auth/register', async (req, res) => {\r\n  try {\r\n    const { email, password } = req.body;\r\n    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });\r\n\r\n    const existingUsers = await sql\`SELECT id FROM users WHERE email = \${email}\`;\r\n    if (existingUsers.length > 0) return res.status(400).json({ error: 'Email already in use' });\r\n\r\n    const passwordHash = bcrypt.hashSync(password, 10);`,
  `app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { email, password } = parsed.data;

    const existingUsers = await sql\`SELECT id FROM users WHERE email = \${email}\`;
    if (existingUsers.length > 0) return res.status(400).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 12);`
);
code = code.replace(
  `app.post('/api/auth/register', async (req, res) => {\n  try {\n    const { email, password } = req.body;\n    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });\n\n    const existingUsers = await sql\`SELECT id FROM users WHERE email = \${email}\`;\n    if (existingUsers.length > 0) return res.status(400).json({ error: 'Email already in use' });\n\n    const passwordHash = bcrypt.hashSync(password, 10);`,
  `app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { email, password } = parsed.data;

    const existingUsers = await sql\`SELECT id FROM users WHERE email = \${email}\`;
    if (existingUsers.length > 0) return res.status(400).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 12);`
);

code = code.replace(
  `app.post('/api/auth/login', async (req, res) => {\r\n  try {\r\n    const { email, password } = req.body;\r\n    const users = await sql\`SELECT * FROM users WHERE email = \${email}\`;\r\n    \r\n    if (users.length === 0) return res.status(400).json({ error: 'Invalid credentials' });\r\n    const user = users[0];\r\n    \r\n    const isMatch = bcrypt.compareSync(password, user.password_hash);\r\n    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });\r\n\r\n    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });\r\n    delete user.password_hash;\r\n    res.json({ token, user });`,
  `app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { email, password } = parsed.data;

    const pwRows = await sql\`SELECT id, password_hash FROM users WHERE email = \${email}\`;
    if (pwRows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, pwRows[0].password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const users = await sql\`SELECT id, email, class_level, board FROM users WHERE id = \${pwRows[0].id}\`;
    const user = users[0];

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });`
);
code = code.replace(
  `app.post('/api/auth/login', async (req, res) => {\n  try {\n    const { email, password } = req.body;\n    const users = await sql\`SELECT * FROM users WHERE email = \${email}\`;\n    \n    if (users.length === 0) return res.status(400).json({ error: 'Invalid credentials' });\n    const user = users[0];\n    \n    const isMatch = bcrypt.compareSync(password, user.password_hash);\n    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });\n\n    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });\n    delete user.password_hash;\n    res.json({ token, user });`,
  `app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { email, password } = parsed.data;

    const pwRows = await sql\`SELECT id, password_hash FROM users WHERE email = \${email}\`;
    if (pwRows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, pwRows[0].password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const users = await sql\`SELECT id, email, class_level, board FROM users WHERE id = \${pwRows[0].id}\`;
    const user = users[0];

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });`
);

// Fix 7 - Exams
code = code.replace(
  `app.post('/api/exams/extract', authenticateToken, async (req: any, res: any) => {\n  try {\n    const { imageBase64 } = req.body;\n    if (!imageBase64) {\n      return res.status(400).json({ error: 'No image provided' });\n    }`,
  `app.post('/api/exams/extract', express.json({ limit: '5mb' }), authenticateToken, aiLimiter, async (req: any, res: any) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'No image provided' });
    }
    if (imageBase64.length > 4 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image too large. Max 4MB.' });
    }`
);
code = code.replace(
  `app.post('/api/exams/extract', authenticateToken, async (req: any, res: any) => {\r\n  try {\r\n    const { imageBase64 } = req.body;\r\n    if (!imageBase64) {\r\n      return res.status(400).json({ error: 'No image provided' });\r\n    }`,
  `app.post('/api/exams/extract', express.json({ limit: '5mb' }), authenticateToken, aiLimiter, async (req: any, res: any) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'No image provided' });
    }
    if (imageBase64.length > 4 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image too large. Max 4MB.' });
    }`
);

code = code.replace(
  `app.post('/api/exams', authenticateToken, async (req: any, res: any) => {\n  try {\n    const { name, date, confidence } = req.body;`,
  `app.post('/api/exams', authenticateToken, async (req: any, res: any) => {
  try {
    const parsed = examSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { name, date, confidence } = parsed.data;`
);
code = code.replace(
  `app.post('/api/exams', authenticateToken, async (req: any, res: any) => {\r\n  try {\r\n    const { name, date, confidence } = req.body;`,
  `app.post('/api/exams', authenticateToken, async (req: any, res: any) => {
  try {
    const parsed = examSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { name, date, confidence } = parsed.data;`
);

// Fix 7 - Homework
code = code.replace(
  `app.post('/api/homework', authenticateToken, async (req: any, res: any) => {\n  try {\n    const { title, subject, due_date } = req.body;`,
  `app.post('/api/homework', authenticateToken, async (req: any, res: any) => {
  try {
    const parsed = homeworkSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { title, subject, due_date } = parsed.data;`
);
code = code.replace(
  `app.post('/api/homework', authenticateToken, async (req: any, res: any) => {\r\n  try {\r\n    const { title, subject, due_date } = req.body;`,
  `app.post('/api/homework', authenticateToken, async (req: any, res: any) => {
  try {
    const parsed = homeworkSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { title, subject, due_date } = parsed.data;`
);

// Fix 7 - Planner
code = code.replace(
  `app.post('/api/planner', authenticateToken, async (req: any, res: any) => {\n  try {\n    const { name, start_time, end_time } = req.body;`,
  `app.post('/api/planner', authenticateToken, async (req: any, res: any) => {
  try {
    const parsed = plannerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { name, start_time, end_time } = parsed.data;`
);
code = code.replace(
  `app.post('/api/planner', authenticateToken, async (req: any, res: any) => {\r\n  try {\r\n    const { name, start_time, end_time } = req.body;`,
  `app.post('/api/planner', authenticateToken, async (req: any, res: any) => {
  try {
    const parsed = plannerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { name, start_time, end_time } = parsed.data;`
);

// Fix 7 - Notes
code = code.replace(
  `app.post('/api/notes', authenticateToken, async (req: any, res: any) => {\n  try {\n    const { title, content, folder, tags } = req.body;\n    const result = await sql\`\n      INSERT INTO notes (user_id, title, content, folder, tags) \n      VALUES (\${req.user.userId}, \${title}, \${content}, \${folder || 'General'}, \${tags ? JSON.stringify(tags) : '[]'})\n      RETURNING *\n    \`;`,
  `app.post('/api/notes', authenticateToken, async (req: any, res: any) => {
  try {
    const parsed = noteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { title, content, folder, tags } = parsed.data;
    const result = await sql\`
      INSERT INTO notes (user_id, title, content, folder, tags) 
      VALUES (\${req.user.userId}, \${title}, \${content}, \${folder || 'General'}, \${tags ? JSON.stringify(tags) : '[]'})
      RETURNING *
    \`;`
);
code = code.replace(
  `app.post('/api/notes', authenticateToken, async (req: any, res: any) => {\r\n  try {\r\n    const { title, content, folder, tags } = req.body;\r\n    const result = await sql\`\r\n      INSERT INTO notes (user_id, title, content, folder, tags) \r\n      VALUES (\${req.user.userId}, \${title}, \${content}, \${folder || 'General'}, \${tags ? JSON.stringify(tags) : '[]'})\r\n      RETURNING *\r\n    \`;`,
  `app.post('/api/notes', authenticateToken, async (req: any, res: any) => {
  try {
    const parsed = noteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { title, content, folder, tags } = parsed.data;
    const result = await sql\`
      INSERT INTO notes (user_id, title, content, folder, tags) 
      VALUES (\${req.user.userId}, \${title}, \${content}, \${folder || 'General'}, \${tags ? JSON.stringify(tags) : '[]'})
      RETURNING *
    \`;`
);

// Fix 7 - AI
code = code.replace(
  `app.post('/api/ai/chat', authenticateToken, async (req: any, res: any) => {\n  try {\n    const { prompt, customSystemPrompt, userContext, providerInfo } = req.body;`,
  `app.post('/api/ai/chat', authenticateToken, aiLimiter, async (req: any, res: any) => {
  try {
    const parsed = aiChatSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { prompt, customSystemPrompt, userContext, providerInfo } = parsed.data;`
);
code = code.replace(
  `app.post('/api/ai/chat', authenticateToken, async (req: any, res: any) => {\r\n  try {\r\n    const { prompt, customSystemPrompt, userContext, providerInfo } = req.body;`,
  `app.post('/api/ai/chat', authenticateToken, aiLimiter, async (req: any, res: any) => {
  try {
    const parsed = aiChatSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { prompt, customSystemPrompt, userContext, providerInfo } = parsed.data;`
);

code = code.replace(`app.post('/api/ai/flashcards', authenticateToken, async (req: any, res: any) => {`, `app.post('/api/ai/flashcards', authenticateToken, aiLimiter, async (req: any, res: any) => {`);
code = code.replace(`app.post('/api/ai/quiz', authenticateToken, async (req: any, res: any) => {`, `app.post('/api/ai/quiz', authenticateToken, aiLimiter, async (req: any, res: any) => {`);
code = code.replace(`app.post('/api/ai/extract-routine', authenticateToken, async (req: any, res: any) => {`, `app.post('/api/ai/extract-routine', authenticateToken, aiLimiter, async (req: any, res: any) => {`);

// Fix 8 - Error leakage
code = code.replace(/res\.status\(500\)\.json\(\{\s*error:\s*error\.message\s*\|\|\s*'([^']+)'\s*\}\)/g, "res.status(500).json({ error: '$1' })");
code = code.replace(/res\.status\(500\)\.json\(\{\s*error:\s*`\[Error\] Failed to connect to AI: \$\{error\.message\}`\s*\}\)/g, "res.status(500).json({ error: 'Failed to connect to AI' })");
code = code.replace(/res\.status\(500\)\.json\(\{\s*error:\s*`Failed to extract routine: \$\{error\.message\}`\s*\}\)/g, "res.status(500).json({ error: 'Failed to extract routine' })");

// Fallback for generic res.status(500).json({ error: error.message })
// Looking manually at view_file, there might be other occurrences where error.message is used
// Wait, the prompt said: "In ALL catch blocks, never send error.message to the client. Replace patterns like res.status(500).json({ error: error.message }) or res.status(500).json({ error: \`Failed: \${error.message}\` }) with generic messages like res.status(500).json({ error: 'Failed to process request' })."
// Most catch blocks already use a generic message like `res.status(500).json({ error: 'Failed to extract exams' });` except for the AI endpoints which did `error.message`.
// Let's do a blanket regex:
code = code.replace(/res\.status\((\d+)\)\.json\(\{\s*error:\s*error\.message\s*\}\)/g, "res.status($1).json({ error: 'Failed to process request' })");
code = code.replace(/res\.status\((\d+)\)\.json\(\{\s*error:\s*`[^`]*\$\{error\.message\}[^`]*`\s*\}\)/g, "res.status($1).json({ error: 'Failed to process request' })");

fs.writeFileSync('api/index.ts', code, 'utf8');
console.log('Patched successfully.');
