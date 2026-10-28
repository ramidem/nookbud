-- Records, their history, events, the parenting schedule and change requests (R54–R58).
begin;
select plan(26);

select set_config('tests.priya', tests.create_user('records-priya@example.test')::text, true);
select set_config('tests.tom', tests.create_user('records-tom@example.test')::text, true);
select set_config('tests.outsider', tests.create_user('records-outsider@example.test')::text, true);

create function pg_temp.as_user(who text, q text) returns text language plpgsql as $$
declare
  out text;
  uid text := current_setting(who);
begin
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', uid, true);
  execute 'set local role authenticated';
  begin
    execute q into out;
  exception when others then
    out := 'error: ' || coalesce(nullif(sqlerrm, ''), sqlstate);
  end;
  execute 'reset role';
  perform set_config('request.jwt.claims', '', true);
  perform set_config('request.jwt.claim.sub', '', true);
  return coalesce(out, '');
end;
$$;
grant execute on function pg_temp.as_user(text, text) to authenticated;

-- A space with Priya (owner) and Tom (member).
select set_config('tests.space', pg_temp.as_user('tests.priya', $q$select public.create_space('Ava''s week')$q$), true);
insert into public.space_members (space_id, user_id, role) values (current_setting('tests.space')::uuid, current_setting('tests.tom')::uuid, 'member');

-- Adding (R54).
select set_config('tests.note', pg_temp.as_user('tests.tom', format(
  $q$select public.add_entry(%L, 'note', null, '{"title":"Dentist moved","body":"Now Thursday","created_at":"1999-01-01"}')$q$,
  current_setting('tests.space'))), true);
select ok(current_setting('tests.note') ~ '^[0-9a-f-]{36}$', 'a member can add a record');
select is((select created_by from public.entries where id = current_setting('tests.note')::uuid), current_setting('tests.tom')::uuid, 'the server records who added it');
select ok((select created_at > now() - interval '1 minute' from public.entries where id = current_setting('tests.note')::uuid), 'and when, ignoring any time the browser sends');
select is((select content ? 'created_at' from public.entry_versions where entry_id = current_setting('tests.note')::uuid), false, 'unknown fields are dropped');
select ok(
  pg_temp.as_user('tests.outsider', format($q$select public.add_entry(%L, 'note', null, '{"title":"x"}')$q$, current_setting('tests.space'))) like 'error:%',
  'someone outside cannot add a record'
);
select is(tests.count_as('select * from public.entries', current_setting('tests.outsider')::uuid), 0::bigint, 'or read any');
select ok(
  pg_temp.as_user('tests.tom', format($q$select public.add_entry(%L, 'expense', null, '{"title":"Boots","amount":-5,"currency":"PHP"}')$q$, current_setting('tests.space'))) like '%above zero%',
  'an expense needs an amount above zero'
);
select is(
  tests.try_as(format($q$insert into public.entries (space_id, type, title) values (%L, 'note', 'planted')$q$, current_setting('tests.space')), current_setting('tests.tom')::uuid),
  '42501',
  'records are added only through add_entry'
);

-- Editing makes a version, never an overwrite (R55, AUD-1).
select is(
  pg_temp.as_user('tests.tom', format($q$select public.edit_entry(%L, null, '{"title":"Dentist moved to Friday"}', 'Clinic called')::text$q$, current_setting('tests.note'))),
  '',
  'the author can correct their record'
);
select is((select count(*) from public.entry_versions where entry_id = current_setting('tests.note')::uuid), 2::bigint, 'which adds a version');
select is(
  (select content ->> 'title' from public.entry_versions where entry_id = current_setting('tests.note')::uuid and version = 1),
  'Dentist moved',
  'and keeps the original'
);
select ok(
  pg_temp.as_user('tests.priya', format($q$select public.edit_entry(%L, null, '{"title":"Rewritten by the owner"}', null)::text$q$, current_setting('tests.note'))) like '%Only the person who added%',
  'nobody else can change it, not even an owner'
);
select is(
  tests.try_as(format($q$update public.entry_versions set content = '{"title":"forged"}' where entry_id = %L$q$, current_setting('tests.note')), current_setting('tests.tom')::uuid),
  '42501',
  'nobody can rewrite history through the API'
);
select throws_ok(
  format($q$update public.entry_versions set content = '{"title":"forged"}' where entry_id = %L$q$, current_setting('tests.note')),
  '42501',
  null,
  'not even the database owner'
);

