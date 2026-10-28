import 'server-only';
import { headers } from 'next/headers';
import { createSupabaseAttemptStore } from './providers/supabase-attempts';
import { type RateLimiter, createRateLimiter } from './rate-limit';

export type { AttemptKind } from './rate-limit';

export function getRateLimiter(): RateLimiter {
  return createRateLimiter(createSupabaseAttemptStore());
}

/**
 * The address a request came from. Behind Cloud Run the last `X-Forwarded-For` entry is the one
 * Google's front end added; earlier entries can be anything the client sent.
 */
export async function requestAddress(): Promise<string> {
  const forwarded = (await headers()).get('x-forwarded-for');
  return forwarded?.split(',').at(-1)?.trim() || 'unknown';
}
