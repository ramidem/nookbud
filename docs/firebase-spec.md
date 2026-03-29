# NookBud — Firebase/Firestore Spec

> Decision: Migrate from SQLite + Drizzle + Supabase → Firebase/Firestore
> Date: 2026-03-29

---

## Stack After Migration

| Layer | Before | After |
|---|---|---|
| Local DB | op-sqlite + Drizzle | Firestore offline cache (built-in) |
| Cloud DB | Supabase (Postgres) | Firebase Firestore |
| Auth | Supabase Auth | Firebase Auth |
| File Storage | Supabase Storage | Firebase Storage |
| Real-time | Stub (not implemented) | Firestore real-time listeners (built-in) |
| Sync | Custom stub | Firestore offline-first (built-in) |

---

## Firestore Data Model

### Collection Structure

```
/users/{userId}
/spaces/{spaceId}
/spaces/{spaceId}/members/{userId}
/spaces/{spaceId}/children/{childId}
/spaces/{spaceId}/entries/{entryId}
/spaces/{spaceId}/entry_versions/{versionId}
/spaces/{spaceId}/attachments/{attachmentId}
/spaces/{spaceId}/acknowledgments/{ackId}
/spaces/{spaceId}/disputes/{disputeId}
/spaces/{spaceId}/dispute_responses/{responseId}
/spaces/{spaceId}/audit_logs/{logId}
/spaces/{spaceId}/resources/{resourceId}
/spaces/{spaceId}/tasks/{taskId}
```

---

### Document Schemas

#### `/users/{userId}`
```ts
{
  id: string                    // Firebase Auth UID
  firstName: string
  lastName: string
  middleName?: string
  email?: string
  role?: 'mother' | 'father' | 'guardian' | 'other'
  timezone: string              // default 'UTC'
  defaultCurrency: string       // default 'USD'
  createdAt: Timestamp
}
```

#### `/spaces/{spaceId}`
```ts
{
  id: string
  name: string
  emoji: string                 // default '🏠'
  color: string                 // default '#6F8F7B'
  createdBy: string             // userId
  createdAt: Timestamp
  updatedAt: Timestamp
  archivedAt?: Timestamp
}
```

#### `/spaces/{spaceId}/members/{userId}`
```ts
{
  userId: string
  spaceId: string
  role: 'owner' | 'editor' | 'viewer'
  label?: 'co-parent' | 'guardian' | 'grandparent' | 'relative' | 'lawyer' | 'social-worker' | 'assistant' | 'other'
  invitedBy?: string            // userId
  joinedAt: Timestamp
}
```

#### `/spaces/{spaceId}/children/{childId}`
```ts
{
  id: string
  spaceId: string
  name: string
  dateOfBirth?: Timestamp
  role?: 'father' | 'mother' | 'step-father' | 'step-mother' | 'grandfather' | 'grandmother' | 'guardian' | 'foster-parent' | 'aunt-uncle' | 'other'
  createdAt: Timestamp
}
```

#### `/spaces/{spaceId}/entries/{entryId}`
```ts
{
  id: string
  spaceId: string
  childId?: string
  type: 'expense' | 'event' | 'agreement' | 'communication' | 'upload'
  status: 'active' | 'soft_deleted'
  createdBy: string             // userId
  currentVersionId: string      // points to latest entry_version
  createdAt: Timestamp
}
```

#### `/spaces/{spaceId}/entry_versions/{versionId}`
```ts
{
  id: string
  entryId: string
  versionNumber: number
  contentJson: string           // JSON string of typed content
  diffJson?: string             // JSON diff from previous version
  createdBy: string             // userId
  createdAt: Timestamp
}
```

#### `/spaces/{spaceId}/attachments/{attachmentId}`
```ts
{
  id: string
  entryVersionId: string
  originalFilename: string
  mimeType: string
  fileSizeBytes: number
  fileHash: string              // SHA-256
  storagePath: string           // Firebase Storage path
  uploadedBy: string            // userId
  uploadedAt: Timestamp
}
```

