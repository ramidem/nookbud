# Database

Postgres on Supabase, in `supabase/` at the repo root, run through Nx. The Supabase CLI is pinned in `devDependencies`, so don't use a global one. Docker must be running.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm nx run supabase:db-start` / `db-stop` | Start or stop the local stack (Studio is at http://127.0.0.1:55623) |
| `pnpm nx run supabase:db-reset` | Rebuild from the migrations, then run `seed.sql` and the test helpers |
| `pnpm nx run supabase:db-new --name=add_spaces` | Create an empty, timestamped migration |
| `pnpm nx run supabase:db-test` | Run the pgTAP tests (reset first) |
| `pnpm nx run supabase:db-lint` | Lint our functions in `public` |
| `pnpm nx run supabase:db-check` | What CI runs: Postgres only, reset, lint, test |

## Local ports

The local stack uses the 556xx range, not Supabase's default 543xx, so it can run next to other local Supabase projects: API 55621, database 55622, Studio 55623, Mailpit (the local inbox that catches every email) 55624.

`apps/web/.env.local` points the web app at it. It is ignored by git; fill it from `pnpm exec supabase status -o env` (`API_URL`, `ANON_KEY`, `SERVICE_ROLE_KEY`).

## Tables

### `users`

One profile per account, created by the `on_auth_user_created` trigger when Supabase Auth registers someone, and deleted with the account (`on delete cascade`).

| Column | Notes |
| --- | --- |
| `id` | The account's id in `auth.users` |
| `display_name`, `time_zone`, `currency` | Optional. The person may change these. `time_zone` is an IANA name, `currency` an ISO 4217 code |
| `terms_version`, `terms_accepted_at`, `adult_confirmed_at` | Consent recorded at sign-up (R8). Nobody can change them through the API |
| `onboarded_at` | Set when the person finishes or skips onboarding |
| `shares_with` | The onboarding answer (`partner`, `ex_partner`, `grandparent`, `guardian`, `other_family`, `sole_caregiver`), or null when skipped |

- A person reads and updates only their own row. Inserts and deletes are not granted: the trigger creates rows and account deletion removes them.
- Only `display_name`, `time_zone`, `currency`, `shares_with` and `onboarded_at` are writable (column grants).
- Sign-up must send `adult_confirmed: true`, `terms_accepted: true` and `terms_version` as user metadata. Without them the trigger raises `P0001` with the hint `consent_required` and no account is created. It may also send `time_zone`; an unknown zone is dropped.

### `audit_logs`

Security-sensitive account events (R23): `user_id`, `action` and the time. Never names, emails, addresses or anything a person wrote. A person reads only their own entries. Nobody inserts, changes or deletes rows directly; `record_audit_event(event)` adds one for the signed-in person, and the check constraint lists the allowed actions. `user_id` has no foreign key, so entries outlive a deleted account.

### `mfa_recovery_codes`

SHA-256 hashes of two-step recovery codes, with `used_at`. Row-Level Security is on with no policies and no grants, so only the service role (the web server) can touch it. See [auth.md](auth.md#account-security-stage-4).

### Functions

- `my_sessions()`: the signed-in person's sessions from `auth.sessions` (device, first and last use, which one is current).
- `record_audit_event(event)`: see `audit_logs`.
- `handle_new_user()`: the `users` trigger.

## Rules

- The schema changes only through migrations in `supabase/migrations/`. Never edit the database by hand, and never change a migration that has been applied elsewhere.
- Every table ships with Row-Level Security and an isolation test in the same change (spec SEC-10). A table without RLS fails CI.
- Every table has a UUID primary key and `created_at` and `updated_at`, kept correct by the `set_updated_at()` trigger from the baseline migration.
- `seed.sql` is synthetic data only (spec DB-9). Never run `db push --include-seed` against a real project, because the seed installs the test helpers.
- Keep keys out of anything a client can reach: see [secrets.md](secrets.md).

## Testing

Tests are [pgTAP](https://pgtap.org) files in `supabase/tests/database/`, each rolled back when it ends.

- `001_every_table_has_rls.sql` fails if any table in `public` has no Row-Level Security.
- `003_users.sql` covers the profile table and the consent trigger, `004_account_security.sql` the audit log, sessions and recovery codes.
- `002_users_cannot_see_each_others_rows.sql` is the pattern to copy for a new table: a throwaway table, two users with one row each, then the same query as user A, user B and a signed-out visitor.

The helpers (`create_user`, `who_sees`, `count_as`, `try_as`, `tables_without_rls`) are in `supabase/tests/support/helpers.psql`, in a `tests` schema. `db-reset` installs them as a seed, never as a migration, and the file refuses to install into a database that has users. Row-Level Security usually refuses a write by quietly changing zero rows, so after `try_as`, check the data too.

## Status

- The tables are `users`, `audit_logs` and `mfa_recovery_codes`. Each new table arrives with its requirement.
- Only the local database exists. Production is R42 in [requirements.md](requirements.md).
