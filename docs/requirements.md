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

- [ ] **R5 · NF · P0** The first deploys are finished off. Both parts wait: the first secret and the first email (R6) are what need them.
  - Secrets live in Secret Manager under their own names and reach the service as server-only variables ([secrets.md](secrets.md)). Do this when the first secret exists.
  - Set the production project's Site URL to the real domain: the email links are built from it ([auth.md](auth.md#email-links)).
  - Both tag deploys work today ([deploy.md](deploy.md)).
  - Spec: D4, D5, roadmap A3 (environment separation), AUTH-1, AUTH-3

- [ ] **R50 · NF · P0** Each service runs as its own account, and builds run as the Cloud Build account.
  - Both `cloudbuild.yaml` files pass `--service-account` (`web-runtime`, `api-runtime`) to the deploy step, through a substitution.
  - Both triggers use the `cloud-build` service account, and the narrow permissions in [gcp-setup.md](gcp-setup.md) are enough for a build to pass.
  - Do this before real data sits behind the services.
  - Spec: D4

- [ ] **R45 · NF · P0** A visitor does not wait on a cold start.
  - Both services scale to zero, so both have cold starts. Before launch that is accepted.
  - At launch, keep the web app warm (the command is in [deploy.md](deploy.md)), about $10–14 a month ([costs.md](costs.md)).
  - Cheaper option to try first: a scheduled request (Cloud Scheduler, every 5 minutes to the home page) keeps an idle instance alive at almost no cost. Google does not guarantee it, and it keeps one instance, so a burst of traffic still waits. Measure before relying on it.
  - Once mobile exists (R32), the API probably needs a warm instance too, because a stalled screen is more noticeable than a slow page. Decide from measured numbers.
  - The first-response check only warns above 3 seconds. Make it fail once a real deploy shows the number is reliable.
  - The images are about 420 MB (web) and 375 MB (api). If the measured cold start misses the target, slim the base image first.
  - Spec: D4

- [ ] **R46 · NF · P1** Static pages and assets are served from a CDN, not from the container.
  - Start with Cloudflare in front of the domain (free), and add Cloud CDN later only if wanted. Cloud CDN needs a global load balancer with its own monthly charge (about $18 or more, unverified: [costs.md](costs.md)).
  - Cache `/_next/static/*`, images and prerendered pages (the home page, the documentation), with the right `Cache-Control` headers from the web app.
  - Never cache signed-in pages, the auth routes or the API, so private data is never shown to the wrong person.
  - A CDN does not help a page that cannot be cached; that is what the warm instance (R45) is for.
  - Check that a custom domain can point at Cloud Run in `asia-southeast1` before relying on it.
  - Spec: D4
  - Blocked by: setting up the domain (you own it; DNS is not pointed yet).

- [ ] **R42 · NF · P0** A production Supabase project exists, and migrations reach it.
  - A separate Supabase project for production, linked with `supabase link`. It shares no keys, users or data with local.
  - There is no staging project for now. How migrations reach production is decided when the first table exists: by hand with `supabase db push`, or as a Cloud Build step.
  - Supabase stays on the Free plan until launch. At launch, production moves to Pro for daily backups and no pausing ([costs.md](costs.md)).
  - Update [the database page](database.md) when it is done.
  - Spec: DB-5, roadmap A3 (environment separation)
  - Blocked by: creating the Supabase project (an account action).

- [ ] **R6 · NF · P0** Verification and reset emails arrive.
  - They send from a Nookbud address with SPF and DKIM set up.
  - The copy says Nookbud and follows the brand voice. The templates are written (`supabase/templates/`); what is left is sending them from a real address.
  - A test send reaches a real inbox and it is not marked as spam.
  - Start from the old email templates (`nookbud_copy/apps/backend/src/app/email/email.templates.ts`, Resend), rebranded from CoParent to Nookbud.
  - Spec: AUTH-1, AUTH-3, AUTH-16
  - Blocked by: owning `nookbud.com`.

---

## Stage 3. Sign-in hardening

Sign-up, email verification, sign-in, sign-out, password reset and sessions are built ([auth.md](auth.md)). What is left here hardens them.

