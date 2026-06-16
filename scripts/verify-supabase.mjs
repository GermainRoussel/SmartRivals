// Smoke-test the Phase 2 schema end-to-end with the service (admin) key.
// Creates a temp user -> checks the signup trigger -> records an attempt ->
// reads the leaderboard view -> deletes the temp user. Leaves the DB clean.
const url = process.env.SUPABASE_URL;
const key = process.env.SERVICE_KEY;
const H = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

const log = (s, ok, extra = "") => console.log(`${ok ? "✅" : "❌"} ${s}${extra ? " — " + extra : ""}`);

// 1. Admin-create a confirmed user.
const email = `smoketest_${Date.now()}@smartrivals.dev`;
const cu = await fetch(`${url}/auth/v1/admin/users`, {
  method: "POST",
  headers: H,
  body: JSON.stringify({ email, password: "Test123456!", email_confirm: true, user_metadata: { username: "SmokeBot" } }),
});
const user = await cu.json();
log("admin create user", cu.ok, user.id);
if (!cu.ok) { console.error(user); process.exit(1); }

// 2. Trigger should have created a profile.
const pr = await fetch(`${url}/rest/v1/profiles?id=eq.${user.id}&select=username,xp`, { headers: H });
const profiles = await pr.json();
log("signup trigger created profile", profiles.length === 1, JSON.stringify(profiles[0] ?? null));

// 3. Record a daily attempt.
const ia = await fetch(`${url}/rest/v1/quiz_attempts`, {
  method: "POST",
  headers: { ...H, Prefer: "return=representation" },
  body: JSON.stringify({ user_id: user.id, score: 1234, correct_count: 8, total: 10, max_streak: 5 }),
});
const attempt = await ia.json();
log("insert quiz_attempt", ia.ok, ia.ok ? `score ${attempt[0]?.score}` : JSON.stringify(attempt));

// 4. Leaderboard view returns the player.
const lb = await fetch(`${url}/rest/v1/weekly_leaderboard?select=username,total_score,games_played`, { headers: H });
const board = await lb.json();
const row = Array.isArray(board) ? board.find((r) => r.username === "SmokeBot") : null;
log("weekly_leaderboard view", !!row, JSON.stringify(row ?? board));

// 5. Cleanup — delete the temp user (cascades to profile + attempt).
const del = await fetch(`${url}/auth/v1/admin/users/${user.id}`, { method: "DELETE", headers: H });
log("cleanup temp user", del.ok);
