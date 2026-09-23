import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

async function testConnection() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`SELECT count(*) FROM users;`;
    console.log("Success! Data:", result);
  } catch (error) {
    console.error("Connection failed:", error);
  }
}
testConnection();
