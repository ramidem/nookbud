# Database

Postgres on Supabase. The project lives in `supabase/` at the repo root and is shared by web and (later) mobile. It is an Nx project, so everything runs through `pnpm nx`. The Supabase CLI is pinned in `devDependencies`; do not use a global one.

Needs Docker running for the local database.

## Layout

```
supabase/
  config.toml        local stack settings (ports, auth defaults)
  migrations/        the only way the schema changes
  seed.sql           synthetic development data, applied after migrations
  functions/         server-side functions (empty for now)
  tests/database/    database tests (empty for now)
```

## Commands

| Command | What it does |
| --- | --- |
| `pnpm nx run supabase:db-start` | Start the whole local stack (database, auth, studio) |
| `pnpm nx run supabase:db-stop` | Stop it |
| `pnpm nx run supabase:db-reset` | Rebuild the local database from the migrations, then run `seed.sql` |
| `pnpm nx run supabase:db-new --name=add_spaces` | Create an empty, timestamped migration |
| `pnpm nx run supabase:db-lint` | Lint the running local database for errors |
| `pnpm nx run supabase:db-check` | What CI runs: start only Postgres, rebuild from migrations, lint, stop |

Local ports are in `config.toml`. Studio is at http://127.0.0.1:54323 once the stack is up.

## Rules

- **The schema changes only through migrations.** Never edit the local database by hand and never change a migration that has been applied anywhere else. Add a new one.
- **Every table ships with Row-Level Security and a forbidden-access test in the same change** (spec SEC-10). A table without RLS is a bug.
- Every table has a UUID primary key, `created_at` and `updated_at`. Attach the baseline helper to keep `updated_at` correct:

  ```sql
  create trigger set_updated_at before update on public.<table>
  for each row execute function public.set_updated_at();
  ```

- **`seed.sql` is synthetic.** Never put real families or children in it (spec DB-9).
- Keep the service-role key and database password out of anything a client can reach.

## What exists

One baseline migration with the `set_updated_at()` trigger function. There are no tables yet. Each table arrives with the requirement that needs it.

The old Firebase-era schema (`nookbud_copy/docs/supabase/schema.sql`, 13 tables) is reference only. It models access through `relationships` and was written before the spec, so importing it would add tables without their RLS tests. Read it for ideas, then build each table from the spec.

## Environments

Local, staging and production are separate Supabase projects. Only local exists today.

Not done yet: creating the staging and production projects, linking them, and pushing migrations through CI. That is item R42 in [docs/requirements.md](requirements.md). Until then, `supabase link` and `supabase db push` are manual and must never be pointed at production by hand.

## CI

`pnpm nx run supabase:db-check` runs in the CI workflow. It fails if the migrations do not build a fresh database or if lint finds an error.

## Auth settings

`config.toml` still has Supabase's local auth defaults, for example email confirmation off. The auth requirements (verification, sessions, redirect URLs) change them as they land.
