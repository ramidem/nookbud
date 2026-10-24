# Nookbud specification

The main requirements document. It grows one area at a time. Today it covers **authentication, users and spaces**. Other areas (calendar, messaging, expenses, documents, export) are still described in [ROADMAP-2026.md](../ROADMAP-2026.md) and will move here as we specify them. The lines for this area were removed from the older docs when they were moved here.

**How to read it**

- Every requirement has an ID (`AUTH-3`) so other docs, tests and commits can point at it.
- **P0 to P3** is the priority, using the scale in [ROADMAP-2026.md](../ROADMAP-2026.md). P0 blocks launch. The roadmap keeps the launch gates, the P0 build order and the rest of the backlog.
- **Proposed** means it came from an older doc or from us and is not agreed yet. See [Open questions](#11-open-questions).
- Where an older doc disagreed with a newer decision, the newer decision wins and the old one is noted in the [source map](#12-source-map).

## Contents

1. [Terms](#1-terms)
2. [Decisions](#2-decisions)
3. [Users and accounts](#3-users-and-accounts)
4. [Authentication](#4-authentication)
5. [Spaces](#5-spaces)
6. [Membership and invitations](#6-membership-and-invitations)
7. [Authorization](#7-authorization)
8. [Data model](#8-data-model)
9. [Non-functional requirements](#9-non-functional-requirements)
10. [Verification](#10-verification)
11. [Open questions](#11-open-questions)
12. [Source map](#12-source-map)

---

## 1. Terms

| Term           | Meaning                                                                                                                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User**       | A person with an account. A user is not a parent, a child or a space.                                                                                                                    |
| **Space**      | The shared place where the people caring for a child keep their records. Other software calls this a workspace; in Nookbud the product, the code and the database all say **space**. |
| **Member**     | A user who belongs to a space, with a role in it.                                                                                                                                        |
| **Owner**      | A member who manages the space: its details, its members and its invitations.                                                                                                            |
| **Child**      | A child whose care a space records. Children do not have accounts.                                                                                                                       |
| **Invitation** | A single-use, expiring way for an owner to add a user to a space.                                                                                                                        |
| **Role**       | What a member may do in one space. It comes from membership, not from the account.                                                                                                       |
| **Label**      | An optional display word on a member (co-parent, grandparent). It never changes permissions.                                                                                             |

---

## 2. Decisions

| #   | Decision                                                                         | Status                       |
| --- | -------------------------------------------------------------------------------- | ---------------------------- |
| D1  | Say **space** everywhere, never workspace, family or care circle.                | Decided 2026-10-24           |
| D2  | The database is **Supabase** (PostgreSQL), with Row-Level Security.              | Decided 2026-10-24           |
| D3  | Users and sign-in use **Supabase Auth**, not WorkOS. Reasons and triggers below. | **Proposed**, confirm in OQ1 |

### D3: Supabase Auth or WorkOS

Both can do sign-in. WorkOS AuthKit works with Supabase as a third-party auth provider ([WorkOS guide](https://workos.com/docs/integrations/supabase-authkit), [Supabase guide](https://supabase.com/docs/guides/auth/third-party/workos)) and is free up to 1 million monthly active users ([pricing](https://workos.com/pricing)). So cost does not decide it. Isolation does.

Recommendation: **Supabase Auth**, because:

1. **Membership has to live in Postgres.** Row-Level Security decides access by joining `space_members`. WorkOS organizations and memberships would be a second copy that must stay in sync, and a gap between them is exactly the cross-family leak we cannot afford (see AZ-3).
2. **RLS works with less glue.** With WorkOS, the access token's `role` claim must be rewritten to `authenticated` through a JWT template. One third-party write-up also reports that WorkOS user IDs are strings like `user_01H…`, not UUIDs, so `auth.uid()` would not work and every policy would compare `auth.jwt() ->> 'sub'` against text columns. We have not verified that ourselves. It is still an extra moving part in the most important security area.
3. **WorkOS's strengths are for businesses.** Single sign-on, directory sync and an admin portal serve companies. A space is a family, not a company.
4. **Supabase Auth covers P0:** email verification, password reset, TOTP MFA, session revoke and rate limits. Confirm each during roadmap step 0.4.
5. **It is reversible.** Keep auth behind one thin module so the provider can change later, since Supabase accepts third-party auth.

Revisit if we need enterprise SSO (for example law firms or mediators in P3), or if Supabase Auth's mobile flows or email deliverability fall short.

---

## 3. Users and accounts

| ID    | Requirement                                                                                                                                                                       | Priority |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| USR-1 | A user is a person with an account. A user is not a parent, a child or a space. Roles come from membership.                                                                       | P0       |
| USR-2 | Children do not get accounts.                                                                                                                                                     | P0       |
| USR-3 | **A user can belong to many spaces**, with a role in each.                                                                                                                        | P0       |
| USR-4 | A user can use a space alone. Inviting someone is optional.                                                                                                                       | P0       |
| USR-5 | The profile holds only what features need: name, email, time zone and default currency. Never hard-code a time zone, date format or currency. _Proposed_                          | P0       |
| USR-6 | A user can edit their profile and change their password in settings.                                                                                                              | P0       |
| USR-7 | A user can **delete their account in the app**. The flow explains what happens to shared data (see OQ7). Apple and Google both require this for apps with account creation.      | P0       |
| USR-8 | Users must be adults. Onboarding has an age gate (18+) and the terms say the app is for adults only. _Proposed_                                                                   | P0       |
| USR-9 | A user can deactivate their account. Define what deactivation does to their memberships and records first.                                                                        | P1       |
| USR-10 | A user can export their own data. Pull into P0 if legal counsel requires it for launch.                                                                                          | P1       |
| USR-11 | A settings area for privacy controls over sensitive family information.                                                                                                           | P1       |
| USR-12 | A user can correct and update their personal data. Deletion is USR-7 and export is USR-10. | P0 |

---

## 4. Authentication

Authentication says who the user is. It does not say what they may access; that is [section 7](#7-authorization).

| ID      | Requirement                                                                                                                                                                  | Priority |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| AUTH-1  | Email verification at registration. An unverified user is denied access to space data.                                                                                       | P0       |
| AUTH-2  | Email and password sign-in. **No social login**, which also avoids Apple's Sign in with Apple requirement.                                                                   | P0       |
| AUTH-3  | Secure password reset.                                                                                                                                                       | P0       |
| AUTH-4  | Session management: defined duration, renewal and expiry. A user can see their active sessions and **sign out of all devices**.                                              | P0       |
| AUTH-5  | **Optional MFA** (authenticator-app codes). In a custody context the adversary is often someone who knows your passwords or has your devices.                                | P0       |
| AUTH-6  | Brute-force protection and rate limits on every auth endpoint.                                                                                                               | P0       |
| AUTH-7  | Account-enumeration protection on sign-up, sign-in and password reset. Responses do not reveal whether an email has an account.                                              | P0       |
| AUTH-8  | Web and mobile use the same flows against the same backend. Both ship every auth flow together.                                                                              | P0       |
| AUTH-9  | Tokens on **web** live in secure, correctly configured cookies. No privileged credential is ever reachable from browser JavaScript.                                          | P0       |
| AUTH-10 | Tokens on **mobile** live in `expo-secure-store`.                                                                                                                            | P0       |
| AUTH-11 | Service-role keys and database passwords are never embedded in any client.                                                                                                   | P0       |
| AUTH-12 | Deep links for invitations and password reset on mobile are handled safely.                                                                                                  | P0       |
| AUTH-13 | **Enforced MFA** for sensitive operations and privileged accounts.                                                                                                           | P1       |
| AUTH-14 | Notify users of important security events on their account.                                                                                                                  | P1       |
| AUTH-15 | A policy for lost or compromised devices, and a policy for supported app versions on mobile.                                                                                 | P1       |

---

## 5. Spaces

| ID     | Requirement                                                                                                                                                                | Priority |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| SPC-1  | Any user can **create a space**. The creator becomes its owner.                                                                                                            | P0       |
| SPC-2  | A user can see every space they belong to and **switch between them**.                                                                                                     | P0       |
| SPC-3  | A space can have several adults and several children.                                                                                                                      | P0       |
| SPC-4  | An owner can rename the space.                                                                                                                                             | P0       |
| SPC-5  | An owner can delete the space. Deletion is soft: records are kept until the retention rules say otherwise (see OQ6). _Proposed_                                            | P0       |
| SPC-6  | A space always has an owner. An owner cannot leave until they have transferred ownership to another member. _Proposed_                                                     | P0       |
| SPC-7  | An owner can customise the space (emoji, colour). _Proposed_                                                                                                               | P1       |
| SPC-8  | Activity history: important changes to the space's records.                                                                                                                | P1       |
| SPC-9  | Child-specific spaces: organise information by child.                                                                                                                      | P2       |
| SPC-10 | A private space for personal notes and reminders that are not shared.                                                                                                      | P2       |
| SPC-11 | A space activity log to review changes within the space.                                                                                                                   | P2       |
| SPC-12 | An owner can archive a space: it leaves the switcher and its data is kept. | P2 |

SPC-2 and USR-3 make "many spaces per user" a P0 requirement. The roadmap listed _Multiple Spaces_ under P2; that no longer holds (see OQ9).

---

## 6. Membership and invitations

### Membership

| ID    | Requirement                                                                                                                              | Priority |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| MEM-1 | An owner can **add a user to a space** by invitation.                                                                                    | P0       |
| MEM-2 | An owner can **remove a member**. Their access ends immediately.                                                                         | P0       |
| MEM-3 | A member can **leave** a space. Their access ends immediately.                                                                           | P0       |
| MEM-4 | Members can see who else is in the space.                                                                                                | P0       |
| MEM-5 | A user can have only one active membership per space. The database enforces it.                                                          | P0       |
| MEM-6 | P0 has two roles: **owner** and **member**. The roadmap calls the second one `parent`; see OQ2. _Proposed_                              | P0       |
| MEM-7 | An owner can change another member's role. An owner cannot change their own; they transfer ownership instead. Role changes are audited. _Proposed_ | P1      |
| MEM-8 | A member can carry an optional label (co-parent, grandparent). It is display only and never changes permissions.                         | P1       |

### Invitations

| ID    | Requirement                                                                                                                                                                  | Priority |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| INV-1 | An invitation is **single-use**, **expires**, and is **bound to the invited email**.                                                                                         | P0       |
| INV-2 | Only the authenticated user whose email matches can accept it.                                                                                                               | P0       |
| INV-3 | Only members allowed to invite can create or revoke an invitation.                                                                                                           | P0       |
| INV-4 | An invitation cannot be accepted by the wrong user, reused, or accepted after it expires. Accepting it when already a member is rejected.                                    | P0       |
| INV-5 | The invitation carries the role the inviter chose, and it is applied when the invitation is accepted.                                                                        | P0       |
| INV-6 | Invitation abuse and spam are limited with rate limits.                                                                                                                      | P0       |
| INV-7 | Accepting works on web and on mobile (through a deep link, see AUTH-12).                                                                                                     | P0       |
| INV-8 | Invitations expire after 7 days. _Proposed_                                                                                                                                  | P0       |
| INV-9 | Read-only invitation links with a viewer role for mediators and coordinators. | P3 |

---

## 7. Authorization

| ID   | Requirement                                                                                                                                                                  | Priority |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| AZ-1 | **Membership-based access.** No membership, no access to any resource in a space.                                                                                            | P0       |
| AZ-2 | **Row-Level Security on every table.** The database enforces isolation, whatever the app does.                                                                               | P0       |
| AZ-3 | **Cross-space isolation.** A user cannot read or write another space's records, even by guessing or changing IDs.                                                            | P0       |
| AZ-4 | Revoking a membership ends access immediately.                                                                                                                               | P0       |
| AZ-5 | Privileged operations are re-checked on the server. Hiding a button is not authorization.                                                                                    | P0       |
| AZ-6 | Role checks follow the access matrix below.                                                                                                                                  | P0       |
| AZ-7 | Child data follows the child-access policy (OQ5). The schema allows tightening it later.                                                                                     | P0       |
| AZ-8 | **Audit log** entries for security-sensitive actions: invitation sent, invitation accepted, member added, member removed, role changed, space deleted, child added, account deleted. | P0       |
| AZ-9 | Granular permissions: control access to individual documents and records.                                                                                                    | P2       |
| AZ-10 | Invited professionals (mediators, lawyers, counsellors) get **explicit-permission-only** access to the calendar, child profile, expenses and legal documents, and **no default access** to private notes or audit records. A role per professional type. Access can be revoked. | P3       |
| AZ-11 | Participants can be restricted by role.                                                                                                                                      | P4       |

Enforcement happens in layers, so one missed check does not open a hole: the request is authenticated, the user is a member of the space, the role allows the action, and for some actions (editing an entry) the user is also its creator.

### Access matrix (P0, illustrative starting policy)

| Resource                                    | Owner                              | Member                  |
| ------------------------------------------- | ---------------------------------- | ----------------------- |
| Shared calendar                             | Read and write                     | Read and write          |
| Schedule change requests                    | Create and respond                 | Create and respond      |
| Messages                                    | Read and write                     | Read and write          |
| Child profile (basic)                       | Per child-access policy            | Per child-access policy |
| Audit records                               | Limited visibility                 | Limited visibility      |
| Rename or delete the space, transfer owner  | Yes _(proposed)_                   | No                      |
| Invite, remove members, change roles        | Yes _(proposed)_                   | No                      |
| Leave the space                             | Yes, after transferring ownership  | Yes                     |
| Anyone outside the space                    | No access                          | No access               |

This is a starting policy, not a universal rule. Access to child or legal records may need to reflect court orders, applicable law and safety requirements. Private notes, legal documents and professional access are not in P0.

---

## 8. Data model

Supabase (PostgreSQL) is the single authoritative backend. Identity comes from Supabase Auth; everything else is ordinary tables with RLS.

| ID   | Requirement                                                                                                                                                                  | Priority |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| DB-1 | P0 tables for this area: `users` (profile, keyed to the auth identity), `spaces`, `space_members`, `invitations`, `audit_logs`. Children and feature tables (calendar, messaging) come with their own specs. | P0       |
| DB-2 | **Model people explicitly.** A user can belong to many spaces and a space can have many adults and children. Do not put a single `parent_id` or `family_id` on every table.   | P0       |
| DB-3 | UUID identifiers for every record the client can see.                                                                                                                        | P0       |
| DB-4 | Foreign keys and constraints, including no duplicate active memberships (MEM-5).                                                                                             | P0       |
| DB-5 | Versioned migrations only. No manual schema changes.                                                                                                                         | P0       |
| DB-6 | Created and updated timestamps on every table.                                                                                                                               | P0       |
| DB-7 | Indexes on foreign keys and on access-control lookups.                                                                                                                       | P0       |
| DB-8 | A soft-delete versus permanent-delete policy, once OQ6 is settled.                                                                                                           | P0       |
| DB-9 | Synthetic seed data only. Never real children's data.                                                                                                                        | P0       |

---

## 9. Non-functional requirements

### Security

| ID     | Requirement                                                                                                                                                | Priority |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| SEC-1  | HTTPS and TLS everywhere.                                                                                                                                  | P0       |
| SEC-2  | Secrets stay out of source control. Production secrets are managed securely.                                                                               | P0       |
| SEC-3  | Input is validated on the server, not only in the UI, with shared Zod schemas.                                                                             | P0       |
| SEC-4  | Output is encoded to prevent cross-site scripting, especially message content.                                                                             | P0       |
| SEC-5  | CSRF protection on cookie-authenticated web operations. CORS limited to intended origins. Security headers on web.                                          | P0       |
| SEC-6  | Rate limits on auth, invitations and messaging.                                                                                                            | P0       |
| SEC-7  | Errors show no internal details, database errors or sensitive data.                                                                                        | P0       |
| SEC-8  | **Logging hygiene.** Never log passwords, tokens or message content. Error monitoring must not capture message content or child data.                      | P0       |
| SEC-9  | Dependency vulnerability scanning.                                                                                                                         | P0       |
| SEC-10 | **Every new table ships with RLS and a forbidden-access test in the same change.**                                                                         | P0       |

### Privacy

| ID     | Requirement                                                                                                                                                                                              | Priority |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| PRIV-1 | Data classification (public, internal, confidential, highly sensitive), in a one-page doc.                                                                                                               | P0       |
| PRIV-2 | **Data minimization.** Collect only what a defined feature needs (a child's nickname and birth date, not more).                                                                                          | P0       |
| PRIV-3 | Encryption at rest for the database and its backups.                                                                                                                                                     | P0       |
| PRIV-4 | Privacy policy and terms published. Consent recorded where legally required.                                                                                                                             | P0       |
| PRIV-5 | **No third-party data sharing** in P0: no professional access, no external integrations. We never sell user data and never target by child-related behaviour; the policy says so.                        | P0       |
| PRIV-6 | Deletion behaviour is defined across related records and backups. The retention policy includes an automatic deletion schedule.                                                                                                                                        | P0       |
| PRIV-7 | **Philippines Data Privacy Act (RA 10173)** review with legal counsel before launch: lawful processing, parental authority, children's data, data-subject rights, retention and sensitive personal information. One parent's consent does not settle every legal question about a child's information. | P0       |
| PRIV-8 | App Store privacy labels and the Google Play Data safety form are accurate.                                                                                                                              | P0       |
| PRIV-9 | Additional restrictions for medical and child-related information.                                                                                                                                       | P1       |
| PRIV-10 | Counsel confirms whether age verification or parental-consent flows are needed for data about children under 13, and that consent mechanisms meet the privacy law. | P0 |

### Reliability and performance

| ID    | Requirement                                                                                          | Priority |
| ----- | ---------------------------------------------------------------------------------------------------- | -------- |
| REL-1 | Database backups with a defined recovery objective, and **one verified restore** before launch.      | P0       |
| REL-2 | Scheduled restore drills.                                                                            | P1      |
| REL-3 | Performance and availability targets for auth and space operations. **Not defined yet.**             | TBD      |

---

## 10. Verification

| ID     | Requirement                                                                                                                                                               | Priority |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| TEST-1 | **Authorization tests are an exit requirement.** One family cannot read or write another family's records. A revoked member loses access. Changing an object ID does not bypass authorization. Unauthenticated and unverified users are denied. | P0       |
| TEST-2 | Invitation tests: it cannot be accepted by the wrong user, reused, or accepted after expiry.                                                                              | P0       |
| TEST-3 | Integration tests for database constraints and auth flows.                                                                                                                | P0       |
| TEST-4 | Web end-to-end test (Playwright): register, sign in, create a space, invite, accept.                                                                                      | P0       |
| TEST-5 | A manual smoke checklist for the same flows on iOS and Android.                                                                                                           | P0       |
| TEST-6 | CI checks migrations as well as types, lint, tests and build.                                                                                                             | P0       |
| TEST-7 | Automated mobile end-to-end tests (Maestro).                                                                                                                              | P1       |

A successful build is not enough. The tests must show that unauthorized access is denied.

---

## 11. Open questions

| #   | Question                                                                                                                                                                                                                              | Recommendation                                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| OQ1 | Confirm Supabase Auth over WorkOS (D3).                                                                                                                                                                                               | Supabase Auth.                                                                                                           |
| OQ2 | Which roles ship in P0? The roadmap says `owner` and `parent`; the older domain docs say `owner`, `editor` and `viewer`; the concept doc says Parent A, Parent B and Viewer.                                                           | `owner` and `member`. Keep "parent" out of role names, since grandparents and guardians join too. Add `viewer` in P3.    |
| OQ3 | Who may invite and remove members: owners only, or any member?                                                                                                                                                                        | Owners only.                                                                                                             |
| OQ4 | One owner per space or several? What does the ownership-transfer flow look like?                                                                                                                                                      | At least one owner, several allowed, so a space survives one parent leaving.                                             |
| OQ5 | Child-access policy: which members can read or write which child fields?                                                                                                                                                              | Open. Do not assume a parent has unrestricted access.                                                                    |
| OQ6 | Retention and deletion rules: what is permanently deleted, what is recoverable, and when. The older data-layer doc proposed 30 days then hard delete for deleted accounts and 7 years for audit logs, written for GDPR on Firebase.   | Open. Settle with legal counsel (PRIV-7).                                                                                |
| OQ7 | When one member deletes their account, what happens to the space, its messages and the children's data? The older docs soft-delete the user and show "Deleted Member" on their entries.                                              | Keep their records in the space, shown as "Former member". Delete personal profile data.                                 |
| OQ8 | Invitation format: the roadmap says an email-bound token; the older docs say a 6-character code with a 7-day expiry.                                                                                                                  | Email-bound token (INV-1). The code is retired.                                                                          |
| OQ9 | Multiple spaces: P0 (per this spec), P2 (per the roadmap) or paid-only (per the older subscription gating)? [BRAND.md](../BRAND.md) says one parent pays and invited members join free.                                              | P0 and free to invite. Decide what the plan limits when pricing is set.                                                  |
| OQ10 | Do privileged operations (accept an invitation, delete an account, transfer ownership) need `apps/api` (NestJS), or are Supabase functions enough? Also in [TODO.md](../TODO.md).                                                    | Start with Supabase functions and add `apps/api` only if a requirement needs it.                                          |

---

## 12. Source map

Where the requirements in this file came from. Those lines were then removed from the source, so this file is the only place they live.

| From | What moved | What stays there |
| --- | --- | --- |
| [ROADMAP-2026.md](../ROADMAP-2026.md) P0 | Database, authentication, authorization, privacy and application security sections; space and account features; the access matrix; auth, invitation and end-to-end tests; the child-access, retention and single-parent-departure decisions; the legal items on the age gate, data selling, retention schedule, data-subject rights and consent | Launch gates, implementation order, architecture, stack table, child profiles, calendar, messaging, the rest of testing and operations |
| ROADMAP-2026.md P1 to P4 | Enforced MFA, deactivation, security notifications, data export, device policy, sensitive-data handling, restore drills, mobile end-to-end tests, permissions UI, activity history, privacy controls, advanced spaces, archive space, member labels, professional access, viewer invitation links, participant permissions | The other backlog items |
| [TODO.md](../TODO.md) | The child-access, retention and account-deletion decisions | Everything else |
| [CO-PARENT.md](../CO-PARENT.md) | Identity & Access and Role-Based Access (password hashing and device tracking are now Supabase Auth's job) | The rest of the product concept |
| `docs/discovery/3-technical/23-domain-logic.md`, `20-decision-logic.md` | Space, member and invitation concepts; space, role and invitation rules; role capabilities; enforcement layers; the owner, duplicate-join and account-deletion edge cases; the space and role terminology rows | Entries, versions, acknowledgment, export and subscription logic |
| `docs/discovery/3-technical/24-data-layer.md`, `21-tech-stack.md` | Only the retention figures, quoted in OQ6 | Everything. Both are marked superseded and describe Firebase |
| `docs/discovery/1-research/05-regulatory.md`, `4-design/33-onboarding.md` | The age gate (USR-8) and the optional invitation (USR-4), quoted | Everything. They are research and design reference |
