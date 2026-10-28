-- Spaces, members, children and invitations (stage 8): who can do what, and isolation between
-- spaces (AZ-1..5, MEM-5, INV-1..5, SPC-5, SPC-6).
begin;
select plan(35);

select set_config('tests.owner', tests.create_user('owner@example.test')::text, true);
select set_config('tests.invitee', tests.create_user('invitee@example.test')::text, true);
select set_config('tests.outsider', tests.create_user('outsider@example.test')::text, true);

-- The helpers run statements; these capture what a function returns, as the given person.
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

-- Creating.
select set_config('tests.space', pg_temp.as_user('tests.owner', $q$select public.create_space('Ava''s week')$q$), true);
select ok(current_setting('tests.space') ~ '^[0-9a-f-]{36}$', 'anyone signed in can create a space');
select is(
  (select role from public.space_members where space_id = current_setting('tests.space')::uuid and user_id = current_setting('tests.owner')::uuid),
  'owner',
  'the creator is its owner'
);
select set_config('tests.other_space', pg_temp.as_user('tests.outsider', $q$select public.create_space('Another family')$q$), true);
select is(
  tests.try_as($q$select public.create_space('x')$q$),
  '42501',
  'a signed-out visitor cannot create a space'
);

-- Isolation.
select is(tests.count_as('select * from public.spaces', current_setting('tests.owner')::uuid), 1::bigint, 'the owner sees their one space');
select is(
  tests.count_as(format('select * from public.spaces where id = %L', current_setting('tests.space')), current_setting('tests.outsider')::uuid),
  0::bigint,
  'someone outside cannot see the space, even knowing its id'
);
select ok(
  pg_temp.as_user('tests.outsider', format($q$select public.space_people(%L)::text$q$, current_setting('tests.space'))) like 'error:%',
  'someone outside cannot list its people'
);
select ok(
  pg_temp.as_user('tests.outsider', format($q$select public.rename_space(%L, 'mine now')::text$q$, current_setting('tests.space'))) like 'error:%',
  'someone outside cannot rename it'
);

-- Children.
select ok(
  pg_temp.as_user('tests.owner', format($q$select public.add_child(%L, 'Ava', date '2019-05-02')$q$, current_setting('tests.space'))) ~ '^[0-9a-f-]{36}$',
  'an owner can add a child'
);
select is(
  tests.count_as('select * from public.children', current_setting('tests.outsider')::uuid),
  0::bigint,
  'someone outside sees no children'
);
select is(
  tests.try_as(format($q$insert into public.children (space_id, name) values (%L, 'planted')$q$, current_setting('tests.space')), current_setting('tests.owner')::uuid),
  '42501',
  'children are added only through add_child'
);

-- Inviting.
select ok(
  pg_temp.as_user('tests.outsider', format($q$select public.create_invitation(%L, 'x@example.test')$q$, current_setting('tests.space'))) like 'error:%',
  'someone outside cannot invite'
);
select set_config('tests.token', pg_temp.as_user('tests.owner', format($q$select public.create_invitation(%L, ' Invitee@Example.test ')$q$, current_setting('tests.space'))), true);
select ok(current_setting('tests.token') ~ '^[0-9a-f]{64}$', 'an owner can invite an email');
select is(
  (select email from public.invitations where space_id = current_setting('tests.space')::uuid),
  'invitee@example.test',
  'the invitation is bound to the email, in lower case'
);
select is(
  (select count(*) from public.invitations where token_hash = current_setting('tests.token')),
  0::bigint,
  'the token itself is never stored'
);
select is(
  tests.try_as('select token_hash from public.invitations', current_setting('tests.owner')::uuid),
  '42501',
  'not even an owner can read token hashes'
);
select is(
  tests.count_as('select id from public.invitations', current_setting('tests.owner')::uuid),
  1::bigint,
  'an owner sees the space''s invitations'
);
select is(
  tests.count_as('select id from public.invitations', current_setting('tests.invitee')::uuid),
  0::bigint,
  'nobody else does'
);

