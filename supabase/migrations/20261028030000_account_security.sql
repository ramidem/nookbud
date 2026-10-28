-- Account security (stage 4): the audit log (R23), signed-in devices (R20) and two-step
-- sign-in recovery codes (R21). Spec: AZ-8, AUTH-4, AUTH-5, DB-1.

-- ---- audit log ------------------------------------------------------------------------------

-- Security-sensitive account events. Ids and the action only: never names, emails, IP addresses
-- or anything a person wrote. `user_id` is kept after the account is gone, so the trail survives.
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  action text not null check (action in (
    'password_changed',
    'password_reset',
    'signed_out_everywhere',
    'two_step_enabled',
    'two_step_disabled',
    'recovery_code_used',
    'account_deleted'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.audit_logs is 'Append-only. Written through record_audit_event(); read by a person only for their own account.';

create index audit_logs_user_id_created_at on public.audit_logs (user_id, created_at desc);

create trigger set_updated_at before update on public.audit_logs
for each row execute function public.set_updated_at();

alter table public.audit_logs enable row level security;

create policy "people read their own account events" on public.audit_logs
  for select to authenticated using (user_id = (select auth.uid()));

-- Nobody writes, changes or deletes entries directly. They are added by the function below.
revoke all on public.audit_logs from anon, authenticated;
grant select on public.audit_logs to anon, authenticated;

-- Records an event for the signed-in person. The action list is the table's check constraint.
create function public.record_audit_event(event text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Sign in to continue.' using errcode = '42501';
  end if;
  insert into public.audit_logs (user_id, action) values ((select auth.uid()), event);
end;
$$;

revoke all on function public.record_audit_event(text) from public, anon;
grant execute on function public.record_audit_event(text) to authenticated;

-- ---- signed-in devices ----------------------------------------------------------------------

-- The signed-in person's sessions, newest use first, with which one is this device. Supabase keeps
-- sessions in `auth`, which the API cannot read, so this exposes only the person's own rows and
-- only what the devices list shows.
create function public.my_sessions()
returns table (id uuid, user_agent text, created_at timestamptz, last_used_at timestamptz, current boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select
    s.id,
    s.user_agent,
    s.created_at,
    coalesce(s.refreshed_at at time zone 'utc', s.updated_at, s.created_at) as last_used_at,
    s.id::text = (select auth.jwt() ->> 'session_id') as current
  from auth.sessions s
  where s.user_id = (select auth.uid())
  order by last_used_at desc;
$$;

revoke all on function public.my_sessions() from public, anon;
grant execute on function public.my_sessions() to authenticated;

-- ---- two-step sign-in recovery codes ---------------------------------------------------------

-- One-time codes for getting back in without the authenticator app. Stored as SHA-256 hashes;
-- the codes themselves are shown once, when two-step sign-in is turned on.
create table public.mfa_recovery_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  code_hash text not null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index mfa_recovery_codes_user_id on public.mfa_recovery_codes (user_id);

create trigger set_updated_at before update on public.mfa_recovery_codes
for each row execute function public.set_updated_at();

alter table public.mfa_recovery_codes enable row level security;

-- No policies: only the server, with the service role, reads or writes these. A person cannot
-- list their hashes, or mark a code unused.
revoke all on public.mfa_recovery_codes from anon, authenticated;
