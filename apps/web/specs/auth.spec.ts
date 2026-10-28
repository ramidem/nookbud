import fs from 'node:fs';
import path from 'node:path';
import {
  createSupabaseAuth,
  type SupabaseAuthClient,
  type SupabaseAuthDeps,
} from '../src/auth/providers/supabase';
import { hashRecoveryCode } from '../src/auth/recovery-codes';

const webRoot = path.join(__dirname, '..');

function filesUnder(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory())
      return entry.name === 'node_modules' || entry.name === '.next' ? [] : filesUnder(full);
    return /\.(ts|tsx|js|jsx|mjs)$/.test(entry.name) ? [full] : [];
  });
}

describe('the auth module is the only way in', () => {
  // The lint rule says the same, but a lint comment can switch it off. This cannot be switched off.
  it('keeps every @supabase import inside the providers folders', () => {
    const allowed = [
      path.join(webRoot, 'src', 'auth', 'providers') + path.sep,
      path.join(webRoot, 'src', 'data', 'providers') + path.sep,
    ];
    const anyImport = /(from\s+|import\s*\(\s*|require\s*\(\s*|import\s+)['"]@supabase\//;
    const offenders = [
      ...filesUnder(path.join(webRoot, 'src')),
      ...filesUnder(path.join(webRoot, 'scripts')),
    ]
      .filter((file) => !allowed.some((dir) => file.startsWith(dir)))
      .filter((file) => anyImport.test(fs.readFileSync(file, 'utf8')))
      .map((file) => path.relative(webRoot, file));
    expect(offenders).toEqual([]);
  });
});

// ---- the Supabase adapter, driven by a stand-in client -------------------------------------------

type Overrides = Partial<
  Record<Exclude<keyof SupabaseAuthClient['auth'], 'mfa'>, ReturnType<typeof vi.fn>>
> & {
  mfa?: Partial<Record<keyof SupabaseAuthClient['auth']['mfa'], ReturnType<typeof vi.fn>>>;
};

function clientWith(overrides: Overrides = {}) {
  const auth = {
    signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: { user: user() }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ data: {}, error: null }),
    resend: vi.fn().mockResolvedValue({ data: {}, error: null }),
    verifyOtp: vi.fn().mockResolvedValue({ data: {}, error: null }),
    updateUser: vi.fn().mockResolvedValue({ data: { user: user() }, error: null }),
    refreshSession: vi.fn().mockResolvedValue({ data: {}, error: null }),
    ...overrides,
    mfa: {
      listFactors: vi.fn().mockResolvedValue({ data: { all: [], totp: [] }, error: null }),
      enroll: vi.fn().mockResolvedValue({
        data: {
          id: 'factor-1',
          totp: { qr_code: 'data:image/svg+xml;utf-8,<svg/>', secret: 'SECRET', uri: 'otpauth://' },
        },
        error: null,
      }),
      challengeAndVerify: vi.fn().mockResolvedValue({ data: {}, error: null }),
      unenroll: vi.fn().mockResolvedValue({ data: {}, error: null }),
      getAuthenticatorAssuranceLevel: vi
        .fn()
        .mockResolvedValue({ data: { currentLevel: 'aal1', nextLevel: 'aal1' }, error: null }),
      ...(overrides as { mfa?: object }).mfa,
    },
  };
  return { client: { auth } as unknown as SupabaseAuthClient, auth };
}

// Stand-ins for what Supabase returns. They are plain objects so this file never imports @supabase.
const user = (over: Record<string, unknown> = {}) => ({
  id: 'user-1',
  email: 'a@example.test',
  email_confirmed_at: '2026-10-24T00:00:00Z',
  ...over,
});

const consent = { adultConfirmed: true, termsAccepted: true, termsVersion: '2026-10-28' };

const providerError = (
  code: string,
  status = 400,
  message = 'provider detail that must not be shown',
) => ({
  code,
  status,
  message,
  name: 'AuthApiError',
});

describe('Supabase auth adapter', () => {
  it('signs up with the email, password and the page the confirmation link returns to', async () => {
    const { client, auth } = clientWith();
    const result = await createSupabaseAuth(client).signUp({
      email: 'a@example.test',
      password: 'a-long-enough-password',
      redirectTo: 'https://nookbud.test/confirm',
      consent,
      timeZone: 'Asia/Manila',
    });
    expect(result).toEqual({ ok: true, data: undefined });
    expect(auth.signUp).toHaveBeenCalledWith({
      email: 'a@example.test',
      password: 'a-long-enough-password',
      options: {
        emailRedirectTo: 'https://nookbud.test/confirm',
        data: {
          adult_confirmed: true,
          terms_accepted: true,
          terms_version: '2026-10-28',
          time_zone: 'Asia/Manila',
        },
      },
    });
  });

  it('makes signing up an existing email look like any other sign-up', async () => {
    const { client } = clientWith({
      signUp: vi.fn().mockResolvedValue({ data: {}, error: providerError('user_already_exists') }),
    });
    const result = await createSupabaseAuth(client).signUp({
      email: 'a@example.test',
      password: 'x',
      redirectTo: '/',
      consent,
    });
    expect(result.ok).toBe(true);
  });

  it('still reports a weak password', async () => {
    const { client } = clientWith({
      signUp: vi.fn().mockResolvedValue({ data: {}, error: providerError('weak_password') }),
    });
    const result = await createSupabaseAuth(client).signUp({
      email: 'a@example.test',
      password: 'x',
      redirectTo: '/',
      consent,
    });
    expect(result).toMatchObject({ ok: false, error: { code: 'weak_password' } });
  });

  it.each([
    [{ ...consent, adultConfirmed: false }],
    [{ ...consent, termsAccepted: false }],
    [{ ...consent, termsVersion: '' }],
  ])('refuses to sign up without both confirmations (%o)', async (given) => {
    const { client, auth } = clientWith();
    const result = await createSupabaseAuth(client).signUp({
      email: 'a@example.test',
      password: 'a-long-enough-password',
      redirectTo: '/',
      consent: given,
    });
    expect(result).toMatchObject({ ok: false, error: { code: 'consent_required' } });
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it('reports the database refusing an account without consent', async () => {
    const { client } = clientWith({
      signUp: vi.fn().mockResolvedValue({ data: {}, error: providerError('P0001', 500) }),
    });
    const result = await createSupabaseAuth(client).signUp({
      email: 'a@example.test',
      password: 'a-long-enough-password',
      redirectTo: '/',
      consent,
    });
    expect(result).toMatchObject({ ok: false, error: { code: 'consent_required' } });
  });

  it('resends the confirmation email, looking the same whatever happened', async () => {
    const { client, auth } = clientWith({
      resend: vi.fn().mockResolvedValue({ data: {}, error: providerError('user_not_found') }),
    });
    const result = await createSupabaseAuth(client).resendConfirmation({
      email: 'a@example.test',
      redirectTo: 'https://nookbud.test/confirm',
    });
    expect(result.ok).toBe(true);
    expect(auth.resend).toHaveBeenCalledWith({
      type: 'signup',
      email: 'a@example.test',
      options: { emailRedirectTo: 'https://nookbud.test/confirm' },
    });
  });

  it('says when resending is rate limited', async () => {
    const { client } = clientWith({
      resend: vi
        .fn()
        .mockResolvedValue({ data: {}, error: providerError('over_email_send_rate_limit', 429) }),
    });
    const result = await createSupabaseAuth(client).resendConfirmation({
      email: 'a@example.test',
      redirectTo: '/',
    });
    expect(result).toMatchObject({ ok: false, error: { code: 'rate_limited' } });
  });

  it('verifies an email link once', async () => {
    const { client, auth } = clientWith();
    const result = await createSupabaseAuth(client).verifyEmailLink({
      tokenHash: 'hash',
      type: 'email',
    });
    expect(result.ok).toBe(true);
    expect(auth.verifyOtp).toHaveBeenCalledWith({ token_hash: 'hash', type: 'email' });
  });

  it('calls a used or expired link invalid, without the provider wording', async () => {
    const { client } = clientWith({
      verifyOtp: vi.fn().mockResolvedValue({ data: {}, error: providerError('otp_expired', 403) }),
    });
    const result = await createSupabaseAuth(client).verifyEmailLink({
      tokenHash: 'old',
      type: 'recovery',
    });
    expect(result).toEqual({
      ok: false,
      error: { code: 'link_invalid', message: expect.not.stringContaining('provider') },
    });
  });

  it('returns the signed-in user', async () => {
    const { client } = clientWith();
    const result = await createSupabaseAuth(client).signIn({
      email: 'a@example.test',
      password: 'x',
    });
    expect(result).toEqual({
      ok: true,
      data: { id: 'user-1', email: 'a@example.test', emailVerified: true },
    });
  });

  it('says an unverified email is not verified', async () => {
    const { client } = clientWith({
      signInWithPassword: vi
        .fn()
        .mockResolvedValue({ data: {}, error: providerError('email_not_confirmed') }),
    });
    const result = await createSupabaseAuth(client).signIn({
      email: 'a@example.test',
      password: 'x',
    });
    expect(result).toMatchObject({ ok: false, error: { code: 'email_not_verified' } });
  });

  it('gives the same answer for a wrong password and an unknown email', async () => {
    const outcome = async (code: string) => {
      const { client } = clientWith({
        signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: providerError(code) }),
      });
      return createSupabaseAuth(client).signIn({ email: 'a@example.test', password: 'x' });
    };
    const wrongPassword = await outcome('invalid_credentials');
    const noSuchAccount = await outcome('user_not_found');
    expect(noSuchAccount).toEqual(wrongPassword);
    expect(wrongPassword).toMatchObject({ ok: false, error: { code: 'invalid_credentials' } });
  });

  it.each([
    ['a 429 response', providerError('anything', 429)],
    ['an over_request_rate_limit code', providerError('over_request_rate_limit')],
    ['an over_email_send_rate_limit code', providerError('over_email_send_rate_limit')],
  ])('recognises %s as rate limiting', async (_name, error) => {
    const { client } = clientWith({
      signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error }),
    });
    const result = await createSupabaseAuth(client).signIn({
      email: 'a@example.test',
      password: 'x',
    });
    expect(result).toMatchObject({ ok: false, error: { code: 'rate_limited' } });
  });

  it('never shows what the provider said', async () => {
    const { client } = clientWith({
      signInWithPassword: vi.fn().mockResolvedValue({
        data: {},
        error: providerError('something_new', 500, 'secret provider detail'),
      }),
    });
    const result = await createSupabaseAuth(client).signIn({
      email: 'a@example.test',
      password: 'x',
    });
    expect(result).toMatchObject({ ok: false, error: { code: 'unknown' } });
    expect(JSON.stringify(result)).not.toContain('secret provider detail');
  });

  it('signs out this session by default and every session on request', async () => {
    const { client, auth } = clientWith();
    const service = createSupabaseAuth(client);
    await service.signOut();
    await service.signOut({ everywhere: true });
    expect(auth.signOut.mock.calls).toEqual([[{ scope: 'local' }], [{ scope: 'global' }]]);
  });

  it('treats signing out when already signed out as success', async () => {
    const { client } = clientWith({
      signOut: vi.fn().mockResolvedValue({ error: providerError('session_not_found') }),
    });
    expect((await createSupabaseAuth(client).signOut()).ok).toBe(true);
  });

  it('knows who is signed in, and when nobody is', async () => {
    const signedIn = clientWith({
      getUser: vi.fn().mockResolvedValue({
        data: { user: user({ email_confirmed_at: undefined }) },
        error: null,
      }),
    });
    expect(await createSupabaseAuth(signedIn.client).getUser()).toEqual({
      id: 'user-1',
      email: 'a@example.test',
      emailVerified: false,
    });

    const nobody = clientWith({
      getUser: vi
        .fn()
        .mockResolvedValue({ data: { user: null }, error: providerError('session_not_found') }),
    });
    expect(await createSupabaseAuth(nobody.client).getUser()).toBeNull();
  });

  it('asks for a reset link with the page it should return to', async () => {
    const { client, auth } = clientWith();
    const result = await createSupabaseAuth(client).requestPasswordReset({
      email: 'a@example.test',
      redirectTo: 'https://nookbud.test/reset',
    });
    expect(result.ok).toBe(true);
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith('a@example.test', {
      redirectTo: 'https://nookbud.test/reset',
    });
  });

  it('needs a signed-in user to change a password', async () => {
    const { client } = clientWith({
      updateUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: { name: 'AuthSessionMissingError', status: 400, message: 'x' },
      }),
    });
    const result = await createSupabaseAuth(client).updatePassword('a-new-long-password');
    expect(result).toMatchObject({ ok: false, error: { code: 'session_missing' } });
  });
});

