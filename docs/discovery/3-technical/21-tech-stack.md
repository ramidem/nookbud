# Nookbud — Tech Stack

> **Status:** Partially decided — extracted from PRD + codebase
> **Depends on:** Product requirements

---

## Overview

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | React Native (Expo) | Cross-platform iOS + Android |
| **Monorepo** | NX | Shared code, multi-app |
| **Language** | TypeScript (strict) | Type safety |
| **Local DB** | SQLite | Local-first |
| **Auth** | Supabase | Auth + cloud DB |
| **File Storage** | Firebase Storage (Blaze) | Pay-as-you-go, gated behind Family Plan |
| **Navigation** | React Navigation | Stack + tabs |
| **Styling** | Tailwind RN (twrnc) | Utility-first |

---

## Project Structure
```
apps/
  mobile/         ← React Native app
  design-system/  ← Shared UI components
```

---

## Infrastructure
- **Cloud DB:** Supabase (PostgreSQL)
- **File Storage:** Firebase Storage
- **CI/CD:** TODO (GCP Cloud Build wired but not fully configured)
- **Monitoring:** TODO

---

## Key Decisions

### Local-first vs Cloud-first
- **Chosen:** Local-first SQLite with Supabase sync
- **Rationale:** Works offline, fast, data sovereignty

### File Integrity
- **Chosen:** SHA-256 hash at upload, stored server-side
- **Rationale:** User-verifiable, court-admissible

---

## TODO
- [ ] Finalize CI/CD pipeline (GCP Cloud Build)
- [ ] Define sync conflict resolution strategy
- [ ] Set up crash reporting / monitoring
- [ ] Document local DB schema
