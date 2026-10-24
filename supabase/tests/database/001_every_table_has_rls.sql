-- CI fails here when a table in `public` has no Row-Level Security (spec AZ-2, SEC-10).
begin;
select plan(3);

select is_empty(
  $$select * from tests.tables_without_rls()$$,
  'every table in public has Row-Level Security turned on'
);

-- The guard itself has to work: it must notice an unprotected table, and stop once RLS is on.
create table public.zz_guard_check (id int);

select results_eq(
  $$select t from tests.tables_without_rls() as t where t = 'zz_guard_check'$$,
  $$values ('zz_guard_check'::text)$$,
  'the guard lists a table that has no Row-Level Security'
);

alter table public.zz_guard_check enable row level security;

select is_empty(
  $$select t from tests.tables_without_rls() as t where t = 'zz_guard_check'$$,
  'the guard stops listing it once Row-Level Security is on'
);

select * from finish();
rollback;
