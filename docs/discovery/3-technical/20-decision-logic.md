# Nookbud — Core Decision Logic

> **Date:** 2026-04-07
> **Status:** ✅ Documented (extracted from PRD + implemented in Phase 1–3)

---

## Overview

Nookbud's decision logic governs four domains: record integrity, entry versioning, acknowledgment state machine, and export generation. Most of this logic is already implemented in Phases 1–3.

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

## 4. Export Generation

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

## 5. Subscription Gating Logic

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
| Entry edited after acknowledgment | New version created; acknowledgment state resets to PENDING for the new version |
| Export with no entries | Returns empty PDF with date range and Space info |
| File upload fails | Entry created without attachment; user notified to retry upload |

---

**Sources:** prd.md (deleted 2026-10-14 — superseded by ROADMAP-2026.md) (Phases 1–3 implementation specs)
