# Auth

All auth goes through one server-only module, `apps/web/src/auth`. The provider is Supabase Auth (spec D3), but only `src/auth/providers/` knows that.

```ts
import { getAuth, requireUser } from '@/auth';

const user = await requireUser('/settings'); // signed in and verified, or redirected to sign in
const auth = await getAuth();
const result = await auth.signIn({ email, password });
if (!result.ok) return result.error.message; // safe to show
```

`AuthService` has `signUp`, `resendConfirmation`, `verifyEmailLink`, `signIn`, `signOut({ everywhere, others })`, `getUser`, `requestPasswordReset`, `updatePassword`, `checkPassword` and the two-step methods (`twoStepStatus`, `startTwoStep`, `confirmTwoStep`, `verifyTwoStepCode`, `useRecoveryCode`, `turnOffTwoStep`). Each returns `{ ok: true, data }` or `{ ok: false, error: { code, message } }`.

## The screens

| Path | What it does | Code |
| --- | --- | --- |
| `/sign-up` | Email, password, "I am 18 or older", "I accept the terms and privacy policy". Sends the device's time zone too | `app/(account)/sign-up`, `auth-actions/sign-up.ts` |
| `/check-email` | "Check your email", with a resend button | `app/(account)/check-email` |
| `/auth/confirm` | Every email link lands here. Verifies the link on the server and signs the person in | `app/auth/confirm/route.ts` |
| `/welcome` | Onboarding: name and "Who shares responsibility for a child with you?". Every step can be skipped | `app/(app)/welcome` |
| `/sign-in` | Sign in. An unconfirmed email gets a resend button. `?next=` returns the person where they were | `app/(account)/sign-in` |
| `/forgot-password`, `/reset-password/new` | Ask for a reset link, then choose a new password | `app/(account)/…` |
| `/sign-in/code` | The second step when two-step sign-in is on: a code from the app, or a recovery code | `app/(account)/sign-in/code` |
| `/home` | The signed-in glance for one space (whose day, upcoming events, requests, latest records). Sends people who have not onboarded to `/welcome`. With no spaces, a sentence and a link to `/spaces` | `app/(app)/home` |
| `/spaces` | The person's spaces, invitations, and creating a space. Sends people who have not onboarded to `/welcome` | `app/(app)/spaces` |
| `/settings` | Profile (name, time zone, currency, who they care with), the accepted policy version, delete account | `app/(app)/settings` |
| `/settings/security` | Change password, two-step sign-in, where you're signed in, sign out everywhere | `app/(app)/settings/security`, `auth-actions/security.ts` |

Signed-in pages live in the `(app)` route group; its layout calls `requireUser()`. Server actions are in `src/auth-actions/` and validate their input with zod (`validation.ts`).

## Sessions (R12)