-- Removing is soft (AUD-2).
select is(
  pg_temp.as_user('tests.tom', format($q$select public.remove_entry(%L, 'Duplicate')::text$q$, current_setting('tests.note'))),
  '',
  'the author can remove their record'
);
select isnt((select removed_at from public.entries where id = current_setting('tests.note')::uuid), null, 'it is marked removed');
select is((select count(*) from public.entry_versions where entry_id = current_setting('tests.note')::uuid), 3::bigint, 'and its history is kept, with the removal');

-- Events (R56, CAL-1).
select set_config('tests.event', pg_temp.as_user('tests.priya', format(
  $q$select public.add_entry(%L, 'event', null, jsonb_build_object('title','Handoff at school','starts_at','2026-11-04T07:30:00Z','assigned_to',%L))$q$,
  current_setting('tests.space'), current_setting('tests.tom'))), true);
select ok(current_setting('tests.event') ~ '^[0-9a-f-]{36}$', 'an event can name who is responsible');
select ok(
  pg_temp.as_user('tests.priya', format(
    $q$select public.add_entry(%L, 'event', null, jsonb_build_object('title','x','starts_at','2026-11-04T07:30:00Z','assigned_to',%L))$q$,
    current_setting('tests.space'), current_setting('tests.outsider'))) like '%must be in this space%',
  'only someone in the space'
);
select is(
  pg_temp.as_user('tests.tom', format($q$select public.set_event_outcome(%L, 'done', 'On time')::text$q$, current_setting('tests.event'))),
  '',
  'the person responsible records what happened'
);
select is(
  (select content ->> 'outcome' from public.entry_versions where entry_id = current_setting('tests.event')::uuid order by version desc limit 1),
  'done',
  'as a new version'
);

-- The parenting schedule (R57).
select ok(
  pg_temp.as_user('tests.tom', format($q$select public.set_schedule(%L, date '2026-11-02', array[%L]::uuid[])::text$q$, current_setting('tests.space'), current_setting('tests.tom'))) like 'error:%',
  'only an owner sets the schedule'
);
select is(
  pg_temp.as_user('tests.priya', format(
    $q$select public.set_schedule(%L, date '2026-11-02', array[%L, %L]::uuid[])::text$q$,
    current_setting('tests.space'), current_setting('tests.priya'), current_setting('tests.tom'))),
  '',
  'an owner sets a repeating pattern'
);

-- Change requests (R58).
select set_config('tests.request', pg_temp.as_user('tests.tom', format(
  $q$select public.request_change(%L, date '2026-11-10', date '2026-11-12', %L, 'School trip')$q$,
  current_setting('tests.space'), current_setting('tests.tom'))), true);
select ok(
  pg_temp.as_user('tests.tom', format($q$select public.respond_to_change(%L, true, null)::text$q$, current_setting('tests.request'))) like '%Someone else%',
  'nobody approves their own request'
);
select is(
  pg_temp.as_user('tests.priya', format($q$select public.respond_to_change(%L, true, 'Fine')::text$q$, current_setting('tests.request'))),
  '',
  'someone else in the space approves it'
);
select ok(
  pg_temp.as_user('tests.priya', format($q$select public.respond_to_change(%L, false, null)::text$q$, current_setting('tests.request'))) like '%answered already%',
  'and the answer stands'
);

select * from finish();
rollback;
