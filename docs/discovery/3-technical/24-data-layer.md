# Nookbud — Data Layer

> **Date:** 2026-04-07
> **Status:** ✅ Decided and implemented (Firebase migration complete 2026-03-29)
> ⚠️ **Superseded (2026-10-14):** [ROADMAP-2026.md](../../../ROADMAP-2026.md) selects Supabase (Postgres + Auth + RLS). The Firebase migration described here was never completed — services are still stubs.
> **Full schema:** `docs/firebase-spec.md`

---

## Architecture

**Offline-first via Firestore's built-in offline cache.** Firebase Firestore persists data locally and syncs when the connection is restored. No custom sync manager needed.

```
User Action → Firestore SDK (local cache) → [auto-sync] → Firebase Firestore (cloud)
                                                              │
                                                    Firebase Storage (files)
```

All reads serve from local cache first; writes queue locally and sync when online. This makes Nookbud functional in low-connectivity environments (relevant for OFW users in remote areas or roaming internationally).

---

## Migration History

| Date | Change |
|------|--------|
| Phase 1 | op-sqlite + Drizzle ORM + Supabase (Auth + DB + Storage) |
| 2026-03-29 | Migrated to Firebase (Firestore + Auth + Storage); offline cache replaces SQLite |

**Artifact cleanup needed:** `package.json` still has `@supabase/supabase-js`, `@op-engineering/op-sqlite`, `drizzle-orm`, `drizzle-kit` — remove these.

---

## Firestore Collection Structure

```
/users/{userId}
  - id, firstName, lastName, email, role, timezone, defaultCurrency, createdAt

/spaces/{spaceId}
  - id, name, emoji, color, createdBy, createdAt, updatedAt, archivedAt?

/spaces/{spaceId}/members/{userId}
  - userId, spaceId, role (owner|editor|viewer), label?, joinedAt, invitedBy

/spaces/{spaceId}/children/{childId}
  - id, spaceId, name, dateOfBirth, avatarUrl?, createdBy, createdAt

/spaces/{spaceId}/entries/{entryId}
  - id, spaceId, type, createdBy, createdAt, version, data (type-specific), requiresAck

/spaces/{spaceId}/entry_versions/{versionId}
  - entryId, version, previousVersionId?, diff, editedBy, editedAt

/spaces/{spaceId}/attachments/{attachmentId}
  - entryId, fileName, fileType, fileSize, storageUrl, sha256Hash, uploadedBy, uploadedAt

/spaces/{spaceId}/acknowledgments/{ackId}
  - entryId, userId, status (pending|acknowledged|disputed), note?, respondedAt?

/spaces/{spaceId}/audit_logs/{logId}
  - action, userId, targetType, targetId, timestamp, details

/spaces/{spaceId}/resources/{resourceId}       ← Phase 4
  - id, title, category, fileAttachmentId, childId?, uploadedBy, uploadedAt

/spaces/{spaceId}/tasks/{taskId}               ← Phase 3.5
  - id, title, description, assignedTo?, dueDate?, status, createdBy, createdAt
```

Full document schemas: `docs/firebase-spec.md`

---

## Firebase Security Rules

All access gated by Space membership. Key rules:
- `/spaces/{spaceId}` — readable/writable only by members of that Space
- `/spaces/{spaceId}/members` — readable by all members; writable only by owner
- `/spaces/{spaceId}/entries` — readable by all members; writable by owner + editor
- `/spaces/{spaceId}/acknowledgments` — writable by editor (not the entry creator)
- `/users/{userId}` — readable/writable only by the authenticated user

Full rules: defined in Firebase Console (not in codebase yet — TODO).

---

## File Storage

### Firebase Storage structure
```
spaces/{spaceId}/entries/{entryId}/{fileName}
spaces/{spaceId}/resources/{resourceId}/{fileName}   ← Phase 4
users/{userId}/avatar/{fileName}
```

### Integrity
- SHA-256 hash computed server-side via Firebase Cloud Function on upload
- Hash stored in `/spaces/{spaceId}/attachments/{attachmentId}.sha256Hash`
- Hash included in every export manifest

### Gating
- File uploads require active Family Plan subscription
- Free/trial users: text entries only; no file uploads

---

## Offline Behavior

| Scenario | Behavior |
|----------|----------|
| Write while offline | Queued locally; synced on reconnection |
| Read while offline | Served from local Firestore cache |
| File upload while offline | Not supported (requires network); user notified |
| Conflict (same doc edited on two devices) | Firestore last-write-wins; entry versioning prevents data loss |

---

## Data Retention Policy

| Data Type | Retention |
|-----------|-----------|
| Active account data | Indefinitely |
| Deleted account | 30 days then hard delete (GDPR requirement) |
| Audit logs | 7 years (legal evidence standard) |
| File attachments (deleted Space) | 90 days after Space archive |

---

## TODO

> Open items for this area are tracked in [ROADMAP-2026.md](../../../ROADMAP-2026.md) — the single source of truth for the roadmap.

**Sources:** `docs/firebase-spec.md`, prd.md (deleted 2026-10-14 — superseded by ROADMAP-2026.md) §12 Technical Constraints, `apps/mobile/package.json`
