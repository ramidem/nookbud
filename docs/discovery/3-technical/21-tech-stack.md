# Nookbud — Tech Stack

> **Date:** 2026-04-07
> **Status:** ✅ Decided and implemented (Phases 1–3 complete)

---

## Current Stack

| Layer | Technology | Version | Decision Date |
|-------|------------|---------|--------------|
| **Framework** | React Native (Expo CNG) | 0.83 + React 19 | Phase 1 |
| **Language** | TypeScript (strict) | 5.8 | Phase 1 |
| **Monorepo** | NX | — | Phase 1 |
| **Cloud DB** | Firebase Firestore | — | 2026-03-29 |
| **Auth** | Firebase Auth | — | 2026-03-29 |
| **File Storage** | Firebase Storage (Blaze) | — | 2026-03-29 |
| **Local / Offline** | Firestore offline cache | Built-in | 2026-03-29 |
| **Styling** | twrnc (Tailwind RN) | — | Phase 1 |
| **Navigation** | React Navigation | — | Phase 1 |

---

## Key Architecture Decision: Firebase Migration (2026-03-29)

**Before:** op-sqlite + Drizzle ORM + Supabase (Auth + DB + Storage)
**After:** Firebase (Firestore + Auth + Storage)

**Rationale:**
- Firestore's offline-first cache eliminates the need for a separate SQLite + Drizzle layer
- Built-in real-time sync (no custom sync manager needed)
- Firebase Auth is simpler for mobile than Supabase JWT flows
- Pay-as-you-go Storage (Blaze) aligns with file upload gating behind Family Plan
- Cost-effective at early stage: generous free tier on Firestore

**Note:** The codebase still has `@supabase/supabase-js`, `op-sqlite`, and `drizzle-orm` in `package.json` — these are migration artifacts and should be removed when Firebase migration is fully complete.

---

## Project Structure

```
apps/
  mobile/           ← React Native app (Expo CNG)
    app/            ← screens + navigation
    components/     ← UI components
    config/         ← app config
    hooks/          ← custom hooks
    navigation/     ← navigation structure
    schemas/        ← Zod schemas / validation
    screens/        ← legacy screens (being migrated)
    services/       ← Firebase service layer
    stores/         ← Zustand state stores
    types/          ← TypeScript types
    utils/          ← utilities
  design-system/    ← shared UI atoms/molecules
```

---

## Firebase Data Model

Firestore collection hierarchy:
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
/spaces/{spaceId}/audit_logs/{logId}
/spaces/{spaceId}/resources/{resourceId}        ← Phase 4
/spaces/{spaceId}/tasks/{taskId}                ← Phase 3.5
```

Full schema: see `docs/firebase-spec.md`

---

## GCP Setup

- **Project ID:** `coparent-dev-491018`
- **Cloud Build triggers:** nookbud-web, nookbud-admin, nookbud-backend, nookbud-landing
- **Landing page:** Cloud Run container (server.js at `/app/apps/landing/server.js`)
- **Status:** Landing deploy has a container start issue — pending fix

---

## Infrastructure

| Service | Tier | Cost |
|---------|------|------|
| Firebase Firestore | Spark (free) → Blaze | Free up to 1GB/50K reads/20K writes per day |
| Firebase Auth | Free | Free up to 10K/month |
| Firebase Storage (Blaze) | Pay-as-you-go | $0.026/GB/month; free 5GB |
| GCP Cloud Run | Pay-as-you-go | Landing page hosting |

---

## Dependencies (Key)

```json
{
  "react-native": "0.83",
  "react": "19",
  "@react-native-firebase/app": "installed",
  "@react-native-firebase/auth": "installed",
  "@react-native-firebase/firestore": "installed",
  "@react-native-firebase/storage": "installed",
  "@react-native-firebase/crashlytics": "installed",
  "react-native-calendars": "^1.1314.0",
  "twrnc": "tailwind styling"
}
```

---

## Cleanup TODO

- [ ] Remove `@supabase/supabase-js` from package.json (migration artifact)
- [ ] Remove `@op-engineering/op-sqlite` (replaced by Firestore offline cache)
- [ ] Remove `drizzle-orm` and `drizzle-kit` (replaced by Firestore)
- [ ] Fix Cloud Run landing deploy (container start issue)
- [ ] Reconnect GCP repo triggers + verify all 4 Cloud Build triggers

---

## Future Considerations

- **Web portal (Phase 6):** React or Next.js; reuse Firebase + shared types
- **RevenueCat:** Not yet integrated (Falcly has this — reuse pattern)
- **PostHog:** Not yet integrated (Falcly has this — reuse pattern)
- **Push notifications:** Firebase Cloud Messaging (FCM) — planned for Phase 3.5+

**Sources:** `docs/firebase-spec.md`, `apps/mobile/package.json`, prd.md §12 Technical Constraints
