-- Records and their history (R54, R55), with calendar events as one type of record (R56).
-- Spec: REC-1..5, AUD-1, AUD-2, CAL-1, CAL-2, D7.
--
-- An entry is never overwritten. `entries` holds who added it, when, and a copy of the latest
-- version's searchable fields; `entry_versions` holds every version, append-only.

create table public.entries (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete cascade,
  type text not null check (type in ('note', 'agreement', 'expense', 'event')),
  child_id uuid references public.children (id) on delete set null,
  -- Null once the person deletes their account: the entry stays, as "Former member" (D7).
  created_by uuid references auth.users (id) on delete set null,
  -- From the latest version, so the timeline and the calendar can sort and filter.
  title text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  version integer not null default 1,
  removed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (type <> 'event' or starts_at is not null)
);

create table public.entry_versions (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.entries (id) on delete cascade,
  version integer not null,
  content jsonb not null,
  -- 'created', 'edited', 'outcome' or 'removed'
  change text not null check (change in ('created', 'edited', 'outcome', 'removed')),
  reason text check (char_length(reason) <= 500),
  changed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entry_id, version)
);

create index entries_space_created on public.entries (space_id, created_at desc);
create index entries_space_starts on public.entries (space_id, starts_at) where type = 'event';
create index entries_child_id on public.entries (child_id);
create index entries_created_by on public.entries (created_by);
create index entry_versions_changed_by on public.entry_versions (changed_by);

create trigger set_updated_at before update on public.entries for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.entry_versions for each row execute function public.set_updated_at();

-- Versions are append-only, for everyone (AUD-1). The one change allowed is the account-deletion
-- cascade clearing `changed_by` (D7).
create function private.versions_are_append_only()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'DELETE' then
    if exists (select 1 from public.entries where id = old.entry_id) then
      raise exception 'Record history cannot be deleted.' using errcode = '42501';
    end if;
    return old;
  end if;
  if new.changed_by is null and old.changed_by is not null
    and (new.content, new.version, new.change, new.reason, new.entry_id, new.created_at)
      is not distinct from (old.content, old.version, old.change, old.reason, old.entry_id, old.created_at) then
    return new;
  end if;
  raise exception 'Record history cannot be changed.' using errcode = '42501';
end;
$$;

create trigger versions_are_append_only before update or delete on public.entry_versions
for each row execute function private.versions_are_append_only();

alter table public.entries enable row level security;
alter table public.entry_versions enable row level security;

create policy "members read the space's records" on public.entries
  for select to authenticated using ((select private.is_member(space_id)));
create policy "members read the records' history" on public.entry_versions
  for select to authenticated using (
    exists (select 1 from public.entries e where e.id = entry_id and (select private.is_member(e.space_id)))
  );

revoke all on public.entries, public.entry_versions from anon, authenticated;
grant select on public.entries, public.entry_versions to anon, authenticated;

-- ---- checking content ------------------------------------------------------------------------

-- What each type may hold. Anything else in the content is dropped. Raises P0001 with hint
-- 'invalid' and a message for the person.
create function private.clean_content(space uuid, entry_type text, content jsonb)
returns jsonb language plpgsql stable set search_path = '' as $$
declare
  title text := btrim(coalesce(content ->> 'title', ''));
  body text := nullif(btrim(coalesce(content ->> 'body', '')), '');
  out jsonb;
  fail text;
