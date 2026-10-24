import 'server-only';
import { z } from 'zod';
import { parseEnv } from './parse';
import { getPublicEnv, type PublicEnv } from './public';

/**
 * Secrets. This file is marked `server-only`: importing it from a client component fails the build,
 * which is what keeps these values out of the browser. Never give a name here a NEXT_PUBLIC_ prefix.
 */
export const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
});

export type ServerEnv = z.infer<typeof serverEnvSchema> & PublicEnv;

let cached: ServerEnv | undefined;

/** Everything server code may read: the secrets and the public values. Read lazily. */
export function getServerEnv(): ServerEnv {
  cached ??= {
    ...getPublicEnv(),
    ...parseEnv(serverEnvSchema, {
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    }),
  };
  return cached;
}

export function resetServerEnvForTests() {
  cached = undefined;
}
