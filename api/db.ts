import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

// Connect to Vercel Postgres / Neon DB
let sql: any;
try {
  sql = neon(process.env.POSTGRES_URL || process.env.DATABASE_URL || '');
} catch (e) {
  console.error("Failed to initialize Neon DB at boot. Missing DATABASE_URL?", e);
  sql = async () => { throw new Error("DATABASE_URL is missing in environment variables!"); };
}

// Note: In a serverless environment, we don't automatically run CREATE TABLE on every request.
// We will assume the table is created by the user or via a migration script, but for this MVP,
// we'll run a quick schema check to ensure it exists on the first query.

export const initializeDb = async () => {
  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) return;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      class_level TEXT,
      board TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS exams (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      confidence INTEGER DEFAULT 50,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
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

  await sql`
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

  // Add source column to existing planner_events tables
  await sql`
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='planner_events' AND column_name='source') THEN
            ALTER TABLE planner_events ADD COLUMN source TEXT DEFAULT 'manual';
        END IF;
    END
    $$;
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS routines (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) UNIQUE,
      schedule JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS routine_progress (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      date TEXT NOT NULL,
      progress JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, date)
    );
  `;

  await sql`
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
    
  await sql`
    CREATE TABLE IF NOT EXISTS study_sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      duration_minutes INTEGER NOT NULL,
      date VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    -- Try to alter notes table if the columns don't exist yet (for existing dbs)
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

  await sql`
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

  await sql`
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='routine_progress' AND column_name='notified_blocks') THEN
            ALTER TABLE routine_progress ADD COLUMN notified_blocks JSONB DEFAULT '[]';
        END IF;
    END
    $$;
  `;
};

export default sql;
