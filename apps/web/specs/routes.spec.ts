import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { HOME, isProtected, safeNext } from '../src/auth/routes';

describe('where people go after signing in', () => {
  it.each(['/settings', '/home?tab=1', '/settings/security'])(
    'keeps a path on this site (%s)',
    (next) => {
      expect(safeNext(next)).toBe(next);
    },
  );

  it.each([
    'https://evil.test',
    '//evil.test',
    '/\\evil.test',
    'javascript:alert(1)',
    '',
    null,
    undefined,
  ])('sends anything else home (%s)', (next) => {
    expect(safeNext(next)).toBe(HOME);
  });
});

describe('pages behind sign-in', () => {
  it.each(['/home', '/welcome', '/settings', '/settings/security', '/reset-password/new'])(
    '%s needs a session',
    (p) => {
      expect(isProtected(p)).toBe(true);
    },
  );

  it.each(['/', '/sign-in', '/sign-up', '/documentation', '/terms', '/homeless'])(
    '%s is public',
    (p) => {
      expect(isProtected(p)).toBe(false);
    },
  );
});

// The local auth settings are the decisions in docs/auth.md. Production must match them.
describe('auth settings', () => {
  const config = fs.readFileSync(
    path.join(__dirname, '..', '..', '..', 'supabase', 'config.toml'),
    'utf8',
  );
  const setting = (name: string) => config.match(new RegExp(`^${name} = (.+)$`, 'm'))?.[1];

  it('asks for passwords of at least 12 characters, with no composition rules (R7)', () => {
    expect(setting('minimum_password_length')).toBe('12');
    expect(setting('password_requirements')).toBe('""');
  });

  it('requires a confirmed email before sign-in (R9)', () => {
    expect(setting('enable_confirmations')).toBe('true');
  });

  it('issues one-hour access tokens, rotates refresh tokens and ends idle sessions after 30 days (R12)', () => {
    expect(setting('jwt_expiry')).toBe('3600');
    expect(setting('enable_refresh_token_rotation')).toBe('true');
    expect(setting('inactivity_timeout')).toBe('"720h"');
  });

  it('expires email links after an hour and spaces resends a minute apart (R9, R14)', () => {
    expect(setting('otp_expiry')).toBe('3600');
    expect(setting('max_frequency')).toBe('"60s"');
  });
});