- [ ] **R15 · NF · P0** Sign-in tokens are stored safely on mobile.
  - Tokens live in `expo-secure-store`. The web half is done ([auth.md](auth.md#cookies-csrf-and-headers)).
  - Spec: AUTH-9, AUTH-10

- [ ] **R18 · NF · P0** Auth and account screens pass a manual screen-reader check.
  - One manual pass with VoiceOver and one with TalkBack (or NVDA on the web) over sign-up, sign-in, the code step, reset and settings.
  - The automated part is done: axe runs on every account form and the text colors are checked for 4.5:1 ([auth.md](auth.md#accessibility-and-voice)).
  - Spec: UX-1

---

## Stage 7. Prove it works

- [ ] **R29 · NF · P0** Error reports hold no secrets.
  - Error monitoring is set up so it cannot capture passwords, tokens, message content or child data.
  - Logging is covered: the web app and the API cannot `console.log` (lint), and nothing logs a request body ([auth.md](auth.md#rules)).
  - Spec: SEC-8

- [ ] **R31 · NF · P0** The privacy policy and terms pass legal review.
  - Minimal drafts are published at `/terms` and `/privacy` (`apps/web/documentation/legal/`), linked from sign-up, settings and every footer, with the version people accept in `src/legal/policies.ts`.
  - What is left: the review under the Data Privacy Act (PRIV-7), the retention rules (OQ6), and removing "draft" once they are final.
  - Spec: PRIV-4, PRIV-7
  - Blocked by: legal review.

- [ ] **R49 · NF · P0** The API accepts requests from the mobile app.
  - Mobile cannot present Google credentials, so the `api` service is made public (remove `--no-allow-unauthenticated` in [gcp-setup.md](gcp-setup.md) and the Cloud Run service).
  - Every request is rejected unless it carries a valid Supabase access token, checked in NestJS.
  - Update [deploy.md](deploy.md) where it says the API is private.
  - Spec: AUTH-8, SEC-5
  - Blocked by: R32 starting, or the first API route that needs a signed-in user.

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
- [ ] **R48 · NF · P2** Google Cloud is managed with Terraform. Parked: the commands in [gcp-setup.md](gcp-setup.md) cover the MVP. Revisit when the setup has to be repeated (a staging environment, a second region) or changes often. Spec: D4

## Spaces

Spaces, members, children and invitations are built ([spaces.md](spaces.md)). Left:

- [ ] **R51 · F · P0** As an owner, I invite someone by email, and the invitation arrives in their inbox.
  - Today the owner copies a link and sends it themselves. Send it from the Nookbud address too, with the link and the space's name only.
  - Spec: MEM-1, INV-1
  - Blocked by: R6.

- [ ] **R53 · NF · P0** The child-access policy is decided (OQ5), and the `children` policies follow it.
  - Today every member reads and owners write. Do not assume a parent has unrestricted access.
  - Spec: AZ-7

## Records and the calendar

Records (spec §9–10) and the calendar (§12, roadmap B2). A calendar event is one kind of record, so it gets the same history. Acknowledgments and disputes (§11) are P2 and wait.

- [ ] **R54 · F · P0** As a member, I add a record to a space and see every record in one timeline.
  - Types: note, agreement, expense (amount and currency) and event. Each can name a child.
  - Who added it and when come from the server, never from the browser (REC-1, REC-4).
  - The timeline lists a space's records newest first, and can be filtered by type (REC-5).
  - Spec: REC-1, REC-2, REC-4, REC-5

- [ ] **R55 · F · P0** As a member, I can correct a record I added, and everyone can see what changed.
  - An edit never overwrites: it adds a version with who, when and an optional reason. The record shows "Edited" and its history lists every version with what changed (AUD-1).
  - Removing a record is a soft delete: it leaves the timeline but stays in the history, marked removed (AUD-2).
  - Only the person who added a record can change or remove it. Owners cannot rewrite other people's records.
  - Spec: REC-3, AUD-1, AUD-2

- [ ] **R56 · F · P0** As a member, I see the space's events on a shared calendar, in my own time zone.
  - Events have a title, a start and end (or all day), an optional place, and the member responsible (CAL-1).
  - After an event, its outcome can be set: done or missed, with a note (CAL-1).
  - A month view shows events per day; times show in each viewer's time zone.
  - Changes are versions, so the history shows who changed the schedule and when (CAL-2).
  - Spec: CAL-1, CAL-2, USR-5

- [ ] **R57 · F · P0** As an owner, I set up the parenting schedule: one repeating pattern of which home a child is in.
  - A pattern is a list of days, each assigned to a member, repeating from a start date (for example a week each, or 2-2-3).
  - The calendar shows whose day it is.
  - Changing the pattern is recorded in the space's history.
  - Spec: roadmap B2 (parenting schedule)

- [ ] **R58 · F · P0** As a member, I can ask to change the schedule for some days, and another member approves or declines.
  - A request names the days, who would have them, and a reason. Anyone in the space except the person asking can respond.
  - An approved request changes those days on the calendar. A declined or withdrawn one changes nothing.
  - Every request and response stays in the record, with who and when.
  - Spec: roadmap B2 (schedule change requests), CAL-2

## Next areas

Not ordered or written as stories yet. Their requirements are in [spec.md](spec.md); we write the stories when we reach them.

- Acknowledgments and disputes ([§11](spec.md#11-acknowledgments-and-disputes))
- Files ([§13](spec.md#13-files))
- Export ([§14](spec.md#14-export))
