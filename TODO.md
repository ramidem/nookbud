# TODO — Fresh Start

> Restarted 2026-10-15 (commit `ddd418d`). The old codebase is in `/Users/ramidem/Code/bulakao/nookbud_copy` (at commit `b8db0b3`, plus uncommitted edits). Copy things back from there when needed. Don't rebuild them from scratch.
>
> This file covers the **next steps for the restart**. The product backlog (P0–P4, launch gates, migrated items) stays in [ROADMAP-2026.md](ROADMAP-2026.md).

---

## 1. Repo basics (now)

- [x] Add `.gitignore`: copy `nookbud_copy/.gitignore` and remove the Nx/React Native/Firebase-specific entries. Make sure `.DS_Store`, `node_modules`, `.next`, `.env*` and `.vercel` are ignored.
- [x] Copy back the editor/format config: `.editorconfig`, `.prettierrc`, `.prettierignore`, `.nvmrc` (Node 22)
- [x] Rewrite `CLAUDE.md`: it still describes the deleted Nx + React Native 0.83 codebase and imports `.claude/docs/*`, which no longer exist. Rewrite it once the stack is decided (step 2).
- [x] Re-enable the `ralph-loop@claude-plugins-official` plugin in a new `.claude/settings.json` (the old one was deleted)
- [ ] Remove the stray `~/package-lock.json` from your home folder. It makes Next.js pick `/Users/ramidem` as the workspace root.

## 2. Decisions before scaffolding (ROADMAP step 0.1)

