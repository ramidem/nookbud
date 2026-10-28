-- R30 (TEST-1): a signed-out visitor reads nothing and changes nothing, in every table and
-- function in `public`, including the ones added after this test was written.
begin;

select plan(3);

-- A row in every table we have, so "sees nothing" means something.
select set_config('tests.user_a', tests.create_user('a@example.test')::text, true);
insert into public.audit_logs (user_id, action) values (current_setting('tests.user_a')::uuid, 'password_changed');
insert into public.mfa_recovery_codes (user_id, code_hash) values (current_setting('tests.user_a')::uuid, 'hash');
insert into public.auth_attempts (kind, subject) values ('sign_in', repeat('a', 64));

create function pg_temp.public_tables() returns setof text language sql as $$
  select c.relname::text
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relispartition
  order by 1;
$$;

-- Reading: a visitor sees no rows anywhere (RLS hides them, or the read is refused outright).
create function pg_temp.tables_a_visitor_can_read() returns text[] language plpgsql as $$
declare
  t text;
  out text[] := '{}';
begin
  for t in select * from pg_temp.public_tables() loop
    begin
      if tests.count_as(format('select * from public.%I', t)) > 0 then out := out || t; end if;
    exception when insufficient_privilege then null;
    end;
  end loop;
  return out;
end;
$$;

select is(pg_temp.tables_a_visitor_can_read(), '{}'::text[], 'no table shows a single row to a signed-out visitor');

-- Deleting: whatever a visitor tries, every row is still there afterwards.
create function pg_temp.tables_a_visitor_can_empty() returns text[] language plpgsql as $$
declare
  t text;
  before bigint;
  after bigint;
  out text[] := '{}';
begin
  for t in select * from pg_temp.public_tables() loop
    execute format('select count(*) from public.%I', t) into before;
    perform tests.try_as(format('delete from public.%I', t));
    perform tests.try_as(format('truncate public.%I', t));
    execute format('select count(*) from public.%I', t) into after;
    if after < before then out := out || t; end if;
  end loop;
  return out;
end;
$$;

select is(pg_temp.tables_a_visitor_can_empty(), '{}'::text[], 'a signed-out visitor cannot remove a row from any table');

-- Functions: a visitor may run none of ours. Trigger functions only ever run as triggers.
select is(
  (
    select coalesce(array_agg(p.proname::text order by p.proname), '{}')
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prorettype <> 'trigger'::regtype
      and has_function_privilege('anon', p.oid, 'execute')
  ),
  '{}'::text[],
  'no function in public can be called by a signed-out visitor'
);

select * from finish();
rollback;
