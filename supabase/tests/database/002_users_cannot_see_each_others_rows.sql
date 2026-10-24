-- The pattern every table's isolation test follows (spec AZ-2, AZ-3, TEST-1).
-- It uses a throwaway table, created and rolled back inside this test, so nothing here ships.
begin;
select plan(13);

-- A table shaped like the real ones will be: every row belongs to one user.
create table public.zz_notes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id),
  body text not null
);
alter table public.zz_notes enable row level security;

create policy "owners read their own notes" on public.zz_notes
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "owners add their own notes" on public.zz_notes
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "owners change their own notes" on public.zz_notes
  for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "owners delete their own notes" on public.zz_notes
  for delete to authenticated using (owner_id = (select auth.uid()));

-- Two users, each adding one note of their own, so the insert policy is exercised too.
select set_config('tests.user_a', tests.create_user('a@example.test')::text, true);
select set_config('tests.user_b', tests.create_user('b@example.test')::text, true);

select is(
  tests.try_as(
    format($q$insert into public.zz_notes (owner_id, body) values (%L, 'a private note')$q$, current_setting('tests.user_a')),
    current_setting('tests.user_a')::uuid
  ),
  'ok',
  'user A can add a note of their own'
);
select is(
  tests.try_as(
    format($q$insert into public.zz_notes (owner_id, body) values (%L, 'b private note')$q$, current_setting('tests.user_b')),
    current_setting('tests.user_b')::uuid
  ),
  'ok',
  'user B can add a note of their own'
);

select set_config('tests.note_a', (select id::text from public.zz_notes where body = 'a private note'), true);
select set_config('tests.note_b', (select id::text from public.zz_notes where body = 'b private note'), true);

-- Reading: the same query as user A, user B and a signed-out visitor.
select results_eq(
  format(
    $q$select identity, row_count from tests.who_sees('select * from public.zz_notes', %L, %L)$q$,
    current_setting('tests.user_a'), current_setting('tests.user_b')
  ),
  $$values ('user a'::text, 1::bigint), ('user b'::text, 1::bigint), ('visitor'::text, 0::bigint)$$,
  'each user sees only their own note, and a visitor sees none'
);

select is(
  tests.count_as(format('select * from public.zz_notes where id = %L', current_setting('tests.note_a')), current_setting('tests.user_a')::uuid),
  1::bigint,
  'user A can read their own note by its id'
);
select is(
  tests.count_as(format('select * from public.zz_notes where id = %L', current_setting('tests.note_b')), current_setting('tests.user_a')::uuid),
  0::bigint,
  'user A cannot read user B''s note, even knowing its id'
);
select is(
  tests.count_as(format('select * from public.zz_notes where id = %L', current_setting('tests.note_a')), current_setting('tests.user_b')::uuid),
  0::bigint,
  'user B cannot read user A''s note, even knowing its id'
);
select is(
  tests.count_as(format('select * from public.zz_notes where id = %L', current_setting('tests.note_a'))),
  0::bigint,
  'a signed-out visitor cannot read a note, even knowing its id'
);

-- Writing: user A tries to change and delete user B's note. RLS answers by affecting zero rows.
select is(
  tests.try_as(format($q$update public.zz_notes set body = 'changed by a' where id = %L$q$, current_setting('tests.note_b')), current_setting('tests.user_a')::uuid),
  'ok',
  'user A''s attempt to edit user B''s note runs without error'
);
select is(
  (select body from public.zz_notes where id = current_setting('tests.note_b')::uuid),
  'b private note',
  '...but user B''s note is unchanged'
);
select is(
  tests.try_as(format($q$delete from public.zz_notes where id = %L$q$, current_setting('tests.note_b')), current_setting('tests.user_a')::uuid),
  'ok',
  'user A''s attempt to delete user B''s note runs without error'
);
select is(
  (select count(*) from public.zz_notes where id = current_setting('tests.note_b')::uuid),
  1::bigint,
  '...but user B''s note is still there'
);

-- Writing on someone else's behalf, or while signed out, is refused outright.
select is(
  tests.try_as(
    format($q$insert into public.zz_notes (owner_id, body) values (%L, 'planted by a')$q$, current_setting('tests.user_b')),
    current_setting('tests.user_a')::uuid
  ),
  '42501',
  'user A cannot add a note that belongs to user B'
);
select is(
  tests.try_as(
    format($q$insert into public.zz_notes (owner_id, body) values (%L, 'planted by a visitor')$q$, current_setting('tests.user_b'))
  ),
  '42501',
  'a signed-out visitor cannot add a note at all'
);

select * from finish();
rollback;
