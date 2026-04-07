# Nookbud — Data Layer

> **Status:** Partially defined — extracted from PRD + codebase
> **Depends on:** Tech stack decisions (21-tech-stack.md)

---

## Architecture
Local-first SQLite with Supabase cloud sync. Offline-capable by design.

```
User Action → Local SQLite → Sync Manager → Supabase (PostgreSQL)
```

---

## Core Entities (Phase 1–3)

### users
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key (Supabase auth) |
| email | string | Auth email |
| display_name | string | |
| avatar_url | string? | |
| created_at | timestamp | |

### spaces
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | |
| name | string | |
| emoji | string? | |
| color | string? | |
| created_by | UUID → users | |
| created_at | timestamp | |
| deleted_at | timestamp? | Soft delete |

### space_members
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | |
| space_id | UUID → spaces | |
| user_id | UUID → users | |
| role | enum: owner, editor, viewer | |
| label | enum: co-parent, guardian, grandparent, relative, lawyer, social-worker, assistant, other? | Display only |
| joined_at | timestamp | |
| invited_by | UUID → users | |

### children
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | |
| space_id | UUID → spaces | |
| name | string | |
| dob | date | |
| created_by | UUID → users | |

### entries
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | |
| space_id | UUID → spaces | |
| type | enum: expense, event, agreement, communication, milestone | |
| created_by | UUID → users | |
| created_at | timestamp | Server-set |
| version | int | Incremented on edit |
| data | jsonb | Type-specific payload |
| requires_ack | boolean | |

### acknowledgments
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | |
| entry_id | UUID → entries | |
| user_id | UUID → users | |
| status | enum: pending, acknowledged, disputed | |
| note | string? | Required if disputed |
| responded_at | timestamp? | |

---

## File Storage
- Firebase Storage (Blaze, pay-as-you-go)
- SHA-256 hash computed server-side on upload
- Hash stored in `file_attachments` table alongside Firebase URL
- Access gated behind Family Plan subscription

---

## Sync Strategy
- Local SQLite as source of truth while offline
- Sync on connection restore
- Conflict resolution: server wins for timestamps; TODO for concurrent edits

---

## TODO
- [ ] Finalize sync conflict resolution strategy
- [ ] Define retention/archival policy
- [ ] Document migration strategy (relationship → spaces was Phase 3)
- [ ] Define export JSON schema
