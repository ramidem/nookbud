# Requirements

What we build, in the order we build it. Each item is a user story (functional) or a rule the system must meet (non-functional) with acceptance criteria that can be tested.

This file covers **authentication and users**. Spaces and membership come next. The full wording of each requirement lives in [spec.md](spec.md); the `Spec` line on every item names the requirement IDs it implements. If the two disagree, `spec.md` wins.

**Who the stories are about**

| Voice | Who |
| --- | --- |
| a visitor | Someone without an account yet |
| a user | Anyone signed in |
| a parent | Any adult caring for a child: a separated parent like Marcus, a parent working overseas like Jun, a grandparent raising a grandchild like Lola Cora, adoptive parents like Sarah and David, a blended-family parent like Camille |
| an owner, a member | Roles inside a space. They arrive with the spaces stage |

The personas are in [docs/discovery/1-research/04-icp.md](discovery/1-research/04-icp.md).

**How to use it**

- Work top to bottom. An item only depends on items above it.
- `F` is functional, `NF` is non-functional. `P0` blocks launch, `P1` follows it.
- Item numbers (`R7`) never change. To reorder, move the item; do not renumber.
- Build web first. A functional item is done only when mobile matches (AUTH-8), once `apps/mobile` exists.

**Done means**

- The acceptance criteria pass.
- Tests cover them.
- Any new table ships with Row-Level Security and a forbidden-access test (SEC-10).
- No password, token or message content reaches a log (SEC-8).
- `spec.md` is updated if the behavior changed.

---

## Stage 1. Foundations

Nothing a user sees yet. These come first because everything else leans on them.

- [ ] **R3 · NF · P0** A test can prove one user cannot read another user's data.
  - A helper in `supabase/tests` runs the same query as user A, user B and a signed-out visitor.
  - A sample table proves A cannot read B's rows.
  - CI fails when a table has no Row-Level Security.
  - Spec: AZ-2, SEC-10, TEST-1

- [ ] **R4 · NF · P0** The app talks to auth through one small module.
  - Sign up, sign in, sign out, session and password reset go through it.
  - No feature code imports the auth provider's SDK directly, so the provider can change later.
  - Spec: D3

- [ ] **R5 · NF · P0** Every push gets its own deploy, and auth links point at the right one.
  - A Vercel project deploys `apps/web` with the app folder as its Root Directory.
  - Each push gets a preview deploy.
  - Verification and reset links use the base URL of the environment that sent them: local, preview, staging or production.
  - Values are set as described in [secrets.md](secrets.md): public values as `NEXT_PUBLIC_` project variables, secrets as server-only variables.
  - Spec: roadmap A3 (environment separation), AUTH-1, AUTH-3

- [ ] **R42 · NF · P0** Staging and production exist, and migrations reach them through CI.
  - Staging and production are separate Supabase projects, each linked with `supabase link`.
  - CI applies migrations to staging on merge and to production after approval. Nobody pushes by hand.
  - Neither environment shares keys, users or data with local.
  - Update [the database page](database.md) when it is done.
  - Spec: DB-5, roadmap A3 (environment separation)
  - Blocked by: creating the two Supabase projects (an account action).

- [ ] **R6 · NF · P0** Verification and reset emails arrive.
  - They send from a Nookbud address with SPF and DKIM set up.
  - The copy says Nookbud and follows the brand voice (R19).
  - A staging test sends one to a real inbox and it is not marked as spam.
  - Start from the old email templates (`nookbud_copy/apps/backend/src/app/email/email.templates.ts`, Resend), rebranded from CoParent to Nookbud.
  - Spec: AUTH-1, AUTH-3, AUTH-16
  - Blocked by: owning `nookbud.com`.

---

## Stage 2. Create an account

- [ ] **R7 · F · P0** As a visitor, I can create an account with my email and a password.
  - There is no social sign-in.
  - The password rules are shown before I submit. _Proposed: at least 12 characters, no composition rules._
  - Spec: AUTH-2

- [ ] **R8 · F · P0** As a visitor, I confirm I am 18 or older and accept the terms and privacy policy when I create an account.
  - I cannot finish sign-up without both.
  - My acceptance is stored with the date and the version of the policy.
  - The terms and policy are linked from the form.
  - The terms state that Nookbud is for adults only.
  - Spec: USR-8, PRIV-4

- [ ] **R9 · F · P0** As a new user, I get an email to verify my address, and I can verify it.
  - The link works once and expires.
  - I can ask for a new email, and requests are rate limited.
  - Until I verify, I cannot reach any space data.
  - Spec: AUTH-1