#### `/spaces/{spaceId}/acknowledgments/{ackId}`
```ts
{
  id: string
  entryId: string
  status: 'pending' | 'acknowledged' | 'disputed'
  actedBy?: string              // userId
  comment?: string
  createdAt: Timestamp
}
```

#### `/spaces/{spaceId}/disputes/{disputeId}`
```ts
{
  id: string
  entryId: string
  raisedBy: string              // userId
  reasonText: string
  createdAt: Timestamp
}
```

#### `/spaces/{spaceId}/dispute_responses/{responseId}`
```ts
{
  id: string
  disputeId: string
  respondedBy: string           // userId
  responseText: string
  createdAt: Timestamp
}
```

#### `/spaces/{spaceId}/audit_logs/{logId}`
```ts
{
  id: string
  userId: string
  action: 'create' | 'update' | 'soft_delete' | 'delete' | 'leave' | 'acknowledge' | 'dispute' | 'respond' | 'generate_invite' | 'accept_invite' | 'assign_role' | 'remove_member' | 'transfer_ownership' | 'upload' | 'archive' | 'unarchive'
  entityType: 'user' | 'space' | 'child' | 'entry' | 'attachment' | 'acknowledgment' | 'dispute' | 'dispute_response' | 'resource' | 'task'
  entityId: string
  metadataJson?: string
  createdAt: Timestamp
}
```

#### `/spaces/{spaceId}/resources/{resourceId}`
```ts
{
  id: string
  spaceId: string
  childId?: string
  title: string
  description?: string
  category: 'medical' | 'school' | 'legal' | 'financial' | 'identity' | 'insurance' | 'other'
  originalFilename: string
  mimeType: string
  fileSizeBytes: number
  fileHash: string
  storagePath: string           // Firebase Storage path
  uploadedBy: string            // userId
  createdAt: Timestamp
  deletedAt?: Timestamp
}
```

#### `/spaces/{spaceId}/tasks/{taskId}`
```ts
{
  id: string
  spaceId: string
  childId?: string
  title: string
  description?: string
  status: 'open' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  assignedTo?: string           // userId
  dueDate?: Timestamp
  completedBy?: string          // userId
  completedAt?: Timestamp
  createdBy: string             // userId
  createdAt: Timestamp
  updatedAt: Timestamp
  deletedAt?: Timestamp
}
```

---

## Security Rules

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users — read own, write own
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      // Space members can read other members' profiles
      allow read: if exists(/databases/$(database)/documents/spaces/$(resource.data.spaceId)/members/$(request.auth.uid));
    }

    // Spaces — only members can access
    match /spaces/{spaceId} {
      function isMember() {
        return exists(/databases/$(database)/documents/spaces/$(spaceId)/members/$(request.auth.uid));
      }
      function isOwner() {
        return get(/databases/$(database)/documents/spaces/$(spaceId)/members/$(request.auth.uid)).data.role == 'owner';
      }

      allow read: if isMember();
      allow create: if request.auth != null;
      allow update: if isOwner();
      allow delete: if isOwner();

      // All subcollections — members only
      match /{subcollection}/{docId} {
        allow read, write: if isMember();
      }
    }
  }
}
```

---

## Cleanup Plan (Before Implementation)

### Files to DELETE
```
apps/mobile/src/database/           ← entire folder (SQLite + Drizzle)
apps/mobile/src/services/sync.service.ts
apps/mobile/src/database/schema/relationships.ts (already deprecated)
supabase/                           ← entire folder
```

### Packages to REMOVE
```
@op-engineering/op-sqlite
drizzle-orm
drizzle-kit
@supabase/supabase-js
```

### Files to REWRITE (28 files)
```
Services (15):
  entry.service.ts
  space.service.ts
  space-member.service.ts
  child.service.ts
  task.service.ts
  user.service.ts
  auth.service.ts
  file.service.ts
  audit.service.ts
  acknowledgment.service.ts
  dispute.service.ts
  resource.service.ts
  notification.service.ts
  timeline.service.ts
  log.service.ts

Config (3):
  config/supabase.ts → config/firebase.ts
  config/index.ts
  .env / .env.template

App root (1):
  src/main.tsx → add FirebaseProvider

Types (9):
  Replace all Drizzle schema types with Firebase interfaces
  (can live in src/types/firebase/)
