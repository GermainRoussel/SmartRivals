# CLAUDE.md — SmartRivals

Guidance for Claude Code when working in this repository. Inherits the workspace
principles from `~/dev/CLAUDE.md` (Simplicity First, No Laziness, Minimal Impact,
craft over code). This file adds project-specific context.

## What this is

**SmartRivals** is a competitive, gamified quiz platform (think Kahoot × Duolingo ×
chess.com): a daily brain duel plus real-time multiplayer, with a large library of
question formats (QCM, chess puzzles, logic, blind tests, Wordle-style, etc.).

The UI is playful, rounded, kid-friendly, **in French**. Preserving this visual
identity is a hard requirement — it is the soul of the product.

> History: v1 was a Google AI Studio export (Vite SPA, CDN Tailwind, everything
> mocked). It was rebuilt from scratch on Next.js 16 + Supabase; the rebuild now
> lives on `main`. The v1 source sat under `legacy/` during the port and has been
> removed — it stays recoverable from the pre-rebuild git history if ever needed.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript** (strict)
- **Tailwind CSS v4** (local build) + `tw-animate-css` for `animate-in`/`zoom-in`
- **Supabase** — Auth, Postgres, Realtime, Storage, Row Level Security
- **Zustand** (client UI state) + **TanStack Query** (server state)
- **chess.js** (real move legality + checkmate) driving a custom board UI
- **@dnd-kit** (drag-and-drop question types) · **lucide-react**

> ⚠️ Next.js 16 has breaking changes vs older versions — see `AGENTS.md`. When unsure
> about an API, consult `node_modules/next/dist/docs/` rather than relying on memory.

## Commands

```bash
npm run dev      # dev server (Turbopack) on :3000
npm run build    # production build (also runs tsc + route generation)
npm run lint     # eslint (next/core-web-vitals + typescript)
```

Always run `npm run build` before declaring a change done — it typechecks the whole app.

## Architecture

```
app/
  (auth)/login/            # auth screens (Supabase)
  (app)/                   # authed area — shared AppShell layout
    layout.tsx             #   Sidebar + BottomNav (+ auth guard, Phase 2)
    page.tsx               #   Home
    daily/ multiplayer/ leaderboard/ types/ profile/
  layout.tsx               # root: fonts (Fredoka/Poppins), Providers, <html lang="fr">
  providers.tsx            # "use client" — TanStack Query provider
  globals.css              # Tailwind import + brand @theme tokens
components/
  ui/                      # Button, Logo, BrandName, ComingSoon …
  layout/                  # Sidebar, BottomNav, AppShell, nav.ts (shared nav config)
  quiz/
    QuestionRenderer.tsx   # single map: QuestionType -> component (no duplication)
    types/                 # one component per question format
  chess/ game/
lib/
  supabase/{client,server}.ts   # @supabase/ssr helpers
  quiz/{validation,bank}.ts      # validation = ONE source of truth, used everywhere
  scoring.ts · chess/            # chess.js wrapper
types/                     # domain types (Question, User, …)
supabase/migrations/       # SQL schema + seed (questions bank)
```

Route groups `(auth)` / `(app)` don't affect URLs; they scope layouts.

## Conventions & invariants

- **Brand tokens** live in `app/globals.css` `@theme`: `primary` #3b82f6,
  `secondary` #fbbf24, `sidebar`, `brand-blue` #8bd8ee, `brand-yellow` #fcd172.
  Use `font-display` (Fredoka) for headings, `font-sans` (Poppins) for body.
- The **"SmartRivals" wordmark** (S blue / R yellow) is `<BrandName />` — never re-inline it.
- **Answer validation is centralised** in `lib/quiz/validation.ts`. The v1 code
  duplicated a big `switch` across DailyQuiz and QuizTypes — do not reintroduce that.
- **Scoring** is centralised in `lib/scoring.ts` (base + time bonus + streak bonus).
- **Secrets are server-only.** `NEXT_PUBLIC_*` (Supabase URL + anon key) may reach the
  browser; the service role key and any future AI keys must never be exposed client-side.
- UI copy is **French**; code identifiers and comments are English.

## Question system

Questions are a **seeded static bank** (Postgres, mirrored as TS for local/dev). A
`Question` carries `type`, `theme`, `difficulty`, `text`, and a type-specific payload.
Adding a format = a `types/` component + a `validation.ts` case + bank entries. The
daily quiz is chosen deterministically by date.

## Rebuild roadmap (track in `tasks/todo.md`)

- **Phase 0 — Foundation** ✅ Next.js scaffold, brand tokens/fonts, visual shell, routes.
- **Phase 1 — Domain + content**: port the 21 question types, unify renderer +
  validation + scoring, seed the bank, daily quiz playable, migrate chess to chess.js.
- **Phase 2 — Supabase**: real auth, persistence, real Profile + Leaderboard.
- **Phase 3 — Realtime multiplayer**: rooms, matchmaking, live sync, results.
- **Phase 4 — Polish + verify**: states, a11y, tests for validation/scoring, deploy (Vercel).

## Working agreement

- Plan non-trivial work first; verify with `build` + a screenshot before saying "done".
- Keep changes minimal and in-character with surrounding code.
- After a correction from the user, capture the lesson in `tasks/lessons.md`.
