-- Supabase schema for CoParent
-- Mirrors the local SQLite schema (Drizzle ORM) with Postgres types.
-- SQLite remains the local source of truth; Supabase is additive for sync.
--
-- All tables include `updated_at` for delta-sync queries.
-- Row Level Security (RLS) restricts access to the user's own data.
--
-- Last updated: 2026-03-22
-- Reflects SQLite migrations 0000–0005

-- =============================================================================
-- EXTENSIONS
-- =============================================================================

create extension if not exists "pgcrypto";

-- =============================================================================
-- TABLES
-- =============================================================================

create table users (
  id               uuid primary key default gen_random_uuid(),
  email            text,
  display_name     text not null,
  timezone         text not null default 'UTC',
  default_currency text not null default 'USD',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table relationships (
  id                uuid primary key default gen_random_uuid(),
  parent_a_id       uuid not null references users(id),
  parent_b_id       uuid references users(id),
  invite_token      text,
  invite_expires_at timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table spaces (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  emoji       text not null default '🏠',
  color       text not null default '#6F8F7B',
  created_by  uuid not null references users(id),
  archived_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table space_members (
  id          uuid primary key default gen_random_uuid(),
  space_id    uuid not null references spaces(id),
  user_id     uuid not null references users(id),
  role        text not null default 'editor'
                check (role in ('owner', 'editor', 'viewer')),
  label       text
                check (label in (
                  'co-parent', 'guardian', 'grandparent', 'relative',
                  'lawyer', 'social-worker', 'assistant', 'other'
                )),
  invited_by  uuid references users(id),
  joined_at   timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table children (
  id              uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references relationships(id),
  name            text not null,
  date_of_birth   date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table entries (
  id                 uuid primary key default gen_random_uuid(),
  relationship_id    uuid not null references relationships(id),
  child_id           uuid references children(id),
  type               text not null,
  created_by         uuid not null references users(id),
  status             text not null default 'active'
                       check (status in ('active', 'deleted')),
  current_version_id uuid,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table entry_versions (
  id             uuid primary key default gen_random_uuid(),
  entry_id       uuid not null references entries(id),
  version_number integer not null,
  content_json   text not null,
  diff_json      text,
  created_by     uuid not null references users(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table entries
  add constraint entries_current_version_id_fkey
  foreign key (current_version_id) references entry_versions(id)
  deferrable initially deferred;

create table attachments (
  id                uuid primary key default gen_random_uuid(),
  entry_version_id  uuid not null references entry_versions(id),
  original_filename text not null,
  storage_path      text not null,
  file_hash         text not null,
  file_size_bytes   integer not null,
  mime_type         text not null,
  uploaded_by       uuid not null references users(id),
  uploaded_at       timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table acknowledgments (
  id         uuid primary key default gen_random_uuid(),
  entry_id   uuid not null references entries(id),
  status     text not null default 'pending'
               check (status in ('pending', 'acknowledged', 'disputed')),
  acted_by   uuid references users(id),
  comment    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table disputes (
  id          uuid primary key default gen_random_uuid(),
  entry_id    uuid not null references entries(id),
  raised_by   uuid not null references users(id),
  reason_text text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table dispute_responses (
  id            uuid primary key default gen_random_uuid(),
  dispute_id    uuid not null references disputes(id),
  responded_by  uuid not null references users(id),
  response_text text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table resources (
  id                uuid primary key default gen_random_uuid(),
  space_id          uuid not null references spaces(id),
  child_id          uuid references children(id),
  title             text not null,
  description       text,
  category          text not null
                      check (category in (
                        'medical', 'school', 'legal', 'financial',
                        'identity', 'insurance', 'other'
                      )),
  file_hash         text not null,
  storage_path      text not null,
  original_filename text not null,
  file_size_bytes   integer not null,
  mime_type         text not null,
  uploaded_by       uuid not null references users(id),
  deleted_at        timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table audit_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id),
  action        text not null
                  check (action in (
                    'create', 'update', 'soft_delete', 'acknowledge',
                    'dispute', 'respond', 'archive'
                  )),
  entity_type   text not null
                  check (entity_type in (
                    'user', 'relationship', 'space', 'space_member',
                    'child', 'entry', 'attachment', 'acknowledgment',
                    'dispute', 'dispute_response', 'resource'
                  )),
  entity_id     text not null,
  metadata_json text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table users enable row level security;
alter table relationships enable row level security;
alter table spaces enable row level security;
alter table space_members enable row level security;
alter table children enable row level security;
alter table entries enable row level security;
alter table entry_versions enable row level security;
alter table attachments enable row level security;
alter table acknowledgments enable row level security;
alter table disputes enable row level security;
alter table dispute_responses enable row level security;
alter table resources enable row level security;
alter table audit_logs enable row level security;

-- users
create policy "users_select_own" on users for select using (auth.uid() = id);
create policy "users_insert_own" on users for insert with check (auth.uid() = id);
create policy "users_update_own" on users for update using (auth.uid() = id);

-- relationships
create policy "relationships_access" on relationships for all
  using (auth.uid() = parent_a_id or auth.uid() = parent_b_id);

-- spaces (via space_members — table now exists)
create policy "spaces_access_via_membership" on spaces for all
  using (
    exists (
      select 1 from space_members sm
      where sm.space_id = spaces.id and sm.user_id = auth.uid()
    )
  );

-- space_members
create policy "space_members_access_via_space" on space_members for all
  using (
    exists (
      select 1 from space_members sm
      where sm.space_id = space_members.space_id and sm.user_id = auth.uid()
    )
  );

-- children
create policy "children_access_via_relationship" on children for all
  using (
    exists (
      select 1 from relationships r
      where r.id = children.relationship_id
        and (auth.uid() = r.parent_a_id or auth.uid() = r.parent_b_id)
    )
  );

-- entries
create policy "entries_access_via_relationship" on entries for all
  using (
    exists (
      select 1 from relationships r
      where r.id = entries.relationship_id
        and (auth.uid() = r.parent_a_id or auth.uid() = r.parent_b_id)
    )
  );

-- entry_versions
create policy "entry_versions_access_via_entry" on entry_versions for all
  using (
    exists (
      select 1 from entries e
      join relationships r on r.id = e.relationship_id
      where e.id = entry_versions.entry_id
        and (auth.uid() = r.parent_a_id or auth.uid() = r.parent_b_id)
    )
  );

-- attachments
create policy "attachments_access_via_entry_version" on attachments for all
  using (
    exists (
      select 1 from entry_versions ev
      join entries e on e.id = ev.entry_id
      join relationships r on r.id = e.relationship_id
      where ev.id = attachments.entry_version_id
        and (auth.uid() = r.parent_a_id or auth.uid() = r.parent_b_id)
    )
  );

-- acknowledgments
create policy "acknowledgments_access_via_entry" on acknowledgments for all
  using (
    exists (
      select 1 from entries e
      join relationships r on r.id = e.relationship_id
      where e.id = acknowledgments.entry_id
        and (auth.uid() = r.parent_a_id or auth.uid() = r.parent_b_id)
    )
  );

-- disputes
create policy "disputes_access_via_entry" on disputes for all
  using (
    exists (
      select 1 from entries e
      join relationships r on r.id = e.relationship_id
      where e.id = disputes.entry_id
        and (auth.uid() = r.parent_a_id or auth.uid() = r.parent_b_id)
    )
  );

-- dispute_responses
create policy "dispute_responses_access_via_dispute" on dispute_responses for all
  using (
    exists (
      select 1 from disputes d
      join entries e on e.id = d.entry_id
      join relationships r on r.id = e.relationship_id
      where d.id = dispute_responses.dispute_id
        and (auth.uid() = r.parent_a_id or auth.uid() = r.parent_b_id)
    )
  );

-- resources
create policy "resources_access_via_space" on resources for all
  using (
    exists (
      select 1 from space_members sm
      where sm.space_id = resources.space_id and sm.user_id = auth.uid()
    )
  );

-- audit_logs
create policy "audit_logs_select_own" on audit_logs for select using (auth.uid() = user_id);
create policy "audit_logs_insert_own" on audit_logs for insert with check (auth.uid() = user_id);

-- =============================================================================
-- UPDATED_AT TRIGGERS
-- =============================================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at before update on users for each row execute function update_updated_at();
create trigger relationships_updated_at before update on relationships for each row execute function update_updated_at();
create trigger spaces_updated_at before update on spaces for each row execute function update_updated_at();
create trigger space_members_updated_at before update on space_members for each row execute function update_updated_at();
create trigger children_updated_at before update on children for each row execute function update_updated_at();
create trigger entries_updated_at before update on entries for each row execute function update_updated_at();
create trigger entry_versions_updated_at before update on entry_versions for each row execute function update_updated_at();
create trigger attachments_updated_at before update on attachments for each row execute function update_updated_at();
create trigger acknowledgments_updated_at before update on acknowledgments for each row execute function update_updated_at();
create trigger disputes_updated_at before update on disputes for each row execute function update_updated_at();
create trigger dispute_responses_updated_at before update on dispute_responses for each row execute function update_updated_at();
create trigger resources_updated_at before update on resources for each row execute function update_updated_at();
create trigger audit_logs_updated_at before update on audit_logs for each row execute function update_updated_at();

-- =============================================================================
-- INDEXES
-- =============================================================================

create index idx_spaces_created_by on spaces(created_by);
create index idx_spaces_archived_at on spaces(archived_at);
create index idx_space_members_space on space_members(space_id);
create index idx_space_members_user on space_members(user_id);
create index idx_relationships_parent_a on relationships(parent_a_id);
create index idx_relationships_parent_b on relationships(parent_b_id);
create index idx_children_relationship on children(relationship_id);
create index idx_entries_relationship on entries(relationship_id);
create index idx_entries_updated_at on entries(updated_at);
create index idx_entry_versions_entry on entry_versions(entry_id);
create index idx_entry_versions_updated_at on entry_versions(updated_at);
create index idx_attachments_entry_version on attachments(entry_version_id);
create index idx_acknowledgments_entry on acknowledgments(entry_id);
create index idx_disputes_entry on disputes(entry_id);
create index idx_dispute_responses_dispute on dispute_responses(dispute_id);
create index idx_resources_space on resources(space_id);
create index idx_resources_child on resources(child_id);
create index idx_resources_deleted_at on resources(deleted_at);
create index idx_audit_logs_user on audit_logs(user_id);
create index idx_audit_logs_entity on audit_logs(entity_type, entity_id);