begin
  if char_length(title) not between 1 and 120 then
    fail := 'Give it a title of up to 120 characters.';
  elsif char_length(coalesce(body, '')) > 5000 then
    fail := 'Keep the details under 5,000 characters.';
  end if;
  out := jsonb_build_object('title', title, 'body', body);

  if fail is null and entry_type = 'agreement' then
    out := out || jsonb_build_object('agreed_on', nullif(content ->> 'agreed_on', '')::date);
  elsif fail is null and entry_type = 'expense' then
    if coalesce((content ->> 'amount')::numeric, 0) <= 0 or (content ->> 'amount')::numeric > 100000000 then
      fail := 'Enter an amount above zero.';
    elsif coalesce(content ->> 'currency', '') !~ '^[A-Z]{3}$' then
      fail := 'Choose a currency.';
    else
      out := out || jsonb_build_object(
        'amount', round((content ->> 'amount')::numeric, 2),
        'currency', content ->> 'currency',
        'spent_on', nullif(content ->> 'spent_on', '')::date,
        'paid_by', nullif(content ->> 'paid_by', '')::uuid
      );
    end if;
  elsif fail is null and entry_type = 'event' then
    if nullif(content ->> 'starts_at', '') is null then
      fail := 'Choose when it starts.';
    elsif nullif(content ->> 'ends_at', '') is not null and (content ->> 'ends_at')::timestamptz < (content ->> 'starts_at')::timestamptz then
      fail := 'It cannot end before it starts.';
    elsif char_length(coalesce(content ->> 'location', '')) > 200 then
      fail := 'Keep the place under 200 characters.';
    elsif nullif(content ->> 'assigned_to', '') is not null and not exists (
      select 1 from public.space_members where space_id = space and user_id = (content ->> 'assigned_to')::uuid
    ) then
      fail := 'The person responsible must be in this space.';
    elsif coalesce(content ->> 'outcome', '') not in ('', 'done', 'missed') then
      fail := 'Unknown outcome.';
    else
      out := out || jsonb_build_object(
        'starts_at', (content ->> 'starts_at')::timestamptz,
        'ends_at', nullif(content ->> 'ends_at', '')::timestamptz,
        'all_day', coalesce((content ->> 'all_day')::boolean, false),
        'location', nullif(btrim(coalesce(content ->> 'location', '')), ''),
        'assigned_to', nullif(content ->> 'assigned_to', '')::uuid,
        'outcome', nullif(content ->> 'outcome', ''),
        'outcome_note', nullif(btrim(coalesce(content ->> 'outcome_note', '')), '')
      );
    end if;
  end if;

  if fail is null and entry_type = 'expense' and nullif(content ->> 'paid_by', '') is not null and not exists (
    select 1 from public.space_members where space_id = space and user_id = (content ->> 'paid_by')::uuid
  ) then
    fail := 'Who paid must be in this space.';
  end if;

  if fail is not null then
    raise exception '%', fail using errcode = 'P0001', hint = 'invalid';
  end if;
  return out;
exception
  when invalid_text_representation or invalid_datetime_format or datetime_field_overflow or numeric_value_out_of_range then
    raise exception 'Check the dates and the amount.' using errcode = 'P0001', hint = 'invalid';
end;
$$;

-- ---- what people can do ---------------------------------------------------------------------

