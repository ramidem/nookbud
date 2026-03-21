import { createMMKV } from 'react-native-mmkv';

import CONFIG from '@/config';

const SYNC_STORAGE_ID = 'sync-meta';
const LAST_SYNCED_AT_KEY = 'last_synced_at';

const syncStorage = createMMKV({
  encryptionKey: CONFIG.STORAGE_KEY,
  id: SYNC_STORAGE_ID,
});

type EntityType =
  | 'acknowledgments'
  | 'attachments'
  | 'audit_logs'
  | 'children'
  | 'disputes'
  | 'entries'
  | 'entry_versions'
  | 'relationships'
  | 'users';

function entitySyncKey(entity: EntityType): string {
  return `${LAST_SYNCED_AT_KEY}:${entity}`;
}

export const SyncService = {
  getEntityLastSyncedAt(entity: EntityType): Date | null {
    const raw = syncStorage.getString(entitySyncKey(entity));

    return raw ? new Date(raw) : null;
  },

  getLastSyncedAt(): Date | null {
    const raw = syncStorage.getString(LAST_SYNCED_AT_KEY);

    return raw ? new Date(raw) : null;
  },

  async pullEntries(_since: Date): Promise<void> {
    // Stub — real sync implementation in a later story.
    // Will pull entries from Supabase where updated_at > since.
  },

  async pushEntry(_entryId: string): Promise<void> {
    // Stub — real sync implementation in a later story.
    // Will push a single entry (with versions, attachments, acknowledgments) to Supabase.
  },

  setEntityLastSyncedAt(entity: EntityType, date: Date): void {
    syncStorage.set(entitySyncKey(entity), date.toISOString());
  },

  setLastSyncedAt(date: Date): void {
    syncStorage.set(LAST_SYNCED_AT_KEY, date.toISOString());
  },
};
