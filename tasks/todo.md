# SmartRivals v2 — Rebuild Plan

Branch: `rebuild/v2-nextjs-supabase`
Stack: Next.js 16 (App Router) · Supabase · Tailwind v4 · TS

---

## Phase 0 — Foundation ✅

- [x] New branch + move v1 source to `legacy/` (porting reference)
- [x] Scaffold Next.js 16 + Tailwind v4 + TS
- [x] Install deps (supabase, zustand, react-query, dnd-kit, recharts, chess.js, lucide)
- [x] Brand design tokens + fonts (Fredoka / Poppins) in `globals.css`
- [x] UI primitives: Button, Logo, BrandName, ComingSoon
- [x] Layout shell: Sidebar, BottomNav, AppShell + shared `nav.ts`
- [x] Routes: `(app)` group + Home, placeholders (daily/multi/leaderboard/types/profile), `(auth)/login`
- [x] Supabase client/server helpers + `.env.local.example`
- [x] Exclude `legacy/` from tsconfig + eslint
- [x] `CLAUDE.md` (project) + this file
- [x] Verify: `build` ✓ `lint` ✓ + screenshot of the shell ✓

## Phase 1 — Domain + content ✅

- [x] Port `types.ts` → `types/index.ts` (Question, enums)
- [x] `lib/quiz/validation.ts` — single source of truth (de-duplicated v1 switch)
- [x] `lib/scoring.ts` — base + time + streak bonus (fixed v1 accuracy bug)
- [x] Port the 18 wired question components → `components/quiz/types/`
      (dropped orphaned Simon/Memory)
- [x] `QuestionPlayer` — unified type→UI map + validate/skip (replaces v1 dup)
- [x] Seed question bank (`lib/quiz/bank.ts`), deterministic daily by date
- [x] Daily Quiz page (timer, scoring, streak, result screen)
- [x] Catalog `/types` playground (reuses QuestionPlayer + validation)
- [x] Migrate chess to chess.js (`lib/chess/board.ts` — real legality + checkmate);
      removed custom engine + constants
- [x] Verify: `build` ✓ `lint` ✓ (0 errors) + screenshots (order, true/false,
      chess mate, blind test, connections)
- [n/a] `next/image` remotePatterns — using `<img>` for arbitrary question images

## Phase 2 — Supabase: auth + persistence (code ✅ — awaiting creds to go live)

- [x] SQL schema `supabase/migrations/0001_init.sql`: profiles, quiz_attempts,
      weekly_leaderboard view, RLS, signup trigger
- [x] Supabase helpers: client/server/proxy + `isSupabaseConfigured` (graceful
      degradation while unconfigured — app stays browsable)
- [x] Auth: magic-link login, `/auth/callback`, `proxy.ts` session guard (Next 16
      proxy convention), signOut wired to Sidebar
- [x] Home shows real username; Profile real stats; Leaderboard real data + chart
- [x] Persist daily attempt (server action, no-op when signed out)
- [x] Verify: build ✓ lint ✓; unconfigured app verified (login + profile fallbacks)
- [x] Wire `.env.local` (project eu-west-1) + apply `0001_init.sql` via `scripts/db-exec.mjs`
- [x] Live smoke test ✓ (scripts/verify-supabase.mjs): signup trigger → profile,
      attempt persistence, weekly_leaderboard view; configured app: auth guard +
      enabled login verified in-browser
- [x] Google OAuth: button + flow; provider enabled & verified (authorize ->
      accounts.google.com with valid client_id + redirect_uri)
- [ ] (optional) mirror question bank into DB

## Phase 3 — Realtime multiplayer ✅

- [x] Schema `0002_multiplayer.sql`: rooms, room_players, matchmaking_queue
      (+ RLS + Realtime publication + replica identity full)
- [x] `find_or_create_match` RPC (atomic pair-or-enqueue)
- [x] `lib/multiplayer.ts` (room ops) + `useRoom` realtime hook
- [x] Menu: public matchmaking (queue + realtime match) + private create/join by code
- [x] Room: lobby (live players, host start) → live game (shared deadline,
      synced questions, live scoreboard) → results, reusing QuestionPlayer
- [x] Verified end-to-end (scripts/verify-multiplayer.mjs): realtime join/start/score
      sync with 2 authenticated users + RLS, matchmaking RPC. build ✓ lint ✓
- [ ] (later) host-leave handling, per-room result persistence to history

## Phase 4 — Polish + verify

- [x] States: branded `not-found.tsx` + `error.tsx`; empty/loading states across
      daily, catalog, multiplayer, profile, leaderboard
- [x] Responsive (login verified on mobile) + a11y (aria-labels on icon buttons)
- [x] Vitest + unit tests for validation (13) + scoring (7) — `npm test`, 20 pass
- [x] Remove `legacy/` (port complete; recoverable from pre-rebuild git history);
      cleaned the now-pointless legacy excludes (tsconfig/eslint/vitest)
