/** Where the auth screens live, and which pages need a signed-in, verified person. */
export const SIGN_IN = '/sign-in';
export const SIGN_UP = '/sign-up';
export const CHECK_EMAIL = '/check-email';
export const FORGOT_PASSWORD = '/forgot-password';
export const NEW_PASSWORD = '/reset-password/new';
export const CONFIRM = '/auth/confirm';
export const HOME = '/home';
export const WELCOME = '/welcome';
export const SETTINGS = '/settings';

/** Pages behind sign-in. Everything else (the landing page, the documentation, auth) is public. */
export const PROTECTED_PREFIXES = [HOME, WELCOME, SETTINGS, NEW_PASSWORD];

/** Pages a signed-in person has no reason to see, so they go home instead. */
export const SIGNED_OUT_ONLY = [SIGN_IN, SIGN_UP, FORGOT_PASSWORD, CHECK_EMAIL];

export const isProtected = (path: string) =>
  PROTECTED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

/**
 * A `next` value is only ever a path on this site. Anything else (another host, `//evil.test`,
 * a backslash trick) falls back to home, so a link cannot send someone elsewhere after sign-in.
 */
export function safeNext(next: string | null | undefined, fallback = HOME): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('\\'))
    return fallback;
  return next;
}
