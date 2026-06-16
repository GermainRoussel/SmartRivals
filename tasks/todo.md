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

## Phase 2 — Supabase: auth + persistence

- [ ] Create Supabase project, wire env
- [ ] Migrations: profiles, questions, daily_quizzes, quiz_attempts (+ RLS)
- [ ] Auth (magic link + Google), middleware guard, replace fake login
- [ ] Seed questions into DB
- [ ] Persist attempts → real Profile stats + real Leaderboard (weekly chart)

## Phase 3 — Realtime multiplayer

- [ ] Tables: rooms, room_players, matchmaking_queue (+ RLS)
- [ ] Create / join private room by code (Presence)
- [ ] Public matchmaking (queue)
- [ ] Live game: synced questions + live scoreboard (Realtime)
- [ ] Persist results

## Phase 4 — Polish + verify

- [ ] Loading / error / empty states
- [ ] Responsive + accessibility pass
- [ ] Tests for validation + scoring
- [ ] Deploy to Vercel + env wiring
- [ ] Remove `legacy/`

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