- [ ] **Stack.** Decided 2026-10-15: **Nx + pnpm** monorepo (instead of the roadmap's Turborepo), **Next.js** web on **Vercel**, **NestJS** API, **Expo** mobile. Still to confirm: Supabase (Postgres + Auth + RLS) as the backend.
- [ ] Child-access policy: which linked adults can read/write which child fields
- [ ] Message edit/delete policy (recommended: none in P0)
- [ ] Retention and deletion rules
- [ ] What happens when one parent deletes their account
- [ ] Notification content policy (recommended: "New message" only, never the text)
- [ ] Brand palette and typography: `BRAND.md` (sage `#4A7C59`, Plus Jakarta Sans) disagrees with the old app (sage `#6F8F7B`, Inter + EB Garamond). Pick one before design tokens are copied back.

## 3. Scaffold (after step 2)

- [x] Monorepo with **one package manager and one committed lockfile**: Nx 23 workspace with pnpm, `pnpm-lock.yaml` only (2026-10-15)
- [x] `apps/web`: Next.js 16 (App Router, `src/`), plain `next.config.js` with no `withNx` wrapper (2026-10-24)
- [ ] Vercel project per web app: Root Directory = the app folder, preview deploys on every push
- [ ] `apps/mobile`: Expo (`pnpm nx add @nx/expo`). Check pnpm compatibility when adding it; React Native tooling may need `nodeLinker: hoisted` in `pnpm-workspace.yaml`.
- [x] `apps/api`: NestJS 11 scaffolded (2026-10-24)
- [ ] Decide whether `apps/api` is needed alongside Supabase server-side functions
- [ ] `supabase/`: migrations, seed, functions, tests (RLS isolation tests before any feature tables)
- [x] Upgrade to Node 24 LTS and Nx 24, all deps to latest (2026-10-24). Held back: NestJS 12 (`@nx/nest` peer `<12`), TypeScript 7 (typescript-eslint `<6.1`), ESLint 10 (eslint-plugin-react/jsx-a11y/import), webpack-dev-server 6 (`@nx/webpack`). Move Node to 26 once it becomes LTS.
- [x] CI: `.github/workflows/ci.yml` runs format check, then lint/test/build/typecheck on every push and PR (no projects yet, so it passes trivially)
- [ ] Then follow ROADMAP-2026 P0 order (steps 0.3 onward)

---

## 4. Files to move back from `nookbud_copy`

> ✅ **"Now" group done 2026-10-15** (docs/discovery, docs/research, logo SVGs, favicons and iOS icon set → `docs/` and `assets/`). Favicons and the iOS icon set landed in `assets/icons/`. `APPNAME.md` was later dropped (2026-10-24). Still to do: the "When scaffolding" items below.

Paths are relative to `/Users/ramidem/Code/bulakao/nookbud_copy`.

### Now — reference docs and brand assets

| From | To | Notes |
|---|---|---|
| `docs/discovery/` | `docs/discovery/` | Research, strategy, ICP, pricing, design docs. **Includes your uncommitted edits to `4-design/30-ux-patterns.md` and `31-branding.md`**, which survive only in the copy. |
| `docs/research/` | `docs/research/` | Competitor, market, regulatory research |
| `assets/brand/logo/` | `assets/brand/logo/` | 4 logo SVG concepts + `LOGO-PROMPT.md`; a logo direction still needs picking |
| `icons/favicon_io/`, `icons/NookBud-icons/` | `assets/icons/` | Favicons and iOS icon set |

### When scaffolding — reusable code

| From | To | Notes |
|---|---|---|
| `docs/supabase/schema.sql` | starting point for `supabase/migrations/` | 13 tables with RLS. Replace `relationships` with the `space_members` model and add the P0 tables (invitations, calendar, messages). |
| `libs/design-tokens/src/` | `packages/design-tokens/` | Colors, fonts, sizes, Tailwind presets (native + web). Update after the palette decision. |
| ~~`apps/landing/*`~~ | `apps/web/src/landing/` | ✅ Brought in 2026-10-24 and redesigned from scratch as the home page of `apps/web` (Tailwind 4, design tokens, no stock art). The old testimonials, persona stories, pricing and trial were dropped: they were invented customers and prices for a product that doesn't exist. "Join the waitlist" is a `mailto:` (`src/landing/config.ts`); swap in a real signup when there is one. Add pricing back once it's decided. |
| `apps/mobile/assets/fonts/` | mobile and web font assets | Inter + EB Garamond `.ttf` files. Only if the palette decision keeps them. |
| `apps/mobile/src/icons/` | mobile icons | 47 Lucide SVGs using `currentColor` |
| `apps/mobile/src/assets/images/logo.png` | mobile assets | |
| `apps/mobile/src/schemas/entry-content.schemas.ts`, `apps/mobile/src/types/entry-content.types.ts` | `packages/validation/`, `packages/shared/` | Zod schemas for expense, event, agreement, communication, upload content |
| `apps/mobile/src/utils/diff.util.ts` | `packages/shared/` | Version diffing for the audit trail |
| `apps/backend/src/app/email/email.templates.ts` | Supabase function or web API route | Invite, reminder, export-ready emails (Resend). Rebrand from "CoParent" to "Nookbud". |
| `.claude/docs/*.md` | `.claude/docs/` | Component, styling, state and performance conventions. Adapt for Expo before copying. |

### Reference only — read, don't copy

- `apps/mobile/src/screens/` and `libs/ui/src/`: old UI flows and components (onboarding, timeline, entries, Spaces, export) to guide the new screens
- `docs/firebase-spec.md`: old data model (Firebase, abandoned)
- `AGENTS.md`, `.agents/skills/`: Nx-specific agent setup

### Don't bring back

- `firestore/` (`google-services.json`, `GoogleService-Info.plist`) and `.gcloudrc`: Firebase/GCP project config
- `node_modules/`, `dist/`, `.nx/`, any `.next/`
- Dockerfiles and `cloudbuild.yaml` files (Cloud Run, replaced by Vercel)
- `apps/web`, `apps/admin`, `apps/design-system`: Next.js starter scaffolds with no real content
- `apps/mobile/src/services/`: about 100 placeholder (`TODO: Firebase`) stubs, nothing real
- `patches/`, `yarn.lock`, `package-lock.json`, `nx.json`, `.yarn/`, `.husky/`: old toolchain
- `prd.json`-era files, `screenshots/`, the root screenshot PNG
