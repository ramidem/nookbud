# CoParent — Product Requirements Document

> **Version:** 2.0
> **Date:** 2026-03-21
> **Status:** Phases 1–2 Complete — Phase 3 (Spaces) Next

---

## Table of Contents

1. [Overview](#1-overview)
2. [Problem Statement](#2-problem-statement)
3. [Solution](#3-solution)
4. [Phases Overview](#4-phases-overview)
5. [Phase 1 — Core Evidence System (Complete)](#5-phase-1--core-evidence-system-complete)
6. [Phase 2 — Native UX Improvements (Complete)](#6-phase-2--native-ux-improvements-complete)
7. [Phase 3 — Spaces (Next)](#7-phase-3--spaces-next)
8. [Phase 4 — Resources](#8-phase-4--resources)
9. [Phase 5 — Intelligence](#9-phase-5--intelligence)
10. [Phase 6 — Collaboration (Web)](#10-phase-6--collaboration-web)
11. [Success Metrics](#11-success-metrics)
12. [Technical Constraints](#12-technical-constraints)
13. [Appendix](#13-appendix)

---

## 1. Overview

### Product Name
**CoParent**

### Tagline
*"Shared records for everyone raising a child."*

### One-Line Description
A shared care records platform that works across family structures — verified, immutable, and exportable for courts, schools, hospitals, and immigration.

### Vision
CoParent becomes the definitive record system for shared child care: a platform that any combination of caregivers — parents, guardians, extended family, lawyers — can trust, contribute to, and rely on when documentation matters. Not because of a marketing claim, but because the technical architecture makes tampering verifiably impossible and the product design includes every family structure.

### Positioning Statement
CoParent is the first shared care records platform built for **every family structure** — not just divorced parents. Where competitors create communication logs, CoParent creates verified care records across Spaces.

### Target Audience (Summary)
- **Primary:** Separated/divorced parents needing defensible care records
- **Expansion:** OFW families, grandparent guardians, blended families, open adoption arrangements
- **B2B (Phase 6+):** Family law attorneys, mediators, parenting coordinators
- **Institutional:** Schools, hospitals, immigration agencies (as consumers of verified exports)

### Platform Strategy
- **Phase 1–3:** React Native mobile app (iOS + Android)
- **Phase 6+:** Web portal (PWA or dedicated web app)

### Business Model
- Freemium: 1 Space free (covers basic arrangement)
- Paid: Multiple Spaces, advanced exports, professional access
- Professional tier for lawyers/mediators (Phase 6)
- Free access for domestic violence survivors and financial hardship cases

---

## 2. Problem Statement

### Who Has the Problem
Anyone who shares responsibility for raising a child with another person — across households, across cities, across countries. This includes:
- Separated and divorced parents (~45–55M in English-speaking markets)
- OFW families (~10M+ Filipino OFWs, millions more globally)
- Grandparent and relative guardians (~2.7M in the US, ~3–5M in the Philippines)
- Blended families (~16M US adults in step-family households)
- Open adoption families (~500K active arrangements in the US)

**Total addressable: ~150–200M adults globally.**

### What the Problem Is

People sharing responsibility for a child's care face a documentation crisis: **care happens daily, records are scattered, and no shared system captures who did what, when, and whether it was acknowledged.**

This problem manifests differently depending on the context:

| Context | Documentation Need | Current Workaround | Why It Fails |
|---------|-------------------|-------------------|--------------|
| Custody dispute | Court-admissible evidence | Screenshots, spreadsheets, notes apps | Editable, contestable, disorganized |
| OFW immigration petition | Proof of ongoing parental involvement | WhatsApp call logs, remittance receipts | Not structured, not verified, not accepted |
| Guardian school enrollment | Proof of care authority | Handwritten notes, SPA from consulate | Slow, expensive, single-use |
| Blended family coordination | Separate records per arrangement | Multiple accounts on different apps | No tool supports multiple arrangements |
| Open adoption compliance | Record of openness agreement adherence | Email threads, text messages | Scattered, unverifiable, no shared view |

### The Critical Gap
No existing tool:
- Supports **multiple care arrangements** (Spaces) per user
- Treats **guardians and extended family** as first-class members with defined roles
- Provides **cryptographic file integrity** (SHA-256 hashing)
- Offers **immutable version-diffed history** for all entry types (not just messages)
- Produces a **verified care report** usable across institutions (courts, schools, hospitals, immigration)

### Why It Matters Now
- AI-fabricated evidence is an active legal crisis (2024–2026)
- OFW migration at all-time highs with no documentation tools
- Family structures have diversified beyond the 2-parent model
- 72% of family law cases involve self-represented litigants
- Court acceptance of digital records is mainstream
- The co-parenting app market is established but locked into a narrow model

---

## 3. Solution

### How CoParent Solves It

CoParent provides **Spaces** — care circles where every member can log immutable, verifiable care records. Each Space has its own members, children, timeline, and roles. A user can belong to multiple Spaces and switch between them.

### Core Capabilities

#### 3.1 Spaces (Care Circles)
The organizing primitive. Each Space represents one care arrangement around one child or group of children. Members have roles (owner, editor, viewer) that define their access level.

#### 3.2 Immutable Care Feed (Timeline)
Every action becomes a permanent, versioned entry within a Space. Entries are never deleted — only amended. Entry types: Expense, Event, Agreement, Communication, Upload.

#### 3.3 Cryptographic File Integrity
Every uploaded file is SHA-256 hashed at upload. The hash is stored server-side and included in every export. Any professional can independently verify file integrity.

#### 3.4 Versioned Audit Trail
Every change creates a new version with a diff. The original is never overwritten. Applies to all entry types, not just messages.

#### 3.5 Acknowledgment + Dispute System
Every entry has a status: `pending`, `acknowledged`, or `disputed`. Both sides of every dispute are captured in the structured record.

#### 3.6 Verified Care Report (Export)
Three formats, all filterable by date range, child, entry type, and Space:

**A. Timeline Report (PDF)** — Human-readable for lawyers, judges, schools, hospitals, immigration officers.
**B. Evidence Bundle (ZIP)** — PDF + JSON + attachments + SHA-256 hash manifest.
**C. Audit Report** — Full edit history, acknowledgment logs, dispute logs.

### Unfair Advantages
1. **Spaces model** — multi-arrangement support requires fundamental architecture decisions competitors can't bolt on
2. **Role system** — owner/editor/viewer is a product-level decision, not a permission flag
3. **Cryptographic evidence bundles** — first-mover on hash manifest creates case law association
4. **Architecture-level immutability** — database design, not a UX feature
5. **Inclusive positioning** — 3–5x larger addressable market than divorce-only competitors

---

## 4. Phases Overview

| Phase | Name | Status | Core Deliverable |
|-------|------|--------|-----------------|
| 1 | Core Evidence System | Complete | Timeline, entries, audit trail, export, acknowledgment, dispute |
| 2 | Native UX Improvements | Complete | Date pickers, calendar, partner invite, Supabase, notifications |
| 3 | Spaces | Next | Multi-space, roles, Space switcher, All Spaces view, onboarding rewrite |
| 4 | Resources | Planned | Reference documents per Space, integrity verification, Archive Space |
| 5 | Intelligence | Planned | Expense summaries, care pattern insights, reminders |
| 6 | Collaboration (Web) | Planned | Viewer portal, shared export links, read-only invite links, web portal |

---

## 5. Phase 1 — Core Evidence System (Complete)

Phase 1 established the evidence architecture and the core care record loop.

| Feature | Description | Status |
|---------|-------------|--------|
| User auth & onboarding | Registration, email verification, profile setup | Complete |
| Partner invitation | Email-based invite to link two accounts | Complete |
| Children management | Add/edit children linked to relationship | Complete |
| Timeline feed (mobile) | Scrollable, chronological care feed | Complete |
| Expense entry | Log expenses with amount, currency, category, receipt | Complete |
| Event entry | Log pickups, dropoffs, appointments | Complete |
| Agreement entry | Log mutual decisions, require acknowledgment | Complete |
| Communication entry | Structured message (evidence-grade) | Complete |
| Upload entry | Standalone document/media upload | Complete |
| File upload + SHA-256 hashing | Every file hashed at upload | Complete |
| Audit trail / version history | Every edit creates new version with diff | Complete |
| Acknowledgment system | Per-entry pending/acknowledged/disputed | Complete |
| Dispute layer | Dispute reason, counter-evidence, threaded response | Complete |
| Server-side timestamps | All entries timestamped by server | Complete |
| Court-ready PDF export | Timeline report PDF, filterable | Complete |
| Evidence bundle (ZIP) | PDF + JSON + attachments + hash manifest | Complete |
| Multi-currency expenses | ISO 4217 currency support | Complete |
| i18n-ready architecture | Strings externalized, UTC timestamps | Complete |
| Role-based access (2 parents) | Two-parent access model | Complete |
| Soft delete (no hard deletes) | Records never permanently destroyed | Complete |
| Encrypted storage | AES-256 at rest, TLS 1.3 in transit | Complete |

---

## 6. Phase 2 — Native UX Improvements (Complete)

Phase 2 improved the native experience and laid the Supabase foundation for sync and collaboration.

| Feature | Description | Status |
|---------|-------------|--------|
| Native date pickers | Platform-native date/time selection | Complete |
| Calendar view | Responsibility ledger with schedule visualization | Complete |
| Partner invite improvements | Improved invitation flow | Complete |
| Supabase foundation | Client, auth service, sync infrastructure | Complete |
| Push notifications | Local notifications for care events | Complete |

---

## 7. Phase 3 — Spaces (Next)

### Overview

Phase 3 transforms CoParent from a 2-parent app into a **multi-Space, multi-role shared care records platform.** This is the architectural pivot that unlocks the inclusive market — OFW families, grandparent guardians, blended families, and open adoption arrangements.

### Key Changes
- `relationships` table → `spaces` + `space_members` tables
- Fixed "Parent A / Parent B" roles → flexible role system (owner, editor, viewer)
- Single arrangement per user → multiple Spaces per user
- No space context → active Space context with switcher
- Single timeline → per-Space timeline + All Spaces merged view

---

### Phase 3 User Stories

---

**S3-01: Schema migration — spaces and space_members tables**

> *As a developer, I need to migrate the database from the `relationships` model to `spaces` + `space_members`, so that the app supports multiple care arrangements with flexible roles.*

**Description:**
Replace the `relationships` table with `spaces` and `space_members`. Migrate existing relationship data into the new schema. All existing entries, children, and acknowledgments must be re-linked to Spaces. This is the foundational migration for Phase 3.

**Acceptance Criteria:**
- [ ] `spaces` table created with: id (UUID), name, emoji, color, created_by (FK: users), created_at, updated_at
- [ ] `space_members` table created with: id (UUID), space_id (FK: spaces), user_id (FK: users), role (enum: owner, editor, viewer), label (optional enum: co-parent, guardian, grandparent, relative, lawyer, social-worker, assistant, other — display-only, does not affect permissions), joined_at, invited_by (FK: users)
- [ ] `children` table updated: `relationship_id` → `space_id` (FK: spaces)
- [ ] `entries` table updated: `relationship_id` → `space_id` (FK: spaces)
- [ ] All existing relationship data migrated: each relationship becomes a Space; parent_a becomes owner, parent_b becomes editor
- [ ] Migration is reversible (down migration exists)
- [ ] All existing entries, children, and acknowledgments correctly linked to migrated Spaces
- [ ] `relationships` table dropped after successful migration verification

**Files:** Database migration files, schema definitions, SpaceService, SpaceMemberService
**Dependencies:** None — this is the first Phase 3 story

---

**S3-02: SpaceService — create, list, getById, rename, delete, leave**

> *As a user, I want to create and manage Spaces so that I can organize my care arrangements separately.*

**Description:**
Implement the core SpaceService with CRUD operations for Spaces. A user can create a Space (becoming the owner), list their Spaces, view a single Space, rename it, customize its emoji/color, delete it (soft delete), or leave it.

**Acceptance Criteria:**
- [ ] `createSpace(name, emoji?, color?)` — creates a Space, adds the creating user as `owner`
- [ ] `listSpaces(userId)` — returns all Spaces the user is a member of, with member count and role
- [ ] `getSpaceById(spaceId, userId)` — returns Space details including members, children, and the user's role (only if user is a member)
- [ ] `renameSpace(spaceId, name, userId)` — only owner can rename
- [ ] `updateSpaceAppearance(spaceId, emoji?, color?, userId)` — only owner can update
- [ ] `deleteSpace(spaceId, userId)` — only owner can soft-delete; all entries preserved in audit
- [ ] `leaveSpace(spaceId, userId)` — any non-owner member can leave; owner must transfer ownership first
- [ ] All operations logged in audit_logs
- [ ] Authorization checks: only members can access their Spaces; role-based write permissions

**Files:** SpaceService, Space model/types, API routes
**Dependencies:** S3-01

---

**S3-03: SpaceMemberService — invite by code, accept invite, assign role, remove member**

> *As a Space owner, I want to invite people to my Space and assign them roles, so that everyone in the care circle has appropriate access.*

**Description:**
Implement SpaceMemberService for managing Space membership. Owners can generate invite codes/links, assign roles, and remove members. Invited users can accept invitations to join a Space.

**Acceptance Criteria:**
- [ ] `generateInviteCode(spaceId, role, userId)` — owner generates a 6-character invite code with expiry (7 days) and pre-assigned role
- [ ] `generateInviteLink(spaceId, role, userId)` — owner generates a deep link containing the invite code
- [ ] `acceptInvite(inviteCode, userId)` — user joins the Space with the pre-assigned role; invite code is consumed
- [ ] `assignRole(spaceId, memberId, newRole, userId)` — owner can change any member's role (except their own)
- [ ] `removeMember(spaceId, memberId, userId)` — owner can remove any non-owner member
- [ ] `transferOwnership(spaceId, newOwnerId, userId)` — current owner transfers ownership to another member
- [ ] Invite codes are single-use and expire after 7 days (with re-generate option)
- [ ] A user cannot join a Space they're already a member of
- [ ] Role-based permission enforcement: only `owner` can invite, assign roles, and remove members
- [ ] All membership changes logged in audit_logs

**Files:** SpaceMemberService, invite code generation, API routes
**Dependencies:** S3-01, S3-02

---

**S3-04: Active Space context — useActiveSpace() hook, MMKV persistence**

> *As a user with multiple Spaces, I want the app to remember which Space I was last using and scope all actions to that Space.*

**Description:**
Implement active Space context throughout the app. The active Space determines which timeline, children, and members are visible. The selection persists across app restarts via MMKV.

**Acceptance Criteria:**
- [ ] `useActiveSpace()` hook returns: activeSpace (object), setActiveSpace (setter), isAllSpaces (boolean)
- [ ] Active Space ID persisted in MMKV; restored on app launch
- [ ] If persisted Space no longer exists (user was removed or Space deleted), fallback to first available Space
- [ ] If user has no Spaces, redirect to Space creation flow
- [ ] Setting active Space to `null` or a sentinel value activates "All Spaces" mode
- [ ] All timeline queries, entry creation, and child listing are scoped to the active Space (or all Spaces in "All Spaces" mode)
- [ ] Active Space context is available throughout the app via Zustand or Jotai atom

**Files:** useActiveSpace hook, MMKV persistence layer, Zustand/Jotai store updates
**Dependencies:** S3-01, S3-02

---

**S3-05: Space switcher UI — header dropdown**

> *As a user with multiple Spaces, I want to quickly switch between Spaces from the main header, so that I can move between care arrangements without navigating to settings.*

**Description:**
Add a Space switcher to the app header. Shows the current Space name + emoji. Tapping opens a dropdown or bottom sheet listing all Spaces + "All Spaces" option. Selecting a Space switches the active context immediately.

**Acceptance Criteria:**
- [ ] Header displays: active Space emoji + name (or "All Spaces" with a distinct icon)
- [ ] Tapping the header element opens a bottom sheet or dropdown listing all user's Spaces
- [ ] Each Space in the list shows: emoji, name, member count, user's role badge
- [ ] "All Spaces" option at the top of the list with a distinct visual treatment
- [ ] Selecting a Space closes the picker and immediately switches the active Space
- [ ] Timeline, calendar, and all scoped views update to reflect the new active Space
- [ ] If user has only 1 Space, the switcher still appears but indicates it's the only Space
- [ ] Smooth animation on open/close (use BottomSheet component)

**Files:** Space switcher component, header integration, bottom sheet
**Dependencies:** S3-02, S3-04

---

**S3-06: All Spaces timeline — merged feed with Space indicators**

> *As a user with multiple Spaces, I want to see a merged timeline across all my Spaces, so that I have a consolidated view of all care activity.*

**Description:**
When "All Spaces" is the active context, the timeline merges entries from all the user's Spaces into a single chronological feed. Each entry is tagged with its Space emoji and color for visual distinction.

**Acceptance Criteria:**
- [ ] When active context is "All Spaces," timeline queries fetch entries from all user's Spaces
- [ ] Each entry in the merged feed displays the Space emoji + color indicator alongside the entry
- [ ] Entries are sorted chronologically (most recent first) across all Spaces
- [ ] Tapping a Space indicator on an entry switches the active context to that Space
- [ ] Filtering by entry type works across all Spaces
- [ ] Performance: merged feed loads within 1 second for typical usage (≤5 Spaces, ≤500 entries total)
- [ ] Pull-to-refresh fetches latest entries from all Spaces

**Files:** Timeline query updates, entry card component (Space indicator), All Spaces data fetching
**Dependencies:** S3-04, S3-05

---

**S3-07: Onboarding update — create and name first Space**

> *As a new user, I want to create my first Space during onboarding, so that I start with a properly set up care arrangement instead of a generic "relationship."*

**Description:**
Replace the current onboarding flow that creates a "relationship" with a flow that creates a Space. New users name their Space, optionally choose an emoji and color, and add their first child. The language should be inclusive — not assuming divorce or conflict.

**Acceptance Criteria:**
- [ ] After registration and profile setup, user is prompted to "Create your first Space"
- [ ] Space creation step includes: name (required), emoji (optional, default provided), color (optional, default provided)
- [ ] Inclusive onboarding copy — e.g., "A Space is your care circle for a child or group of children. Name it anything that makes sense to you."
- [ ] Examples shown: "Finn & Ava's Space," "Lola Cora's Care," "Portland Family"
- [ ] After Space creation, user adds first child (name, date of birth)
- [ ] After child creation, user is prompted to invite members (optional, can skip)
- [ ] Invite flow uses role selection: "What is this person's role?" with options: editor, viewer
- [ ] User becomes the `owner` of the created Space
- [ ] Existing users with migrated relationships see their Space already set up (no re-onboarding)

**Files:** Onboarding screens, Space creation form, invite flow updates
**Dependencies:** S3-01, S3-02, S3-03

---

**S3-08: Settings — manage Spaces**

> *As a user, I want to manage my Spaces from settings — rename, change appearance, view members, invite new members, and see roles.*

**Description:**
Add a "My Spaces" section to Settings. Each Space shows its members, roles, and management options. Owners get additional controls (rename, change emoji/color, invite, manage roles, remove members).

**Acceptance Criteria:**
- [ ] Settings screen includes "My Spaces" section listing all user's Spaces
- [ ] Each Space entry shows: emoji, name, member count, user's role
- [ ] Tapping a Space opens Space detail screen showing:
  - Space name, emoji, color
  - All members with their roles and join dates
  - Children in this Space
  - Owner-only actions: rename, change emoji/color, invite member, change member role, remove member
  - Any member: leave Space (non-owners only)
- [ ] "Create New Space" button at the bottom of the Spaces list
- [ ] Invite member flow: generate invite code or share invite link; select role for invitee
- [ ] Role display uses human-readable labels with brief descriptions (e.g., "Editor — Can log and view all care records")
- [ ] Leaving a Space requires confirmation dialog
- [ ] Deleting a Space (owner only) requires confirmation with warning about data preservation

**Files:** Settings screen updates, Space detail screen, member management components
**Dependencies:** S3-02, S3-03

---

**S3-09: Entry creation scoped to active Space**

> *As a user, I want new entries to automatically belong to the active Space, so that records are always filed in the correct care arrangement.*

**Description:**
Ensure all entry creation flows (expense, event, agreement, communication, upload) are scoped to the active Space. The Space context should be visible during entry creation. If "All Spaces" is active, the user must select a Space before creating an entry.

**Acceptance Criteria:**
- [ ] All entry creation forms include the active Space as context (displayed but not editable)
- [ ] Created entries are automatically linked to the active Space's `space_id`
- [ ] If active context is "All Spaces," entry creation prompts the user to select a target Space first
- [ ] Child selection dropdown only shows children belonging to the active Space
- [ ] Acknowledgment notifications are sent to members of the entry's Space (not all Spaces)
- [ ] Entry creation respects role permissions: only owner and editor roles can create entries; viewer cannot

**Files:** Entry creation forms, Space context integration, notification scoping
**Dependencies:** S3-04

---

**S3-10: Export scoped to Spaces**

> *As a user, I want to export records for a specific Space or all Spaces, so that I can produce verified reports relevant to a particular care arrangement.*

**Description:**
Update the export system to support Space-scoped and cross-Space exports. Single-Space exports include only that Space's records. All-Spaces exports include a Space identifier per entry.

**Acceptance Criteria:**
- [ ] Export flow includes Space selection: specific Space or "All Spaces"
- [ ] Single-Space PDF export includes Space name, members, and roles in the cover page
- [ ] All-Spaces PDF export groups entries by Space with clear section headers
- [ ] ZIP evidence bundle includes Space metadata in the JSON data file
- [ ] Hash manifest includes Space context per file
- [ ] Export filters (date range, child, entry type) work within Space scope or across all Spaces
- [ ] Audit report export includes Space membership changes (joins, leaves, role changes)

**Files:** Export service updates, PDF template updates, ZIP bundle generation
**Dependencies:** S3-04

---

**S3-11: Phase 3 QA pass**

> *As the development team, we need to verify that all Phase 3 features work correctly end-to-end and that the migration preserves all existing data.*

**Description:**
Comprehensive QA pass covering: schema migration verification, Space CRUD, member management, invite flow, active Space context, Space switcher, All Spaces timeline, onboarding, settings, entry creation scoping, export scoping, and role-based access control.

**Acceptance Criteria:**
- [ ] All migrated data verified: existing relationships → Spaces, entries linked correctly, no data loss
- [ ] Space CRUD: create, list, view, rename, customize, delete, leave — all working
- [ ] Member management: invite by code, accept, assign role, remove, transfer ownership — all working
- [ ] Active Space: persists across app restart, handles edge cases (removed from Space, Space deleted)
- [ ] Space switcher: opens, lists Spaces, switches context, updates timeline
- [ ] All Spaces timeline: merged feed, Space indicators, correct chronological ordering
- [ ] Onboarding: new user creates Space + child + optional invite
- [ ] Settings: view Spaces, manage members, invite flow, role display
- [ ] Entry creation: scoped to active Space, role-based creation permissions enforced
- [ ] Export: single-Space and all-Spaces exports produce correct output
- [ ] Role enforcement: viewer cannot create entries; editor can; owner manages membership
- [ ] No regressions in Phase 1 and Phase 2 features
- [ ] ESLint passes (`npx nx run mobile:lint`)
- [ ] TypeScript compiles (`tsc --noEmit`)

**Files:** All Phase 3 files
**Dependencies:** S3-01 through S3-10

---

## 8. Phase 4 — Resources

Phase 4 adds a reference document layer to Spaces — distinct from the timeline, purpose-built for documents that need to exist and be accessible rather than recorded as events.

### Core Concept
Resources are **static reference documents** — not things that happened, but things you need to know or prove. A medical history summary, a school enrollment form, a custody order PDF. They belong to a Space (and optionally a child), are SHA-256 verified for integrity, and are accessible to all members based on their role.

### What makes Resources different from Uploads (timeline entries)
| | Timeline Upload | Resource |
|-|----------------|----------|
| Purpose | Record that something happened | Reference material |
| Acknowledgment | Yes — other parent can acknowledge | No |
| Version history | Yes — edits create new versions | No |
| Audit trail | Full | Upload/delete only |
| Example | "Uploaded school report card on March 15" | "Felix's vaccination record" |

### Categories
medical · school · legal · financial · identity · insurance · other

### Archive Space
A simple toggle to hide an inactive Space from the switcher while preserving all its data. Useful when a custody arrangement ends, a child turns 18, or a guardianship closes. Archived Spaces remain fully readable and exportable.

### Stories (Phase 4)
- R-01: Resources schema
- R-02: ResourceService
- R-03: Resources tab + navigation
- R-04: Resources list screen
- R-05: Add Resource screen
- R-06: Resource detail with integrity verification
- R-07: Archive Space feature
- R-08: Export includes Resources
- R-09: Phase 4 QA

---

## 9. Phase 5 — Intelligence

Phase 5 adds insights and automation on top of the verified record system.

| Feature | Description |
|---------|-------------|
| Expense summaries | Per-Space and cross-Space expense totals, splits, and trends |
| Care pattern insights | Visualization of custody time, event participation, acknowledgment rates |
| Smart reminders | Configurable reminders for pending acknowledgments, overdue expenses, upcoming events |
| Automated reports | Scheduled export generation (weekly/monthly) sent to designated members |
| Compliance tracking | Track adherence to care agreements and court orders (referenced, not enforced) |
| OCR document scanning | Scan physical documents (court orders, medical reports, school letters) — on-device OCR extracts dates, amounts, and names; offers to pre-fill timeline entries or save as Resources |

---

## 10. Phase 6 — Collaboration (Web)

Phase 6 extends Spaces with professional access and sharing capabilities via a web portal.

| Feature | Description |
|---------|-------------|
| Viewer access portal | Read-only web portal for professionals to view client Spaces |
| Shared export links | Generate time-limited, password-protected links to verified care reports |
| Read-only invite links | Public invite links with viewer role for mediators, coordinators |
| Professional tier pricing | Multi-Space subscription for lawyers managing multiple client Spaces |
| Web portal (PWA) | Browser-based access for desktop users and professionals |

### Key Stories (Phase 6)
- Professional can view all Spaces they've been invited to from a single dashboard
- Lawyer can export records from a client's Space without client action
- Shared export link expires after configurable period (7/30/90 days)
- Professional can manage multiple client Spaces under one subscription
- Parenting coordinator can be added as viewer to multiple Spaces across families

---

## 11. Success Metrics

### North Star Metric
**Active Spaces per month** — This measures whether users are creating and maintaining care arrangements across family structures. A growing number of active Spaces validates both the core product and the inclusive positioning.

### Leading Indicators (Early Signal)

| Metric | Target (Month 3 post-Phase 3) | Rationale |
|--------|-------------------------------|-----------|
| Spaces created per user | >1.2 avg | Multi-Space adoption validates the model |
| Space members per Space | >2.0 avg | More than 2 = inclusive family structures adopting |
| Day-7 retention | >45% | Users returning = building a habit |
| Entries per active Space per week | >5 | Active record-building |
| Acknowledgment rate | >60% within 48h | Multiple members engaged |

### Lagging Indicators (Business Health)

| Metric | Target (Month 6 post-Phase 3) | Rationale |
|--------|-------------------------------|-----------|
| Monthly recurring revenue (MRR) | $8,000+ | Spaces-based pricing drives upgrades |
| Paid conversion rate | >15% | Multi-Space need = conversion trigger |
| NPS | >40 | High-stress product; NPS reflects genuine value |
| Non-divorce user percentage | >20% | Validates inclusive market thesis |
| Churn rate (monthly) | <5% | Record lock-in = retention |

### Anti-Metrics
- **Time in app** — goal is efficient logging, not engagement
- **Message volume** — not a chat app
- **Dispute rate** — should stay below 20% of entries; higher may signal adversarial use

---

## 12. Technical Constraints

### Platform Requirements

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Mobile app | React Native 0.83 + React 19 | Cross-platform; established codebase |
| Language | TypeScript 5.8 (strict) | End-to-end type safety |
| Backend | Supabase (PostgreSQL + Auth + Storage) | Foundation laid in Phase 2 |
| State | Zustand + Jotai + React Query | Established in Phase 1–2 |
| Local storage | MMKV | Active Space persistence, offline data |
| File storage | Supabase Storage (S3-compatible) | Encrypted at rest |
| Hashing | SHA-256 (crypto) | File integrity verification |
| Navigation | React Navigation | Established in codebase |
| Styling | twrnc (Tailwind) | Established in codebase |

### Security Requirements (Non-Negotiable)

| Requirement | Implementation |
|-------------|---------------|
| Data at rest | AES-256 encryption |
| Data in transit | TLS 1.3 minimum |
| File integrity | SHA-256 hash at upload, in exports |
| Passwords | Argon2id hashing |
| Audit logging | Append-only audit_logs table |
| No hard deletes | Soft delete only |
| Server-side timestamps | Never trusted from client |
| Space isolation | Members only see Spaces they belong to; RLS policies enforce this |
| Role enforcement | Write operations check member role before execution |

### Database Design — Spaces Schema

```
spaces
  - id (UUID)
  - name (string)
  - emoji (string, nullable)
  - color (string, nullable)
  - created_by (FK: users)
  - created_at (server-set)
  - updated_at (server-set)
  - deleted_at (nullable — soft delete)

space_members
  - id (UUID)
  - space_id (FK: spaces)
  - user_id (FK: users)
  - role (enum: owner, editor, viewer) — controls access/permissions
  - label (optional enum: co-parent, guardian, grandparent, relative, lawyer, social-worker, assistant, other) — display-only, describes relationship; does not affect permissions
  - joined_at (server-set)
  - invited_by (FK: users, nullable)
  - left_at (nullable — soft leave)

space_invites
  - id (UUID)
  - space_id (FK: spaces)
  - code (string, 6 chars, unique)
  - role (enum: editor, viewer)
  - created_by (FK: users)
  - created_at (server-set)
  - expires_at (server-set, +7 days)
  - accepted_by (FK: users, nullable)
  - accepted_at (nullable)

children
  - id (UUID)
  - space_id (FK: spaces)  ← changed from relationship_id
  - name
  - date_of_birth
  - created_at

entries
  - id (UUID)
  - space_id (FK: spaces)  ← changed from relationship_id
  - child_id (FK: children, nullable)
  - type (expense | event | agreement | communication | upload)
  - created_by (FK: users)
  - created_at (server-set, immutable)
  - status (active | soft_deleted)
  - current_version_id (FK: entry_versions)

-- entry_versions, attachments, acknowledgments, disputes,
-- dispute_responses, audit_logs remain unchanged from Phase 1
```

### Role Permissions Matrix

| Permission | owner | editor | viewer |
|-----------|-------|--------|--------|
| Create entries | ✅ | ✅ | ❌ |
| View entries | ✅ | ✅ | ✅ |
| Acknowledge entries | ✅ | ✅ | ❌ |
| Dispute entries | ✅ | ✅ | ❌ |
| Export records | ✅ | ✅ | ✅ |
| Invite members | ✅ | ❌ | ❌ |
| Manage roles | ✅ | ❌ | ❌ |
| Remove members | ✅ | ❌ | ❌ |
| Rename/customize Space | ✅ | ❌ | ❌ |
| Delete Space | ✅ | ❌ | ❌ |
| Leave Space | ❌ | ✅ | ✅ |

### Supabase RLS Policy Requirements
- All `spaces` queries filtered by `space_members` membership
- All `entries` queries filtered by Space membership (via join)
- `space_invites` readable only by the Space's owner
- `audit_logs` append-only; no UPDATE or DELETE policies

---

## 13. Appendix

### A. Neutral Language Guide

| Avoid | Use Instead |
|-------|-------------|
| "Parent A / Parent B" | Member name or role |
| "Co-parent" (as label) | "Member" or role name |
| "You owe" | "Balance" or "Recorded amount" |
| "Failed to" | "Not completed" |
| "Debt" | "Outstanding amount" |
| "Violation" | "Unresolved item" |
| "Evidence" (in UI for users) | "Record" |
| "Evidence bundle" (in UI) | "Verified care report" |
| "Dispute" (as accusation) | "Flag for review" |
| "Custody" (in UI) | "Care arrangement" |
| "Court-ready" (in positioning) | "Verified records" |
| "Relationship" (data model) | "Space" or "Care circle" |

### B. Core Data Model (Complete)

```
users
  - id (UUID)
  - email
  - password_hash (Argon2)
  - display_name
  - timezone
  - default_currency
  - created_at

spaces
  - id (UUID)
  - name
  - emoji (nullable)
  - color (nullable)
  - created_by (FK: users)
  - created_at
  - updated_at
  - deleted_at (nullable)

space_members
  - id (UUID)
  - space_id (FK: spaces)
  - user_id (FK: users)
  - role (owner | editor | viewer) — controls access
  - label (optional: co-parent | guardian | grandparent | relative | lawyer | social-worker | assistant | other) — display-only relationship descriptor
  - joined_at
  - invited_by (FK: users, nullable)
  - left_at (nullable)

space_invites
  - id (UUID)
  - space_id (FK: spaces)
  - code (6 chars, unique)
  - role (editor | viewer)
  - created_by (FK: users)
  - created_at
  - expires_at
  - accepted_by (FK: users, nullable)
  - accepted_at (nullable)

children
  - id (UUID)
  - space_id (FK: spaces)
  - name
  - date_of_birth
  - created_at

entries
  - id (UUID)
  - space_id (FK: spaces)
  - child_id (FK: children, nullable)
  - type (expense | event | agreement | communication | upload)
  - created_by (FK: users)
  - created_at (server-set, immutable)
  - status (active | soft_deleted)
  - current_version_id (FK: entry_versions)

entry_versions
  - id (UUID)
  - entry_id (FK: entries)
  - version_number (integer, starts at 1)
  - content_json (JSONB)
  - diff_json (nullable on v1)
  - created_by (FK: users)
  - created_at (server-set)

attachments
  - id (UUID)
  - entry_version_id (FK: entry_versions)
  - original_filename
  - storage_path
  - file_hash (SHA-256)
  - file_size_bytes
  - mime_type
  - uploaded_by (FK: users)
  - uploaded_at (server-set)

acknowledgments
  - id (UUID)
  - entry_id (FK: entries)
  - status (pending | acknowledged | disputed)
  - acted_by (FK: users)
  - created_at (server-set)
  - comment (nullable)

disputes
  - id (UUID)
  - entry_id (FK: entries)
  - raised_by (FK: users)
  - reason_text
  - created_at (server-set)

dispute_responses
  - id (UUID)
  - dispute_id (FK: disputes)
  - responded_by (FK: users)
  - response_text
  - created_at (server-set)

audit_logs
  - id (UUID)
  - user_id (FK: users)
  - action (string)
  - entity_type
  - entity_id
  - metadata_json
  - created_at (server-set)
```

### C. Export Hash Manifest Format

```
CoParent Verified Care Report — Hash Manifest
Generated: 2026-03-21T14:32:00Z
Export ID: exp_01HXXXXX
Space: "Finn & Ava's Space" (space_01HAAAAAA)
Members: Camille Oduya (owner), Liam Byrne (editor)
Entries: 47
Attachments: 23

FILE INTEGRITY VERIFICATION
----------------------------
receipt_2026-02-14_expense-001.jpg
  SHA-256: a3f4b8c2d1e9...
  Uploaded: 2026-02-14T09:15:22Z
  Entry ID: ent_01HAAAAAA
  Space: Finn & Ava's Space

medical_bill_2026-01-20.pdf
  SHA-256: 7e2b9f1a4c8d...
  Uploaded: 2026-01-20T16:44:01Z
  Entry ID: ent_01HBBBBBB
  Space: Finn & Ava's Space

...

Verification instructions:
  To verify file integrity, run: sha256sum <filename>
  Compare output against hash listed above.
  A match confirms the file is identical to the original upload.
```

### D. Market Size Summary

| Market | Estimate |
|--------|----------|
| Global TAM (all shared care arrangements) | ~$6–8B/year |
| TAM (English-speaking + Philippines) | ~$3.5–4.5B/year |
| SAM (active documentation need) | $1.4–2.2B/year |
| SOM (3–5 year horizon) | $12M–$54M ARR |
| Benchmark: OurFamilyWizard ARR (2024) | ~$10.5M |

### E. Pricing Direction (To Be Validated)

| Tier | Price | Includes |
|------|-------|---------|
| Free | $0 | 1 Space, 2 members, basic timeline, limited export (5/month) |
| Plus | ~$9.99/mo | Unlimited Spaces, unlimited members, unlimited PDF exports |
| Complete | ~$14.99/mo | Evidence bundle exports (ZIP + hash manifest), dispute tools, All Spaces view |
| Professional | ~$79.99/mo | Lawyer portal, multi-Space management (Phase 6) |

*Per-account pricing — one subscription unlocks features across all Spaces.*
*Free access for DV survivors and financial hardship cases.*

### F. Competitive Positioning Summary

| Competitor | Their Moat | CoParent Advantage |
|-----------|------------|-------------------|
| OurFamilyWizard | Court brand (20+ years) | Spaces model, inclusive positioning, superior technical architecture |
| TalkingParents | Communication immutability; free tier | Full-spectrum evidence (all types), multi-Space, inclusive roles |
| AppClose | Affordable; Certified Records (2025) | Architecture-first legal integrity; Spaces; 3–5x larger market |
| 2Houses | International, one-sub model | Verified records; Spaces; role-based access |

---

*This PRD is the output of the CoParent discovery rerun with inclusive framing and Spaces.*
*Discovery inputs: BRIEF.md, market-research.md, competitor-analysis.md, icp.md*
*Next: Phase 3 implementation per user stories S3-01 through S3-11.*
