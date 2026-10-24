import { Buffer } from 'node:buffer';
import { describe, expect, it } from 'vitest';
import {
  CANARY_BASE_NAMES,
  CANARY_PREFIXES,
  canaryEnvironment,
  findSecrets,
  redact,
} from '../scripts/secret-patterns.mjs';

// Fake credentials are assembled at run time so this file never contains a key-shaped string.
const base64url = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const jwt = (role) =>
  `${base64url({ alg: 'HS256', typ: 'JWT' })}.${base64url({ role, iss: 'supabase' })}.${'s'.repeat(20)}`;
const rules = (text, canaries) => findSecrets(text, canaries).map((finding) => finding.rule);

describe('findSecrets', () => {
  it('flags a Supabase service-role key', () => {
    expect(rules(`const key = "${jwt('service_role')}"`)).toEqual(['supabase-service-role-jwt']);
  });

  it('allows a Supabase anon key, which is public by design', () => {
    expect(rules(`const key = "${jwt('anon')}"`)).toEqual([]);
  });

  it('flags the newer Supabase secret key format', () => {
    expect(rules(`key=${'sb_secret_'}${'x'.repeat(24)}`)).toEqual(['supabase-secret-key']);
  });

  it('flags a database URL that carries a password', () => {
    expect(
      rules(`url = "${'postgresql://'}app:hunter2hunter2@db.example.com:5432/postgres"`),
    ).toEqual(['database-url-with-password']);
  });

  it('allows the local development database and placeholder passwords', () => {
    expect(rules('postgresql://postgres:postgres@127.0.0.1:54322/postgres')).toEqual([]);
    expect(rules('postgresql://postgres:[YOUR-PASSWORD]@db.example.com:5432/postgres')).toEqual([]);
    expect(rules('postgresql://db.example.com:5432/postgres')).toEqual([]);
  });

  it('flags a Google OAuth client secret', () => {
    expect(rules(`secret: ${'GOCSPX-'}${'a'.repeat(28)}`)).toEqual(['google-oauth-client-secret']);
  });

  it('flags private keys and cloud tokens', () => {
    expect(rules(`${'-----BEGIN '}RSA PRIVATE KEY-----`)).toEqual(['private-key']);
    expect(rules(`${'AKIA'}${'A'.repeat(16)}`)).toEqual(['aws-access-key-id']);
    expect(rules(`${'ghp_'}${'a'.repeat(36)}`)).toEqual(['github-token']);
  });

  it('ignores ordinary text', () => {
    expect(
      rules(
        'Spaces are private. Only invited members can see a space. https://nookbud.com/documentation',
      ),
    ).toEqual([]);
  });

  it('never returns the secret itself', () => {
    const secret = `${'sb_secret_'}${'x'.repeat(24)}`;
    const [finding] = findSecrets(secret);
    expect(finding.excerpt).not.toContain(secret);
    expect(redact(secret)).toMatch(/…\(\d+ chars\)$/);
  });
});

describe('canaries', () => {
  it('covers every secret name with and without the public prefix', () => {
    const names = Object.keys(canaryEnvironment());
    for (const prefix of CANARY_PREFIXES)
      for (const base of CANARY_BASE_NAMES) expect(names).toContain(`${prefix}${base}`);
    expect(names).toContain('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY');
  });

  it('gives every name a different value', () => {
    const values = Object.values(canaryEnvironment());
    expect(new Set(values).size).toBe(values.length);
  });

  it('finds a decoy that reached the output, and says which variable it was', () => {
    const canaries = canaryEnvironment();
    const leaked = `<script>window.k="${canaries.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY}"</script>`;
    expect(rules(leaked, canaries)).toEqual(['canary:NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY']);
  });

  it('finds nothing when no decoy reached the output', () => {
    expect(rules('<html>hello</html>', canaryEnvironment())).toEqual([]);
  });
});
