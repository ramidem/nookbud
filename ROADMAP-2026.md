# Co-Parenting App — Prioritized Roadmap (P0 → P4)

**Intent:** Launch the smallest app that parents can actually use day to day, on **web and mobile**, without cutting corners on **authentication, authorization, or privacy**.

**Product principles**

1. **Child-centered** — Organize the experience around children's needs, not parental conflict.
2. **Neutral** — Don't assume one parent is right; avoid engagement mechanics that encourage conflict.
3. **Privacy-first** — Separate shared family information, personal information, and professionally restricted records.

**P0 rule:** Build the smallest secure foundation *and* the smallest useful product. Don't build the whole product in P0, and don't build elaborate abstractions.

---

## Priority Legend

| Priority | Meaning | Source in original doc |
|---|---|---|
| **P0** | Launch blocker. Required before any real family uses the app. | Phase 0 (trimmed) + Phase 1 core |
| **P1** | Fast follow. Ships right after launch; completes the original MVP and the hardening deferred from P0. | Rest of Phase 1 + deferred Phase 0 items |
| **P2** | Advanced coordination | Phase 2 |
| **P3** | Legal & professional support | Phase 3 |
| **P4** | Intelligence & ecosystem | Phase 4 |

### What the P0 cut deliberately defers

| Deferred | Why | Lands in |
|---|---|---|
| File uploads (receipts, photos, documents) | Removes storage buckets, signed URLs, and malware scanning from the launch path entirely. No uploads = no file-leak risk at launch. | P1 |
| Medical, school, emergency-contact data on child profiles | Most sensitive child data. Ship after access controls are proven in production. | P1 |
| Expenses & reimbursements | Valuable, but calendar + messaging is the usable core. First candidate to pull forward if testers ask for it. | P1 |
| Tasks & reminders | Useful, not required to coordinate. | P1 |
| Enforced MFA, account deactivation, data export, security notification emails | Hardening on top of a secure base (optional MFA *is* in P0). Pull data export forward if legal counsel requires it for launch. | P1 |
| Invited professionals, private notes, granular/child-level permissions, legal workflows | Complex permission surface. P0 schema is designed to support them later. | P2 / P3 |
| Mobile E2E automation (Maestro), performance and security monitoring | Manual mobile smoke checklist covers P0. | P1 |

---

# P0 — Launch MVP

**Goal:** Two parents can securely create a shared space, invite each other, coordinate a schedule, and message — on web and mobile — with provable isolation from every other family.

## P0 Launch Gates (all must be true before real users)

- [ ] Automated tests prove one family **cannot** read or write another family's data (including by guessing/changing IDs)
- [ ] Row-Level Security enabled on **every** table; no service-role keys or DB credentials in any client
- [ ] Email verification, sign-in, password reset, and session revocation work on **both** web and mobile
- [ ] **In-app account deletion** works (required by Apple App Store and Google Play for apps with account creation)
- [ ] Privacy policy and terms published; Philippines Data Privacy Act (RA 10173) review done with legal counsel
- [ ] A database backup has been **restored successfully at least once**
- [ ] CI is green (types, lint, tests, build, dependency scan)
- [ ] Error monitoring is on and confirmed not to capture message content or child data
- [ ] No public storage buckets exist; no file upload feature is shipped

## Decisions to Settle Before Building (Step 0.1)

