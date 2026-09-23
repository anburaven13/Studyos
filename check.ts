import { neon } from '@neondatabase/serverless';
const sql = neon('postgresql://neondb_owner:npg_bDwAQBhKG3m9@ep-young-bar-awjvwlwk-pooler.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
async function get() {
    try {
        console.log("Users:", await sql`SELECT * FROM users`);
    } catch (e) {
        console.log(e);
    }
}
get();
