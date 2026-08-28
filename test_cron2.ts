import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.POSTGRES_URL);

async function run() {
  const res = await sql`SELECT user_id, date, notified_blocks, upcoming_notified_blocks FROM routine_progress ORDER BY date DESC LIMIT 5`;
  for (const row of res) {
    console.log(`Date: ${row.date}`);
    console.log(`notified_blocks:`, typeof row.notified_blocks, Array.isArray(row.notified_blocks) ? 'Array' : row.notified_blocks);
    console.log(`upcoming_notified_blocks:`, typeof row.upcoming_notified_blocks, Array.isArray(row.upcoming_notified_blocks) ? 'Array' : row.upcoming_notified_blocks);
    console.log('---');
  }
}
run();
