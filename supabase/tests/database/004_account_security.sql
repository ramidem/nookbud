-- Audit log (R23), signed-in devices (R20) and recovery codes (R21).
begin;
select plan(11);

select set_config('tests.user_a', tests.create_user('a@example.test')::text, true);
select set_config('tests.user_b', tests.create_user('b@example.test')::text, true);

-- Audit log.
select is(
  tests.try_as($q$select public.record_audit_event('password_changed')$q$, current_setting('tests.user_a')::uuid),
  'ok',
  'a signed-in person can record an event for their own account'
);
select is(
  (select count(*) from public.audit_logs where user_id = current_setting('tests.user_a')::uuid and action = 'password_changed'),
  1::bigint,
  '...and it is stored with their id and the action only'
);
select is(
  tests.try_as($q$select public.record_audit_event('made_up')$q$, current_setting('tests.user_a')::uuid),
  '23514',
  'only known actions can be recorded'
);
select is(
  tests.try_as($q$select public.record_audit_event('password_changed')$q$),
  '42501',
  'a signed-out visitor cannot record anything'
);
select results_eq(
  format(
    $q$select identity, row_count from tests.who_sees('select * from public.audit_logs', %L, %L)$q$,
    current_setting('tests.user_a'), current_setting('tests.user_b')
  ),
  $$values ('user a'::text, 1::bigint), ('user b'::text, 0::bigint), ('visitor'::text, 0::bigint)$$,
  'each person sees only their own account events'
);
select is(
  tests.try_as(
    format($q$insert into public.audit_logs (user_id, action) values (%L, 'password_changed')$q$, current_setting('tests.user_b')),
    current_setting('tests.user_a')::uuid
  ),
  '42501',
  'nobody can write an entry directly, for themselves or anyone else'
);
select is(
  tests.try_as($q$delete from public.audit_logs$q$, current_setting('tests.user_a')::uuid),
  '42501',
  'nobody can delete entries'
);

-- Sessions.
insert into auth.sessions (id, user_id, created_at, updated_at, user_agent)
values
  (gen_random_uuid(), current_setting('tests.user_a')::uuid, now(), now(), 'device of a'),
  (gen_random_uuid(), current_setting('tests.user_b')::uuid, now(), now(), 'device of b');

select is(
  tests.count_as('select * from public.my_sessions()', current_setting('tests.user_a')::uuid),
  1::bigint,
  'a person sees only their own sessions'
);
select is(
  tests.try_as('select * from public.my_sessions()'),
  '42501',
  'a signed-out visitor cannot list sessions'
);

-- Recovery codes.
insert into public.mfa_recovery_codes (user_id, code_hash) values (current_setting('tests.user_a')::uuid, 'hash');

select is(
  tests.try_as('select * from public.mfa_recovery_codes', current_setting('tests.user_a')::uuid),
  '42501',
  'a person cannot read recovery code hashes, even their own'
);
select is(
  tests.try_as($q$update public.mfa_recovery_codes set used_at = null$q$, current_setting('tests.user_a')::uuid),
  '42501',
  'a person cannot change recovery codes'
);

select * from finish();
rollback;