-- Accepting.
select is(
  tests.count_as('select * from public.my_invitations()', current_setting('tests.invitee')::uuid),
  1::bigint,
  'the invited person finds the invitation on their home page'
);
select is(
  tests.count_as('select * from public.my_invitations()', current_setting('tests.outsider')::uuid),
  0::bigint,
  'nobody else does'
);
select ok(
  pg_temp.as_user('tests.outsider', format(
    $q$select public.accept_my_invitation((select id from public.invitations where email = 'invitee@example.test'))$q$
  )) like 'error:%',
  'the wrong person cannot accept it by id either'
);
select ok(
  pg_temp.as_user('tests.outsider', format($q$select public.accept_invitation(%L)$q$, current_setting('tests.token'))) like '%different email%',
  'the wrong person cannot accept it'
);
select is(
  pg_temp.as_user('tests.invitee', format($q$select public.accept_invitation(%L)$q$, current_setting('tests.token'))),
  current_setting('tests.space'),
  'the invited person can accept it'
);
select is(
  (select role from public.space_members where space_id = current_setting('tests.space')::uuid and user_id = current_setting('tests.invitee')::uuid),
  'member',
  'and joins with the role the owner chose'
);
select ok(
  pg_temp.as_user('tests.invitee', format($q$select public.accept_invitation(%L)$q$, current_setting('tests.token'))) like '%already been used%',
  'an invitation works once'
);
select is(
  tests.count_as('select * from public.children', current_setting('tests.invitee')::uuid),
  1::bigint,
  'a member reads the space''s children'
);
select ok(
  pg_temp.as_user('tests.invitee', format($q$select public.add_child(%L, 'Ben', null)::text$q$, current_setting('tests.space'))) like 'error:%',
  'a member cannot add children (owners only, until OQ5 is settled)'
);
select ok(
  pg_temp.as_user('tests.invitee', format($q$select public.create_invitation(%L, 'y@example.test')$q$, current_setting('tests.space'))) like 'error:%',
  'a member cannot invite (OQ3)'
);

-- Expired invitations.
select set_config('tests.late', pg_temp.as_user('tests.owner', format($q$select public.create_invitation(%L, 'outsider@example.test')$q$, current_setting('tests.space'))), true);
update public.invitations set expires_at = now() - interval '1 minute' where email = 'outsider@example.test';
select ok(
  pg_temp.as_user('tests.outsider', format($q$select public.accept_invitation(%L)$q$, current_setting('tests.late'))) like '%expired%',
  'an expired invitation cannot be accepted'
);

-- Owners and leaving.
select ok(
  pg_temp.as_user('tests.owner', format($q$select public.leave_space(%L)::text$q$, current_setting('tests.space'))) like '%someone else an owner%',
  'the last owner cannot leave'
);
select ok(
  pg_temp.as_user('tests.invitee', format($q$select public.set_member_role(%L, %L, 'owner')::text$q$, current_setting('tests.space'), current_setting('tests.invitee'))) like 'error:%',
  'a member cannot make themselves an owner'
);
select is(
  pg_temp.as_user('tests.owner', format($q$select public.set_member_role(%L, %L, 'owner')::text$q$, current_setting('tests.space'), current_setting('tests.invitee'))),
  '',
  'an owner can make another member an owner'
);
select is(
  pg_temp.as_user('tests.owner', format($q$select public.leave_space(%L)::text$q$, current_setting('tests.space'))),
  '',
  'then the first owner can leave'
);
select is(
  tests.count_as(format('select * from public.spaces where id = %L', current_setting('tests.space')), current_setting('tests.owner')::uuid),
  0::bigint,
  'and their access ends at once'
);

-- Deleting.
select is(
  pg_temp.as_user('tests.invitee', format($q$select public.delete_space(%L)::text$q$, current_setting('tests.space'))),
  '',
  'an owner can delete the space'
);
select is(
  tests.count_as('select * from public.children', current_setting('tests.invitee')::uuid),
  0::bigint,
  'after which nobody sees anything in it'
);

select * from finish();
rollback;