- [ ] **R10 · F · P0** As a new user, my profile is created for me.
  - A `users` profile row appears when I register, keyed to my sign-in identity.
  - It has Row-Level Security: I can read and change only my own row.
  - Spec: USR-1, DB-1, DB-3, DB-6

---

## Stage 3. Sign in and out

- [ ] **R11 · F · P0** As a user, I can sign in with my email and password.
  - A wrong password and an unknown email show the same message.
  - If my email is not verified, I am asked to verify it.
  - Spec: AUTH-2, AUTH-7

- [ ] **R12 · F · P0** As a user, I stay signed in until my session expires.
  - Session length and renewal are decided, written down and tested.
  - An expired session sends me back to sign in, then back to where I was.
  - Spec: AUTH-4

- [ ] **R13 · F · P0** As a user, I can sign out.
  - The session ends on the server, not only on my device.
  - Spec: AUTH-4

- [ ] **R14 · F · P0** As a user who forgot my password, I can reset it by email.
  - The link works once and expires.
  - The response never says whether the email has an account.
  - Resetting signs out every other session. _Proposed._
  - Spec: AUTH-3, AUTH-7

- [ ] **R15 · NF · P0** Sign-in tokens are stored safely.
  - Web: secure, correctly configured cookies. No privileged credential is reachable from browser JavaScript.
  - Mobile: tokens live in `expo-secure-store`.
  - Spec: AUTH-9, AUTH-10

- [ ] **R16 · NF · P0** Sign-in, sign-up and reset are protected against guessing.
  - Repeated failures slow down or block, per account and per address.
  - The limit message never reveals whether an account exists.
  - A test runs the attack and shows it is stopped.
  - Spec: AUTH-6, AUTH-7, SEC-6

- [ ] **R17 · NF · P0** Cookie sessions on the web are protected.
  - CSRF protection on every state-changing request.
  - CORS allows only our own origins.
  - Security headers are set.
  - Spec: SEC-5

- [ ] **R18 · NF · P0** Auth and account screens are accessible.
  - Every control has a label, images have alt text and focus order is logical.
  - Text has 4.5:1 contrast and nothing relies on color alone.
  - Touch targets are at least 44×44 pt with space between them.
  - Reduced-motion settings are respected, and no information appears only in an animation.
  - An automated accessibility check passes, and one manual screen-reader pass is done on each platform.
  - Spec: UX-1

- [ ] **R19 · NF · P0** Auth and account messages follow the Nookbud voice.
  - Short sentences, one idea at a time, addressing me as "you".
  - Titles describe what happened ("Verification failed"), never just "Error".
  - Red is only for real alerts such as a failed sign-in lockout or data loss.
  - Spec: UX-2

---

## Stage 4. Account security

- [ ] **R20 · F · P0** As a parent who worries someone has access to my devices, I can see where I am signed in and sign out of every device.
  - The list shows each session's device and when it was last used.
  - "Sign out everywhere" ends all sessions at once.
  - Spec: AUTH-4

- [ ] **R21 · F · P0** As a user, I can turn on two-step sign-in with an authenticator app, and turn it off.
  - Setup shows a QR code and asks for a code to confirm.
  - Once on, sign-in asks for a code.
  - There is a way back in if I lose my phone (recovery codes).
  - Spec: AUTH-5

- [ ] **R22 · F · P0** As a user, I can change my password while signed in.
  - I must enter my current password.
  - My other sessions end.
  - Spec: USR-6

- [ ] **R23 · NF · P0** Security-sensitive account events are recorded.
  - An `audit_logs` table exists with Row-Level Security.
  - Entries hold ids and the action, not personal details.
  - Account deletion writes an entry. Later items add more.
  - Spec: AZ-8, DB-1

---

## Stage 5. Profile, settings and first run

- [ ] **R24 · F · P0** As a parent working overseas, I see dates and times in my own time zone and money in my own currency.
  - I can set my name, time zone and default currency.
  - Time zone starts from my device and I can change it.
  - Nothing assumes a time zone, date format or currency.
  - Spec: USR-5

- [ ] **R25 · F · P0** As a user, I can correct my details later.
  - I can edit everything in my profile.
  - Spec: USR-6, USR-12

- [ ] **R26 · F · P0** As a user, I find my account controls in one Settings screen.
  - It holds profile, password, two-step sign-in, signed-in devices and delete account.
  - Currency and notifications sit here too once they exist, and privacy controls and data export arrive in P1.
  - Spec: USR-6