describe('session cookies and requests (R15, R17)', () => {
  it('keeps the session cookies out of reach of browser JavaScript', async () => {
    const { sessionCookieOptions } = await import('../src/auth/providers/cookies');
    expect(sessionCookieOptions).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/' });
  });

  // Server actions get Next.js's own origin check, which refuses a POST from another site. Route
  // handlers do not, so any handler that changes state must be added here with its own check.
  it('has route handlers that only read', () => {
    const routes = filesUnder(path.join(webRoot, 'src', 'app')).filter((f) =>
      /route\.(ts|js)$/.test(f),
    );
    const writers = routes.filter((file) =>
      /export\s+(async\s+)?function\s+(POST|PUT|PATCH|DELETE)\b/.test(
        fs.readFileSync(file, 'utf8'),
      ),
    );
    expect(writers.map((f) => path.relative(webRoot, f))).toEqual([]);
  });
});

// ---- two-step sign-in, password checks and the audit trail (R20–R23) ---------------------------

function depsWith(over: Partial<SupabaseAuthDeps> = {}) {
  const deps = {
    checkPassword: vi.fn().mockResolvedValue(true),
    recoveryCodes: {
      replace: vi.fn().mockResolvedValue(true),
      consume: vi.fn().mockResolvedValue(true),
      removeFactors: vi.fn().mockResolvedValue(true),
    },
    record: vi.fn().mockResolvedValue(undefined),
    ...over,
  };
  return deps;
}

