-- The parenting schedule (R57) and schedule change requests (R58). Spec: roadmap B2, CAL-2.
--
-- A schedule is one repeating pattern: a list of days, each with the member whose day it is,
-- repeating from a start date. Approved change requests replace the pattern for their days.
-- Every version of the pattern is kept, so the history shows who changed it and when.

create table public.schedules (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null unique references public.spaces (id) on delete cascade,
  starts_on date not null,
  -- One user id per day of the cycle, 1 to 28 days. A day may be unassigned (null).
  pattern uuid[] not null check (cardinality(pattern) between 1 and 28),
  version integer not null default 1,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.schedule_versions (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.schedules (id) on delete cascade,
  version integer not null,
  starts_on date not null,
  pattern uuid[] not null,
  changed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (schedule_id, version)
);

create table public.change_requests (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete cascade,
  starts_on date not null,
  ends_on date not null,
  -- Whose days they would be.
  assignee uuid references auth.users (id) on delete set null,
  reason text check (char_length(reason) <= 500),
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined', 'withdrawn')),
  requested_by uuid references auth.users (id) on delete set null,
  responded_by uuid references auth.users (id) on delete set null,
  responded_at timestamptz,
  response_note text check (char_length(response_note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on >= starts_on and ends_on - starts_on <= 90)
);

create index schedule_versions_changed_by on public.schedule_versions (changed_by);
create index schedules_updated_by on public.schedules (updated_by);
create index change_requests_space on public.change_requests (space_id, starts_on);
create index change_requests_people on public.change_requests (requested_by, responded_by, assignee);

create trigger set_updated_at before update on public.schedules for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.schedule_versions for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.change_requests for each row execute function public.set_updated_at();

alter table public.schedules enable row level security;
alter table public.schedule_versions enable row level security;
alter table public.change_requests enable row level security;

create policy "members read the schedule" on public.schedules
  for select to authenticated using ((select private.is_member(space_id)));
create policy "members read the schedule's history" on public.schedule_versions
  for select to authenticated using (
    exists (select 1 from public.schedules s where s.id = schedule_id and (select private.is_member(s.space_id)))
  );
create policy "members read change requests" on public.change_requests
  for select to authenticated using ((select private.is_member(space_id)));

revoke all on public.schedules, public.schedule_versions, public.change_requests from anon, authenticated;
grant select on public.schedules, public.schedule_versions, public.change_requests to anon, authenticated;

alter table public.audit_logs drop constraint audit_logs_action_check;
alter table public.audit_logs add constraint audit_logs_action_check check (action in (
  'password_changed', 'password_reset', 'signed_out_everywhere', 'two_step_enabled',
  'two_step_disabled', 'recovery_code_used', 'account_deleted',
  'space_created', 'space_renamed', 'space_deleted', 'invitation_sent', 'invitation_revoked',
  'invitation_accepted', 'member_removed', 'member_left', 'role_changed', 'child_added',
  'child_changed', 'child_removed',
  'schedule_changed', 'change_requested', 'change_approved', 'change_declined', 'change_withdrawn'
));

-- R57: an owner sets the pattern. Every day must belong to someone in the space, or no one.
create function public.set_schedule(space uuid, start_date date, days uuid[])
returns void language plpgsql security definer set search_path = '' as $$
declare
  current public.schedules;
begin
  perform private.require_owner(space);
  if cardinality(days) not between 1 and 28 then
    raise exception 'A pattern has between 1 and 28 days.' using errcode = 'P0001', hint = 'invalid';
  end if;
  if exists (
    select 1 from unnest(days) d
    where d is not null and not exists (select 1 from public.space_members m where m.space_id = space and m.user_id = d)
  ) then
    raise exception 'Every day must belong to someone in this space.' using errcode = 'P0001', hint = 'invalid';
  end if;
  select * into current from public.schedules where space_id = space for update;
  if current.id is null then
    insert into public.schedules (space_id, starts_on, pattern, updated_by)
    values (space, start_date, days, (select auth.uid())) returning * into current;
  else
    update public.schedules
    set starts_on = start_date, pattern = days, version = current.version + 1, updated_by = (select auth.uid())
    where id = current.id returning * into current;
  end if;
  insert into public.schedule_versions (schedule_id, version, starts_on, pattern, changed_by)
  values (current.id, current.version, start_date, days, (select auth.uid()));
  perform private.audit(space, 'schedule_changed');
end;
$$;

-- R58: any member asks for some days to be someone's.
create function public.request_change(space uuid, from_date date, to_date date, for_member uuid, why text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  new_id uuid;
begin
  if not private.is_member(space) then
    raise exception 'You are not in this space.' using errcode = '42501';
  end if;
  if to_date < from_date then
    raise exception 'The last day cannot be before the first.' using errcode = 'P0001', hint = 'invalid';
  end if;
  if to_date - from_date > 90 then
    raise exception 'Ask for up to 90 days at a time.' using errcode = 'P0001', hint = 'invalid';
  end if;
  if not exists (select 1 from public.space_members where space_id = space and user_id = for_member) then
    raise exception 'Choose someone in this space.' using errcode = 'P0001', hint = 'invalid';
  end if;
  if (select count(*) from public.change_requests where space_id = space and requested_by = (select auth.uid()) and status = 'pending') >= 10 then
    raise exception 'You have 10 requests waiting already.' using errcode = 'P0001', hint = 'limit';
  end if;
  insert into public.change_requests (space_id, starts_on, ends_on, assignee, reason, requested_by)
  values (space, from_date, to_date, for_member, nullif(btrim(coalesce(why, '')), ''), (select auth.uid()))
  returning id into new_id;
  perform private.audit(space, 'change_requested');
  return new_id;
end;
$$;

-- Anyone in the space except the person who asked approves or declines.
create function public.respond_to_change(request uuid, approve boolean, note text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  r public.change_requests;
begin
  select * into r from public.change_requests where id = request for update;
  if r.id is null or not private.is_member(r.space_id) then
    raise exception 'You are not in this space.' using errcode = '42501';
  end if;
  if r.requested_by = (select auth.uid()) then
    raise exception 'Someone else in the space answers your request.' using errcode = 'P0001', hint = 'self';
  end if;
  if r.status <> 'pending' then
    raise exception 'This request has been answered already.' using errcode = 'P0001', hint = 'used';
  end if;
  update public.change_requests
  set status = case when approve then 'approved' else 'declined' end,
      responded_by = (select auth.uid()), responded_at = now(),
      response_note = nullif(btrim(coalesce(note, '')), '')
  where id = request;
  perform private.audit(r.space_id, case when approve then 'change_approved' else 'change_declined' end);
end;
$$;

create function public.withdraw_change(request uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  r public.change_requests;
begin
  select * into r from public.change_requests where id = request for update;
  if r.id is null or r.requested_by is distinct from (select auth.uid()) or not private.is_member(r.space_id) then
    raise exception 'Only the person who asked can withdraw a request.' using errcode = 'P0001', hint = 'not_author';
  end if;
  if r.status <> 'pending' then
    raise exception 'This request has been answered already.' using errcode = 'P0001', hint = 'used';
  end if;
  update public.change_requests set status = 'withdrawn', responded_at = now() where id = request;
  perform private.audit(r.space_id, 'change_withdrawn');
end;
$$;

do $$
declare
  fn text;
begin
  foreach fn in array array[
    'set_schedule(uuid, date, uuid[])', 'request_change(uuid, date, date, uuid, text)',
    'respond_to_change(uuid, boolean, text)', 'withdraw_change(uuid)'
  ] loop
    execute format('revoke all on function public.%s from public, anon', fn);
    execute format('grant execute on function public.%s to authenticated', fn);
  end loop;
end;
$$;
