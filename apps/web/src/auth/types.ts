/**
 * What the app may know about auth. Nothing here names a provider, so the provider can change
 * without touching the rest of the app. Only `providers/` knows which one is in use.
 */

export type AuthUser = {
  id: string;
  email: string | null;
  emailVerified: boolean;
};

export type AuthErrorCode =
  | 'invalid_credentials' // wrong password, or no such account: the same answer for both
  | 'email_not_verified'
  | 'weak_password'
  | 'rate_limited'
  | 'session_missing' // acting without being signed in
  | 'unknown';

export type AuthError = {
  code: AuthErrorCode;
  /** Safe to show to a person. It never repeats what the provider said. */
  message: string;
};

export type AuthResult<T = void> = { ok: true; data: T } | { ok: false; error: AuthError };

/**
 * Everything auth the app can do. It runs on the server, so tokens stay in cookies and never reach
 * browser JavaScript.
 *
 * No method may reveal whether an email already has an account: signing up an existing email looks
 * like a new sign-up, and asking for a reset link always looks the same.
 */
export interface AuthService {
  signUp(input: { email: string; password: string; redirectTo: string }): Promise<AuthResult>;
  signIn(input: { email: string; password: string }): Promise<AuthResult<AuthUser>>;
  /** Ends this session, or every session on every device with `everywhere`. Signing out twice is fine. */
  signOut(options?: { everywhere?: boolean }): Promise<AuthResult>;
  /** The signed-in user, checked with the provider, or null. */
  getUser(): Promise<AuthUser | null>;
  requestPasswordReset(input: { email: string; redirectTo: string }): Promise<AuthResult>;
  /** Sets a new password for the signed-in user, including someone who arrived from a reset link. */
  updatePassword(newPassword: string): Promise<AuthResult>;
}