1. **Child access policy** — Which linked adults can read/write which child fields? (Don't assume a parent has unrestricted access to everything.)
2. **Message edit/delete policy** — Recommended: no edit or delete in P0, to keep the record trustworthy and avoid retention complexity.
3. **Retention & deletion rules** — What is permanently deleted vs. recoverable, and when.
4. **Single-parent departure** — What happens to a space, its messages, and its children's data when one parent deletes their account?
5. **Notification content policy** — Recommended: push and email say "New message," never the message text.

---

## P0-A — Foundation & Security

### A1. Architecture & Stack
- [ ] **Monorepo** — Web, mobile, shared packages, and backend in one repo (Turborepo + pnpm)
- [ ] **Web app** — Next.js + TypeScript
- [ ] **Mobile app** — Expo + React Native + TypeScript (iOS and Android)
- [ ] **Single authoritative backend** — Supabase (PostgreSQL, Auth, RLS); server-side functions for privileged operations
- [ ] **API strategy** — Supabase client for standard operations; server-side functions for anything privileged
- [ ] **Environment separation** — Local, staging, production
- [ ] **Architecture doc** — One short page: system boundaries, dependencies, key decisions

### A2. Database
Core tables for P0: `users` (profile), `spaces`, `space_members`, `children`, `parent_child_relationships`, `invitations`, `audit_logs`, plus feature tables for calendar and messaging. (`documents` is deferred with file storage.)

- [ ] UUID identifiers for client-visible records
- [ ] Foreign keys and constraints (e.g., no duplicate active memberships)
- [ ] Versioned migrations only; no manual schema changes
- [ ] Created/updated timestamps everywhere
- [ ] Indexes on foreign keys and access-control lookups
- [ ] Soft-delete vs. permanent-delete policy defined (see decisions above)
- [ ] Synthetic seed data only; never real children's data

**Modeling rule:** A user is not a parent, a child, or a space. A user can belong to multiple spaces; a space can have multiple adults and children. Model these explicitly instead of embedding a single `parent_id` or `family_id` in every table. Children do **not** get accounts.

### A3. Authentication & Account Security
- [ ] Email verification at registration
- [ ] Email + password sign-in (no social login — also avoids Apple's Sign in with Apple requirement)
- [ ] Secure password reset
- [ ] Session management: duration, renewal, expiry, **revoke / sign out of all devices**
- [ ] **MFA (TOTP), optional enrollment** — in a custody context the adversary is often someone who knows your passwords or has access to your devices
- [ ] Brute-force protection and rate limits on auth endpoints
- [ ] Secure token handling
  - Web: secure, correctly configured cookies; no privileged credentials in browser JS
  - Mobile: `expo-secure-store` for tokens
  - Both: never embed service-role keys or DB passwords in clients
- [ ] **Account deletion** — documented process and in-app flow, including what happens to shared data
- [ ] Account-enumeration protection on sign-up, sign-in, and reset

> Authentication establishes who the user is. It does not establish what they may access. That's A4.

### A4. Authorization & Multi-Tenant Isolation *(most important security area)*
- [ ] **Roles (P0):** `owner` and `parent` only
- [ ] **Membership-based access** — No membership, no access to any space resource
- [ ] **PostgreSQL RLS** on every table, enforcing isolation at the database level
- [ ] **Cross-space isolation** — Users can't access another space's records, even by guessing IDs
- [ ] **Invitation authorization** — Single-use, expiring token, bound to the invited email; only the authenticated matching user can accept; only authorized members can create/revoke
- [ ] **Membership revocation** — Access ends immediately when membership ends
- [ ] **Server-side authorization recheck** for privileged operations
- [ ] **Child-access rules** per the policy decided in Step 0.1 (schema supports tightening later)
- [ ] Audit log entries for security-sensitive actions: invite sent/accepted, member added/removed, child added, account deletion

> Hiding a button is not authorization. The backend and database must reject unauthorized requests even if the UI is bypassed.

### A5. Data Privacy & Protection
- [ ] Data classification (public / internal / confidential / highly sensitive) — a one-page doc
- [ ] **Data minimization** — Collect only what a defined feature needs (e.g., child nickname and birth date, not more)
- [ ] HTTPS/TLS everywhere; encryption at rest for database and backups
- [ ] Secrets kept out of source control
- [ ] Privacy policy and terms; consent recorded where legally required
- [ ] Data deletion behavior defined across related records and backups
- [ ] **No third-party data sharing** in P0 (no professional access, no external integrations)
- [ ] **Philippines Data Privacy Act (RA 10173)** — Get legal advice before launch on lawful processing, parental authority, children's data, data-subject rights, retention, and sensitive personal information obligations. One parent's consent does not automatically resolve every legal question about a child's information.
- [ ] App Store privacy labels / Google Play Data safety form completed accurately

### A6. Application Security
- [ ] Server-side input validation (not UI-only), using shared Zod schemas
- [ ] Output encoding / XSS protection (especially for message content)
- [ ] CSRF protection for cookie-authenticated web operations
- [ ] CORS limited to intended origins
- [ ] Rate limiting on auth, invitations, and messaging
- [ ] Security headers on web
- [ ] Safe error handling — no internal details, DB errors, or sensitive data in responses
- [ ] **Logging hygiene** — Never log passwords, tokens, or message content
- [ ] Dependency vulnerability scanning
- [ ] Invitation abuse and spam prevention
- [ ] Mobile: secure deep-link handling (invites, password reset)

### A7. Testing (minimum for launch)
- [ ] **Authorization tests (exit requirement):**
  - One family can't access another family's records
  - Revoked members lose access
  - Changing an object ID doesn't bypass authorization
  - Unauthenticated and unverified users are denied
  - Invitation can't be accepted by the wrong user, reused, or used after expiry
- [ ] Unit tests: validation schemas, scheduling/date/time zone logic
- [ ] Integration tests: DB constraints, auth flows, API behavior
- [ ] Web E2E (Playwright): register, sign in, create space, invite, accept
- [ ] Mobile: manual smoke checklist for the same flows on iOS and Android
- [ ] CI checks: type checking, lint/format, tests, migration validation, build verification

> A successful build alone is not sufficient. Authorization tests must demonstrate that unauthorized access is denied. **Rule:** every new table ships with RLS and a forbidden-access test in the same PR.

### A8. Infrastructure, CI/CD & Operations
- [ ] Staging and production environments, isolated from each other and from local development
- [ ] Version-controlled migrations applied through the pipeline
- [ ] CI on every pull request
- [ ] Web and backend deployment pipelines
- [ ] Mobile builds and distribution via EAS Build/Submit
- [ ] Production secrets managed securely
- [ ] **Database backups with a defined recovery objective, plus one verified restore**
- [ ] Error monitoring (Sentry or equivalent) configured to avoid capturing sensitive content
- [ ] **Incident response doc** — Short runbook for security incidents and data breaches, including breach-notification obligations under the Data Privacy Act (confirm timelines with counsel)

### A9. Shared Foundations & Developer Experience (web + mobile)
- [ ] Shared **types**, **Zod validation**, and **API client** packages
- [ ] **Design tokens** shared across platforms (colors, type, spacing, radii)
- [ ] Platform-specific UI components (no forced identical implementations); keep them inside each app until duplication actually hurts
- [ ] Separate navigation for Next.js and Expo
- [ ] Form conventions: validation, error messages, loading states
- [ ] **Time zone, date format, and currency handling** — never hard-code assumptions (critical for the calendar)
- [ ] Accessibility baseline: keyboard, screen reader, contrast
- [ ] Developer docs: local setup, env vars, migrations, testing
- [ ] Synthetic demo data for realistic family scenarios

---

## P0-B — Product Features (minimum usable product)

### B1. Family Space & Membership
- [ ] **Create Family Space** — Shared environment for co-parenting
- [ ] **Invite the other parent** — Via the controlled invitation flow (A4)
- [ ] **Basic permissions** — Owner and parent roles, enforced by RLS
- [ ] **Leave / remove member** — Immediate access revocation

### B2. Child Profiles (basic)
- [ ] Add and edit a child: nickname/name and birth date only
- [ ] Link child to parents through `parent_child_relationships`
- [ ] *(Medical, school, and emergency-contact information is P1.)*

### B3. Calendar & Scheduling
- [ ] **Shared calendar** — Create, view, edit events (handovers, appointments, school events); time-zone correct
- [ ] **Parenting schedule** — One recurring custody pattern (e.g., weekly rotation)
- [ ] **Schedule change requests** — Request, approve, or decline
- [ ] **Pickup & drop-off details** — Time, location, and transportation notes on handover events

### B4. Messaging & Notifications
- [ ] **Messaging** — Text-only, child-related conversation within the space; sanitized output
- [ ] **Notifications** — Push (mobile) and email (web/fallback) for new messages, change requests, and upcoming events; content-free per the decision above
- [ ] *(Search, handover notes, and photo/file sharing are P1.)*

### B5. Home / Dashboard (minimal)
- [ ] Upcoming events
- [ ] Pending requests (schedule changes)

### B6. Account & Settings (minimum)
- [ ] Profile and password management
- [ ] MFA enrollment
- [ ] Active sessions / sign out of all devices
- [ ] Delete account

---

## P0 Reference

### Recommended Stack

| Layer | Recommendation |
|---|---|
| Monorepo | Turborepo + pnpm |
| Web | Next.js + TypeScript |
| Mobile | Expo + React Native + TypeScript |
| Backend | Supabase |
| Database | PostgreSQL |
| Authentication | Supabase Auth |
| Authorization | PostgreSQL Row-Level Security (RLS) |
| API | Supabase client for standard operations; server-side functions for privileged operations |
| Validation | Zod |
| UI | Web-specific and native-specific components with shared design tokens |
| Testing | Vitest + Playwright (Maestro added in P1) |
| CI/CD | GitHub Actions + EAS Build/Submit |

**Why Supabase?** PostgreSQL gives relational modeling and transactional consistency. Supabase provides authentication, database access, and authorization without building and maintaining an entire backend up front. This assumes a small initial team; a custom backend can come later if requirements justify it.

### Web + Mobile Approach
- **Both platforms ship every P0 flow.** Sign-up, sign-in, space, invite, calendar, messages, account.
- **Share:** types, Zod schemas, API client, business rules (scheduling logic, request state transitions), design tokens.
- **Don't share:** UI components, navigation, session/token storage — React Native and browsers differ in rendering, navigation, and storage.
- **Mobile-specific:** push notifications, `expo-secure-store`, deep links for invites and password reset.
- **Web-specific:** cookie sessions, CSRF, CORS, security headers.

### Monorepo Structure (trimmed for P0)

```
coparenting-app/
├── apps/
│   ├── web/                  # Next.js
│   └── mobile/               # Expo / React Native
│
├── packages/
│   ├── shared/               # Domain types and utilities
│   ├── validation/           # Zod schemas
│   ├── api-client/           # Shared API client
│   └── design-tokens/        # Cross-platform design tokens
│
├── supabase/
│   ├── migrations/           # Version-controlled SQL migrations
│   ├── seed.sql              # Synthetic development data
│   ├── functions/            # Server-side functions
│   └── tests/                # Database and authorization tests
│
├── tests/
│   └── e2e/
│
├── docs/
│   ├── architecture.md       # Includes data model + security notes
│   ├── security.md           # Classification, retention, incident response
│   └── development.md
│
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

`ui-web` and `ui-native` packages, `documents` storage, and extra integration test folders are added when the features that need them arrive. Keep secrets, environment-specific config, and production data out of source control.

### P0 Access Matrix (illustrative starting policy)

| Resource | Owner (Parent A) | Parent B (invited) |
|---|---|---|
| Shared calendar | Read/write | Read/write |
| Schedule change requests | Create / respond | Create / respond |
| Messages | Read/write | Read/write |
| Child profile (basic) | Per child-access policy | Per child-access policy |
| Audit records | Limited visibility | Limited visibility |
| Anyone outside the space | No access | No access |

Private notes, legal documents, and professional access are not in P0. This is a starting policy, not a universal rule: access to child or legal records may need to reflect court orders, applicable law, and safety requirements.

### P0 Implementation Order

| Step | Workstream | Deliverable |
|---|---|---|
| 0.1 | Decisions | Stack, child-access policy, retention, message and deletion policies |
| 0.2 | Tooling | Monorepo, TypeScript, lint/format, CI |
| 0.3 | Database foundation | Core schema, migration workflow, constraints, seed data |
| 0.4 | Authentication | Registration, verification, sign-in, recovery, sessions, MFA, on **web and mobile together** |
| 0.5 | Authorization | Membership model, roles, RLS, **isolation tests before any feature tables** |
| 0.6 | Space, invitations, children | Space creation, controlled invites, basic child profiles |
| 0.7 | Calendar | Events, recurring schedule, change requests |
| 0.8 | Messaging & notifications | Text messaging, push/email notifications |
| 0.9 | Dashboard & account | Home, settings, session management, account deletion |
| 0.10 | Operations | Staging/prod, backups and restore test, monitoring, incident runbook |
| 0.11 | Launch verification | Security acceptance tests, privacy docs, legal review, store submissions |

Some steps can run in parallel, but the authorization model must be designed before feature development depends on it.

### P0 Definition of Done
- [ ] Web app runs locally and builds for deployment
- [ ] Expo app runs on iOS and Android
- [ ] Web and mobile authenticate against the same backend
- [ ] Schema changes are reproducible through migrations
- [ ] Users can create a space and join via a controlled invitation
- [ ] Parents can create events, a recurring schedule, and change requests, and exchange messages
- [ ] Membership and permissions are enforced by RLS and server-side checks
- [ ] Automated tests verify cross-space isolation and revoked-member access
- [ ] Development, staging, and production configurations are separated
- [ ] CI runs automatically
- [ ] Backups are documented and a restore has been tested
- [ ] Privacy, retention, deletion, and incident-response docs exist
- [ ] Architecture and development docs exist

**Final P0 note:** Build around identity, spaces, membership, authorization, and auditability. Those decisions affect every later feature. Getting multi-tenant isolation and child-data access controls right matters more than choosing the perfect frontend library.

---

# P1 — Fast Follow

**Goal:** Complete the original MVP feature set and add the hardening deliberately deferred from P0.

## P1-A — Security & Privacy Hardening

- **Private file storage** *(gate for every upload feature below)* — Private buckets, access-controlled downloads, short-lived signed URLs, file type/size validation, upload restrictions, malware scanning, metadata in PostgreSQL, deletion handling, audit events for upload/download/delete. Never make a bucket public just for convenient previews.
- **Enforced MFA** — Require it for sensitive operations and privileged accounts
- **Account Deactivation** — Define behavior for deactivated accounts
- **Security Notifications** — Notify users of important account security events
- **Data Export** — Let users retrieve their data (pull into P0 if counsel requires)
- **Lost/Compromised Device Policy** and **supported app versions** policy for mobile
- **Sensitive Data Handling** — Additional restrictions for medical and child-related information
- **Performance & Security Monitoring** — API latency, DB performance, suspicious auth/authorization activity
- **Scheduled Restore Drills**
- **Mobile E2E automation** (Maestro)

## P1-B — Product Features

### 1. Expenses & Financial Management *(first candidate to pull into P0)*
- Expense Tracking — Record child-related expenses and who paid
- Expense Categories — School, healthcare, clothing, and other needs
- Receipt Attachments — Proof of purchase or payment *(requires private storage)*
- Reimbursement Requests — Request and track repayment
- Contribution Summary — Review recorded expenses and contributions

### 2. Child Profiles (full)
- Medical Information — Allergies, medications, relevant medical details
- School Information — School details and important contacts
- Emergency Contacts — Essential contacts and emergency instructions

### 3. Tasks & Reminders
- Shared Tasks — Track responsibilities for the children
- Task Assignment — Clarify which parent is responsible
- Deadlines — School requirements, payments, appointments
- Task Status — Pending vs. completed

### 4. Communication
- Conversation History — Search previous messages and agreements
- Handover Notes — Health, behavior, schoolwork, and daily routine updates
- Photo & File Sharing — Relevant photos and files *(requires private storage)*
- Notification Preferences — Configure alerts

### 5. Home / Dashboard (full)
- Reminders — Upcoming responsibilities
- Recent Updates — Important changes and shared activity

### 6. Spaces
- Shared Documents — Essential family and child-related files *(requires private storage)*
- Basic Permissions UI — Control access to shared information
- Activity History — Important changes to shared records

### 7. Account & Settings
- Privacy Controls — Protect sensitive family information
- Data Export — Export essential records

---

# P2 — Advanced Coordination

**Goal:** Support more complex family arrangements and improve accountability.

### 1. Advanced Calendar
- Multiple Schedule Templates — Different custody arrangements
- Holiday Scheduling — Holiday and school-break arrangements
- Recurring Events — Automate regular appointments and activities
- Calendar Synchronization — Integrate with external calendars
- Schedule History — Review previous arrangements and changes

### 2. Advanced Communication
- Structured Requests — Standardize requests for decisions or changes
- Decision Tracking — Record proposals, responses, and outcomes
- Message Search & Filters — Find relevant conversations quickly
- Communication Records — Preserve timestamped histories

### 3. Parenting Plan & Agreements
- Parenting Plan — Document custody arrangements and responsibilities
- Decision-Making Rules — Agreements about education and healthcare
- Agreement History — Amendments and versions
- Obligations & Deadlines — Agreed responsibilities and important dates
- Agreement Acknowledgment — Record each parent's acknowledgment

### 4. Advanced Spaces
- Multiple Spaces — Separate spaces for different purposes
- Child-Specific Spaces — Organize information by child
- Private Space — Personal notes and reminders that are not shared
- Granular Permissions — Control access to individual documents and records
- Space Activity Log — Review changes within each space

### 5. Advanced Financial Management
- Recurring Expenses — Regular tuition, healthcare, and other costs
- Expense Approval — Workflow for reviewing shared expenses
- Payment Status — Outstanding and completed reimbursements
- Expense Reports — Summaries by child, category, or period

### 6. Records & Documents
- Document Categories — Medical, school, and parenting documents
- Version History — Track document revisions
- Record Export — Compile schedules, expenses, and messages into reports
- Incident Records — Events with dates, descriptions, and attachments

---

# P3 — Legal & Professional Support

**Goal:** Support families who need structured assistance from third parties.

### 1. Legal
- Legal Documents — Court orders, signed agreements, related documents
- Document Classification — Court orders vs. signed agreements vs. informal arrangements
- Legal Contacts — Lawyer and legal representative details
- Legal Deadlines — Court dates and filing deadlines
- Legal Record Packages — Compile selected records for legal review

### 2. Intermediaries & Professionals
- Professional Invitations — Mediators, lawyers, counselors, parenting coordinators
- Role-Based Access — Appropriate permissions per professional
- Issue-Specific Access — Share only information relevant to a matter
- Professional Communication — Dedicated channel for authorized participants
- Mediation Workflow — Discussions, proposals, and outcomes
- Supervised Handover Coordination — Exchanges involving an agreed third party

### 3. Conflict Resolution
- Structured Disagreements — Unresolved issues organized separately from general messages
- Alternative Proposals — Parents can suggest compromises
- Resolution Tracking — Unresolved, under review, resolved
- Neutral Communication Assistance — Help phrase clear, child-focused messages
- Agreement Records — Document mutually accepted outcomes

### 4. Security & Auditability
- Detailed Access Logs — Track access to sensitive records
- Change Audit Trail — Significant changes and their authors
- Permission Revocation — Remove access when appropriate
- Retention Controls — Manage records per applicable legal and privacy requirements
- Sensitive Record Protection — Additional safeguards for legal and medical information

*Extended access matrix applies here:* invited professionals get **explicit-permission-only** access to calendar, child profile, expenses, and legal documents; **no default access** to private notes or audit records; authorization tests must prove professional access is limited to explicitly permitted resources.

---

# P4 — Intelligence & Ecosystem

**Goal:** Make the platform more proactive and useful without compromising parental autonomy.

### 1. AI Assistance
- Message Drafting — Clear, neutral messages
- Conversation Summaries — Decisions and outstanding issues
- Schedule Conflict Detection — Conflicting appointments and custody arrangements
- Task Extraction — Suggest tasks and deadlines from shared conversations
- Agreement Summaries — Summarize recorded arrangements without claiming to determine legal meaning
- Optional Guidance — Relevant parenting resources, without nagging or deciding for users

### 2. Family & Caregiver Network
- Trusted Caregiver Access — Limited access for approved relatives or caregivers
- School & Activity Coordination — School and extracurricular information
- Caregiver Scheduling — Coordinate childcare and transportation
- Participant Permissions — Restrict access by role

### 3. Integrations
- Calendar Integrations — External calendar services
- Document Storage Integrations — Import from supported services
- Payment Integrations — Supported reimbursement workflows
- Professional Services — Mediation or legal service providers

### 4. Insights & Reporting
- Family Activity Overview — Schedules, tasks, shared responsibilities
- Expense Trends — Changes in child-related spending
- Coordination Overview — Recurring scheduling conflicts
- Custom Reports — For personal or professional use

---

# Summary

| Priority | Focus | Main Outcome |
|---|---|---|
| **P0** | Secure foundation + minimum coordination (spaces, invites, children, calendar, messaging) | Two parents can securely coordinate schedules and communicate on web and mobile |
| **P1** | Hardening + remaining MVP features (storage, expenses, tasks, full child profiles) | Parents manage day-to-day parenting, expenses, and documents in one place |
| **P2** | Structured arrangements and accountability | Complex schedules, agreements, and records |
| **P3** | Mediation, legal documentation, third-party access | Families involve professionals with appropriate safeguards |
| **P4** | AI, integrations, insights | Less administrative work, better coordination |

**Recommendation:** Build around the shared Family Space. Don't build legal workflows or AI-driven conflict resolution into the initial release. First validate that parents consistently use the basic coordination features.

---

# Migrated Backlog (Nookbud)

> **This file is the single source of truth for Nookbud's roadmap and open items.** Do not add TODO lists, phase plans, or checklists to other docs — add them here and link back.
>
> Consolidated 2026-10-14 from: `prd.json`, `progress.txt`, `docs/discovery/prd.md`, `docs/discovery/5-launch/43-user-stories.md` (all deleted), and the TODO / action-item sections of the discovery and research docs (replaced with links to this file). Items already covered by P0–P4 above were not duplicated. Each item notes its source.

## Current codebase state (as of 2026-10-14)

- The mobile UI is built (onboarding, timeline, entry forms, entry detail, calendar, Spaces, Resources, export, settings), but the **data layer is stubbed**: a Firebase migration removed SQLite/Drizzle and was never completed. ~100 `// TODO: Firebase` stubs remain in `apps/mobile/src/services/`, and `auth.service.ts` is not implemented.
- No automated tests, no CI, no backend security rules.
- Old PRD stories 1–63 were marked as passing against the pre-migration local SQLite layer; stories 58 (OCR) and 64–69 (Tasks) were never done. All are mapped below.
- **Stack note:** this roadmap selects Supabase (Postgres + Auth + RLS). That supersedes the Firebase decision recorded in `docs/discovery/3-technical/21-tech-stack.md` and `24-data-layer.md`. `docs/supabase/schema.sql` is a starting point for migrations. Firebase-only TODOs (Firestore security rules, Firebase backup, Cloud Function hashing) are replaced by the P0/P1 equivalents and were not carried over.

## P0 additions

**Codebase & infrastructure**
- [ ] Remove migration leftovers: `@supabase/supabase-js` (re-add properly), `@op-engineering/op-sqlite`, `drizzle-orm`, `drizzle-kit`, unused `@react-native-firebase/*` *(21-tech-stack, 24-data-layer)*
- [ ] Replace every stubbed service in `apps/mobile/src/services/` with a real Supabase-backed implementation, starting with auth *(code audit)*
- [ ] Fix the Cloud Run landing deploy (container fails to start) and reconnect/verify the 4 Cloud Build triggers (nookbud-web, -admin, -backend, -landing) *(21-tech-stack)*
- [ ] Decide whether `apps/backend` (NestJS) is still needed alongside Supabase server-side functions *(roadmap comparison)*

**Legal & compliance** *(extends P0 launch gates and A5)*
- [ ] Philippines NPC registration and DPO designation *(05-regulatory, research/07)*
- [ ] Terms of Service with 18+ age gate / adult-only usage *(05-regulatory, research/07)*
- [ ] COPPA position review with counsel: data *about* minors vs. data *from* minors; privacy policy explicitly covers children's data and the PH DPA, GDPR and Australian Privacy Principles positions *(05-regulatory, research/07)*
- [ ] Breach response plan includes the 72-hour notification window *(05-regulatory, research/07)*
- [ ] Apple age-rating questionnaire; evaluate the Google Play Age Signals API *(research/07)*
- [ ] Confirm every third-party SDK is acceptable for an app handling children's data *(research/07)*
- [ ] Data-subject rights: correct/update personal data (deletion is already in P0; export is in P1) *(05-regulatory)*
- [ ] Consent mechanisms compliant with the DPA; counsel to confirm whether age verification or parental-consent flows are needed for data about children under 13 *(research/07)*
- [ ] Annual Security Incident Report (ASIR) process for the NPC; evaluate Philippine data-residency requirements *(research/07)*
- [ ] Document compliance processes *(research/07)*
- [ ] Privacy notice in English and Filipino; privacy policy also covers US state privacy rights (CCPA/CPRA etc.) and the Australian Privacy Principles (72-hour OAIC breach notice) *(05-regulatory)*
- [ ] No selling of user data and no behavioral targeting based on child-related data — state it in the policy *(05-regulatory)*
- [ ] Retention policy includes an auto-deletion schedule *(05-regulatory; extends Step 0.1 retention decision)*

**Accessibility baseline** *(specifics for A9)*
- [ ] Accessibility labels on all interactive elements; alt text on images; logical focus order *(32-accessibility)*
- [ ] WCAG AA contrast (4.5:1); no color-only indicators *(32-accessibility)*
- [ ] 44×44pt minimum touch targets with adequate spacing *(32-accessibility)*
- [ ] Respect reduce-motion; no information conveyed only through animation *(32-accessibility)*
- [ ] Automated a11y audit, plus manual VoiceOver (iOS) and TalkBack (Android) passes *(32-accessibility)*

**Onboarding** *(supports B1/B2)*
- [ ] Finalize inclusive family-structure options, design the screens, define skip behavior per step *(33-onboarding)*

**Pre-launch essentials**
- [ ] Buy `nookbud.com` (Porkbun, ~$11/yr) — verify it hasn't been bought already *(31-branding)*

## P1 additions

- [ ] **Tasks** — old PRD stories 64–69: tasks table, TaskService (CRUD, assign, complete), list screen with filters, create/assign form, task detail (edit, complete, reassign, delete), QA pass. `task.service.ts` exists as a stub. *(prd.json; maps to P1 Tasks & Reminders)*
- [ ] **Smart reminders** for pending acknowledgments, overdue expenses, upcoming events *(prd.md Phase 5; fold into P1 Tasks & Reminders)*
- [ ] **Resources** — reference documents per Space (medical, school, legal) with SHA-256 integrity check; UI exists from old Phase 4, needs private storage *(prd.md Phase 4; maps to P1 Shared Documents)*
- [ ] **Data export format** — PDF timeline report and ZIP evidence bundle (data JSON + attachments + hash manifest); define the `data.json` schema; compute the SHA-256 hash server-side on upload. Export screens exist from old Phase 1. *(24-data-layer, prd.md; maps to P1 Data Export)*
- [ ] **Analytics** — PostHog with onboarding funnel events, analytics opt-out, UTM channel attribution; A/B test invite-prompt timing *(33-onboarding, 05-regulatory, 12-go-to-market)*
- [ ] **Dark mode** support *(32-accessibility)*
- [ ] **Monetization** (pricing already decided: $17.99/mo · $149.99/yr — see `docs/discovery/2-strategy/10-pricing.md`): RevenueCat setup, annual-first paywall, trial countdown banner, hardship waiver form, invoice/receipt flow for annual plans, dunning, "your records summary" email at renewal. *Placed in P1 per the roadmap's "validate basic usage first" recommendation; pull forward if launching paid.* *(11-monetization)*

## P2 additions

- [ ] **Acknowledgment + dispute on records** — the old Phase 1 core (entry versioning, acknowledge/dispute, threaded responses). Maps to P2 Agreement Acknowledgment / Decision Tracking / Communication Records and P3 Structured Disagreements. Screens and content schemas exist. *(prd.md Phase 1)*
- [ ] **Archive Space** — hide inactive Spaces from the switcher, keep data *(prd.md Phase 4; extends P2 Advanced Spaces)*
- [ ] **Member labels** (co-parent, guardian, grandparent, lawyer, social worker…) — display-only, separate from permissions *(prd.json story 59)*
- [ ] **Scheduled reports** — weekly/monthly export sent to chosen members *(prd.md Phase 5)*
- [ ] **Tagalog localization** for the PH / OFW market *(32-accessibility)*

## P3 additions

- [ ] **Shared export links** — time-limited (7/30/90 days), password-protected links to verified reports *(prd.md Phase 6)*
- [ ] **Read-only invite links** with viewer role for mediators and coordinators *(prd.md Phase 6)*
- [ ] **Professional dashboard** — one view across all invited Spaces; lawyer can export from a client Space without client action; professional tier (multi-Space subscription) *(prd.md Phase 6, 11-monetization)*
- [ ] **Compliance tracking** against care agreements and court orders (referenced, not enforced) *(prd.md Phase 5)*
- [ ] **Digital signatures (PKI)** on exports *(01-brief)*

## P4 additions

- [ ] **OCR document scanning** — on-device (Google ML Kit); extract dates, amounts, names; pre-fill entries or save as Resources *(prd.json story 58)*
- [ ] **ToneMeter** — prototype API-based tone advisor in one sprint; define AI privacy consent model; decide on-device vs. cloud per feature; survey users at 500+ paid *(22-ai-layer)*
- [ ] **Care pattern insights** — custody time, event participation, acknowledgment rates *(prd.md Phase 5; extends P4 Insights)*

## Later — market expansion

- [ ] GDPR program if EU users grow: lawful basis per processing activity, DPIA, EU DPO, EU data residency, privacy-by-default for children's data *(05-regulatory, research/07)*
- [ ] Monitor NPC guidance on pending DPA amendments; annual privacy review *(05-regulatory)*

---

## Non-product workstreams

### Brand & store assets *(31-branding, 42-marketing-assets)*
- [ ] Pick a logo direction from `assets/brand/logo/`
- [ ] Finalize light + dark palette and typography — `BRAND.md` (sage `#4A7C59`, Plus Jakarta Sans) disagrees with `.claude/docs/styling.md` and the app (sage `#6F8F7B`, Inter + EB Garamond); pick one and update the other; write brand guidelines *(31-branding)*
- [ ] App icon from the chosen logo
- [ ] OG image (1200×630) and Play Store feature graphic
- [ ] App Store / Play screenshots once the P0 UI is stable

### Landing page *(41-landing-page, 12-go-to-market)*
- [ ] Waitlist page on nookbud.com (needed ~6 weeks before launch)
- [ ] Final copy, design and build, OG image, analytics
- [ ] Add App Store / Play links when live

### ASO & SEO *(40-keywords-seo-aso)*
- [ ] Keyword research (Ahrefs / App Annie / Sensor Tower) and competitor ASO keywords
- [ ] App Store listing copy (name + primary keyword, subtitle)
- [ ] SEO content plan

### Go-to-market *(12-go-to-market)*
- **Pre-launch (6 weeks before)**
  - [ ] Start helpful (non-marketing) participation in r/Divorce and r/coparenting
  - [ ] Reach out to 10 family law attorneys for beta feedback; draft the outreach email template
  - [ ] Find 3 OFW beta users for authentic testimonials
- **Launch week**
  - [ ] Product Hunt launch (pick the date)
  - [ ] Post an authentic OFW story in 3 Facebook groups
  - [ ] Pitch 2–3 family law blogs for a review
- **Ongoing**
  - [ ] Weekly Reddit participation; bi-weekly OFW community stories; 2 SEO blog posts per month
  - [ ] Monthly attorney outreach (5 new per month); define attorney referral program mechanics

### Finance *(13-financial-projections)*
- [ ] Track real conversion in RevenueCat from day 1; update projections monthly with actuals
- [ ] Track CAC per channel (Reddit, ASO, attorney referral, OFW groups)
- [ ] Milestone-based spending rules (e.g., no paid ads until $5K MRR is proven organically)
- [ ] Model a web-billing option to avoid the 15–30% store fee on annual plans

### Research backlog *(03-competitors, competitor-talkingparents)*
- [ ] Transcribe and analyze: [TalkingParents App Review (2025)](https://www.youtube.com/watch?v=TgBL38atkeA)
- [ ] Transcribe and analyze: [Co-Parenting Tools for Centralized & Court-Admissible Communication](https://www.youtube.com/watch?v=3SgCwgSbnU8)
- [ ] ⭐ Transcribe and analyze: [Unalterable Records — Court-Approved Documentation](https://www.youtube.com/watch?v=BiIABLoIrgk&list=PLgDIr_o2OqckCvwAPioRsOLzq7scyDbW0) (check the rest of the playlist)
