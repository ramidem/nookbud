-- A profile for every account (R10), with the consent given at sign-up (R8).
-- Spec: USR-1, USR-5, USR-8, PRIV-4, DB-1, DB-3, DB-6.

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) between 1 and 80),
  -- An IANA zone such as 'Asia/Manila'. Null until the person (or their device) sets one.
  time_zone text check (char_length(time_zone) between 1 and 64),
  -- An ISO 4217 code such as 'PHP'.
  currency text check (currency ~ '^[A-Z]{3}$'),
  -- What the person accepted when they signed up. Never changed by the person themselves.
  terms_version text not null,
  terms_accepted_at timestamptz not null,
  adult_confirmed_at timestamptz not null,
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.users is 'One row per account. Personal details only; space data lives elsewhere.';

create trigger set_updated_at before update on public.users
for each row execute function public.set_updated_at();

alter table public.users enable row level security;

create policy "people read their own profile" on public.users
  for select to authenticated using (id = (select auth.uid()));
create policy "people change their own profile" on public.users
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Rows are created by the trigger below and removed with the account, never by the person directly.
-- Only the details a person may correct are writable (USR-6, USR-12); consent stays as recorded.
-- Visitors keep read access to the table so a query answers with no rows; RLS gives them none.
revoke all on public.users from anon, authenticated;
grant select on public.users to anon, authenticated;
grant update (display_name, time_zone, currency, onboarded_at) on public.users to authenticated;

-- Creates the profile when an account is registered. Sign-up sends the consent as user metadata;
-- without both confirmations the account is not created at all.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  zone text := nullif(meta ->> 'time_zone', '');
begin
  if coalesce((meta ->> 'adult_confirmed')::boolean, false) is not true
    or coalesce((meta ->> 'terms_accepted')::boolean, false) is not true
    or nullif(meta ->> 'terms_version', '') is null then
    raise exception 'Sign-up needs the age confirmation and the accepted terms.'
      using errcode = 'P0001', hint = 'consent_required';
  end if;

  -- A time zone the database does not know is dropped rather than refusing the account.
  if zone is not null and not exists (select 1 from pg_catalog.pg_timezone_names where name = zone) then
    zone := null;
  end if;

  insert into public.users (id, time_zone, terms_version, terms_accepted_at, adult_confirmed_at)
  values (new.id, zone, meta ->> 'terms_version', now(), now());
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();
