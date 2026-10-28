# Auth

All auth goes through one server-only module, `apps/web/src/auth`. The provider is Supabase Auth (spec D3), but only `src/auth/providers/` knows that.

```ts
import { getAuth, requireUser } from '@/auth';

const user = await requireUser('/settings'); // signed in and verified, or redirected to sign in
const auth = await getAuth();
const result = await auth.signIn({ email, password });
if (!result.ok) return result.error.message; // safe to show
```

`AuthService` has `signUp`, `resendConfirmation`, `verifyEmailLink`, `signIn`, `signOut({ everywhere, others })`, `getUser`, `requestPasswordReset` and `updatePassword`. Each returns `{ ok: true, data }` or `{ ok: false, error: { code, message } }`.

## The screens

| Path | What it does | Code |
| --- | --- | --- |
| `/sign-up` | Email, password, "I am 18 or older", "I accept the terms and privacy policy". Sends the device's time zone too | `app/(account)/sign-up`, `auth-actions/sign-up.ts` |
| `/check-email` | "Check your email", with a resend button | `app/(account)/check-email` |
| `/auth/confirm` | Every email link lands here. Verifies the link on the server and signs the person in | `app/auth/confirm/route.ts` |
| `/welcome` | Onboarding: name and "Who shares responsibility for a child with you?". Every step can be skipped | `app/(app)/welcome` |
| `/sign-in` | Sign in. An unconfirmed email gets a resend button. `?next=` returns the person where they were | `app/(account)/sign-in` |
| `/forgot-password`, `/reset-password/new` | Ask for a reset link, then choose a new password | `app/(account)/…` |
| `/home` | The signed-in home. Sends people who have not onboarded to `/welcome` | `app/(app)/home` |

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

## Consent at sign-up (R8)

The form sends both confirmations and `POLICY_VERSION` (`src/legal/policies.ts`) as user metadata. The adapter refuses to sign up without them, and the database trigger refuses again, so an account never exists without consent. The `users` row stores the version and the time ([database.md](database.md)). When the terms or the privacy policy change in a way people must accept again, bump `POLICY_VERSION` and the version line on both pages; a test checks they match.

## Rules

- **Import auth only from `@/auth`, and data only from `@/data`.** Nothing outside `src/auth/providers/` and `src/data/providers/` may import `@supabase/*`. An ESLint rule and a test enforce it; the test also catches a lint-disable comment and dynamic imports.
- **Server only.** A client component that imports `getAuth` fails the build, so tokens stay in cookies and out of browser JavaScript.
- **No method reveals whether an email has an account.** A wrong password and an unknown email give the same error, signing up an existing email looks like a new sign-up, and resend and reset requests always look the same. Only a rate limit is ever named.
- **Errors are neutral.** They carry a code and a message in the Nookbud voice, never the provider's wording.
- **To change provider,** write an adapter in `src/auth/providers/` that implements `AuthService` and switch it in `server.ts`.

## Not done yet

- Cookie hardening and the security headers (R15, R17), and per-account rate limits (R16).
- The settings screens: profile, password, two-step sign-in, devices (stages 4 and 5).
- Mobile (R32, R33).
