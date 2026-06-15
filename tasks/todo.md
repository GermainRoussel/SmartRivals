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

## Phase 1 — Domain + content

- [ ] Port `types.ts` → `types/` (Question, enums)
- [ ] `lib/quiz/validation.ts` — single source of truth (de-duplicate v1 switch)
- [ ] `lib/scoring.ts` — base + time + streak bonus (fix v1 accuracy bug)
- [ ] Port the 21 question components → `components/quiz/types/`
- [ ] `QuestionRenderer` — single type→component map
- [ ] Seed question bank (`lib/quiz/bank.ts`) by theme/difficulty
- [ ] Daily Quiz page (deterministic by date, timer, feedback)
- [ ] Catalog `/types` playground (reuse renderer + validation)
- [ ] Migrate chess to chess.js (legality + real checkmate); drop custom engine gaps
- [ ] Configure `next/image` remotePatterns (unsplash, wikimedia, dicebear, flagcdn)

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
