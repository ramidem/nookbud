-- Attempts at signing in, signing up, resetting a password and entering two-step codes, for
-- the per-account and per-address limits (R16). Spec: AUTH-6, AUTH-7, SEC-6.
--
-- Subjects are SHA-256 hashes of an email or an address, never the values themselves. Rows older
-- than a day are pruned as new ones arrive.
create table public.auth_attempts (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('sign_in', 'sign_up', 'reset', 'resend', 'code')),
  subject text not null check (subject ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index auth_attempts_lookup on public.auth_attempts (kind, subject, created_at desc);

create trigger set_updated_at before update on public.auth_attempts
for each row execute function public.set_updated_at();

alter table public.auth_attempts enable row level security;

-- No policies and no grants: only the web server, with the service role, counts attempts. If
-- visitors could write here, they could lock someone else out on purpose.
revoke all on public.auth_attempts from anon, authenticated;
