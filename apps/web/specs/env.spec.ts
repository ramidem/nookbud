import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { publicEnvSchema, getPublicEnv, resetPublicEnvForTests } from '../src/env/public';
import { getServerEnv, resetServerEnvForTests, serverEnvSchema } from '../src/env/server';

const webRoot = path.join(__dirname, '..');
const repoRoot = path.join(webRoot, '..', '..');

function filesUnder(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory())
      return entry.name === 'node_modules' || entry.name === '.next' ? [] : filesUnder(full);
    return /\.(ts|tsx|mjs|js|json|toml|example)$/.test(entry.name) ? [full] : [];
  });
}

describe('environment variables', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    resetPublicEnvForTests();
    resetServerEnvForTests();
  });

  it('only lets NEXT_PUBLIC_ names into the public schema', () => {
    for (const name of Object.keys(publicEnvSchema.shape)) expect(name).toMatch(/^NEXT_PUBLIC_/);
  });

  it('never gives a secret a NEXT_PUBLIC_ name', () => {
    for (const name of Object.keys(serverEnvSchema.shape))
      expect(name).not.toMatch(/^NEXT_PUBLIC_/);
  });

  it('reads the public values', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:54321');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key-that-is-long-enough');
    expect(getPublicEnv().NEXT_PUBLIC_SUPABASE_URL).toBe('http://127.0.0.1:54321');
  });

  it('reads the secrets together with the public values', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:54321');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key-that-is-long-enough');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key-that-is-long-enough');
    expect(getServerEnv().SUPABASE_SERVICE_ROLE_KEY).toBe('service-role-key-that-is-long-enough');
  });

  it('says which variable is missing', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:54321');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key-that-is-long-enough');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', undefined);
    expect(() => getServerEnv()).toThrow(/SUPABASE_SERVICE_ROLE_KEY is missing/);
  });

  it('never repeats a bad value in its error', () => {
    const leaked = 'tiny-secret-9f3a';
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:54321');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key-that-is-long-enough');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', leaked);

    let message = '';
    try {
      getServerEnv();
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message).toMatch(/SUPABASE_SERVICE_ROLE_KEY is invalid/);
    expect(message).not.toContain(leaked);
  });
});

describe('keeping secrets out of git', () => {
  it.each([
    '.env',
    '.env.local',
    '.env.production',
    '.env.staging',
    'apps/web/.env.development',
    'apps/api/.env',
    'apps/api/.env.production',
    'supabase/.env',
  ])('ignores %s', (file) => {
    expect(() =>
      execFileSync('git', ['check-ignore', '-q', file], { cwd: repoRoot }),
    ).not.toThrow();
  });

  it('does not ignore the example file', () => {
    expect(() =>
      execFileSync('git', ['check-ignore', '-q', 'apps/web/.env.example'], { cwd: repoRoot }),
    ).toThrow();
  });

  it('keeps values out of example files', () => {
    const lines = fs.readFileSync(path.join(webRoot, '.env.example'), 'utf8').split('\n');
    const assigned = lines.filter((line) => /^[A-Z0-9_]+=/.test(line));
    expect(assigned.length).toBeGreaterThan(0);
    for (const line of assigned) expect(line.split('=')[1]).toBe('');
  });

  it('lists every variable the schemas know about in the example file', () => {
    const example = fs.readFileSync(path.join(webRoot, '.env.example'), 'utf8');
    for (const name of [
      ...Object.keys(publicEnvSchema.shape),
      ...Object.keys(serverEnvSchema.shape),
    ]) {
      expect(example).toContain(`${name}=`);
    }
  });

  it('never names a secret with a public prefix', () => {
    const secretLooking = /(NEXT_PUBLIC|EXPO_PUBLIC)_\w*(SERVICE_ROLE|SECRET|PASSWORD|PRIVATE)/;
    const roots = [
      path.join(webRoot, 'src'),
      path.join(webRoot, 'scripts'),
      path.join(repoRoot, 'supabase'),
    ];
    const offenders = [...roots.flatMap(filesUnder), path.join(webRoot, '.env.example')]
      .filter((file) => !file.endsWith('secret-patterns.mjs'))
      .filter((file) => secretLooking.test(fs.readFileSync(file, 'utf8')))
      .map((file) => path.relative(repoRoot, file));
    expect(offenders).toEqual([]);
  });
});
