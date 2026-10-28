import 'server-only';
import { createSupabaseServerClient } from '../auth/providers/supabase-server';
import { createSupabaseProfiles, createSupabaseSessions } from './providers/supabase';
import { createSupabaseSpaces } from './providers/spaces';
import type { ProfileStore, SessionStore, SpaceStore } from './types';

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

/** Spaces, their people, children and invitations, as the signed-in person (stage 8). */
export async function getSpaces(): Promise<SpaceStore> {
  return createSupabaseSpaces(await createSupabaseServerClient());
}

export type {
  Child,
  Invitation,
  InvitationForMe,
  InvitationPreview,
  Person,
  Role,
  Space,
  SpaceStore,
  DataResult,
  Profile,
  ProfileChanges,
  ProfileStore,
  Session,
  SessionStore,
  SharesWith,
} from './types';