-- R54: any member adds a record. The time and the author come from the server (REC-4).
create function public.add_entry(space uuid, entry_type text, child uuid, content jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  me uuid := private.require_user();
  clean jsonb;
  new_id uuid;
begin
  if not private.is_member(space) then
    raise exception 'You are not in this space.' using errcode = '42501';
  end if;
  if entry_type not in ('note', 'agreement', 'expense', 'event') then
    raise exception 'Unknown kind of record.' using errcode = 'P0001', hint = 'invalid';
  end if;
  if child is not null and not exists (select 1 from public.children where id = child and space_id = space) then
    raise exception 'That child is not in this space.' using errcode = 'P0001', hint = 'invalid';
  end if;
  clean := private.clean_content(space, entry_type, content);
  insert into public.entries (space_id, type, child_id, created_by, title, starts_at, ends_at)
  values (space, entry_type, child, me, clean ->> 'title', (clean ->> 'starts_at')::timestamptz, (clean ->> 'ends_at')::timestamptz)
  returning id into new_id;
  insert into public.entry_versions (entry_id, version, content, change, changed_by)
  values (new_id, 1, clean || jsonb_build_object('child_id', child), 'created', me);
  return new_id;
end;
$$;

-- R55: the author corrects a record. A new version, never an overwrite (AUD-1).
create function private.new_version(entry uuid, content jsonb, kind text, why text, child uuid, keep_child boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare
  e public.entries;
  clean jsonb;
begin
  select * into e from public.entries where id = entry for update;
  clean := private.clean_content(e.space_id, e.type, content);
  if not keep_child and child is not null
    and not exists (select 1 from public.children where id = child and space_id = e.space_id) then
    raise exception 'That child is not in this space.' using errcode = 'P0001', hint = 'invalid';
  end if;
  update public.entries
  set version = e.version + 1,
      title = clean ->> 'title',
      starts_at = (clean ->> 'starts_at')::timestamptz,
      ends_at = (clean ->> 'ends_at')::timestamptz,
      child_id = case when keep_child then e.child_id else child end
  where id = entry;
  insert into public.entry_versions (entry_id, version, content, change, reason, changed_by)
  values (entry, e.version + 1,
    clean || jsonb_build_object('child_id', case when keep_child then e.child_id else child end),
    kind, nullif(btrim(coalesce(why, '')), ''), (select auth.uid()));
end;
$$;
revoke all on function private.new_version(uuid, jsonb, text, text, uuid, boolean) from public, anon, authenticated;

create function private.require_author(entry uuid)
returns public.entries language plpgsql stable security definer set search_path = '' as $$
declare
  e public.entries;
begin
  select * into e from public.entries where id = entry;
  if e.id is null or not private.is_member(e.space_id) then
    raise exception 'You are not in this space.' using errcode = '42501';
  end if;
  if e.created_by is distinct from (select auth.uid()) then
    raise exception 'Only the person who added this record can change it.' using errcode = 'P0001', hint = 'not_author';
  end if;
  if e.removed_at is not null then
    raise exception 'This record was removed.' using errcode = 'P0001', hint = 'removed';
  end if;
  return e;
end;
$$;
revoke all on function private.require_author(uuid) from public, anon, authenticated;

create function public.edit_entry(entry uuid, child uuid, content jsonb, reason text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  e public.entries := private.require_author(entry);
  latest jsonb := (select v.content from public.entry_versions v where v.entry_id = entry order by v.version desc limit 1);
begin
  -- An outcome already recorded on an event stays unless the edit says otherwise.
  if e.type = 'event' then
    content := jsonb_build_object('outcome', latest -> 'outcome', 'outcome_note', latest -> 'outcome_note') || content;
  end if;
  perform private.new_version(entry, content, 'edited', reason, child, false);
end;
$$;

-- AUD-2: soft delete. The record leaves the timeline; its history keeps every version.
create function public.remove_entry(entry uuid, reason text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  e public.entries := private.require_author(entry);
  latest jsonb := (select v.content from public.entry_versions v where v.entry_id = entry order by v.version desc limit 1);
begin
  update public.entries set removed_at = now(), version = e.version + 1 where id = entry;
  insert into public.entry_versions (entry_id, version, content, change, reason, changed_by)
  values (entry, e.version + 1, latest, 'removed', nullif(btrim(coalesce(reason, '')), ''), (select auth.uid()));
end;
$$;

-- CAL-1: after an event, its author or the person responsible records what happened.
create function public.set_event_outcome(entry uuid, outcome text, note text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  e public.entries := (select x from public.entries x where x.id = entry);
  latest jsonb := (select v.content from public.entry_versions v where v.entry_id = entry order by v.version desc limit 1);
begin
  if e.id is null or not private.is_member(e.space_id) then
    raise exception 'You are not in this space.' using errcode = '42501';
  end if;
  if e.type <> 'event' or e.removed_at is not null then
    raise exception 'Only an event can have an outcome.' using errcode = 'P0001', hint = 'invalid';
  end if;
  if (select auth.uid()) is distinct from e.created_by
    and (select auth.uid())::text is distinct from (latest ->> 'assigned_to') then
    raise exception 'Only the person who added the event or the person responsible can record what happened.'
      using errcode = 'P0001', hint = 'not_author';
  end if;
  perform private.new_version(
    entry,
    latest || jsonb_build_object('outcome', nullif(outcome, ''), 'outcome_note', nullif(btrim(coalesce(note, '')), '')),
    'outcome', null, null, true
  );
end;
$$;

-- Who added and changed records, by name, for the people in the space. Someone no longer in it,
-- or whose account is gone, shows as a former member.
create function public.space_names(space uuid)
returns table (user_id uuid, display_name text)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not private.is_member(space) then
    raise exception 'You are not in this space.' using errcode = '42501';
  end if;
  return query
    select m.user_id, u.display_name
    from public.space_members m left join public.users u on u.id = m.user_id
    where m.space_id = space;
end;
$$;

do $$
declare
  fn text;
begin
  foreach fn in array array[
    'add_entry(uuid, text, uuid, jsonb)', 'edit_entry(uuid, uuid, jsonb, text)',
    'remove_entry(uuid, text)', 'set_event_outcome(uuid, text, text)', 'space_names(uuid)'
  ] loop
    execute format('revoke all on function public.%s from public, anon', fn);
    execute format('grant execute on function public.%s to authenticated', fn);
  end loop;
end;
$$;
