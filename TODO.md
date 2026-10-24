# TODO — Fresh Start

> Restarted 2026-10-15 (commit `ddd418d`). The old codebase is in `/Users/ramidem/Code/bulakao/nookbud_copy` (at commit `b8db0b3`, plus uncommitted edits). Copy things back from there when needed. Don't rebuild them from scratch.
>
> This file covers the **next steps for the restart**. The product backlog (P0–P4, launch gates, migrated items) stays in [ROADMAP-2026.md](ROADMAP-2026.md).

---

## 1. Repo basics (now)

- [ ] Remove the stray `~/package-lock.json` from your home folder. It makes Next.js pick `/Users/ramidem` as the workspace root.

## 2. Decisions before scaffolding (ROADMAP step 0.1)

- [ ] Message edit/delete policy (recommended: none in P0)
- [ ] Notification content policy (recommended: "New message" only, never the text)
- [ ] Update `BRAND.md` to the palette and type on the design page: sage `#6f8f7b`, Inter + EB Garamond, spelled "Nookbud".

---

## 3. Files to move back from `nookbud_copy`

Paths are relative to `/Users/ramidem/Code/bulakao/nookbud_copy`.

### When scaffolding — reusable code

| From | To | Notes |
|---|---|---|
| `docs/supabase/schema.sql` | starting point for `supabase/migrations/` | 13 tables with RLS. Replace `relationships` with the `space_members` model and add the P0 tables (invitations, calendar, messages). |
| `libs/design-tokens/src/` | `packages/design-tokens/` | Colors, fonts, sizes, Tailwind presets (native + web). Update after the palette decision. |
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
