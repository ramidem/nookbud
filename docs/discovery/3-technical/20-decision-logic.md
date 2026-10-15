# Nookbud — Core Decision Logic

> **Date:** 2026-04-07
> **Status:** ✅ Documented (extracted from PRD + implemented in Phase 1–3)

---

## Overview

Nookbud's decision logic governs five domains: record integrity, entry versioning, acknowledgment state machine, role-based authorization, and export generation. Most of this logic is already implemented in Phases 1–3.

---

## 1. Record Integrity

### Rule: All entries are immutable after creation
- Entries are never deleted — only amended
- Edits create new versions with a diff (see Versioning)
- Server-side timestamps only — client cannot set or modify timestamps
- File integrity: SHA-256 hash computed server-side at upload, stored in `file_attachments.hash`

### Rule: Timestamps are authoritative
- `created_at` and `updated_at` are set server-side (PostgreSQL `NOW()`)
- Client cannot pass custom timestamps
- This is what makes Nookbud records court-defensible

---

## 2. Entry Versioning

### Rule: Edit = new version, not overwrite
- Every edit to an entry creates a new version with:
  - `version` integer (incremented)
  - `previous_version_id` FK to prior version
  - `diff` — what changed (field-level diff)
  - `edited_by` — who made the change
  - `edited_at` — server timestamp
- Original version is never overwritten or deleted
- Export includes full version history for every entry

### Entry Types
| Type | Description | Versioned |
|------|-------------|-----------|
| Expense | Financial transaction in a care arrangement | ✅ |
| Event | Scheduled/completed care event (pickup, medical, school) | ✅ |
| Agreement | Documented verbal or written agreement | ✅ |
| Communication | Logged communication between members | ✅ |
| Milestone | Child milestone (first word, birthday, etc.) | ✅ |
| Upload | File attachment with SHA-256 hash | ✅ |

---

## 3. Acknowledgment State Machine

Every entry can be marked `requires_ack = true` by the creator. This initiates the acknowledgment flow.

```
          [Entry Created with requires_ack = true]
                          │
                          ▼
                    [PENDING]
                     │     │
           (respond) │     │ (no response after X days)
                     │     │
              ┌──────┘     └──────┐
              ▼                   ▼
        [ACKNOWLEDGED]         [EXPIRED]
              │
         (with note)
              │
              ▼
          [DISPUTED]
```

### State Rules
| State | Description | Who can trigger |
|-------|-------------|-----------------|
| PENDING | Entry sent, awaiting response | System (auto on create) |
| ACKNOWLEDGED | Recipient confirmed | Editor or viewer with ACK rights |
| DISPUTED | Recipient disputes content | Editor or viewer with ACK rights |
| EXPIRED | No response after defined period | System (background job) |

### Expiry
- Default: 14 days with no response → EXPIRED
- EXPIRED entries still show in timeline; no further action required
- EXPIRED ≠ deleted; it's an audit event

---

## 4. Role-Based Authorization

Three roles per Space. Roles are set per-member per-Space (a user can have different roles in different Spaces).

### Role Capabilities

| Action | Owner | Editor | Viewer |
|--------|-------|--------|--------|
| View entries and timeline | ✅ | ✅ | ✅ |
| Create new entries | ✅ | ✅ | ❌ |
| Edit own entries | ✅ | ✅ | ❌ |
| Acknowledge / dispute entries | ✅ | ✅ | ❌ |
| Export verified report | ✅ | ✅ | ✅ |
| Invite members | ✅ | ❌ | ❌ |
| Assign / change member roles | ✅ | ❌ | ❌ |
| Remove members | ✅ | ❌ | ❌ |
| Rename Space | ✅ | ❌ | ❌ |
| Change Space emoji / color | ✅ | ❌ | ❌ |
| Delete Space (soft) | ✅ | ❌ | ❌ |
| Transfer ownership | ✅ | ❌ | ❌ |

### Authorization Enforcement (Multi-layer)
1. **Route level** — unauthenticated requests rejected
2. **Space membership check** — user must be a member of the Space they're accessing
3. **Role check** — user's role must permit the action
4. **Resource ownership** — some actions (e.g., editing an entry) also require the user to be the creator

---

## 5. Invite Code Logic

- Owner generates a 6-character alphanumeric code
- Code is single-use and expires after 7 days
- Code carries a pre-assigned role (owner selects at generation)
- `acceptInvite(code, userId)` validates: not expired, not already used, user not already a member
- After acceptance: code marked consumed, `space_members` row created

---

## 6. Export Generation

### Export Types

**A. PDF Report (Verified Care Report)**
- Full timeline of entries in date range
- Each entry shows: type, date, creator, version count, acknowledgment status
- File attachments listed with SHA-256 hash
- Nookbud logo + generation timestamp

**B. Evidence Bundle (ZIP)**
- `report.pdf` — PDF report above
- `data.json` — machine-readable export of all entries
- `attachments/` — all uploaded files in the date range
- `manifest.txt` — SHA-256 hash of every file in the bundle

### Integrity Verification
Anyone with the ZIP bundle can independently verify file integrity:
```bash
sha256sum attachments/photo-2026-01-15.jpg
# Compare output to manifest.txt
```

This makes Nookbud's exports user-verifiable — no need to "trust the platform."

---

## 7. Subscription Gating Logic

| Feature | Free (Trial / 1 Space solo) | Family Plan |
|---------|---------------------------|-------------|
| 1 Space, solo use | ✅ | ✅ |
| Text entries (all types) | ✅ | ✅ |
| Court-ready export (text only) | ✅ | ✅ |
| Multiple Spaces | ❌ | ✅ |
| Invite co-parents / members | ❌ | ✅ |
| File uploads (attachments, resources) | ❌ | ✅ |
| Evidence bundle with attachments | ❌ | ✅ |

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Space owner leaves | Owner must transfer ownership first; cannot leave without a new owner |
| User tries to join a Space they're already in | `acceptInvite` rejects — "already a member" |
| Entry edited after acknowledgment | New version created; acknowledgment state resets to PENDING for the new version |
| Export with no entries | Returns empty PDF with date range and Space info |
| File upload fails | Entry created without attachment; user notified to retry upload |
| User deletes account | Soft delete user; entries attributed to "Deleted Member" in Spaces they were part of |

---

**Sources:** prd.md (deleted 2026-10-14 — superseded by ROADMAP-2026.md) (Phases 1–3 implementation specs)
