# Auth

All auth goes through one server-only module, `apps/web/src/auth`. The provider is Supabase Auth (spec D3), but only `src/auth/providers/` knows that.

```ts
import { getAuth } from '@/auth';

const auth = await getAuth();
const result = await auth.signIn({ email, password });
if (!result.ok) return result.error.message; // safe to show
```

`AuthService` has `signUp`, `signIn`, `signOut({ everywhere })`, `getUser`, `requestPasswordReset` and `updatePassword`. Each returns `{ ok: true, data }` or `{ ok: false, error: { code, message } }`.

## Rules

- **Import auth only from `@/auth`.** Nothing outside `src/auth/providers/` may import `@supabase/*`. An ESLint rule and a test enforce it; the test also catches a lint-disable comment and dynamic imports.
- **Server only.** A client component that imports `getAuth` fails the build, so tokens stay in cookies and out of browser JavaScript.
- **No method reveals whether an email has an account.** A wrong password and an unknown email give the same error, signing up an existing email looks like a new sign-up, and a reset request always looks the same.
- **Errors are neutral.** They carry a code and a message in the Nookbud voice, never the provider's wording.
- **To change provider,** write an adapter in `src/auth/providers/` that implements `AuthService` and switch it in `server.ts`. When the app needs database access, add a module like this one and allow it in the lint rule and the test.

## Not done yet

- No screens use it yet (R7 onward).
- Keeping a session alive in the proxy (R12) and hardening the cookies (R15).
- The adapter is tested against a stand-in client. Check the no-enumeration behavior against the real local stack when sign-up is built (it needs email confirmation turned on in `config.toml`, R9).