const signedIn = { getUser: vi.fn().mockResolvedValue({ data: { user: user() }, error: null }) };
const verifiedFactor = { id: 'factor-1', status: 'verified', factor_type: 'totp' };

describe('two-step sign-in', () => {
  it('says a code is owed after the password when two-step sign-in is on', async () => {
    const { client } = clientWith({
      mfa: {
        listFactors: vi
          .fn()
          .mockResolvedValue({
            data: { all: [verifiedFactor], totp: [verifiedFactor] },
            error: null,
          }),
        getAuthenticatorAssuranceLevel: vi
          .fn()
          .mockResolvedValue({ data: { currentLevel: 'aal1', nextLevel: 'aal2' }, error: null }),
      },
    });
    expect(await createSupabaseAuth(client).twoStepStatus()).toEqual({
      enabled: true,
      codeNeeded: true,
      factorId: 'factor-1',
    });
  });

  it('starts setup with a QR code, clearing an abandoned attempt first', async () => {
    const abandoned = { id: 'old', status: 'unverified', factor_type: 'totp' };
    const { client, auth } = clientWith({
      mfa: {
        listFactors: vi
          .fn()
          .mockResolvedValue({ data: { all: [abandoned], totp: [] }, error: null }),
      },
    });
    const result = await createSupabaseAuth(client).startTwoStep();
    expect(auth.mfa.unenroll).toHaveBeenCalledWith({ factorId: 'old' });
    expect(result).toEqual({
      ok: true,
      data: { factorId: 'factor-1', qrCode: 'data:image/svg+xml;utf-8,<svg/>', secret: 'SECRET' },
    });
  });

  it('confirms setup, stores only hashes of ten recovery codes and records the event', async () => {
    const { client } = clientWith(signedIn);
    const deps = depsWith();
    const result = await createSupabaseAuth(client, deps).confirmTwoStep({
      factorId: 'factor-1',
      code: '123456',
    });
    expect(result.ok).toBe(true);
    const codes = (result as { data: string[] }).data;
    expect(codes).toHaveLength(10);
    for (const code of codes) expect(code).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    const [userId, hashes] = deps.recoveryCodes.replace.mock.calls[0];
    expect(userId).toBe('user-1');
    expect(hashes).toEqual(codes.map(hashRecoveryCode));
    expect(hashes.join()).not.toContain(codes[0]);
    expect(deps.record).toHaveBeenCalledWith('two_step_enabled');
  });

  it('refuses a wrong code without the provider wording', async () => {
    const { client } = clientWith({
      ...signedIn,
      mfa: {
        challengeAndVerify: vi
          .fn()
          .mockResolvedValue({ data: null, error: providerError('mfa_verification_failed') }),
      },
    });
    const deps = depsWith();
    const result = await createSupabaseAuth(client, deps).confirmTwoStep({
      factorId: 'factor-1',
      code: '000000',
    });
    expect(result).toMatchObject({ ok: false, error: { code: 'code_invalid' } });
    expect(deps.recoveryCodes.replace).not.toHaveBeenCalled();
  });

  it('lets a recovery code in once, turning two-step sign-in off', async () => {
    const { client, auth } = clientWith(signedIn);
    const deps = depsWith();
    const result = await createSupabaseAuth(client, deps).useRecoveryCode('k4m9 x7qp');
    expect(result.ok).toBe(true);
    expect(deps.recoveryCodes.consume).toHaveBeenCalledWith(
      'user-1',
      hashRecoveryCode('K4M9-X7QP'),
    );
    expect(deps.recoveryCodes.removeFactors).toHaveBeenCalledWith('user-1');
    expect(deps.record).toHaveBeenCalledWith('recovery_code_used');
    expect(auth.refreshSession).toHaveBeenCalled();
  });

  it('refuses a recovery code that does not match or was used', async () => {
    const { client } = clientWith(signedIn);
    const deps = depsWith({
      recoveryCodes: {
        replace: vi.fn(),
        consume: vi.fn().mockResolvedValue(false),
        removeFactors: vi.fn(),
      },
    });
    const result = await createSupabaseAuth(client, deps).useRecoveryCode('AAAA-BBBB');
    expect(result).toMatchObject({ ok: false, error: { code: 'code_invalid' } });
    expect(deps.recoveryCodes.removeFactors).not.toHaveBeenCalled();
  });
});

