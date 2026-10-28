import type { SupabaseClient } from '@supabase/supabase-js';
import type { DataResult, Profile, ProfileChanges, ProfileStore, SharesWith } from '../types';

type Row = {
  id: string;
  display_name: string | null;
  time_zone: string | null;
  currency: string | null;
  terms_version: string;
  terms_accepted_at: string;
  onboarded_at: string | null;
  shares_with: SharesWith | null;
};

const toProfile = (row: Row): Profile => ({
  id: row.id,
  displayName: row.display_name,
  timeZone: row.time_zone,
  currency: row.currency,
  termsVersion: row.terms_version,
  termsAcceptedAt: row.terms_accepted_at,
  onboardedAt: row.onboarded_at,
  sharesWith: row.shares_with,
});

const COLUMNS =
  'id, display_name, time_zone, currency, terms_version, terms_accepted_at, onboarded_at, shares_with';

const failed: DataResult<never> = { ok: false, message: 'Your changes were not saved. Try again.' };

/** Profiles through the person's own session, so Row-Level Security applies to every query. */
export function createSupabaseProfiles(
  client: Pick<SupabaseClient, 'from' | 'auth'>,
): ProfileStore {
  return {
    async get() {
      const { data: auth } = await client.auth.getUser();
      if (!auth.user) return null;
      const { data, error } = await client
        .from('users')
        .select(COLUMNS)
        .eq('id', auth.user.id)
        .maybeSingle<Row>();
      return error || !data ? null : toProfile(data);
    },

    async update(changes: ProfileChanges) {
      const { data: auth } = await client.auth.getUser();
      if (!auth.user) return failed;
      const row: Partial<Row> = {};
      if (changes.displayName !== undefined) row.display_name = changes.displayName;
      if (changes.timeZone !== undefined) row.time_zone = changes.timeZone;
      if (changes.currency !== undefined) row.currency = changes.currency;
      if (changes.sharesWith !== undefined) row.shares_with = changes.sharesWith;
      if (changes.onboarded) row.onboarded_at = new Date().toISOString();
      const { error } = await client.from('users').update(row).eq('id', auth.user.id);
      return error ? failed : { ok: true, data: undefined };
    },
  };
}
