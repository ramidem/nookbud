import type { AuthError, AuthErrorCode } from './types';

/** What a person is told. Short, in the Nookbud voice, and the same whichever provider is in use. */
const MESSAGES: Record<AuthErrorCode, string> = {
  invalid_credentials: 'Check your email and password, then try again.',
  email_not_verified: 'Confirm your email address first. We can send the link again.',
  weak_password: 'That password is too weak. Choose a longer one.',
  rate_limited: 'Too many attempts. Wait a few minutes, then try again.',
  session_missing: 'Sign in to continue.',
  unknown: 'Something went wrong. Try again.',
};

export function authError(code: AuthErrorCode): AuthError {
  return { code, message: MESSAGES[code] };
}
