# Secrets

Secrets stay on the server and out of git. The Supabase service-role key bypasses every Row-Level Security rule, so if it reached a browser, anyone could read every family's data.

## The rule

- Public values start with `NEXT_PUBLIC_`. Everything else is a secret and never does.
- Read secrets only through `getServerEnv()` in `apps/web/src/env/server.ts`, never `process.env`.
- Never commit a value. `.env*` is ignored, except `apps/web/.env.example`, which lists names only.

| Name | Side | Lives in |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | `apps/web/.env.local`, Vercel |
| `SUPABASE_SERVICE_ROLE_KEY` | secret | `apps/web/.env.local`, Vercel (server only) |
| `SUPABASE_DB_PASSWORD` | secret | your shell and GitHub Actions secrets, for `supabase link` and `db push` |

To run locally, copy `apps/web/.env.example` to `apps/web/.env.local` and fill it in.

## What enforces it

- **`server-only` module.** Importing `env/server.ts` from a client component fails the build.
- **Tests** (`specs/env.spec.ts`). They fail if a secret gets a `NEXT_PUBLIC_` name, an example file holds a value, or a `.env*` file isn't ignored.
- **Bundle check.** `pnpm nx run web:check-secrets` builds with decoy secrets and fails if one, or anything key-shaped, appears in a file a browser can receive. CI runs it.
- **History scan.** CI runs gitleaks over every commit since the fresh start (`94d37c3`), so any new leak fails. Run it yourself: `gitleaks git . --redact --log-opts="94d37c3..HEAD"`.

## Add a secret

1. Name it without `NEXT_PUBLIC_`.
2. Add it to `serverEnvSchema` in `src/env/server.ts` and, name only, to `.env.example`.
3. Add its name to `CANARY_BASE_NAMES` in `scripts/secret-patterns.mjs`.
4. Set it in Vercel as a server-only variable, and in GitHub secrets if CI needs it.

## If one leaks

Rotate it first: create a new one and revoke the old one where it was issued. Removing it from git does not help. Then update it everywhere, and check the service's logs.

## The API

`apps/api` reads no secrets today (only `PORT`). When it needs one, the same rule applies: add a validated env module inside the API, never read `process.env` directly, and never commit a value. The bundle check is web-only because the API never reaches a browser.

## Not covered yet

- The mobile app: when it exists, add `EXPO_PUBLIC_` to `CANARY_PREFIXES` and scan its bundle (R32).
- Real keys and the Vercel, GitHub and Supabase settings (R5, R42).
