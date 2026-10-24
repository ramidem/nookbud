/**
 * The only way the app does auth: `const auth = await getAuth()`.
 * Import from here, never from `@supabase/*`. Lint and a test enforce it.
 */
export { getAuth } from './server';
export type { AuthError, AuthErrorCode, AuthResult, AuthService, AuthUser } from './types';