- [ ] **R27 · F · P0** As a new user, I am asked who shares responsibility for a child with me, with options that fit my family.
  - The question is "Who shares responsibility for a child with you?", never "Who is your co-parent?"
  - Options: partner, ex-partner, grandparent, guardian, other family member, and "I'm the sole caregiver right now".
  - Every onboarding step can be skipped. Using Nookbud alone is a valid choice.
  - The welcome screen carries the tagline "Two homes. One childhood."
  - Spec: USR-4, USR-13

---

## Stage 6. Delete my account

- [ ] **R28 · F · P0** As a user, I can delete my account inside the app.
  - I confirm with my password.
  - It tells me what happens to anything I shared before I confirm.
  - My profile is removed and all my sessions end.
  - An audit entry is written.
  - Deletion works properly from day one. Competitors have been flagged for refusing it.
  - Needs a server-side path, since a client cannot delete its own identity: a Supabase function, or `apps/api` if OQ10 says so.
  - Spec: USR-7, PRIV-6
  - Blocked by: decisions OQ6 and OQ7 in `spec.md`.

---

## Stage 7. Prove it works

- [ ] **R29 · NF · P0** Logs and error reports hold no secrets.
  - Passwords and tokens are never logged.
  - Error monitoring is set up so it cannot capture message content or child data.
  - Spec: SEC-8

- [ ] **R30 · NF · P0** Signed-out and unverified visitors are denied everywhere.
  - A test calls every endpoint and table without a session, and again with an unverified one.
  - Changing an id in a request never returns or changes another user's profile.
  - Spec: TEST-1

- [ ] **R31 · NF · P0** The privacy policy and terms are published.
  - Both are linked from sign-up and from settings.
  - Spec: PRIV-4, PRIV-7
  - Blocked by: legal review.

- [ ] **R32 · NF · P0** `apps/mobile` exists and signs in against the same backend.
  - An Expo app runs on iOS and Android.
  - It uses the same auth module and the same Supabase project as the web app.
  - It joins the client-bundle secrets check: add `EXPO_PUBLIC_` to the decoy prefixes and scan its bundle ([secrets.md](secrets.md)).
  - Check pnpm compatibility when adding it. React Native tooling may need `nodeLinker: hoisted` in `pnpm-workspace.yaml`.
  - Spec: AUTH-8

- [ ] **R33 · NF · P0** Web and mobile behave the same.
  - Every functional item above works on both.
  - Password-reset links open the app safely on mobile.
  - A manual smoke checklist covers sign up, verify, sign in, sign out and reset on iOS and Android.
  - Spec: AUTH-8, AUTH-12, TEST-5

- [ ] **R34 · NF · P0** One automated browser test covers the whole path.
  - It registers, verifies, signs in, signs out and resets a password.
  - Spec: TEST-4

---

## Later (P1)

- [ ] **R35 · F · P1** As a user, I can deactivate my account. Spec: USR-9
- [ ] **R36 · F · P1** As a user, I can export my data.
  - The export holds everything Nookbud keeps about me, in a structured, machine-readable format. This covers my right of access and portability under the privacy law.
  - Pull it into P0 if legal counsel requires it for launch.
  - Spec: USR-10
- [ ] **R37 · F · P1** As a user, I get a message when something important happens to my account's security. Spec: AUTH-14
- [ ] **R38 · F · P1** As a parent with sensitive access, I am required to use two-step sign-in. Spec: AUTH-13
- [ ] **R39 · F · P1** As a user, I can control privacy settings for sensitive family information. Spec: USR-11
- [ ] **R40 · NF · P1** There is a written policy for lost or compromised devices and for supported app versions. Spec: AUTH-15
- [ ] **R41 · NF · P1** Automated mobile end-to-end tests run in CI. Spec: TEST-7

## Waiting on spaces

These need a space to exist, so they come with the spaces stage.

- As a parent, I can start using Nookbud on my own without inviting anyone. Spec: USR-4
- As a parent in a blended family, I use one account for all my arrangements, with no extra emails. Spec: USR-3, SPC-2
- As someone invited to a space, such as a birth mother invited by adoptive parents, I can create my own account from the invitation and land in that space. Spec: INV-2, INV-7

## Next areas

Not ordered or written as stories yet. Their requirements are in [spec.md](spec.md); we write the stories when we reach them.

- Records and the timeline ([§9](spec.md#9-records-and-the-timeline))
- Audit trail ([§10](spec.md#10-audit-trail))
- Acknowledgments and disputes ([§11](spec.md#11-acknowledgments-and-disputes))
- Calendar ([§12](spec.md#12-calendar))
- Files ([§13](spec.md#13-files))
- Export ([§14](spec.md#14-export))
