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
