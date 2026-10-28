import { describe, expect, it } from 'vitest';
import {
  type AttemptKind,
  type AttemptStore,
  LIMITS,
  createRateLimiter,
} from '../src/auth/rate-limit';

/** An in-memory stand-in for `auth_attempts`, with a clock the test controls. */
function memoryStore() {
  let now = 0;
  const rows: { kind: AttemptKind; subject: string; at: number }[] = [];
  const store: AttemptStore = {
    count: async (kind, subject, since) =>
      rows.filter((r) => r.kind === kind && r.subject === subject && r.at > now - since * 1000)
        .length,
    add: async (kind, subjects) => {
      for (const subject of subjects) rows.push({ kind, subject, at: now });
    },
  };
  return { store, rows, advance: (seconds: number) => (now += seconds * 1000) };
}

// The attack: one address guessing one account's password, again and again (R16).
describe('guessing a password', () => {
  it('is stopped after 10 wrong passwords for one account, from any address', async () => {
    const { store } = memoryStore();
    const limiter = createRateLimiter(store);
    const victim = 'priya@example.test';
    let tries = 0;
    for (let i = 0; i < 100; i++) {
      const who = { email: victim, address: `203.0.113.${i}` };
      if (!(await limiter.allowed('sign_in', who))) break;
      tries++;
      await limiter.record('sign_in', who); // every guess is wrong
    }
    expect(tries).toBe(LIMITS.sign_in.account?.max);
  });

  it('is stopped after 50 wrong passwords from one address, across accounts', async () => {
    const { store } = memoryStore();
    const limiter = createRateLimiter(store);
    let tries = 0;
    for (let i = 0; i < 500; i++) {
      const who = { email: `person${i}@example.test`, address: '198.51.100.7' };
      if (!(await limiter.allowed('sign_in', who))) break;
      tries++;
      await limiter.record('sign_in', who);
    }
    expect(tries).toBe(LIMITS.sign_in.address.max);
  });

  it('lets the person in again once the window has passed', async () => {
    const { store, advance } = memoryStore();
    const limiter = createRateLimiter(store);
    const who = { email: 'priya@example.test', address: '203.0.113.1' };
    for (let i = 0; i < 10; i++) await limiter.record('sign_in', who);
    expect(await limiter.allowed('sign_in', who)).toBe(false);
    advance(15 * 60 + 1);
    expect(await limiter.allowed('sign_in', who)).toBe(true);
  });

  it('treats the email the same whatever its case or spaces', async () => {
    const { store } = memoryStore();
    const limiter = createRateLimiter(store);
    for (let i = 0; i < 10; i++)
      await limiter.record('sign_in', { email: ' Priya@Example.test', address: `a${i}` });
    expect(await limiter.allowed('sign_in', { email: 'priya@example.test', address: 'b' })).toBe(
      false,
    );
  });

  it('stores only hashes, never the email or the address', async () => {
    const { store, rows } = memoryStore();
    await createRateLimiter(store).record('sign_in', {
      email: 'priya@example.test',
      address: '203.0.113.1',
    });
    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expect(row.subject).toMatch(/^[0-9a-f]{64}$/);
      expect(row.subject).not.toContain('priya');
    }
  });
});

describe('emails people can trigger', () => {
  it.each(['reset', 'resend'] as const)(
    'limits %s requests for one account to 5 an hour',
    async (kind) => {
      const { store } = memoryStore();
      const limiter = createRateLimiter(store);
      let sent = 0;
      for (let i = 0; i < 20; i++) {
        const who = { email: 'priya@example.test', address: `203.0.113.${i}` };
        if (!(await limiter.allowed(kind, who))) break;
        await limiter.record(kind, who);
        sent++;
      }
      expect(sent).toBe(5);
    },
  );

  it('limits sign-ups from one address to 10 an hour', async () => {
    const { store } = memoryStore();
    const limiter = createRateLimiter(store);
    let made = 0;
    for (let i = 0; i < 50; i++) {
      const who = { address: '198.51.100.7' };
      if (!(await limiter.allowed('sign_up', who))) break;
      await limiter.record('sign_up', who);
      made++;
    }
    expect(made).toBe(10);
  });
});
