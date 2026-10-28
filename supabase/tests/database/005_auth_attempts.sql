-- The attempt counter for rate limits (R16) is for the server only.
begin;
select plan(3);

select set_config('tests.user_a', tests.create_user('a@example.test')::text, true);

select is(
  tests.try_as($q$insert into public.auth_attempts (kind, subject) values ('sign_in', repeat('a', 64))$q$),
  '42501',
  'a visitor cannot add attempts, so nobody can lock out someone else'
);
select is(
  tests.try_as('select * from public.auth_attempts', current_setting('tests.user_a')::uuid),
  '42501',
  'a signed-in person cannot read the attempt counter'
);
select throws_ok(
  $q$insert into public.auth_attempts (kind, subject) values ('sign_in', 'someone@example.test')$q$,
  '23514',
  null,
  'only hashes are stored, never an email or an address'
);

select * from finish();
rollback;
