// Apply a .sql file to the Supabase Postgres database.
// Usage: SUPABASE_DB_URL="postgres://..." node scripts/db-exec.mjs <file.sql>
// The connection string (with password) is passed via env — never hard-coded.
import { readFile } from "node:fs/promises";
import pg from "pg";

const url = process.env.SUPABASE_DB_URL;
const file = process.argv[2];

if (!url || !file) {
  console.error("usage: SUPABASE_DB_URL=... node scripts/db-exec.mjs <file.sql>");
  process.exit(1);
}

const sql = await readFile(file, "utf8");
const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 12000,
});

try {
  await client.connect();
  await client.query(sql);
  console.log(`OK — applied ${file}`);
} catch (err) {
  console.error("ERROR:", err.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
