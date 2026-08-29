import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function checkData() {
  const userId = 8;
  const routines = await sql`SELECT COUNT(*) FROM routines WHERE user_id = ${userId}`;
  const notes = await sql`SELECT COUNT(*) FROM notes WHERE user_id = ${userId}`;
  const exams = await sql`SELECT COUNT(*) FROM exams WHERE user_id = ${userId}`;
  console.log('Routines:', routines[0].count);
  console.log('Notes:', notes[0].count);
  console.log('Exams:', exams[0].count);
}
checkData().catch(console.error);
