// Provision SmartRivals bot opponents (B3 — anti cold-start).
//
// Bots are real profiles (they need an auth.users row for the profiles FK), so
// they are created via the admin API rather than a SQL migration. Idempotent:
// re-running reuses existing bot users by email.
//
// Usage:
//   npm run seed:bots
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the env
// (the npm script loads .env.local if present).
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Persona roster: varied skill so solo players meet a believable range.
const BOTS = [
  { email: "robo-debutant@bots.smartrivals.app", username: "Robo-Débutant", accuracy: 0.45, speed: 0.82, label: "Débutant" },
  { email: "cyber-challenger@bots.smartrivals.app", username: "Cyber-Challenger", accuracy: 0.7, speed: 0.55, label: "Confirmé" },
  { email: "megacerveau-9000@bots.smartrivals.app", username: "MégaCerveau 9000", accuracy: 0.9, speed: 0.32, label: "Expert" },
];

async function findUserByEmail(email) {
  // listUsers is paginated; bots are few, a couple of pages is plenty.
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email === email);
    if (hit) return hit;
    if (data.users.length < 200) break;
  }
  return null;
}

async function ensureBot(bot) {
  let user = await findUserByEmail(bot.email);

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email: bot.email,
      password: randomUUID(), // never used; bots don't log in
      email_confirm: true,
      user_metadata: {
        username: bot.username,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(bot.username)}`,
      },
    });
    if (error) throw error;
    user = data.user;
    console.log(`  created auth user ${bot.email}`);
  } else {
    console.log(`  reusing auth user ${bot.email}`);
  }

  // Flag the profile (the handle_new_user trigger already created the row).
  const { error: profErr } = await admin
    .from("profiles")
    .update({ is_bot: true, username: bot.username })
    .eq("id", user.id);
  if (profErr) throw profErr;

  const { error: botErr } = await admin
    .from("bots")
    .upsert({ id: user.id, label: bot.label, accuracy: bot.accuracy, speed: bot.speed });
  if (botErr) throw botErr;
}

try {
  for (const bot of BOTS) {
    console.log(`Seeding ${bot.username}…`);
    await ensureBot(bot);
  }
  console.log(`OK — ${BOTS.length} bots ready.`);
} catch (err) {
  console.error("ERROR:", err.message ?? err);
  process.exitCode = 1;
}
