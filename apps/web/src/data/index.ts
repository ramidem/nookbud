import 'server-only';
import { createSupabaseServerClient } from '../auth/providers/supabase-server';
import { createSupabaseProfiles, createSupabaseSessions } from './providers/supabase';
import type { ProfileStore, SessionStore } from './types';

/**
 * The app's data, read and written as the signed-in person. Import from `@/data`, never from
 * `@supabase/*`. Like `@/auth`, it runs on the server only.
 */
export async function getProfiles(): Promise<ProfileStore> {
  return createSupabaseProfiles(await createSupabaseServerClient());
}

export { SHARES_WITH } from './types';
/** The signed-in person's sessions, for the devices list (R20). */
export async function getSessions(): Promise<SessionStore> {
  return createSupabaseSessions(await createSupabaseServerClient());
}

export type {
  DataResult,
  Profile,
  ProfileChanges,
  ProfileStore,
  Session,
  SessionStore,
  SharesWith,
} from './types';
