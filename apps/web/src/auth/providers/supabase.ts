import type { AuthError as SupabaseAuthError, SupabaseClient, User } from '@supabase/supabase-js';
import { authError } from '../errors';
import { hashRecoveryCode, newRecoveryCodes } from '../recovery-codes';
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
    | 'refreshSession'
  > & {
    mfa: Pick<
      SupabaseClient['auth']['mfa'],
      | 'listFactors'
      | 'enroll'
      | 'challengeAndVerify'
      | 'unenroll'
      | 'getAuthenticatorAssuranceLevel'
    >;
  };
};

/**
 * What the adapter needs beyond the person's own client: a way to check a password without
 * touching their session, and a privileged store for recovery codes. Only the server has these.
 */
export type SupabaseAuthDeps = {
  checkPassword(email: string, password: string): Promise<boolean>;
  recoveryCodes: {
    replace(userId: string, hashes: string[]): Promise<boolean>;
    /** Marks the code used and returns true, or false when no unused code matches. */
    consume(userId: string, hash: string): Promise<boolean>;
    /** Removes every two-step factor, so the person is back to password-only sign-in. */
    removeFactors(userId: string): Promise<boolean>;
  };
  record(event: AuditEvent): Promise<void>;
};

export type AuditEvent =
  | 'password_changed'
  | 'password_reset'
  | 'signed_out_everywhere'
  | 'two_step_enabled'
  | 'two_step_disabled'
  | 'recovery_code_used';

function toCode(error: SupabaseAuthError): AuthErrorCode {
  const code = error.code ?? '';
  if (code === 'invalid_credentials' || code === 'user_not_found') return 'invalid_credentials';
  if (code === 'email_not_confirmed') return 'email_not_verified';
  if (code === 'weak_password') return 'weak_password';
  if (
    code === 'mfa_verification_failed' ||
    code === 'mfa_challenge_expired' ||
    code === 'mfa_factor_not_found'
  ) {
    return 'code_invalid';
  }
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

const noDeps: SupabaseAuthDeps = {
  checkPassword: async () => false,
  recoveryCodes: {
    replace: async () => false,
    consume: async () => false,
    removeFactors: async () => false,
  },
  record: async () => undefined,
};

export function createSupabaseAuth(
  client: SupabaseAuthClient,
  deps: SupabaseAuthDeps = noDeps,
): AuthService {
  const currentUser = async () => {
    const { data, error } = await client.auth.getUser();
    return error ? null : data.user;
  };
  const verifiedTotp = async () => {
    const { data } = await client.auth.mfa.listFactors();
    return data?.totp.find((f) => f.status === 'verified') ?? null;
  };

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
      // Recorded first: once every session has ended, there is nobody to record it as.
      if (options?.everywhere) await deps.record('signed_out_everywhere');
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

    async updatePassword(newPassword, reason = 'changed') {
      const { error } = await client.auth.updateUser({ password: newPassword });
      if (error) return fail(error);
      await deps.record(reason === 'reset' ? 'password_reset' : 'password_changed');
      return ok();
    },

    async checkPassword(password) {
      const user = await currentUser();
      if (!user?.email) return { ok: false, error: authError('session_missing') };
      return (await deps.checkPassword(user.email, password))
        ? ok()
        : { ok: false, error: authError('wrong_password') };
    },

    async twoStepStatus() {
      const factor = await verifiedTotp();
      const { data } = await client.auth.mfa.getAuthenticatorAssuranceLevel();
      return {
        enabled: Boolean(factor),
        codeNeeded: data?.nextLevel === 'aal2' && data.currentLevel !== 'aal2',
        factorId: factor?.id ?? null,
      };
    },

    async startTwoStep() {
      // An abandoned setup leaves an unverified factor behind; clear it so setup can start again.
      const { data: factors } = await client.auth.mfa.listFactors();
      for (const f of factors?.all ?? []) {
        if (f.status !== 'verified') await client.auth.mfa.unenroll({ factorId: f.id });
      }
      const { data, error } = await client.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator app',
      });
      if (error || !data) return error ? fail(error) : { ok: false, error: authError('unknown') };
      return ok({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret });
    },

    async confirmTwoStep({ factorId, code }) {
      const user = await currentUser();
      if (!user) return { ok: false, error: authError('session_missing') };
      const { error } = await client.auth.mfa.challengeAndVerify({ factorId, code });
      if (error)
        return {
          ok: false,
          error: authError(toCode(error) === 'rate_limited' ? 'rate_limited' : 'code_invalid'),
        };
      const codes = newRecoveryCodes();
      await deps.recoveryCodes.replace(user.id, codes.map(hashRecoveryCode));
      await deps.record('two_step_enabled');
      return ok(codes);
    },

    async verifyTwoStepCode(code) {
      const factor = await verifiedTotp();
      if (!factor) return { ok: false, error: authError('code_invalid') };
      const { error } = await client.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
      if (error)
        return {
          ok: false,
          error: authError(toCode(error) === 'rate_limited' ? 'rate_limited' : 'code_invalid'),
        };
      return ok();
    },

    async useRecoveryCode(code) {
      const user = await currentUser();
      if (!user) return { ok: false, error: authError('session_missing') };
      if (!(await deps.recoveryCodes.consume(user.id, hashRecoveryCode(code)))) {
        return { ok: false, error: authError('code_invalid') };
      }
      await deps.recoveryCodes.removeFactors(user.id);
      await deps.record('recovery_code_used');
      // The old token still says a code is owed; a fresh one does not, now the factor is gone.
      await client.auth.refreshSession();
      return ok();
    },

    async turnOffTwoStep() {
      const user = await currentUser();
      const factor = await verifiedTotp();
      if (!user || !factor) return ok();
      const { error } = await client.auth.mfa.unenroll({ factorId: factor.id });
      if (error) return fail(error);
      await deps.recoveryCodes.replace(user.id, []);
      await deps.record('two_step_disabled');
      return ok();
    },
  };
}
