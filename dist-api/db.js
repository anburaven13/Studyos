"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDb = exports.getDbForContext = exports.dbConnections = exports.dbContext = void 0;
const serverless_1 = require("@neondatabase/serverless");
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
const async_hooks_1 = require("async_hooks");
dotenv_1.default.config();
exports.dbContext = new async_hooks_1.AsyncLocalStorage();
const dbUrls = [
    process.env.DATABASE_URL_1 || process.env.POSTGRES_URL || process.env.DATABASE_URL,
    process.env.DATABASE_URL_2,
    process.env.DATABASE_URL_3
].filter(Boolean);
if (dbUrls.length === 0) {
    console.error("Failed to initialize Neon DB at boot. Missing DATABASE_URL?");
}
exports.dbConnections = dbUrls.map(url => {
    try {
        return (0, serverless_1.neon)(url);
    }
    catch (e) {
        console.error("Failed to init DB", e);
        return null;
    }
}).filter(Boolean);
const getDbForContext = () => {
    const context = exports.dbContext.getStore();
    const identifier = context?.email || (context?.id ? context.id.toString() : null);
    // If no context is provided or we only have one DB, default to the LAST available DB
    // (This is so new signups go to the newest active database if older ones are full)
    if (!identifier || exports.dbConnections.length === 1) {
        return exports.dbConnections[exports.dbConnections.length - 1];
    }
    // Consistent hashing based on email/id to select the shard
    const hash = crypto_1.default.createHash('md5').update(identifier).digest('hex');
    const hashInt = parseInt(hash.substring(0, 8), 16);
    const dbIndex = hashInt % exports.dbConnections.length;
    return exports.dbConnections[dbIndex];
};
exports.getDbForContext = getDbForContext;
// Create a Proxy that looks and acts like the `neon()` tagged template literal function
const sqlProxy = new Proxy(() => { }, {
    apply: function (target, thisArg, argumentsList) {
        const db = (0, exports.getDbForContext)();
        if (!db) {
            throw new Error("No database connections available");
        }
        return db.apply(thisArg, argumentsList);
    }
});
// Run migrations on ALL connected databases
const initializeDb = async () => {
    for (let i = 0; i < exports.dbConnections.length; i++) {
        const currentSql = exports.dbConnections[i];
        if (!currentSql)
            continue;
        try {
            await currentSql `
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          class_level TEXT,
          board TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
            await currentSql `
        CREATE TABLE IF NOT EXISTS exams (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          name TEXT NOT NULL,
          date TEXT NOT NULL,
          confidence INTEGER DEFAULT 50,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
            await currentSql `
        CREATE TABLE IF NOT EXISTS homework (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          title TEXT NOT NULL,
          subject TEXT NOT NULL,
          due_date TEXT NOT NULL,
          completed BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
            await currentSql `
        CREATE TABLE IF NOT EXISTS planner_events (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          name TEXT NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT NOT NULL,
          source TEXT DEFAULT 'manual',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
            await currentSql `
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='planner_events' AND column_name='source') THEN
                ALTER TABLE planner_events ADD COLUMN source TEXT DEFAULT 'manual';
            END IF;
        END
        $$;
      `;
            await currentSql `
        CREATE TABLE IF NOT EXISTS routines (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) UNIQUE,
          schedule JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
            await currentSql `
        CREATE TABLE IF NOT EXISTS routine_progress (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          date TEXT NOT NULL,
          progress JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, date)
        );
      `;
            await currentSql `
        CREATE TABLE IF NOT EXISTS notes (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          title VARCHAR(255) NOT NULL,
          content TEXT,
          folder VARCHAR(255) DEFAULT 'General',
          tags JSONB DEFAULT '[]',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
            await currentSql `
        CREATE TABLE IF NOT EXISTS study_sessions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          duration_minutes INTEGER NOT NULL,
          date VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
            await currentSql `
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notes' AND column_name='folder') THEN
                ALTER TABLE notes ADD COLUMN folder VARCHAR(255) DEFAULT 'General';
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notes' AND column_name='tags') THEN
                ALTER TABLE notes ADD COLUMN tags JSONB DEFAULT '[]';
            END IF;
        END
        $$;
      `;
            await currentSql `
        CREATE TABLE IF NOT EXISTS knowledge_dna (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          source_id VARCHAR(255),
          concept_name VARCHAR(255) NOT NULL,
          requires JSONB DEFAULT '[]',
          leads_to JSONB DEFAULT '[]',
          abstractness FLOAT DEFAULT 0.5,
          calculation_load FLOAT DEFAULT 0.5,
          visualization_need FLOAT DEFAULT 0.5,
          memory_difficulty FLOAT DEFAULT 0.5,
          misconceptions JSONB DEFAULT '[]',
          real_world_uses JSONB DEFAULT '[]',
          mastery_level FLOAT DEFAULT 0.0,
          decay_rate FLOAT DEFAULT 0.1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
            await currentSql `
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='routine_progress' AND column_name='notified_blocks') THEN
                ALTER TABLE routine_progress ADD COLUMN notified_blocks JSONB DEFAULT '[]';
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='routine_progress' AND column_name='upcoming_notified_blocks') THEN
                ALTER TABLE routine_progress ADD COLUMN upcoming_notified_blocks JSONB DEFAULT '[]';
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='routine_progress' AND column_name='agenda_sent') THEN
                ALTER TABLE routine_progress ADD COLUMN agenda_sent BOOLEAN DEFAULT false;
            END IF;
        END
        $$;
      `;
            await currentSql `
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_used_totp') THEN
                ALTER TABLE users ADD COLUMN last_used_totp TEXT;
            END IF;
        END
        $$;
      `;
        }
        catch (e) {
            console.error(`Failed to initialize DB${i + 1} schema. It might be suspended due to quota limits. Error:`, e);
        }
    }
};
exports.initializeDb = initializeDb;
exports.default = sqlProxy;
