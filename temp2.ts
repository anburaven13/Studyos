import sql from './api/db.js';

async function main() {
  console.log("Starting migration...");
  
  // 1. Delete the new empty account
  await sql`DELETE FROM users WHERE email = 'debg4171@gmail.com'`;
  console.log("Deleted empty account for debg4171@gmail.com");

  // 2. Update the old account to use the new email
  const res = await sql`UPDATE users SET email = 'debg4171@gmail.com' WHERE email = 'keya.ghosh3110@gmail.com' RETURNING id, email`;
  
  console.log("Successfully migrated account! New data:", res);
  process.exit(0);
}
main();
