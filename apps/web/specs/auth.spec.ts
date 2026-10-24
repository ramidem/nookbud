import fs from 'node:fs';
import path from 'node:path';
import { createSupabaseAuth, type SupabaseAuthClient } from '../src/auth/providers/supabase';

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
  it('keeps every @supabase import inside src/auth/providers', () => {
    const allowed = path.join(webRoot, 'src', 'auth', 'providers') + path.sep;
    const anyImport = /(from\s+|import\s*\(\s*|require\s*\(\s*|import\s+)['"]@supabase\//;
    const offenders = [
      ...filesUnder(path.join(webRoot, 'src')),
      ...filesUnder(path.join(webRoot, 'scripts')),
    ]
      .filter((file) => !file.startsWith(allowed))
      .filter((file) => anyImport.test(fs.readFileSync(file, 'utf8')))
      .map((file) => path.relative(webRoot, file));
    expect(offenders).toEqual([]);
  });
});

// ---- the Supabase adapter, driven by a stand-in client -------------------------------------------

type Overrides = Partial<Record<keyof SupabaseAuthClient['auth'], ReturnType<typeof vi.fn>>>;

function clientWith(overrides: Overrides = {}) {
  const auth = {
    signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: { user: user() }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ data: {}, error: null }),
    updateUser: vi.fn().mockResolvedValue({ data: { user: user() }, error: null }),
    ...overrides,
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
    });
    expect(result).toEqual({ ok: true, data: undefined });
    expect(auth.signUp).toHaveBeenCalledWith({
      email: 'a@example.test',
      password: 'a-long-enough-password',
      options: { emailRedirectTo: 'https://nookbud.test/confirm' },
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
    });
    expect(result).toMatchObject({ ok: false, error: { code: 'weak_password' } });
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
