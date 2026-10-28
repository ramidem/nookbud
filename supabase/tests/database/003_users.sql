-- Profiles (R10) and the consent recorded at sign-up (R8).
begin;
select plan(14);

select set_config('tests.user_a', tests.create_user('a@example.test')::text, true);
select set_config('tests.user_b', tests.create_user('b@example.test')::text, true);

select is(
  (select count(*) from public.users where id in (current_setting('tests.user_a')::uuid, current_setting('tests.user_b')::uuid)),
  2::bigint,
  'registering creates a profile row'
);
select is(
  (select terms_version from public.users where id = current_setting('tests.user_a')::uuid),
  'test',
  'the profile records the accepted policy version'
);
select isnt(
  (select adult_confirmed_at from public.users where id = current_setting('tests.user_a')::uuid),
  null,
  'the profile records when the person confirmed they are 18 or older'
);

-- No account without consent.
select throws_ok(
  $q$insert into auth.users (instance_id, id, aud, role, email, raw_user_meta_data)
     values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
       'no-consent@example.test', '{"terms_accepted":true,"terms_version":"x"}')$q$,
  'P0001',
  null,
  'an account without the age confirmation is refused'
);
select throws_ok(
  $q$insert into auth.users (instance_id, id, aud, role, email, raw_user_meta_data)
     values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
       'no-terms@example.test', '{"adult_confirmed":true}')$q$,
  'P0001',
  null,
  'an account without accepted terms is refused'
);

-- Reading.
select results_eq(
  format(
    $q$select identity, row_count from tests.who_sees('select * from public.users', %L, %L)$q$,
    current_setting('tests.user_a'), current_setting('tests.user_b')
  ),
  $$values ('user a'::text, 1::bigint), ('user b'::text, 1::bigint), ('visitor'::text, 0::bigint)$$,
  'each person sees only their own profile, and a visitor sees none'
);
select is(
  tests.count_as(format('select * from public.users where id = %L', current_setting('tests.user_b')), current_setting('tests.user_a')::uuid),
  0::bigint,
  'user A cannot read user B''s profile, even knowing the id'
);

-- Writing.
select is(
  tests.try_as($q$update public.users set display_name = 'Priya', time_zone = 'Asia/Manila', currency = 'PHP'$q$, current_setting('tests.user_a')::uuid),
  'ok',
  'user A can change their own details'
);
select is(
  (select display_name from public.users where id = current_setting('tests.user_a')::uuid),
  'Priya',
  '...and the change is saved'
);
select is(
  tests.try_as(format($q$update public.users set display_name = 'changed by a' where id = %L$q$, current_setting('tests.user_b')), current_setting('tests.user_a')::uuid),
  'ok',
  'user A''s attempt to change user B''s profile runs without error'
);
select is(
  (select display_name from public.users where id = current_setting('tests.user_b')::uuid),
  null,
  '...but user B''s profile is unchanged'
);
select is(
  tests.try_as($q$update public.users set terms_version = 'forged'$q$, current_setting('tests.user_a')::uuid),
  '42501',
  'nobody can rewrite the consent they gave'
);
select is(
  tests.try_as(format($q$delete from public.users where id = %L$q$, current_setting('tests.user_a')), current_setting('tests.user_a')::uuid),
  '42501',
  'a profile cannot be deleted directly'
);
select is(
  tests.try_as($q$update public.users set display_name = 'visitor'$q$),
  '42501',
  'a signed-out visitor cannot change any profile'
);

select * from finish();
rollback;
