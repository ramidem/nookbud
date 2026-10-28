import { createHash } from 'node:crypto';

/** What is being limited (R16). */
export type AttemptKind = 'sign_in' | 'sign_up' | 'reset' | 'resend' | 'code';

type Limit = { max: number; windowSeconds: number };

/**
 * How many attempts each kind allows before refusing, per account and per address. Sign-in and
 * codes count failures; the rest count every request, because each one sends an email.
 */
export const LIMITS: Record<AttemptKind, { account?: Limit; address: Limit }> = {
  sign_in: {
    account: { max: 10, windowSeconds: 15 * 60 },
    address: { max: 50, windowSeconds: 15 * 60 },
  },
  code: {
    account: { max: 10, windowSeconds: 15 * 60 },
    address: { max: 50, windowSeconds: 15 * 60 },
  },
  reset: {
    account: { max: 5, windowSeconds: 60 * 60 },
    address: { max: 20, windowSeconds: 60 * 60 },
  },
  resend: {
    account: { max: 5, windowSeconds: 60 * 60 },
    address: { max: 20, windowSeconds: 60 * 60 },
  },
  sign_up: { address: { max: 10, windowSeconds: 60 * 60 } },
};

/** Where attempts are counted. Subjects are hashes, never an email or an address. */
export interface AttemptStore {
  count(kind: AttemptKind, subject: string, sinceSeconds: number): Promise<number>;
  add(kind: AttemptKind, subjects: string[]): Promise<void>;
}

export type Who = { email?: string; address: string };

const hash = (value: string) => createHash('sha256').update(value).digest('hex');

function subjects({ email, address }: Who) {
  return {
    account: email ? hash(`account:${email.trim().toLowerCase()}`) : null,
    address: hash(`address:${address}`),
  };
}

export type RateLimiter = {
  /** False once either the account or the address has used up its attempts. */
  allowed(kind: AttemptKind, who: Who): Promise<boolean>;
  record(kind: AttemptKind, who: Who): Promise<void>;
};

export function createRateLimiter(store: AttemptStore): RateLimiter {
  return {
    async allowed(kind, who) {
      const limit = LIMITS[kind];
      const s = subjects(who);
      const checks: Promise<boolean>[] = [
        store
          .count(kind, s.address, limit.address.windowSeconds)
          .then((n) => n < limit.address.max),
      ];
      if (limit.account && s.account) {
        const account = limit.account;
        checks.push(
          store.count(kind, s.account, account.windowSeconds).then((n) => n < account.max),
        );
      }
      return (await Promise.all(checks)).every(Boolean);
    },

    async record(kind, who) {
      const s = subjects(who);
      await store.add(kind, [s.address, ...(LIMITS[kind].account && s.account ? [s.account] : [])]);
    },
  };
}
