-- Supabase schema for CoParent
-- Mirrors the local SQLite schema (Drizzle ORM) with Postgres types.
-- SQLite remains the local source of truth; Supabase is additive for sync.
--
-- All tables include `updated_at` for delta-sync queries.
-- Row Level Security (RLS) restricts access to the user's own relationship data.

-- =============================================================================
-- EXTENSIONS
-- =============================================================================

create extension if not exists "pgcrypto";

-- =============================================================================
-- USERS
-- =============================================================================
-- Local user profile. One row per device user.

create table users (
  id            uuid primary key default gen_random_uuid(),
  email         text,
  display_name  text not null,
  timezone      text not null default 'UTC',
  default_currency text not null default 'USD',  -- ISO 4217
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table users enable row level security;

create policy "users_select_own"
  on users for select
  using (auth.uid() = id);

create policy "users_insert_own"
  on users for insert
  with check (auth.uid() = id);

create policy "users_update_own"
  on users for update
  using (auth.uid() = id);

-- =============================================================================
-- RELATIONSHIPS
-- =============================================================================
-- A co-parenting relationship between two users.
-- parent_b_id is nullable until the partner accepts the invite.

create table relationships (
  id                uuid primary key default gen_random_uuid(),
  parent_a_id       uuid not null references users(id),
  parent_b_id       uuid references users(id),
  invite_token      text,
  invite_expires_at timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table relationships enable row level security;

create policy "relationships_select_own"
  on relationships for select
  using (auth.uid() = parent_a_id or auth.uid() = parent_b_id);

create policy "relationships_insert_own"
  on relationships for insert
  with check (auth.uid() = parent_a_id);

create policy "relationships_update_own"
  on relationships for update
  using (auth.uid() = parent_a_id or auth.uid() = parent_b_id);

-- =============================================================================
-- CHILDREN
-- =============================================================================
-- Children linked to a relationship.

create table children (
  id              uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references relationships(id),
  name            text not null,
  date_of_birth   timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table children enable row level security;

create policy "children_access_via_relationship"
  on children for all
  using (
    exists (
      select 1 from relationships r
      where r.id = children.relationship_id
        and (auth.uid() = r.parent_a_id or auth.uid() = r.parent_b_id)
    )
  );

-- =============================================================================
-- ENTRIES
-- =============================================================================
-- Core records: expenses, events, agreements, communications, uploads.
-- Each entry has versioned content via entry_versions.

create table entries (
  id                 uuid primary key default gen_random_uuid(),
  relationship_id    uuid not null references relationships(id),
  child_id           uuid references children(id),
  type               text not null check (type in ('expense', 'event', 'agreement', 'communication', 'upload')),
  created_by         uuid not null references users(id),
  current_version_id uuid,  -- FK added after entry_versions is created
  status             text not null default 'active' check (status in ('active', 'soft_deleted')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table entries enable row level security;

create policy "entries_access_via_relationship"
  on entries for all
  using (
    exists (
      select 1 from relationships r
      where r.id = entries.relationship_id
        and (auth.uid() = r.parent_a_id or auth.uid() = r.parent_b_id)
    )
  );

-- =============================================================================
-- ENTRY VERSIONS
-- =============================================================================
-- Immutable version history for entries. Each edit creates a new version.

create table entry_versions (
  id             uuid primary key default gen_random_uuid(),
  entry_id       uuid not null references entries(id),
  version_number integer not null,
  content_json   text not null,        -- JSON string of typed content
  diff_json      text,                 -- JSON diff from previous version (null for v1)
  created_by     uuid not null references users(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Now add the FK from entries.current_version_id → entry_versions.id
alter table entries
  add constraint entries_current_version_fk
  foreign key (current_version_id) references entry_versions(id);

alter table entry_versions enable row level security;

create policy "entry_versions_access_via_entry"
  on entry_versions for all
  using (
    exists (
      select 1 from entries e
      join relationships r on r.id = e.relationship_id
      where e.id = entry_versions.entry_id
        and (auth.uid() = r.parent_a_id or auth.uid() = r.parent_b_id)
    )
  );

-- =============================================================================
-- ATTACHMENTS
-- =============================================================================
-- Files attached to entry versions. Integrity verified via SHA-256 hash.

create table attachments (
  id                uuid primary key default gen_random_uuid(),
  entry_version_id  uuid not null references entry_versions(id),
  file_hash         text not null,           -- SHA-256 hex
  file_size_bytes   integer not null,
  original_filename text not null,
  mime_type         text not null,
  storage_path      text not null,           -- Supabase Storage path
  uploaded_by       uuid not null references users(id),
  uploaded_at       timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table attachments enable row level security;

create policy "attachments_access_via_entry_version"
  on attachments for all
  using (
    exists (
      select 1 from entry_versions ev
      join entries e on e.id = ev.entry_id
      join relationships r on r.id = e.relationship_id
      where ev.id = attachments.entry_version_id
        and (auth.uid() = r.parent_a_id or auth.uid() = r.parent_b_id)
    )
  );

-- =============================================================================
-- ACKNOWLEDGMENTS
-- =============================================================================
-- Partner acknowledgments or disputes of entries.

create table acknowledgments (
  id         uuid primary key default gen_random_uuid(),
  entry_id   uuid not null references entries(id),
  status     text not null default 'pending' check (status in ('pending', 'acknowledged', 'disputed')),
  acted_by   uuid references users(id),  -- null if still pending
  comment    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table acknowledgments enable row level security;

create policy "acknowledgments_access_via_entry"
  on acknowledgments for all
  using (
    exists (
      select 1 from entries e
      join relationships r on r.id = e.relationship_id
      where e.id = acknowledgments.entry_id
        and (auth.uid() = r.parent_a_id or auth.uid() = r.parent_b_id)
    )
  );

-- =============================================================================
-- DISPUTES
-- =============================================================================
-- Formal disputes raised against entries.

create table disputes (
  id          uuid primary key default gen_random_uuid(),
  entry_id    uuid not null references entries(id),
  raised_by   uuid not null references users(id),
  reason_text text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table disputes enable row level security;

create policy "disputes_access_via_entry"
  on disputes for all
  using (
    exists (
      select 1 from entries e
      join relationships r on r.id = e.relationship_id
      where e.id = disputes.entry_id
        and (auth.uid() = r.parent_a_id or auth.uid() = r.parent_b_id)
    )
  );

-- =============================================================================
-- DISPUTE RESPONSES
-- =============================================================================
-- Text responses within a dispute thread.

create table dispute_responses (
  id            uuid primary key default gen_random_uuid(),
  dispute_id    uuid not null references disputes(id),
  responded_by  uuid not null references users(id),
  response_text text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table dispute_responses enable row level security;

create policy "dispute_responses_access_via_dispute"
  on dispute_responses for all
  using (
    exists (
      select 1 from disputes d
      join entries e on e.id = d.entry_id
      join relationships r on r.id = e.relationship_id
      where d.id = dispute_responses.dispute_id
        and (auth.uid() = r.parent_a_id or auth.uid() = r.parent_b_id)
    )
  );

-- =============================================================================
-- AUDIT LOGS
-- =============================================================================
-- Complete audit trail for compliance. Records every mutation.

create table audit_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id),
  action        text not null check (action in ('create', 'update', 'soft_delete', 'acknowledge', 'dispute', 'respond')),
  entity_type   text not null check (entity_type in ('user', 'relationship', 'child', 'entry', 'attachment', 'acknowledgment', 'dispute', 'dispute_response')),
  entity_id     text not null,
  metadata_json text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table audit_logs enable row level security;

create policy "audit_logs_select_own"
  on audit_logs for select
  using (auth.uid() = user_id);

create policy "audit_logs_insert_own"
  on audit_logs for insert
  with check (auth.uid() = user_id);

-- =============================================================================
-- UPDATED_AT TRIGGERS
-- =============================================================================
-- Auto-update `updated_at` on row modification for delta-sync queries.

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at before update on users for each row execute function update_updated_at();
create trigger relationships_updated_at before update on relationships for each row execute function update_updated_at();
create trigger children_updated_at before update on children for each row execute function update_updated_at();
create trigger entries_updated_at before update on entries for each row execute function update_updated_at();
create trigger entry_versions_updated_at before update on entry_versions for each row execute function update_updated_at();
create trigger attachments_updated_at before update on attachments for each row execute function update_updated_at();
create trigger acknowledgments_updated_at before update on acknowledgments for each row execute function update_updated_at();
create trigger disputes_updated_at before update on disputes for each row execute function update_updated_at();
create trigger dispute_responses_updated_at before update on dispute_responses for each row execute function update_updated_at();
create trigger audit_logs_updated_at before update on audit_logs for each row execute function update_updated_at();

-- =============================================================================
-- INDEXES
-- =============================================================================
-- Optimize common sync and lookup queries.

create index idx_entries_relationship on entries(relationship_id);
create index idx_entries_updated_at on entries(updated_at);
create index idx_entry_versions_entry on entry_versions(entry_id);
create index idx_entry_versions_updated_at on entry_versions(updated_at);
create index idx_children_relationship on children(relationship_id);
create index idx_acknowledgments_entry on acknowledgments(entry_id);
create index idx_disputes_entry on disputes(entry_id);
create index idx_dispute_responses_dispute on dispute_responses(dispute_id);
create index idx_audit_logs_user on audit_logs(user_id);
create index idx_audit_logs_entity on audit_logs(entity_type, entity_id);
