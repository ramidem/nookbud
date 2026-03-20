# CoParent — Product Requirements Document

> **Version:** 1.0
> **Author:** Eli (PRD Writer)
> **Date:** 2026-03-21
> **Status:** Discovery Complete — Ready for Build Phase

---

## Table of Contents

1. [Overview](#1-overview)
2. [Problem Statement](#2-problem-statement)
3. [Solution](#3-solution)
4. [User Stories](#4-user-stories)
5. [MVP Scope](#5-mvp-scope)
6. [Success Metrics](#6-success-metrics)
7. [Technical Constraints](#7-technical-constraints)
8. [Timeline](#8-timeline)
9. [Appendix](#9-appendix)

---

## 1. Overview

### Product Name
**CoParent**

### Tagline
*"Built for clarity. Ready for court."*

### One-Line Description
A tamper-resistant, cryptographically verifiable record system for co-parenting — built as legal evidence infrastructure from day one.

### Vision
CoParent becomes the definitive source of truth in co-parenting disputes: a system both parents trust, lawyers depend on, and courts accept — not because of a marketing claim, but because the technical architecture makes tampering verifiably impossible.

### Positioning Statement
CoParent is the first co-parenting platform built as a **legal evidence system** — not a communication tool with evidence features bolted on. Where competitors create records, CoParent creates evidence.

### Target Audience (Summary)
- **Primary:** High-conflict co-parents in active or anticipated litigation
- **Secondary:** Proactive/protective co-parents building records before conflict escalates
- **Tertiary:** Court-ordered users mandated to use a co-parenting platform
- **B2B (Phase 2+):** Family law attorneys, mediators, parenting coordinators

### Platform Strategy
- **Phase 1:** React Native mobile app (iOS + Android)
- **Phase 2+:** Web portal (PWA or dedicated web app)

### Business Model
- B2C subscription: per-household or per-parent monthly/annual plans
- Free tier with limited exports (conversion hook)
- Professional tier for lawyers/mediators (Phase 2)
- Free access for domestic violence survivors and financial hardship cases

---

## 2. Problem Statement

### Who Has the Problem
Separated and divorced parents across the US, UK, Canada, and Australia who co-parent children under 21. Estimated **45–55 million co-parenting adults** in English-speaking markets alone, with a serviceable addressable market of **3–5 million high-conflict households**.

### What the Problem Is

Co-parents in conflict face a fundamental documentation crisis: **memory is disputed, records are incomplete, and courts demand evidence.**

Current workarounds all fail in court:

| Workaround | Why It Fails |
|------------|-------------|
| Text messages / iMessage | Screenshots are contestable, out of context, easily "edited" visually |
| Spreadsheets | Editable with no audit trail; "who changed this?" is unanswerable |
| Notes apps | No integrity verification; timestamps are user-controlled |
| Email chains | Disorganized, no structure, no acknowledgment system |
| Existing co-parenting apps | Focus on communication only; immutability limited to messages; no cryptographic file verification; exports require significant attorney prep time |

### The Critical Gap
No existing tool treats **the entire co-parenting record** — expenses, events, agreements, communication, and uploaded documents — as a legal evidence ledger with:
- Cryptographic file integrity (SHA-256 hashing)
- Immutable version-diffed history for all entry types
- Structured acknowledgment + dispute workflow per entry
- A court-export bundle (PDF + JSON + hash manifest) designed for legal professionals

### Why It Matters Now (Market Timing)

**AI-fabricated evidence is an active 2024–2026 legal crisis.** AI-generated deepfakes, fabricated messages, and forged financial documents are being submitted in custody cases. Courts are alarmed. Any digital record without cryptographic provenance is now suspect — and this directly creates the CoParent opportunity.

**72% of family law cases involve self-represented litigants** (Clio 2026). These parents need tools that are simple to use but legally sound.

**The window is open.** OurFamilyWizard has validated court-ordered app adoption (50 US states), but it's a 2001-era product resting on brand equity. The "legal evidence record" niche is genuinely underserved. Estimated 3–5 years before a well-funded player dominates.

### Scale of Problem
- ~$15,000+ average US divorce cost; significant portion is lawyer time organizing inadequate records
- Family law attorneys bill $300–500/hour to do record-organization work that structured software should handle
- High-conflict cases: 10–15% of ~700K annual US divorce caseload = 70,000–105,000 new cases/year in the US alone
- **SAM revenue potential: $540M–$1.2B/year** at $15–20/month per household pair

---

## 3. Solution

### How CoParent Solves It

CoParent provides a single, shared, legally defensible record system where **every co-parenting event is logged immutably, cryptographically verified, mutually acknowledged, and exportable in court-ready format** — with no technical expertise required.

### Core Capabilities

#### 3.1 Immutable Evidence Feed (Timeline)
Every action becomes a permanent, versioned entry. Entries are never deleted — only amended (with full version history). Entry types cover the full spectrum of co-parenting activity:

- **Expense** — with receipt upload, split tracking, reimbursement status
- **Event** — pickups, dropoffs, school events, medical appointments
- **Agreement** — decisions made together (documented and acknowledged)
- **Communication** — structured messages (not chat; evidence-grade)
- **Upload** — documents, photos, videos with hash verification

#### 3.2 Cryptographic File Integrity
Every uploaded file is SHA-256 hashed at upload. The hash is stored server-side and included in every evidence export. A lawyer or judge can independently verify that the exported file matches the original upload — without trusting CoParent's word.

#### 3.3 Versioned Audit Trail
Every change creates a new version with a diff of what changed, who changed it, and when (server-side timestamp). The original is never overwritten. This applies to all entry types, not just messages.

#### 3.4 Acknowledgment + Dispute System
Every entry has a status:
- `pending` — awaiting the other parent's response
- `acknowledged` — confirmed by the other parent (timestamped)
- `disputed` — challenged with reason, counter-evidence, and threaded response

Both sides of every dispute are captured in the structured record — not in a separate chat thread.

#### 3.5 Court-Ready Export (Killer Feature)
Three export formats, all filterable by date range, child, and entry type:

**A. Timeline Report (PDF)** — Human-readable for lawyers and judges. Chronological, timestamped, authors, status, inline attachments.

**B. Evidence Bundle (ZIP)** — PDF summary + JSON data + all attachments + SHA-256 hash manifest file. Designed for legal professionals. Hash manifest enables independent integrity verification.

**C. Audit Report** — Full edit history, acknowledgment logs, dispute logs.

### Unique Angle — Why This Approach
Every competitor has bolted legal features onto a communication tool. CoParent is architected as an evidence system first — the coordination features (calendar, expense tracking) serve the evidence layer, not the other way around.

**Technical moat:** SHA-256 file hashing + immutable entry versioning across all data types + hash manifest in exports = months of re-architecture for incumbents to match. They'd have to break backward compatibility with existing records.

**Trust model moat:** User-verifiable integrity vs. "trust us, it's tamper-proof." A user's lawyer can independently verify CoParent records without subpoenaing the company.

### Unfair Advantages
1. **First-mover on cryptographic evidence bundles** — creates case law association as courts accept hash-verified records
2. **Architecture-level immutability** — not a UX feature, a database design decision; competitors can't replicate without rebuild
3. **Both-sides capture** — records with mutual acknowledgment are structurally more credible than one-parent records
4. **Calm, neutral UX** — users are emotionally taxed; the design should de-escalate, not inflame

---

## 4. User Stories

### Persona 1: Marcus — The High-Conflict Parent
*37, Atlanta USA, active custody modification hearing, paying $300/hr for lawyer to organize his records*

---

**US-1: Log an expense entry with receipt**
> *As Marcus, I want to log an expense with a photo receipt, amount, and category, so that I have a timestamped, immutable record of every co-parenting expense I pay.*

**Acceptance Criteria:**
- [ ] Marcus can create an expense entry with: amount, currency, category, date, notes, and receipt photo/PDF
- [ ] Entry is timestamped server-side (not client-side) on creation
- [ ] Receipt file is SHA-256 hashed at upload; hash stored with entry
- [ ] Entry appears immediately in the shared timeline
- [ ] The other parent receives a notification (in-app) of the new entry
- [ ] Entry status is set to `pending` until the other parent acknowledges or disputes it

---

**US-2: View full audit trail for a disputed entry**
> *As Marcus, I want to see the complete version history of any entry, so that I can prove what was originally recorded versus what was later amended.*

**Acceptance Criteria:**
- [ ] Marcus can view a list of all versions for any entry, from v1 to current
- [ ] Each version shows: timestamp, who made the change, and a diff of what changed
- [ ] Original version (v1) is always accessible and clearly labeled
- [ ] Version history is read-only; cannot be edited or deleted
- [ ] Full version history is included in court exports

---

**US-3: Export a court-ready evidence bundle**
> *As Marcus, I want to generate an evidence bundle (PDF + ZIP with hash manifest) for a date range, so that I can hand it to my lawyer without hours of manual prep.*

**Acceptance Criteria:**
- [ ] Marcus can trigger an export with filters: date range, child(ren), entry types
- [ ] PDF output is chronological, includes all entries with timestamps, authors, statuses, and inline attachment thumbnails
- [ ] ZIP bundle includes: PDF, JSON data file, all attachments, SHA-256 hash manifest
- [ ] Hash manifest lists every file's name, upload timestamp, and hash
- [ ] Export completes within 60 seconds for typical usage (≤500 entries)
- [ ] Export is accessible from the mobile app and downloadable

---

**US-4: Track acknowledgment status on all entries**
> *As Marcus, I want to see whether the other parent has acknowledged each entry, so that I know when I have mutual confirmation vs. a pending or disputed record.*

**Acceptance Criteria:**
- [ ] Every entry shows its current status: `pending`, `acknowledged`, or `disputed`
- [ ] Status change (acknowledge or dispute) is timestamped server-side
- [ ] Marcus can filter the timeline by status
- [ ] Unacknowledged entries older than 7 days are visually highlighted (reminder state)

---

### Persona 2: Siobhán — The Proactive/Protective Parent
*34, Dublin Ireland, amicable separation, building records "just in case"*

---

**US-5: Log a custody event (pickup/dropoff) quickly**
> *As Siobhán, I want to log a pickup or dropoff event in under 30 seconds from my phone, so that I maintain a running record without it feeling like surveillance.*

**Acceptance Criteria:**
- [ ] Siobhán can create an event entry with: type (pickup/dropoff/activity/appointment), assigned parent, date/time, child, and optional notes
- [ ] Entry can be created from the timeline feed in ≤3 taps
- [ ] No mandatory fields beyond type, child, and date/time
- [ ] Entry is server-timestamped on creation
- [ ] Co-parent receives notification with option to acknowledge

---

**US-6: Log a mutual agreement**
> *As Siobhán, I want to record an agreement we've both made (e.g., "school in Dublin for the next academic year"), so that it's documented, acknowledged by both of us, and retrievable if things change.*

**Acceptance Criteria:**
- [ ] Siobhán can create an agreement entry with: description, effective date, related child(ren)
- [ ] Agreement entries require acknowledgment from the other parent before status moves to `acknowledged`
- [ ] Both parents can add notes to the agreement thread before acknowledgment
- [ ] Acknowledged agreements display prominently in a dedicated "Agreements" view
- [ ] Agreements are included in all exports

---

**US-7: Onboard the other parent via invitation**
> *As Siobhán, I want to invite my co-parent via email or link, so that we're both on the same record system and entries are mutually visible.*

**Acceptance Criteria:**
- [ ] Siobhán can send an invitation by email to co-parent from within the app
- [ ] Invitation link expires after 7 days (with re-send option)
- [ ] When co-parent accepts, both accounts are linked under the same "co-parenting relationship"
- [ ] Co-parent sees the same timeline from their own account perspective
- [ ] Children must be added by the inviting parent; co-parent can confirm child details

---

**US-8: View the timeline in a calm, neutral interface**
> *As Siobhán, I want the app to feel organized and professional, not adversarial, so that I don't feel like I'm treating my co-parent as an enemy just by using it.*

**Acceptance Criteria:**
- [ ] No aggressive language in UI copy (follow the neutral language guide: "Recorded" not "You owe"; "Not completed" not "Failed to")
- [ ] Entry status indicators use calm color system (muted, not alarming)
- [ ] Timeline scrolls chronologically with clear date separators
- [ ] No "score" or "balance due" framing for expenses — only neutral labels
- [ ] App passes a copy review checklist for neutral language

---

### Persona 3: Tyler — The Court-Ordered User
*42, Vancouver Canada, judge-mandated co-parenting app, compliance-focused*

---

**US-9: Log a receipt in under 60 seconds on mobile**
> *As Tyler, I want to photograph a receipt and submit it as a logged expense from my phone in under 60 seconds, so that compliance logging doesn't interfere with my workday.*

**Acceptance Criteria:**
- [ ] Camera-first entry flow: tap "+" → select "Expense" → camera opens immediately
- [ ] Photo captured → amount + category fields auto-surfaced
- [ ] Entry submitted in ≤3 screens / ≤60 seconds from launch
- [ ] Entry receives server-side timestamp on submission
- [ ] Confirmation screen shows entry ID and timestamp for Tyler's records

---

**US-10: Receive acknowledgment notifications**
> *As Tyler, I want to be notified immediately when the other parent acknowledges or disputes one of my entries, so that I know the record is complete or needs a response.*

**Acceptance Criteria:**
- [ ] Push notification sent within 60 seconds of acknowledgment or dispute action
- [ ] Notification includes: entry type, entry date, status change (acknowledged / disputed)
- [ ] Tapping notification opens directly to the relevant entry
- [ ] In-app notification badge for unacknowledged entries

---

**US-11: Respond to a dispute with counter-evidence**
> *As Tyler, I want to add a counter-response (including a document) to a disputed entry, so that my side of the story is captured in the formal record.*

**Acceptance Criteria:**
- [ ] Tyler can view all entries the other parent has marked `disputed`, with the dispute reason visible
- [ ] Tyler can add a written response and/or upload a file as counter-evidence
- [ ] Counter-evidence file is SHA-256 hashed at upload
- [ ] Dispute thread (reason → response → counter-response) is stored as part of the entry record
- [ ] Full dispute thread is included in exports

---

### Persona 4: Priya — The Family Lawyer (B2B — Phase 2 Feature, Design Now)
*44, Sydney Australia, family law solicitor, recommends apps to clients weekly*

> ⚠️ **Note:** Priya's primary workflows (lawyer portal, multi-client management) are **Phase 2 features**. These stories are included in the PRD to ensure the Phase 1 architecture supports them without re-engineering. The export story below is Phase 1 since it directly serves all user types.

---

**US-12: Receive a court-export that requires minimal prep before filing**
> *As Priya (via her client), I want a structured, filterable evidence bundle that I can use in a filing without spending billable hours organizing it.*

**Acceptance Criteria:**
- [ ] PDF export has clearly labeled sections: Summary, Expenses, Events, Agreements, Communications, Uploads, Disputes, Audit Report
- [ ] Each entry in the PDF includes: entry ID, type, date, author, status, acknowledgment timestamp (if applicable), dispute summary (if applicable)
- [ ] JSON data file is structured and parseable (documented schema)
- [ ] Export is filterable by: date range, child, entry type, status (acknowledged / disputed / pending)
- [ ] PDF includes a cover page with: case metadata, export generation timestamp, number of entries, and hash manifest summary

---

**US-13: Viewer access role for lawyer/mediator (Phase 2 foundation)**
> *As Priya, I want read-only access to a client's CoParent record without requiring the client to export and email me files.*

> ⚠️ **Phase 2 story** — included here to ensure Phase 1 database and auth architecture supports role=`viewer` without redesign.

**Acceptance Criteria:**
- [ ] Role system supports: `parent_a`, `parent_b`, `viewer` roles
- [ ] `viewer` role has read-only access; cannot create, edit, or acknowledge entries
- [ ] Client can invite a viewer by email with a time-limited access token
- [ ] Viewer access can be revoked by either parent at any time
- [ ] All viewer actions are logged in the audit trail

---

### Cross-Cutting Stories

---

**US-14: Register and create a co-parenting profile**
> *As a new user, I want to register with email and password, create my profile, and add my children, so that I can start using CoParent.*

**Acceptance Criteria:**
- [ ] User can register with email + password (Argon2 hashed)
- [ ] Email verification required before first login
- [ ] User creates a profile: name, timezone, preferred currency
- [ ] User can add one or more children: name, date of birth, optional photo
- [ ] Account is created with role `parent_a` for the inviting user; co-parent invitation sets role `parent_b`

---

**US-15: Upload any document or media file**
> *As any user, I want to upload photos, PDFs, or videos as standalone evidence uploads or attachments to entries, so that I have a verified record of any document relevant to my co-parenting situation.*

**Acceptance Criteria:**
- [ ] Supported file types: JPEG, PNG, GIF, PDF, MP4, MOV (with size limits per tier)
- [ ] Every file is SHA-256 hashed at upload; hash and upload timestamp stored server-side
- [ ] Files can be uploaded as: (a) standalone Upload entries, or (b) attachments to any other entry type
- [ ] File integrity is verifiable: hash displayed in-app and included in every export
- [ ] Files are stored encrypted at rest (AES-256)

---

**US-16: Multi-currency expense tracking**
> *As a user in any supported country, I want to log expenses in my local currency, so that the record reflects actual financial transactions accurately.*

**Acceptance Criteria:**
- [ ] Expense entries support any ISO 4217 currency
- [ ] User profile stores a default currency preference
- [ ] Currency is displayed on each entry and in exports
- [ ] No automatic currency conversion (amounts recorded as-submitted; courts deal in actual amounts)
- [ ] Currency symbols and formatting follow locale conventions

---

**US-17: i18n-ready UI and date/time handling**
> *As a user in any supported locale, I want dates, times, and number formats to display correctly for my region, so that the app is usable and the records are unambiguous.*

**Acceptance Criteria:**
- [ ] App uses i18n framework (i18next or equivalent) for all user-facing strings
- [ ] Date/time stored as UTC; displayed in user's timezone
- [ ] User can set their timezone in profile settings
- [ ] Number formatting follows locale (decimal separators, currency placement)
- [ ] Phase 1 ships in English; architecture supports additional locales without code changes

---

**US-18: Soft delete and data retention**
> *As a user, I want to know that records are never permanently deleted, so that I can trust the system's completeness as a legal record.*

**Acceptance Criteria:**
- [ ] No hard deletes exist in the system; only soft deletes with `deleted_at` timestamp
- [ ] "Deleted" entries are hidden from the main timeline by default but visible in audit reports
- [ ] Soft-deleted entries and their versions remain in court exports
- [ ] User cannot permanently delete any entry; deletion requests are logged

---

## 5. MVP Scope

### Phase 1 — Core Evidence System (Must-Have)

The Phase 1 MVP establishes the evidence architecture and the core co-parenting record loop. Every feature in Phase 1 serves the goal of creating a legally defensible record.

| Feature | Description | Priority |
|---------|-------------|----------|
| User auth & onboarding | Registration, email verification, profile setup | P1 |
| Co-parent invitation | Email-based invite to link two parent accounts | P1 |
| Children management | Add/edit children linked to co-parenting relationship | P1 |
| Timeline feed (mobile) | Scrollable, chronological evidence feed | P1 |
| Expense entry | Log expenses with amount, currency, category, receipt | P1 |
| Event entry | Log pickups, dropoffs, appointments with assigned parent | P1 |
| Agreement entry | Log mutual decisions, require acknowledgment from both | P1 |
| Communication entry | Structured message (evidence-grade, not chat) | P1 |
| Upload entry | Standalone document/media upload to timeline | P1 |
| File upload + SHA-256 hashing | Every file hashed at upload, hash stored server-side | P1 |
| Audit trail / version history | Every edit creates new version with diff | P1 |
| Acknowledgment system | Per-entry pending/acknowledged/disputed status | P1 |
| Dispute layer | Dispute reason, counter-evidence upload, threaded response | P1 |
| Server-side timestamps | All entries timestamped by server, not client | P1 |
| Court-ready PDF export | Timeline report PDF, filterable | P1 |
| Evidence bundle (ZIP) | PDF + JSON + attachments + hash manifest | P1 |
| Multi-currency expenses | ISO 4217 currency support, locale formatting | P1 |
| i18n-ready architecture | All strings externalized, UTC timestamps, timezone support | P1 |
| Role-based access (parent A/B) | Two-parent access model; viewer role architecture | P1 |
| Soft delete (no hard deletes) | Records never permanently destroyed | P1 |
| Push notifications | Acknowledgment, dispute, and new entry notifications | P1 |
| Encrypted storage | AES-256 at rest, TLS 1.3 in transit | P1 |

### Phase 2 — Growth & Professional Layer (Should-Have)

| Feature | Description | Target Phase |
|---------|-------------|-------------|
| Lawyer/viewer portal | Read-only professional access with time-limited token | Phase 2 |
| Professional tier pricing | Multi-client subscription for lawyers/mediators | Phase 2 |
| Calendar view | Responsibility ledger with custody schedule visualization | Phase 2 |
| Google/Apple Calendar sync | Two-way sync for custody schedule | Phase 2 |
| Web portal (PWA) | Browser-based access for desktop users and lawyers | Phase 2 |
| Audit report export | Standalone full audit history report | Phase 2 |
| Certified/notarized records | Third-party notarization service integration | Phase 2 |
| Expense reimbursement requests | Formal request + approval workflow | Phase 2 |
| Automated reminders | Configurable reminders for pending acknowledgments | Phase 2 |
| Parenting coordinator access | Third-party neutral viewer role | Phase 2 |

### Phase 3 — Differentiation & Scale (Nice-to-Have)

| Feature | Description | Target Phase |
|---------|-------------|-------------|
| Digital signatures (PKI) | Cryptographic signing of entries and exports | Phase 3 |
| Blockchain anchoring | Optional hash anchoring to public blockchain | Phase 3 |
| Call recording | In-app call recording with transcript, stored/logged | Phase 3 |
| GPS check-ins | Location-verified custody exchanges | Phase 3 |
| AI tone analysis | Flag inflammatory language before sending | Phase 3 |
| Import from other apps | Migrate records from OFW, TalkingParents | Phase 3 |
| EU localization | German, French, Dutch, Spanish support | Phase 3 |
| Court order management | Store and track compliance with specific court orders | Phase 3 |
| DV survivor free tier | Free full-feature access for domestic violence cases | Phase 3 |
| Analytics dashboard (B2B) | Case-level insights for legal professionals | Phase 3 |

---

## 6. Success Metrics

### North Star Metric
**Evidence bundles exported per month** — This measures whether users are creating records they trust enough to present in court. It is the ultimate validation that CoParent is fulfilling its core promise.

### Leading Indicators (Early Signal, Weeks 1–12)

| Metric | Target (Month 3) | Rationale |
|--------|------------------|-----------|
| Day-7 retention | >45% | Users who return after 7 days are building a habit |
| Entries logged per active user per week | >5 | Measures active record-building behavior |
| Acknowledgment rate | >60% of entries acknowledged within 48h | Both parents engaged = mutual record credibility |
| Time-to-first-entry after registration | <10 minutes | Onboarding converts to value quickly |

### Lagging Indicators (Business Health, Months 3–12)

| Metric | Target (Month 6) | Rationale |
|--------|------------------|-----------|
| Monthly recurring revenue (MRR) | $5,000+ | Early monetization validation |
| Paid conversion rate (free → paid) | >15% | Export as conversion trigger |
| Net Promoter Score (NPS) | >40 | High-stress product; NPS reflects genuine value |
| Lawyer/court referral rate | >20% of signups cite lawyer/court as source | Distribution moat building |
| Churn rate (monthly) | <5% | Once users build a record, they stay |

### Anti-Metrics (Things to Monitor but Not Optimize)
- **Time in app** — We don't want users to spend excessive time here; the goal is efficient logging
- **Message volume** — CoParent is not a chat app; high message volume may indicate feature creep
- **Dispute rate** — High dispute rates may signal the product is becoming adversarial; should stay below 20% of entries

---

## 7. Technical Constraints

### Platform Requirements

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Mobile app | React Native (bare or Expo) | Cross-platform iOS + Android; single codebase |
| Language | TypeScript | End-to-end type safety; required for legal data integrity |
| Backend | Node.js + NestJS | Structured, testable; familiar to team |
| Database | PostgreSQL | ACID compliance critical for audit trail; no eventual consistency |
| ORM | Drizzle ORM | Lightweight, type-safe; established project preference |
| File storage | S3-compatible (AWS S3 or Cloudflare R2) | Encrypted at rest; durable; scalable |
| Cache | Redis | Session management; notification queuing |
| PDF generation | react-pdf or Puppeteer | PDF export from structured data |
| Auth | JWT + Argon2 | Secure token auth; Argon2 for password hashing |
| Hashing | SHA-256 (Node.js crypto) | File integrity verification |

### Security Requirements (Non-Negotiable)

| Requirement | Implementation |
|-------------|---------------|
| Data at rest | AES-256 encryption (database + file storage) |
| Data in transit | TLS 1.3 minimum |
| File integrity | SHA-256 hash stored at upload, included in exports |
| Passwords | Argon2id hashing (never stored plaintext) |
| Audit logging | Separate `audit_logs` table; append-only; no updates |
| No hard deletes | Soft delete only; `deleted_at` + `deleted_by` fields |
| Server-side timestamps | All `created_at` and `updated_at` set by the server, never trusted from client |
| Input validation | All API inputs validated at API layer before reaching database |
| Rate limiting | Auth endpoints, export endpoints rate-limited |

### Database Design Requirements (Immutability)

The following constraints enforce immutability at the data layer, not just the application layer:

- `entries` table: `created_at` is set once on INSERT; no `updated_at` on base record
- `entry_versions` table: every modification creates a new row with `version_number`, `diff_json`, `created_by`, `created_at`
- `attachments` table: `file_hash` (SHA-256), `file_size`, `uploaded_at`, `storage_path` — all set on INSERT; no UPDATE
- `audit_logs` table: INSERT only; no UPDATE or DELETE privileges for application user
- `acknowledgments` table: INSERT only; status transitions create new rows, not updates

### API Design Requirements

- RESTful API with versioning (`/v1/`)
- All timestamps returned in ISO 8601 UTC format
- All file references returned as signed URLs (time-limited)
- Pagination on all list endpoints (cursor-based preferred)
- API responses include `request_id` for tracing

### Internationalization Requirements

- All user-facing strings managed via `i18next` (or equivalent)
- Date/time displayed in user's configured timezone (stored in profile as IANA timezone string)
- Numbers and currency formatted per locale using `Intl.NumberFormat`
- Currency stored as: amount (integer, in minor units) + currency_code (ISO 4217) — never as float
- Phase 1 ships English only; architecture must support adding locales without code changes

### Scalability Constraints

- Phase 1 target: up to 10,000 active households
- Database must handle: ~500 entries/day at 10,000 households = 5M entries/year
- File storage: estimate 2MB avg/attachment × 5 attachments/entry × 5M entries/year = ~50TB over 5 years (use tiered storage with warm/cold transition)
- Export generation: must complete in <60 seconds for ≤500 entries; async job queue for larger exports

### Privacy Architecture

- **End-to-end encryption (E2EE) consideration:** Full E2EE for message content is architecturally possible but complicates server-side hash verification and export generation. **Decision: Phase 1 uses server-side encryption (AES-256 at rest) with a strong access control model. E2EE for message content is a Phase 3 consideration after validating that it doesn't compromise the court-export use case.**
- Minimum data collection — only collect data necessary for the evidence record
- Users can export their full data at any time (data portability)
- Account deletion: soft-delete account, retain records per court-order-compliance statute window (jurisdiction-dependent; default: 7 years)

### Integration Constraints (Phase 1: None Required)

Phase 1 has no external service integrations beyond:
- Email provider (SendGrid or Postmark) for invitations and notifications
- Push notification service (FCM + APNs) for mobile push

Third-party payment, calendar sync, and legal service integrations are Phase 2+.

---

## 8. Timeline

### Phase 1 — Core Evidence System (Months 1–3)

**Goal:** Functioning mobile app with full evidence architecture, shareable with early users and lawyers for feedback.

| Week | Milestone |
|------|-----------|
| 1–2 | Project setup, database schema, auth system |
| 3–4 | Entry types (expense, event, agreement, communication, upload) |
| 5–6 | File upload + SHA-256 hashing; audit trail / versioning |
| 7–8 | Acknowledgment + dispute system; push notifications |
| 9–10 | Timeline feed UI (mobile); entry detail views |
| 11–12 | Court-ready PDF export; evidence bundle (ZIP + hash manifest) |

**Phase 1 Exit Criteria:**
- All MVP features complete and passing acceptance criteria
- iOS and Android builds running on device
- 3 legal professionals have reviewed an evidence export and confirmed usability
- No critical security issues in auth or file storage

---

### Phase 2 — Professional Layer & Growth (Months 4–6)

**Goal:** Lawyer portal MVP, web access, expanded export features, first paying B2B customers.

| Feature Area | Estimated Effort |
|--------------|-----------------|
| Lawyer/viewer portal (read-only access) | 3 weeks |
| Web portal (PWA) | 4 weeks |
| Calendar view with custody schedule | 2 weeks |
| Certified records (third-party integration) | 2 weeks |
| Expense reimbursement request workflow | 2 weeks |
| Professional pricing tier | 1 week |

---

### Phase 3 — Differentiation & Scale (Months 7–12)

**Goal:** Technical moat features, EU expansion, advanced legal integrations.

| Feature Area | Estimated Effort |
|--------------|-----------------|
| Digital signatures (PKI) | 4 weeks |
| Blockchain anchoring (optional) | 3 weeks |
| EU localization (DE, FR, NL) | 6 weeks |
| Call recording + transcription | 4 weeks |
| DV survivor free tier + eligibility workflow | 2 weeks |
| Import from OFW / TalkingParents | 4 weeks |

---

### Revenue Milestones

| Milestone | Target |
|-----------|--------|
| First paying user | Month 2 (soft launch to waitlist) |
| $1K MRR | Month 4 |
| $5K MRR | Month 6 |
| $12K MRR (OFW parity benchmark) | Month 12–18 |
| First court-ordered usage | Month 8–12 (via lawyer referral channel) |

---

## 9. Appendix

### A. Competitive Positioning Summary

| Competitor | Their Moat | CoParent Advantage |
|-----------|------------|-------------------|
| OurFamilyWizard | Court brand recognition (20+ years) | Superior technical architecture; OFW rebuilt for 2026 |
| TalkingParents | Communication immutability; free tier | Full-spectrum evidence (all entry types, not just messages) |
| AppClose | Affordable; Certified Electronic Records (2025) | Launched with superior legal architecture; first-mover on hash manifest |
| 2Houses | International, one-subscription model | Court-ready architecture; 2Houses serves cooperative users only |

### B. Neutral Language Guide

| Avoid | Use Instead |
|-------|-------------|
| "You owe" | "Balance" or "Recorded amount" |
| "Failed to" | "Not completed" |
| "Debt" | "Outstanding amount" |
| "Violation" | "Unresolved item" |
| "Evidence" (in UI copy for parents) | "Record" |
| "Dispute" (as accusation) | "Flag for review" |

### C. Core Data Model

```
users
  - id (UUID)
  - email
  - password_hash (Argon2)
  - display_name
  - timezone
  - default_currency
  - role (parent_a | parent_b | viewer)
  - created_at

relationships
  - id (UUID)
  - parent_a_id (FK: users)
  - parent_b_id (FK: users, nullable until accepted)
  - invite_token
  - invite_expires_at
  - created_at

children
  - id (UUID)
  - relationship_id (FK: relationships)
  - name
  - date_of_birth
  - created_at

entries
  - id (UUID)
  - relationship_id (FK: relationships)
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
  - content_json (JSONB — entry-type-specific data)
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
  - action (string — e.g., "entry.create", "entry.version.create", "acknowledgment.set")
  - entity_type
  - entity_id
  - metadata_json
  - created_at (server-set)
```

### D. Export Hash Manifest Format

```
CoParent Evidence Bundle — Hash Manifest
Generated: 2026-03-21T14:32:00Z
Export ID: exp_01HXXXXX
Entries: 47
Attachments: 23

FILE INTEGRITY VERIFICATION
----------------------------
receipt_2026-02-14_expense-001.jpg
  SHA-256: a3f4b8c2d1e9...
  Uploaded: 2026-02-14T09:15:22Z
  Entry ID: ent_01HAAAAAA

medical_bill_2026-01-20.pdf
  SHA-256: 7e2b9f1a4c8d...
  Uploaded: 2026-01-20T16:44:01Z
  Entry ID: ent_01HBBBBBB

...

Verification instructions:
  To verify file integrity, run: sha256sum <filename>
  Compare output against hash listed above.
  A match confirms the file is identical to the original upload.
```

### E. Market Size Summary

| Market | Estimate |
|--------|----------|
| Global TAM (English-speaking + EU) | ~$2.7–3.3B/year |
| SAM (high-conflict + active legal) | $540M–$1.2B/year |
| SOM (3–5 year horizon) | $2.7M–$12M ARR |
| Benchmark: OurFamilyWizard ARR (2024) | ~$10.5M |

### F. Pricing Direction (To Be Validated)

| Tier | Price | Includes |
|------|-------|---------|
| Free | $0 | Basic logging, limited export (5/month) |
| Essential | ~$9.99/mo | Unlimited entries, unlimited PDF exports |
| Complete | ~$14.99/mo | Evidence bundle exports (ZIP + hash manifest), dispute tools |
| Professional | ~$79.99/mo | Lawyer portal, multi-client management (Phase 2) |

*Both parents should be able to use the core features on a single-subscription model (one parent subscribes, both can log).*

---

*This PRD is the final output of the CoParent discovery phase. Build phase begins with Phase 1 — Core Evidence System.*
*Discovery inputs: BRIEF.md, market-research.md, competitor-analysis.md, icp.md*
*Next: Begin implementation per prd.json task list.*
