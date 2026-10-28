-- Deleting an account (R28, D7).
begin;
select plan(5);

select set_config('tests.user_a', tests.create_user('a@example.test')::text, true);
select set_config('tests.user_b', tests.create_user('b@example.test')::text, true);
insert into public.mfa_recovery_codes (user_id, code_hash) values (current_setting('tests.user_a')::uuid, 'hash');

select is(
  tests.try_as('select public.prepare_account_deletion()', current_setting('tests.user_a')::uuid),
  'ok',
  'a signed-in person can start deleting their own account'
);
select is(
  (select count(*) from public.audit_logs where user_id = current_setting('tests.user_a')::uuid and action = 'account_deleted'),
  1::bigint,
  '...which writes an audit entry first'
);

-- What the server then does with the service role.
delete from auth.users where id = current_setting('tests.user_a')::uuid;

select is(
  (select count(*) from public.users where id = current_setting('tests.user_a')::uuid)
    + (select count(*) from public.mfa_recovery_codes where user_id = current_setting('tests.user_a')::uuid),
  0::bigint,
  'the profile and recovery codes are gone with the account'
);
select is(
  (select count(*) from public.audit_logs where user_id = current_setting('tests.user_a')::uuid),
  1::bigint,
  'the audit entry outlives the account'
);
select is(
  (select count(*) from public.users where id = current_setting('tests.user_b')::uuid),
  1::bigint,
  'nobody else is touched'
);

select * from finish();
rollback;
