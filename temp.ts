import sql from './api/db.js';

async function main() {
  const users = await sql`SELECT id, email FROM users`;
  console.log("Users:", users);
  process.exit(0);
}
main();
async function main() {
  const users = await sql\SELECT id, email FROM users\;
  console.log(users);
  process.exit(0);
}
main();