- [~] Deploy to Vercel: rebuild merged to `main` for deployment; env wiring +
      Supabase URL config are user-side (instructions provided)

---

## Review

### Phase 0
Foundation in place: Next.js 16 + Tailwind v4, full brand identity preserved
(logo, S/R wordmark, Fredoka/Poppins, playful tokens). Visual shell + all routes
browsable with placeholders. `build` and `lint` pass; shell verified by screenshot.

### Phase 1
The whole question domain is live and playable. v1's duplicated validation switch
is now a single `lib/quiz/validation.ts`; scoring is centralised in `lib/scoring.ts`
(accuracy bug fixed). All 18 wired question types render through one `QuestionPlayer`
(used by both the Daily Quiz and the catalog — no duplication). Bank is seeded and
the daily set is deterministic per date. Chess moved off the home-grown engine to
**chess.js** (`lib/chess/board.ts`): real legal moves + genuine checkmate detection
(verified by solving the rook mate-in-1). `build` green, `lint` 0 errors. Remaining
lint warnings are intentional ported-component patterns (downgraded with rationale
in `eslint.config.mjs`).

### Phase 2
Supabase is live on project `hybcxbjuqpbnkgdgzwed` (eu-west-1). Schema applied
(`0001_init.sql`): profiles + quiz_attempts + weekly_leaderboard view, RLS, and a
signup trigger that auto-creates a profile. Auth is magic-link (`/auth/callback`,
Next 16 `proxy.ts` session guard); Home/Profile/Leaderboard read real data and the
Daily Quiz persists results. Everything degrades gracefully when Supabase is absent
(`isSupabaseConfigured`). End-to-end verified with `scripts/verify-supabase.mjs`
(trigger → persistence → leaderboard, then cleanup) and in-browser (guard +
enabled login). Migrations run via `npm run db:migrate -- <file.sql>`.

### Phase 3
Realtime multiplayer on Supabase. `0002_multiplayer.sql` adds rooms /
room_players / matchmaking_queue with RLS, the Realtime publication, and an
atomic `find_or_create_match` RPC. The client uses the browser Supabase client +
`useRoom` (postgres_changes on the room and its players); the host drives
question progression off a shared `question_ends_at` deadline so every client
stays in sync, and each player writes only their own score row (live
scoreboard). Private rooms join by 6-char code; public play uses the matchmaking
RPC + a realtime wait. The game screen reuses the unified `QuestionPlayer`.
Verified end-to-end with two authenticated users (scripts/verify-multiplayer.mjs:
realtime join/start/score sync + matchmaking). Key fix for delivery: propagate
the auth token to the socket (`realtime.setAuth`) before subscribing.

---

## Post-launch audit (deployed on `main`)

Deep line-by-line review of the 21 question types vs validation + bank.

- **P1 — broken-content types** ✅ Differences (real SVG diff scenes),
  Pattern (real solvable SVG sequences), Blind Test (Web Audio synth, Safari-safe).
- **P2 — bug fixes** ✅ Sorting ←/→ keyboard, Anagram stale value, Anagram/Wordle
  auto-validation.
- **P3 — tests** ✅ chess (fenToBoard/legalMoves/moveResult+mate), validation edge
  cases, bank integrity, and jsdom component tests (Anagram/HoleText/TrueFalse +
  QuestionPlayer auto-submit). 40 tests across 5 files. Test files excluded from
  the Next build; run via `npm test`.
- **P4 — content depth** ✅ (content) Bank roughly doubled: +2-3 questions across
  MCQ, T/F, Input, Slider, Anagram, Word-guess, Math, Order, Odd-one-out, Matching,
  Sorting, Hole-text, Connections, Blind-test, Image-MCQ, + 2 verified chess mates.
  New chess integrity test asserts every puzzle's solution is a real mate.
- **P4 — multiplayer host-leave** ✅ `0003_host_handoff.sql` adds a SECURITY DEFINER
  `promote_host` RPC (no-op while host present; else promote earliest-joined
  player, or delete the empty room). The room page calls it when it detects the
  host is gone, so the new host resumes driving progression. Verified end-to-end
  in `scripts/verify-multiplayer.mjs`.
  - Known limit: handoff fires on explicit "Quitter" (row delete); tab-close needs
    Realtime Presence cleanup (future).
- **P4 — multiplayer theme/difficulty** ✅ Private-room create flow now has a setup
  step (theme chips + difficulty). `pickFilteredQuestionIds` draws the room's
  questions from the filter (deterministic, falls back if too narrow); settings
  stored on the room. Covered by tests.
  - Still pending (multiplayer): result history.
