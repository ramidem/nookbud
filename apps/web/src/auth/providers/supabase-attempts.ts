import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { getServerEnv } from '../../env/server';
import type { AttemptStore } from '../rate-limit';

/** The attempt counter in `auth_attempts`, which only the service role can reach (R16). */
export function createSupabaseAttemptStore(): AttemptStore {
  const env = getServerEnv();
  const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return {
    async count(kind, subject, sinceSeconds) {
      const since = new Date(Date.now() - sinceSeconds * 1000).toISOString();
      const { count, error } = await db
        .from('auth_attempts')
        .select('id', { count: 'exact', head: true })
        .eq('kind', kind)
        .eq('subject', subject)
        .gte('created_at', since);
      // If the counter cannot be read, Supabase's own per-address limits still apply.
      return error ? 0 : (count ?? 0);
    },

    async add(kind, subjects) {
      await db.from('auth_attempts').insert(subjects.map((subject) => ({ kind, subject })));
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      await db.from('auth_attempts').delete().lt('created_at', dayAgo);
    },
  };
}
