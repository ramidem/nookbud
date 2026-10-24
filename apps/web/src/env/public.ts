import { z } from 'zod';
import { parseEnv } from './parse';

/**
 * Values that are safe to ship to the browser. Only names that start with NEXT_PUBLIC_ belong here:
 * Next.js copies those into the client bundle. Anything secret goes in `server.ts` instead.
 */
export const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

let cached: PublicEnv | undefined;

/** Read lazily, so a build that never needs these values does not fail on their absence. */
export function getPublicEnv(): PublicEnv {
  // Next.js only inlines `process.env.NEXT_PUBLIC_*` when it is written out in full, so list each name.
  cached ??= parseEnv(publicEnvSchema, {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  return cached;
}

export function resetPublicEnvForTests() {
  cached = undefined;
}
