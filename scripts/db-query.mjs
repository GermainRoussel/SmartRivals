// Run a read-only SQL query and print rows. Usage:
//   node --env-file=.env.local scripts/db-query.mjs "select ..."
import pg from "pg";
const url = process.env.SUPABASE_DB_URL;
const sql = process.argv[2];
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 12000 });
await client.connect();
const res = await client.query(sql);
console.log(JSON.stringify(res.rows, null, 2));
await client.end();