```

### Files that STAY (untouched)
```
All 33 screens
All navigation files
All stores (Zustand/MMKV)
All hooks
All components
All utilities (diff.util, etc.)
notification.service.ts (logic stays, just swap DB calls)
export.service.ts (reads local data, minor changes)
```

---

## Implementation Plan

### Phase 0 — Cleanup (Day 1, morning)
1. Remove Drizzle + op-sqlite packages
2. Remove Supabase package
3. Delete `src/database/` folder
4. Delete `supabase/` folder
5. Update `package.json`

### Phase 1 — Firebase Setup (Day 1, afternoon)
1. Create Firebase project (NookBud-Dev)
2. Enable Firestore + Firebase Auth + Firebase Storage
3. Install `@react-native-firebase/app` + `@react-native-firebase/firestore` + `@react-native-firebase/auth` + `@react-native-firebase/storage`
4. iOS: `pod install`
5. Add `google-services.json` (Android) + `GoogleService-Info.plist` (iOS)
6. Create `config/firebase.ts`
7. Write Firestore security rules
8. Write TypeScript interfaces (`src/types/firebase/`)

### Phase 2 — Auth (Day 2, morning)
1. Rewrite `auth.service.ts` → Firebase Auth
2. Test: sign up, sign in, sign out, session persistence

### Phase 3 — Core Services (Day 2-3)
Rewrite in this order (dependency order):
1. `user.service.ts`
2. `space.service.ts`
3. `space-member.service.ts`
4. `child.service.ts`
5. `entry.service.ts` + `entry_versions`
6. `acknowledgment.service.ts`
7. `dispute.service.ts`
8. `task.service.ts`
9. `resource.service.ts`
10. `audit.service.ts`
11. `file.service.ts` → Firebase Storage
12. `timeline.service.ts`
13. `log.service.ts`
14. `notification.service.ts`
15. `export.service.ts`

### Phase 4 — Real-time (Day 4, morning)
1. Add Firestore `onSnapshot` listeners to SpaceService
2. Real-time Space updates → co-parent sees changes instantly
3. Real-time entry feed on Timeline

### Phase 5 — Test + Fix (Day 4, afternoon)
1. Run all 63 stories
2. Fix failing ones
3. Test offline → online sync
4. Test two-device co-parent scenario

---

## Cost Optimizations Applied

### Changes from naive implementation:
1. **Audit logs embedded** in entry/space `_auditTrail[]` array (max 50 entries) — removes ~68 writes/user/month
2. **Entry versions deduped** — skip write if content hash unchanged — saves ~40%
3. **Dispute responses embedded** in dispute document — removes subcollection
4. **memberIds[] denormalized** in Space — avoids extra reads for security checks
5. **Pagination** — load entries in pages of 20, not all at once
6. **Selective real-time listeners** — only active Space + current feed, not all subcollections
7. **Non-blocking audit** — audit writes are fire-and-forget, don't block user action

---

## Cost Projection (Optimized)

| MAU | Reads/mo | Writes/mo | Storage | Cost/mo |
|---|---|---|---|---|
| 10 | 131K | 680 | ~10MB | **$0** |
| 100 | 1.31M | 6.8K | ~100MB | **~$0.01** |
| 500 | 6.55M | 34K | ~500MB | **~$0.10** |
| 1,000 | 13.1M | 68K | ~1GB | **~$0.39** |
| 5,000 | 65.5M | 340K | ~5GB | **~$1.95** |
| 10,000 | 131M | 680K | ~10GB | **~$23/mo** |

Free tier covers ~4 daily active users. Paid kicks in after that but stays cheap.

---

## Dropped: Supabase
All Supabase work (tables, publication, RLS) is abandoned.
The `powersync` publication and `tasks` table created today can be left as-is or cleaned up later.

---

## Notes
- Firebase project region: **asia-east1** (Taiwan) or **asia-southeast1** (Singapore) — closest to PH
- Firestore offline persistence: enabled by default on mobile
- Firebase Auth: email/password + Google Sign-In (later)
- `relationships` table: already deprecated, not migrated to Firestore
