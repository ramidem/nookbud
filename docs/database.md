# Database

Postgres on Supabase, in `supabase/` at the repo root, run through Nx. The Supabase CLI is pinned in `devDependencies`, so don't use a global one. Docker must be running.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm nx run supabase:db-start` / `db-stop` | Start or stop the local stack (Studio is at http://127.0.0.1:54323) |
| `pnpm nx run supabase:db-reset` | Rebuild from the migrations, then run `seed.sql` and the test helpers |
| `pnpm nx run supabase:db-new --name=add_spaces` | Create an empty, timestamped migration |
| `pnpm nx run supabase:db-test` | Run the pgTAP tests (reset first) |
| `pnpm nx run supabase:db-lint` | Lint our functions in `public` |
| `pnpm nx run supabase:db-check` | What CI runs: Postgres only, reset, lint, test |

## Rules

- The schema changes only through migrations in `supabase/migrations/`. Never edit the database by hand, and never change a migration that has been applied elsewhere.
- Every table ships with Row-Level Security and an isolation test in the same change (spec SEC-10). A table without RLS fails CI.
- Every table has a UUID primary key and `created_at` and `updated_at`, kept correct by the `set_updated_at()` trigger from the baseline migration.
- `seed.sql` is synthetic data only (spec DB-9). Never run `db push --include-seed` against a real project, because the seed installs the test helpers.
- Keep keys out of anything a client can reach: see [secrets.md](secrets.md).

## Testing

Tests are [pgTAP](https://pgtap.org) files in `supabase/tests/database/`, each rolled back when it ends.

- `001_every_table_has_rls.sql` fails if any table in `public` has no Row-Level Security.
- `002_users_cannot_see_each_others_rows.sql` is the pattern to copy for a new table: a throwaway table, two users with one row each, then the same query as user A, user B and a signed-out visitor.

The helpers (`create_user`, `who_sees`, `count_as`, `try_as`, `tables_without_rls`) are in `supabase/tests/support/helpers.psql`, in a `tests` schema. `db-reset` installs them as a seed, never as a migration, and the file refuses to install into a database that has users. Row-Level Security usually refuses a write by quietly changing zero rows, so after `try_as`, check the data too.

## Status

- Only the baseline migration and the test helpers exist. There are no tables yet; each arrives with its requirement.
- Only the local database exists. Staging and production are R42 in [requirements.md](requirements.md).
- `config.toml` still has Supabase's local auth defaults (email confirmation off). The auth requirements change them.
