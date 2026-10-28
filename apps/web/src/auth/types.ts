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
  | 'consent_required' // sign-up without the age confirmation or the accepted terms
  | 'link_invalid' // an email link that was used already, has expired or was changed
  | 'unknown';

export type AuthError = {
  code: AuthErrorCode;
  /** Safe to show to a person. It never repeats what the provider said. */
  message: string;
};

/** What a person agreed to at sign-up. Both must be true for an account to be created. */
export type SignUpConsent = {
  adultConfirmed: boolean;
  termsAccepted: boolean;
  termsVersion: string;
};

/** The kinds of link Nookbud emails: confirm a new account, reset a password, confirm a new email. */
export type EmailLinkType = 'email' | 'recovery' | 'email_change';

export type AuthResult<T = void> = { ok: true; data: T } | { ok: false; error: AuthError };

/**
 * Everything auth the app can do. It runs on the server, so tokens stay in cookies and never reach
 * browser JavaScript.
 *
 * No method may reveal whether an email already has an account: signing up an existing email looks
 * like a new sign-up, and asking for a reset link always looks the same.
 */
export interface AuthService {
  signUp(input: {
    email: string;
    password: string;
    redirectTo: string;
    consent: SignUpConsent;
    /** The person's IANA time zone, from their device. Optional. */
    timeZone?: string;
  }): Promise<AuthResult>;
  /** Sends the confirmation email again. Always looks the same, whether or not the email has an account. */
  resendConfirmation(input: { email: string; redirectTo: string }): Promise<AuthResult>;
  /** Checks a link from one of our emails and, if it is good, signs the person in. A link works once. */
  verifyEmailLink(input: { tokenHash: string; type: EmailLinkType }): Promise<AuthResult>;
  signIn(input: { email: string; password: string }): Promise<AuthResult<AuthUser>>;
  /**
   * Ends this session, every session on every device with `everywhere`, or every session except
   * this one with `others`. Signing out twice is fine.
   */
  signOut(options?: { everywhere?: boolean; others?: boolean }): Promise<AuthResult>;
  /** The signed-in user, checked with the provider, or null. */
  getUser(): Promise<AuthUser | null>;
  requestPasswordReset(input: { email: string; redirectTo: string }): Promise<AuthResult>;
  /** Sets a new password for the signed-in user, including someone who arrived from a reset link. */
  updatePassword(newPassword: string): Promise<AuthResult>;
}
