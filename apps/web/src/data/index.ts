import 'server-only';
import { createSupabaseServerClient } from '../auth/providers/supabase-server';
import { createSupabaseProfiles } from './providers/supabase';
import type { ProfileStore } from './types';

/**
 * The app's data, read and written as the signed-in person. Import from `@/data`, never from
 * `@supabase/*`. Like `@/auth`, it runs on the server only.
 */
export async function getProfiles(): Promise<ProfileStore> {
  return createSupabaseProfiles(await createSupabaseServerClient());
}

export { SHARES_WITH } from './types';
export type { DataResult, Profile, ProfileChanges, ProfileStore, SharesWith } from './types';
