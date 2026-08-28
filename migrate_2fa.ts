import sql from './api/db.ts';

async function migrate() {
  try {
    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS totp_secret VARCHAR(255),
      ADD COLUMN IF NOT EXISTS is_2fa_enabled BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS verified_auth_times BIGINT[] DEFAULT '{}';
    `;
    console.log("Migration successful!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit(0);
  }
}

migrate();