describe('passwords and the audit trail', () => {
  it('checks the current password against the signed-in email', async () => {
    const { client } = clientWith(signedIn);
    const deps = depsWith({ checkPassword: vi.fn().mockResolvedValue(false) });
    const result = await createSupabaseAuth(client, deps).checkPassword('guess');
    expect(deps.checkPassword).toHaveBeenCalledWith('a@example.test', 'guess');
    expect(result).toMatchObject({ ok: false, error: { code: 'wrong_password' } });
  });

  it.each([
    ['changed', 'password_changed'],
    ['reset', 'password_reset'],
  ] as const)('records a %s password', async (reason, event) => {
    const { client } = clientWith();
    const deps = depsWith();
    await createSupabaseAuth(client, deps).updatePassword('a-long-enough-password', reason);
    expect(deps.record).toHaveBeenCalledWith(event);
  });

  it('records signing out everywhere before the sessions end', async () => {
    const order: string[] = [];
    const { client } = clientWith({
      signOut: vi.fn().mockImplementation(async () => {
        order.push('signOut');
        return { error: null };
      }),
    });
    const deps = depsWith({
      record: vi.fn().mockImplementation(async () => void order.push('record')),
    });
    await createSupabaseAuth(client, deps).signOut({ everywhere: true });
    expect(order).toEqual(['record', 'signOut']);
  });
});
