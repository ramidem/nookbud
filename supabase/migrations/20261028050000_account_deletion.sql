-- Account deletion (R28, USR-7, D7). The web server deletes the identity with the service role;
-- the profile and recovery codes go with it (on delete cascade). The audit entry stays, because
-- audit_logs.user_id has no foreign key.
--
-- Later tables that hold what a person shared in a space must not cascade from auth.users: they
-- keep the row and show "Former member" (D7).

-- Records the deletion for the signed-in person, then hands back their id for the server to
-- delete. Called by the person themselves, so a stolen service key alone cannot fake the entry.
create function public.prepare_account_deletion()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
begin
  if me is null then
    raise exception 'Sign in to continue.' using errcode = '42501';
  end if;
  insert into public.audit_logs (user_id, action) values (me, 'account_deleted');
  return me;
end;
$$;

revoke all on function public.prepare_account_deletion() from public, anon;
grant execute on function public.prepare_account_deletion() to authenticated;
