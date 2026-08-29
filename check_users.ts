import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);
sql`SELECT id, email FROM users`.then(console.log).catch(console.error);
