import 'server-only';
import { createSupabaseServerClient } from '../auth/providers/supabase-server';
import { createSupabaseProfiles, createSupabaseSessions } from './providers/supabase';
import { createSupabaseRecords, createSupabaseSchedules } from './providers/records';
import { createSupabaseSpaces } from './providers/spaces';
import type { RecordStore, ScheduleStore } from './records-types';
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

/** Records and their history (R54–R56). */
export async function getRecords(): Promise<RecordStore> {
  return createSupabaseRecords(await createSupabaseServerClient());
}

/** The parenting schedule and change requests (R57, R58). */
export async function getSchedules(): Promise<ScheduleStore> {
  return createSupabaseSchedules(await createSupabaseServerClient());
}

export type {
  ChangeRequest,
  Entry,
  EntryContent,
  EntryType,
  EntryVersion,
  RecordStore,
  Schedule,
  ScheduleStore,
  ScheduleVersion,
} from './records-types';
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
