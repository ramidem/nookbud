import type { AuthError as SupabaseAuthError, SupabaseClient, User } from '@supabase/supabase-js';
import { authError } from '../errors';
import type { AuthErrorCode, AuthResult, AuthService, AuthUser } from '../types';

/** The part of the Supabase client this adapter uses, so tests can stand in for it. */
export type SupabaseAuthClient = {
  auth: Pick<
    SupabaseClient['auth'],
    | 'signUp'
    | 'signInWithPassword'
    | 'signOut'
    | 'getUser'
    | 'resetPasswordForEmail'
    | 'updateUser'
    | 'resend'
    | 'verifyOtp'
  >;
};

function toCode(error: SupabaseAuthError): AuthErrorCode {
  const code = error.code ?? '';
  if (code === 'invalid_credentials' || code === 'user_not_found') return 'invalid_credentials';
  if (code === 'email_not_confirmed') return 'email_not_verified';
  if (code === 'weak_password') return 'weak_password';
  if (code === 'otp_expired' || code === 'flow_state_expired' || code === 'bad_code_verifier') {
    return 'link_invalid';
  }
  // The users trigger refuses an account without consent with P0001 (see docs/database.md).
  if (code === 'P0001') return 'consent_required';
  if (error.status === 429 || code.startsWith('over_')) return 'rate_limited';
  if (
    code === 'session_not_found' ||
    code === 'session_expired' ||
    error.name === 'AuthSessionMissingError'
  ) {
    return 'session_missing';
  }
  return 'unknown';
}

function toUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? null,
    emailVerified: Boolean(user.email_confirmed_at),
  };
}

const ok = <T = void>(data?: T): AuthResult<T> => ({ ok: true, data: data as T });
const fail = (error: SupabaseAuthError): AuthResult<never> => ({
  ok: false,
  error: authError(toCode(error)),
});

export function createSupabaseAuth(client: SupabaseAuthClient): AuthService {
  return {
    async signUp({ email, password, redirectTo, consent, timeZone }) {
      // Checked here as well as in the database, so a missing box never reaches the provider.
      if (!consent.adultConfirmed || !consent.termsAccepted || !consent.termsVersion) {
        return { ok: false, error: authError('consent_required') };
      }
      const { error } = await client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            adult_confirmed: true,
            terms_accepted: true,
            terms_version: consent.termsVersion,
            ...(timeZone ? { time_zone: timeZone } : {}),
          },
        },
      });
      // An existing account must look like a new one, so it never reveals who has signed up.
      if (error && error.code !== 'user_already_exists') return fail(error);
      return ok();
    },

    async resendConfirmation({ email, redirectTo }) {
      const { error } = await client.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: redirectTo },
      });
      // Only a rate limit is worth saying: anything else would hint at whether the email exists.
      if (error && toCode(error) === 'rate_limited') return fail(error);
      return ok();
    },

    async verifyEmailLink({ tokenHash, type }) {
      const { error } = await client.auth.verifyOtp({ token_hash: tokenHash, type });
      if (error) {
        const code = toCode(error);
        return { ok: false, error: authError(code === 'rate_limited' ? code : 'link_invalid') };
      }
      return ok();
    },

    async signIn({ email, password }) {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) return fail(error);
      return ok(toUser(data.user));
    },

    async signOut(options) {
      const { error } = await client.auth.signOut({
        scope: options?.everywhere ? 'global' : options?.others ? 'others' : 'local',
      });
      // Already signed out is the outcome the caller wanted.
      if (error && toCode(error) !== 'session_missing') return fail(error);
      return ok();
    },

    async getUser() {
      const { data, error } = await client.auth.getUser();
      return error || !data.user ? null : toUser(data.user);
    },

    async requestPasswordReset({ email, redirectTo }) {
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
      return error ? fail(error) : ok();
    },

    async updatePassword(newPassword) {
      const { error } = await client.auth.updateUser({ password: newPassword });
      return error ? fail(error) : ok();
    },
  };
}