- **Access tokens** last one hour (`jwt_expiry = 3600`). **Refresh tokens** rotate on every use.
- **A session ends after 30 days without use** (`[auth.sessions] inactivity_timeout = "720h"`). There is no fixed maximum length. Hosted Supabase needs the Pro plan for this setting; production moves to Pro at launch (R42).
- `src/proxy.ts` (Next.js 16's name for middleware) refreshes the session cookies on every request and sends a signed-out visitor from a protected page to `/sign-in?next=<where they were>`. It is only an optimistic check: every page and action checks again with `requireUser()`.
- The protected paths and the safe `next` rules are in `src/auth/routes.ts`. `safeNext()` only accepts a path on this site.

## Email links

- Email confirmation is on (`enable_confirmations = true`). Until someone confirms, Supabase refuses to sign them in, so they cannot reach any data.
- Links are one-time token hashes, verified on the server by `/auth/confirm`. They expire after an hour (`otp_expiry`), and a resend waits at least 60 seconds (`max_frequency`).
- The templates are in `supabase/templates/` and are named in `config.toml`. They link to `{{ .SiteURL }}`, so the base URL comes from each Supabase project's Site URL: `http://localhost:3000` locally, the real domain in production (R5).
- Locally every email lands in Mailpit at http://127.0.0.1:55624.

## Passwords

- At least 12 characters, no composition rules (`minimum_password_length = 12`). The rule is shown under the field before submitting.
- A new password from a reset link signs the person out on every device; they sign in again with it.
- `secure_password_change = true`: changing a password needs a recent sign-in.

## Account security (stage 4)

- **Two-step sign-in (R21)** uses Supabase's TOTP factors (`[auth.mfa.totp]` is on). Setup shows the provider's QR code and the secret, and only turns on once a code from the app checks out. Signing in with the password then leaves the session at `aal1`: the proxy, `requireUser()` and the sign-in action all send the person to `/sign-in/code` until they give a code (`aal2`).
- **Recovery codes** are ours, because Supabase's are experimental. Ten codes like `K4M9-X7QP` are made when two-step sign-in is turned on and shown once. Only SHA-256 hashes are stored, in `mfa_recovery_codes`, which only the service role can read. Using one marks it used, deletes the person's factors through the admin API and refreshes the session, so they are back to password-only sign-in and can set it up again. `src/auth/providers/supabase-deps.ts` holds the privileged calls.
- **Devices (R20).** `my_sessions()` lists the person's own rows from `auth.sessions`. Calls to Supabase come from the web server, so `supabase-server.ts` forwards the browser's `User-Agent` and `X-Forwarded-For`; the list shows "Chrome on Mac" and not the server.
- **Changing the password (R22)** asks for the current one. `checkPassword` signs in on a throwaway client that never touches the cookies, then the password changes and every other session ends. `secure_password_change` is off because Nookbud asks for the current password itself.
- **The audit log (R23).** `record_audit_event()` writes the signed-in person's id and an action: `password_changed`, `password_reset`, `signed_out_everywhere`, `two_step_enabled`, `two_step_disabled`, `recovery_code_used`. `account_deleted` is allowed for R28. The adapter records these, so no screen can forget.

## Deleting an account (R28)

Settings → Delete account says what happens, then asks for the password and for `DELETE` typed out. `deleteAccount(password)`:

1. checks the password on a throwaway client (`checkPassword`);
2. calls `prepare_account_deletion()` as the person, which writes the `account_deleted` audit entry and returns their id;
3. deletes that identity with the service role (`auth.admin.deleteUser`), only if the id matches the signed-in person. The `users` row and recovery codes cascade, and every session ends with the identity;
4. clears the cookies on this device and lands on `/sign-in?note=deleted`.

What a person shared in a space stays, shown as "Former member" (spec D7): tables for space content must not cascade from `auth.users`. How long anything is kept after that is OQ6, still open. OQ10 suggested Supabase functions for privileged work; the web server already holds the service role for recovery codes, so deletion runs there too, server-side only.

## Consent at sign-up (R8)

The form sends both confirmations and `POLICY_VERSION` (`src/legal/policies.ts`) as user metadata. The adapter refuses to sign up without them, and the database trigger refuses again, so an account never exists without consent. The `users` row stores the version and the time ([database.md](database.md)). When the terms or the privacy policy change in a way people must accept again, bump `POLICY_VERSION` and the version line on both pages; a test checks they match.

## Rate limits (R16)

Supabase limits sign-ins and emails per address on its side (`[auth.rate_limit]`). Nookbud adds its own limits, per account and per address, in `src/auth/rate-limit.ts`:

| Kind | Per account | Per address | Counts |
| --- | --- | --- | --- |
| `sign_in` | 10 in 15 minutes | 50 in 15 minutes | Wrong passwords |
| `code` | 10 in 15 minutes | 50 in 15 minutes | Wrong two-step or recovery codes |
| `reset`, `resend` | 5 an hour | 20 an hour | Every request, since each sends an email |
| `sign_up` | — | 10 an hour | Every request |

- Each server action checks `getRateLimiter().allowed()` before doing anything, and answers "Too many attempts" the same way whether or not the account exists.
- Attempts live in `auth_attempts` as SHA-256 hashes of the email or the address, never the values. Only the service role can read or write it, so nobody can lock out someone else by writing rows. Rows older than a day are pruned.
- The address is the last `X-Forwarded-For` entry (the one Cloud Run's front end adds).
- `specs/rate-limit.spec.ts` runs the attacks against the limiter: one account guessed from many addresses, and many accounts from one address.

## Cookies, CSRF and headers

- **Cookies (R15).** The session cookies are `httpOnly`, `SameSite=Lax`, `path=/`, and `Secure` in production (`src/auth/providers/cookies.ts`). The app never creates a browser Supabase client, so nothing in the browser needs to read them. A test checks the options.
- **CSRF (R17).** Every change goes through a server action. Next.js refuses a server action whose `Origin` does not match the site, and `SameSite=Lax` keeps the cookies off cross-site posts. Route handlers have no such check, so a test fails if one exports `POST`, `PUT`, `PATCH` or `DELETE`; add an origin check before allowing one.
- **CORS.** The app sends no CORS headers, so browsers only allow its own pages to call it.
- **Headers.** `next.config.js` sends a Content Security Policy (scripts, connections and forms only to this site, no framing), `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy` and, in production, HSTS. `X-Powered-By` is off. Inline scripts are still allowed because Next.js needs them; use a nonce before any page renders user-supplied HTML.

## Accessibility and voice

- **R18.** `specs/accessibility.spec.tsx` renders every account form and runs axe (labels, roles, ARIA, names). Contrast needs real layout, so the same file checks the token pairs the screens use for 4.5:1. The app screens are light only (`ui/AppRoot.tsx`), because `subtitle` has no dark value. Every control is at least 44px tall, errors are words with a dot beside them, never color alone, and the only animation is a color change.
- **R19.** Messages are short sentences addressed to "you"; titles say what happened ("Sign-in failed", "Not saved"), never "Error". A test checks the auth messages. Red (`Notice tone="alert"`) is used only when sign-in is paused by the rate limit and when a profile change was not saved.
- Still to do: one manual screen-reader pass per platform (R18).

## Rules

- **Import auth only from `@/auth`, and data only from `@/data`.** Nothing outside `src/auth/providers/` and `src/data/providers/` may import `@supabase/*`. An ESLint rule and a test enforce it; the test also catches a lint-disable comment and dynamic imports.
- **Server only.** A client component that imports `getAuth` fails the build, so tokens stay in cookies and out of browser JavaScript.
- **No method reveals whether an email has an account.** A wrong password and an unknown email give the same error, signing up an existing email looks like a new sign-up, and resend and reset requests always look the same. Only a rate limit is ever named.
- **No logging of secrets (R29).** `no-console` is an error in `apps/web/src` and `apps/api/src`. Add a redacting logger before anything needs to log.
- **Visitors are denied everywhere (R30).** `supabase/tests/database/006_visitors_are_denied_everywhere.sql` walks every table and function in `public`: a signed-out visitor sees no rows, removes none, and can call no function. It covers tables added later without changes. An unverified person never gets a session (`enable_confirmations`), so they are a visitor too. `003_users.sql` checks that changing an id never reads or changes someone else's profile. The API has no data endpoints yet; R49 adds token checks with the first one.
- **Errors are neutral.** They carry a code and a message in the Nookbud voice, never the provider's wording.
- **To change provider,** write an adapter in `src/auth/providers/` that implements `AuthService` and switch it in `server.ts`.

## Not done yet

- Mobile (R32, R33).
