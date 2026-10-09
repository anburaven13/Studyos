import { dbConnections } from './api/db';

async function check() {
  const res = await dbConnections[0]`SELECT id, email, is_2fa_enabled, verified_auth_times FROM users WHERE email='keya.ghosh3110@gmail.com'`;
  console.log(res);
  process.exit(0);
}

check();
