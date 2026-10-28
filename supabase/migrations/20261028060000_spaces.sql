-- Spaces, their members, children and invitations (stage 8). Spec: SPC-1..6, MEM-1..6,
-- INV-1..8, AZ-1..8, DB-1..7, PRIV-2. Roles follow OQ2 (owner, member); only owners invite and
-- remove (OQ3); a space may have several owners and always has at least one (OQ4).
--
-- Every write that needs more than one row, or a rule RLS cannot express, goes through a
-- security definer function below. Tables are readable through RLS; most writes are not granted.

create extension if not exists pgcrypto with schema extensions;

-- ---- tables ---------------------------------------------------------------------------------

create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  -- Soft delete (SPC-5): hidden from everyone, kept until the retention rules (OQ6) say otherwise.
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.space_members (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete cascade,
  -- Membership is access, so it goes with the account. What the person shared stays (D7).
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (space_id, user_id) -- MEM-5
);

create table public.children (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete cascade,
  -- A name or nickname and a birth date: nothing more (PRIV-2).
  name text not null check (char_length(btrim(name)) between 1 and 60),
  birth_date date check (birth_date <= current_date and birth_date > date '1990-01-01'),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete cascade,
  email text not null check (email = lower(btrim(email)) and email like '%_@_%'),
  role text not null default 'member' check (role in ('owner', 'member')),
  -- SHA-256 of the token in the link. The token itself is shown once, to the person inviting.
  token_hash text not null unique,
  invited_by uuid references auth.users (id) on delete set null,
  expires_at timestamptz not null default now() + interval '7 days', -- INV-8
  accepted_at timestamptz,
  accepted_by uuid references auth.users (id) on delete set null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index space_members_user_id on public.space_members (user_id);
create index children_space_id on public.children (space_id);
create index invitations_space_id on public.invitations (space_id);
create index spaces_created_by on public.spaces (created_by);

create trigger set_updated_at before update on public.spaces for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.space_members for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.children for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.invitations for each row execute function public.set_updated_at();

-- The audit log learns the space events (AZ-8) and which space they happened in.
alter table public.audit_logs add column space_id uuid;
alter table public.audit_logs drop constraint audit_logs_action_check;
alter table public.audit_logs add constraint audit_logs_action_check check (action in (
  'password_changed', 'password_reset', 'signed_out_everywhere', 'two_step_enabled',
  'two_step_disabled', 'recovery_code_used', 'account_deleted',
  'space_created', 'space_renamed', 'space_deleted', 'invitation_sent', 'invitation_revoked',
  'invitation_accepted', 'member_removed', 'member_left', 'role_changed', 'child_added',
  'child_changed', 'child_removed'
));
create index audit_logs_space_id on public.audit_logs (space_id);

-- ---- access helpers -------------------------------------------------------------------------

-- Security definer, so policies can ask about membership without RLS recursing into itself.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create function private.is_member(space uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.space_members m join public.spaces s on s.id = m.space_id
    where m.space_id = space and m.user_id = (select auth.uid()) and s.deleted_at is null
  );
$$;

create function private.is_owner(space uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.space_members m join public.spaces s on s.id = m.space_id
    where m.space_id = space and m.user_id = (select auth.uid()) and m.role = 'owner' and s.deleted_at is null
  );
$$;

revoke all on function private.is_member(uuid), private.is_owner(uuid) from public, anon;
grant execute on function private.is_member(uuid), private.is_owner(uuid) to authenticated;

create function private.audit(space uuid, event text)
returns void language sql security definer set search_path = '' as $$
  insert into public.audit_logs (user_id, space_id, action) values ((select auth.uid()), space, event);
$$;
revoke all on function private.audit(uuid, text) from public, anon, authenticated;

-- ---- row-level security ---------------------------------------------------------------------

alter table public.spaces enable row level security;
alter table public.space_members enable row level security;
alter table public.children enable row level security;
alter table public.invitations enable row level security;

create policy "members read their spaces" on public.spaces
  for select to authenticated using (deleted_at is null and (select private.is_member(id)));

create policy "members see who else is in the space" on public.space_members
  for select to authenticated using ((select private.is_member(space_id)));

-- Child-access policy (AZ-7, OQ5 still open): every member reads; owners add and change. The
-- policies are per child table, so a stricter rule can replace them without a schema change.
create policy "members read the children" on public.children
  for select to authenticated using ((select private.is_member(space_id)));

create policy "owners see the space's invitations" on public.invitations
  for select to authenticated using ((select private.is_owner(space_id)));

revoke all on public.spaces, public.space_members, public.children, public.invitations from anon, authenticated;
grant select on public.spaces, public.space_members, public.children, public.invitations to anon, authenticated;
-- Hide token hashes even from owners.
revoke select on public.invitations from anon, authenticated;
grant select (id, space_id, email, role, invited_by, expires_at, accepted_at, revoked_at, created_at)
  on public.invitations to anon, authenticated;

-- ---- what people can do ---------------------------------------------------------------------

-- Every function below runs as the signed-in person and checks their role itself (AZ-5).

create function private.require_user()
returns uuid language plpgsql stable set search_path = '' as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Sign in to continue.' using errcode = '42501';
  end if;
  return (select auth.uid());
end;
$$;

create function private.require_owner(space uuid)
returns void language plpgsql stable security definer set search_path = '' as $$
begin
  if not private.is_owner(space) then
    raise exception 'Only an owner of this space can do that.' using errcode = '42501';
  end if;
end;
$$;
revoke all on function private.require_user(), private.require_owner(uuid) from public, anon;

-- SPC-1: anyone signed in creates a space and becomes its owner.
create function public.create_space(space_name text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  me uuid := private.require_user();
  new_id uuid;
begin
  if (select count(*) from public.space_members where user_id = me) >= 20 then
    raise exception 'You can be in up to 20 spaces.' using errcode = 'P0001', hint = 'limit';
  end if;
  insert into public.spaces (name, created_by) values (btrim(space_name), me) returning id into new_id;
  insert into public.space_members (space_id, user_id, role) values (new_id, me, 'owner');
  perform private.audit(new_id, 'space_created');
  return new_id;
end;
$$;

-- SPC-4
create function public.rename_space(space uuid, space_name text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner(space);
  update public.spaces set name = btrim(space_name) where id = space;
  perform private.audit(space, 'space_renamed');
end;
$$;

-- SPC-5: soft delete. Every member loses access at once; the rows stay until OQ6 is settled.
create function public.delete_space(space uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner(space);
  perform private.audit(space, 'space_deleted');
  update public.spaces set deleted_at = now() where id = space;
  update public.invitations set revoked_at = now() where space_id = space and accepted_at is null and revoked_at is null;
end;
$$;

-- Children (SPC-3, PRIV-2)
create function public.add_child(space uuid, child_name text, child_birth_date date)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  new_id uuid;
begin
  perform private.require_owner(space);
  insert into public.children (space_id, name, birth_date, created_by)
  values (space, btrim(child_name), child_birth_date, (select auth.uid())) returning id into new_id;
  perform private.audit(space, 'child_added');
  return new_id;
end;
$$;

create function public.update_child(child uuid, child_name text, child_birth_date date)
returns void language plpgsql security definer set search_path = '' as $$
declare
  space uuid := (select space_id from public.children where id = child);
begin
  perform private.require_owner(space);
  update public.children set name = btrim(child_name), birth_date = child_birth_date where id = child;
  perform private.audit(space, 'child_changed');
end;
$$;

create function public.remove_child(child uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  space uuid := (select space_id from public.children where id = child);
begin
  perform private.require_owner(space);
  delete from public.children where id = child;
  perform private.audit(space, 'child_removed');
end;
$$;

-- MEM-4: who is in the space, with the name each person chose. Profiles are private, so this
-- returns only the display name and role, and only to members.
create function public.space_people(space uuid)
returns table (user_id uuid, display_name text, role text, joined_at timestamptz, is_me boolean)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not private.is_member(space) then
    raise exception 'You are not in this space.' using errcode = '42501';
  end if;
  return query
    select m.user_id, u.display_name, m.role, m.created_at, m.user_id = (select auth.uid())
    from public.space_members m left join public.users u on u.id = m.user_id
    where m.space_id = space
    order by m.role = 'owner' desc, m.created_at;
end;
$$;

-- INV-1, INV-3, INV-5, INV-6, INV-8: an owner invites an email. Returns the token for the link,
-- once. Only its hash is stored.
create function public.create_invitation(space uuid, invitee_email text, invitee_role text default 'member')
returns text language plpgsql security definer set search_path = '' as $$
declare
  token text := encode(extensions.gen_random_bytes(32), 'hex');
  normal text := lower(btrim(invitee_email));
begin
  perform private.require_owner(space);
  if (select count(*) from public.invitations where space_id = space and created_at > now() - interval '1 day') >= 20 then
    raise exception 'Too many invitations today. Try again tomorrow.' using errcode = 'P0001', hint = 'limit';
  end if;
  if exists (
    select 1 from public.space_members m join auth.users a on a.id = m.user_id
    where m.space_id = space and lower(a.email) = normal
  ) then
    raise exception 'That person is already in this space.' using errcode = 'P0001', hint = 'already_member';
  end if;
  -- A new invitation replaces any open one for the same email.
  update public.invitations set revoked_at = now()
  where space_id = space and email = normal and accepted_at is null and revoked_at is null;
  insert into public.invitations (space_id, email, role, token_hash, invited_by)
  values (space, normal, invitee_role, encode(extensions.digest(token, 'sha256'), 'hex'), (select auth.uid()));
  perform private.audit(space, 'invitation_sent');
  return token;
end;
$$;

create function public.revoke_invitation(invitation uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  space uuid := (select space_id from public.invitations where id = invitation);
begin
  perform private.require_owner(space);
  update public.invitations set revoked_at = now() where id = invitation and accepted_at is null;
  perform private.audit(space, 'invitation_revoked');
end;
$$;

-- What the invitation page shows before accepting. Anyone with the link sees the space's name
-- and the email it was sent to, nothing else.
create function public.invitation_preview(token text)
returns table (space_name text, email text, role text, status text)
language sql stable security definer set search_path = '' as $$
  select s.name, i.email, i.role,
    case
      when s.deleted_at is not null or i.revoked_at is not null then 'revoked'
      when i.accepted_at is not null then 'used'
      when i.expires_at < now() then 'expired'
      else 'open'
    end
  from public.invitations i join public.spaces s on s.id = i.space_id
  where i.token_hash = encode(extensions.digest(token, 'sha256'), 'hex');
$$;

-- INV-2, INV-4, INV-5: only the verified account with the invited email can accept, once.
create function private.accept(invitation uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  me uuid := private.require_user();
  inv public.invitations;
  my_email text;
begin
  select a.email into my_email from auth.users a where a.id = me and a.email_confirmed_at is not null;
  select * into inv from public.invitations where id = invitation for update;

  if inv.id is null or inv.revoked_at is not null
    or exists (select 1 from public.spaces where id = inv.space_id and deleted_at is not null) then
    raise exception 'This invitation is no longer valid.' using errcode = 'P0001', hint = 'invalid';
  end if;
  if inv.accepted_at is not null then
    raise exception 'This invitation has already been used.' using errcode = 'P0001', hint = 'used';
  end if;
  if inv.expires_at < now() then
    raise exception 'This invitation has expired.' using errcode = 'P0001', hint = 'expired';
  end if;
  if my_email is null or lower(my_email) <> inv.email then
    raise exception 'This invitation was sent to a different email address.' using errcode = 'P0001', hint = 'wrong_email';
  end if;
  if exists (select 1 from public.space_members where space_id = inv.space_id and user_id = me) then
    raise exception 'You are already in this space.' using errcode = 'P0001', hint = 'already_member';
  end if;

  insert into public.space_members (space_id, user_id, role) values (inv.space_id, me, inv.role);
  update public.invitations set accepted_at = now(), accepted_by = me where id = inv.id;
  perform private.audit(inv.space_id, 'invitation_accepted');
  return inv.space_id;
end;
$$;
revoke all on function private.accept(uuid) from public, anon, authenticated;

-- From the link in the invitation.
create function public.accept_invitation(token text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  found uuid := (select id from public.invitations where token_hash = encode(extensions.digest(token, 'sha256'), 'hex'));
begin
  if found is null then
    raise exception 'This invitation is no longer valid.' using errcode = 'P0001', hint = 'invalid';
  end if;
  return private.accept(found);
end;
$$;

-- Open invitations for the signed-in person's verified email. Someone who signs up after being
-- invited finds them on their home page, without needing the link again.
create function public.my_invitations()
returns table (id uuid, space_name text, role text, expires_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select i.id, s.name, i.role, i.expires_at
  from public.invitations i
  join public.spaces s on s.id = i.space_id and s.deleted_at is null
  join auth.users a on a.id = (select auth.uid()) and a.email_confirmed_at is not null
  where i.email = lower(a.email) and i.accepted_at is null and i.revoked_at is null and i.expires_at > now()
    and not exists (select 1 from public.space_members m where m.space_id = i.space_id and m.user_id = a.id)
  order by i.created_at desc;
$$;

create function public.accept_my_invitation(invitation uuid)
returns uuid language sql security definer set search_path = '' as $$
  select private.accept(invitation);
$$;

-- MEM-2, AZ-4: an owner removes someone. Access ends with the row.
create function public.remove_member(space uuid, member uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner(space);
  if member = (select auth.uid()) then
    raise exception 'To leave, use Leave space.' using errcode = 'P0001', hint = 'self';
  end if;
  delete from public.space_members where space_id = space and user_id = member;
  perform private.audit(space, 'member_removed');
end;
$$;

-- MEM-3, SPC-6: anyone leaves, except the last owner.
create function public.leave_space(space uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  me uuid := private.require_user();
begin
  if not private.is_member(space) then
    raise exception 'You are not in this space.' using errcode = '42501';
  end if;
  if private.is_owner(space)
    and (select count(*) from public.space_members where space_id = space and role = 'owner') = 1 then
    raise exception 'Make someone else an owner before you leave.' using errcode = 'P0001', hint = 'last_owner';
  end if;
  perform private.audit(space, 'member_left');
  delete from public.space_members where space_id = space and user_id = me;
end;
$$;

-- OQ4, MEM-7: an owner makes another member an owner, or back. Never their own role.
create function public.set_member_role(space uuid, member uuid, new_role text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner(space);
  if member = (select auth.uid()) then
    raise exception 'You cannot change your own role.' using errcode = 'P0001', hint = 'self';
  end if;
  if new_role not in ('owner', 'member') then
    raise exception 'Unknown role.' using errcode = '22023';
  end if;
  update public.space_members set role = new_role where space_id = space and user_id = member;
  perform private.audit(space, 'role_changed');
end;
$$;

do $$
declare
  fn text;
begin
  foreach fn in array array[
    'create_space(text)', 'rename_space(uuid, text)', 'delete_space(uuid)',
    'add_child(uuid, text, date)', 'update_child(uuid, text, date)', 'remove_child(uuid)',
    'space_people(uuid)', 'create_invitation(uuid, text, text)', 'revoke_invitation(uuid)',
    'invitation_preview(text)', 'accept_invitation(text)', 'my_invitations()',
    'accept_my_invitation(uuid)', 'remove_member(uuid, uuid)',
    'leave_space(uuid)', 'set_member_role(uuid, uuid, text)'
  ] loop
    execute format('revoke all on function public.%s from public, anon', fn);
    execute format('grant execute on function public.%s to authenticated', fn);
  end loop;
end;
$$;
