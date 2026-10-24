# Old codebase

The previous Nookbud codebase is at `/Users/ramidem/Code/bulakao/nookbud_copy` (commit `b8db0b3`, plus uncommitted edits to `docs/discovery/4-design/30-ux-patterns.md` and `31-branding.md`, which exist only there). We restarted from scratch on 2026-10-15 (commit `ddd418d`). Copy things back when a requirement needs them. Do not rebuild them from scratch.

Delete this page when `nookbud_copy` is deleted.

Paths below are relative to `nookbud_copy`.

## Reusable when the work arrives

| From | To | Notes |
|---|---|---|
| `docs/supabase/schema.sql` | reference for `supabase/migrations/` | 13 tables with RLS, built on a `relationships` model. Read it for ideas; build each table from [spec.md](spec.md) with its own tests. See `apps/web/docs/database.md`. |
| `libs/design-tokens/src/` | `packages/design-tokens/` | Colors, fonts, sizes, Tailwind presets (native and web). The web tokens already live in `apps/web/src/app/design/_data/tokens.json`; this is for mobile. |
| `apps/mobile/assets/fonts/` | mobile font assets | Inter and EB Garamond `.ttf` files. The web app loads both through `next/font`. |
| `apps/mobile/src/assets/images/logo.png` | mobile assets | |
| `apps/mobile/src/schemas/entry-content.schemas.ts`, `apps/mobile/src/types/entry-content.types.ts` | `packages/validation/`, `packages/shared/` | Zod schemas for expense, event, agreement, communication and upload content |
| `apps/mobile/src/utils/diff.util.ts` | `packages/shared/` | Version diffing for the audit trail |
| `apps/backend/src/app/email/email.templates.ts` | Supabase function or web API route | Invite, reminder and export-ready emails (Resend). Rebrand from "CoParent" to "Nookbud". Used by R6. |
| `.claude/docs/*.md` | `.claude/docs/` | Component, styling, state and performance conventions. Adapt for Expo before copying. |

## Reference only: read, don't copy

- `apps/mobile/src/screens/` and `libs/ui/src/`: old UI flows and components (onboarding, timeline, entries, Spaces, export) to guide the new screens
- `docs/firebase-spec.md`: old data model (Firebase, abandoned)
- `AGENTS.md`, `.agents/skills/`: Nx-specific agent setup

## Don't bring back

- `firestore/` (`google-services.json`, `GoogleService-Info.plist`) and `.gcloudrc`: Firebase and GCP project config
- `node_modules/`, `dist/`, `.nx/`, any `.next/`
- Dockerfiles and `cloudbuild.yaml` files (Cloud Run, replaced by Vercel)
- `apps/web`, `apps/admin`, `apps/design-system`: Next.js starter scaffolds with no real content
- `apps/mobile/src/services/`: about 100 placeholder (`TODO: Firebase`) stubs, nothing real
- `patches/`, `yarn.lock`, `package-lock.json`, `nx.json`, `.yarn/`, `.husky/`: old toolchain
- `prd.json`-era files, `screenshots/`, the root screenshot PNG
