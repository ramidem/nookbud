import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  ChangeRequest,
  Entry,
  EntryContent,
  EntryVersion,
  RecordStore,
  Schedule,
  ScheduleStore,
  ScheduleVersion,
} from '../records-types';
import type { DataResult } from '../types';
import { failure } from './spaces';

type Db = Pick<SupabaseClient, 'from' | 'rpc'>;

type EntryRow = {
  id: string;
  space_id: string;
  type: Entry['type'];
  child_id: string | null;
  created_by: string | null;
  created_at: string;
  version: number;
  removed_at: string | null;
};

const ENTRY_COLUMNS = 'id, space_id, type, child_id, created_by, created_at, version, removed_at';

async function call<T = void>(
  client: Db,
  fn: string,
  args: Record<string, unknown>,
): Promise<DataResult<T>> {
  const { data, error } = await client.rpc(fn, args);
  return error ? failure(error) : { ok: true, data: data as T };
}

/** Each entry with the content of its latest version. */
async function withContent(client: Db, rows: EntryRow[]): Promise<Entry[]> {
  if (rows.length === 0) return [];
  const { data } = await client
    .from('entry_versions')
    .select('entry_id, version, content, change')
    .in(
      'entry_id',
      rows.map((r) => r.id),
    );
  const latest = new Map<string, EntryContent>();
  const versions = (data ?? []) as { entry_id: string; version: number; content: EntryContent }[];
  for (const row of rows) {
    const v = versions.find((x) => x.entry_id === row.id && x.version === row.version);
    if (v) latest.set(row.id, v.content);
  }
  return rows.map((r) => ({
    id: r.id,
    spaceId: r.space_id,
    type: r.type,
    childId: r.child_id,
    createdBy: r.created_by,
    createdAt: r.created_at,
    version: r.version,
    removedAt: r.removed_at,
    content: latest.get(r.id) ?? { title: '' },
  }));
}

export function createSupabaseRecords(client: Db): RecordStore {
  return {
    async list(space, options = {}) {
      let query = client.from('entries').select(ENTRY_COLUMNS).eq('space_id', space);
      // Removed records leave the timeline but stay findable, under "Removed" (AUD-2).
      query = options.removed ? query.not('removed_at', 'is', null) : query.is('removed_at', null);
      if (options.type) query = query.eq('type', options.type);
      const { data } = await query
        .order('created_at', { ascending: false })
        .limit(options.limit ?? 100);
      return withContent(client, (data ?? []) as EntryRow[]);
    },

    async events(space, from, to) {
      const { data } = await client
        .from('entries')
        .select(ENTRY_COLUMNS)
        .eq('space_id', space)
        .eq('type', 'event')
        .is('removed_at', null)
        .lt('starts_at', to)
        .or(`ends_at.gte.${from},and(ends_at.is.null,starts_at.gte.${from})`)
        .order('starts_at');
      return withContent(client, (data ?? []) as EntryRow[]);
    },

    async get(entry) {
      if (!/^[0-9a-f-]{36}$/i.test(entry)) return null;
      const { data } = await client
        .from('entries')
        .select(ENTRY_COLUMNS)
        .eq('id', entry)
        .maybeSingle<EntryRow>();
      if (!data) return null;
      const [full] = await withContent(client, [data]);
      const { data: rows } = await client
        .from('entry_versions')
        .select('version, change, content, reason, changed_by, created_at')
        .eq('entry_id', entry)
        .order('version');
      const versions = ((rows ?? []) as Record<string, unknown>[]).map((v): EntryVersion => ({
        version: v.version as number,
        change: v.change as EntryVersion['change'],
        content: v.content as EntryContent,
        reason: (v.reason as string | null) ?? null,
        changedBy: (v.changed_by as string | null) ?? null,
        createdAt: v.created_at as string,
      }));
      return { entry: full, versions };
    },

    add: (space, type, content) =>
      call<string>(client, 'add_entry', {
        space,
        entry_type: type,
        child: content.child_id ?? null,
        content,
      }),
    edit: (entry, content, reason) =>
      call(client, 'edit_entry', { entry, child: content.child_id ?? null, content, reason }),
    remove: (entry, reason) => call(client, 'remove_entry', { entry, reason }),
    setOutcome: (entry, outcome, note) =>
      call(client, 'set_event_outcome', { entry, outcome: outcome ?? '', note }),

    async names(space) {
      const { data } = await client.rpc('space_names', { space });
      return new Map(
        ((data ?? []) as { user_id: string; display_name: string | null }[]).map((r) => [
          r.user_id,
          r.display_name,
        ]),
      );
    },
  };
}

export function createSupabaseSchedules(client: Db): ScheduleStore {
  return {
    async get(space) {
      const { data } = await client
        .from('schedules')
        .select('starts_on, pattern, version, updated_by, updated_at')
        .eq('space_id', space)
        .maybeSingle<{
          starts_on: string;
          pattern: (string | null)[];
          version: number;
          updated_by: string | null;
          updated_at: string;
        }>();
      return data
        ? {
            startsOn: data.starts_on,
            pattern: data.pattern,
            version: data.version,
            updatedBy: data.updated_by,
            updatedAt: data.updated_at,
          }
        : null;
    },

    async history(space) {
      const { data: schedule } = await client
        .from('schedules')
        .select('id')
        .eq('space_id', space)
        .maybeSingle<{ id: string }>();
      if (!schedule) return [];
      const { data } = await client
        .from('schedule_versions')
        .select('version, starts_on, pattern, changed_by, created_at')
        .eq('schedule_id', schedule.id)
        .order('version', { ascending: false });
      return ((data ?? []) as Record<string, unknown>[]).map((v): ScheduleVersion => ({
        version: v.version as number,
        startsOn: v.starts_on as string,
        pattern: v.pattern as (string | null)[],
        changedBy: (v.changed_by as string | null) ?? null,
        createdAt: v.created_at as string,
      }));
    },

    set: (space, startsOn, pattern) =>
      call(client, 'set_schedule', { space, start_date: startsOn, days: pattern }),

    async requests(space) {
      const { data } = await client
        .from('change_requests')
        .select(
          'id, starts_on, ends_on, assignee, reason, status, requested_by, responded_by, responded_at, response_note, created_at',
        )
        .eq('space_id', space)
        .order('created_at', { ascending: false })
        .limit(100);
      return ((data ?? []) as Record<string, string | null>[]).map((r): ChangeRequest => ({
        id: r.id as string,
        startsOn: r.starts_on as string,
        endsOn: r.ends_on as string,
        assignee: r.assignee,
        reason: r.reason,
        status: r.status as ChangeRequest['status'],
        requestedBy: r.requested_by,
        respondedBy: r.responded_by,
        respondedAt: r.responded_at,
        responseNote: r.response_note,
        createdAt: r.created_at as string,
      }));
    },

    request: (space, input) =>
      call<string>(client, 'request_change', {
        space,
        from_date: input.from,
        to_date: input.to,
        for_member: input.assignee,
        why: input.reason,
      }),
    respond: (request, approve, note) =>
      call(client, 'respond_to_change', { request, approve, note }),
    withdraw: (request) => call(client, 'withdraw_change', { request }),
  };
}

export type { Schedule };
