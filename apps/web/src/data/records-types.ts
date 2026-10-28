import type { DataResult } from './types';

export const ENTRY_TYPES = ['note', 'agreement', 'expense', 'event'] as const;
export type EntryType = (typeof ENTRY_TYPES)[number];

/** What a record holds. Which fields apply depends on its type (see docs/records.md). */
export type EntryContent = {
  title: string;
  body?: string | null;
  child_id?: string | null;
  agreed_on?: string | null;
  amount?: number | null;
  currency?: string | null;
  spent_on?: string | null;
  paid_by?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  all_day?: boolean;
  location?: string | null;
  assigned_to?: string | null;
  outcome?: 'done' | 'missed' | null;
  outcome_note?: string | null;
};

export type Entry = {
  id: string;
  spaceId: string;
  type: EntryType;
  childId: string | null;
  createdBy: string | null;
  createdAt: string;
  version: number;
  removedAt: string | null;
  content: EntryContent;
};

export type EntryVersion = {
  version: number;
  change: 'created' | 'edited' | 'outcome' | 'removed';
  content: EntryContent;
  reason: string | null;
  changedBy: string | null;
  createdAt: string;
};

export interface RecordStore {
  /** A space's records, newest first. Removed ones are left out unless asked for. */
  list(
    space: string,
    options?: { type?: EntryType; removed?: boolean; limit?: number },
  ): Promise<Entry[]>;
  /** Events that overlap a time range, for the calendar. */
  events(space: string, from: string, to: string): Promise<Entry[]>;
  get(entry: string): Promise<{ entry: Entry; versions: EntryVersion[] } | null>;
  add(space: string, type: EntryType, content: EntryContent): Promise<DataResult<string>>;
  edit(entry: string, content: EntryContent, reason: string | null): Promise<DataResult>;
  remove(entry: string, reason: string | null): Promise<DataResult>;
  setOutcome(
    entry: string,
    outcome: 'done' | 'missed' | null,
    note: string | null,
  ): Promise<DataResult>;
  /** Display names of the people in the space, by user id. Anyone else is a former member. */
  names(space: string): Promise<Map<string, string | null>>;
}

export type Schedule = {
  startsOn: string;
  /** One user id (or null) per day of the cycle. */
  pattern: (string | null)[];
  version: number;
  updatedBy: string | null;
  updatedAt: string;
};

export type ScheduleVersion = {
  version: number;
  startsOn: string;
  pattern: (string | null)[];
  changedBy: string | null;
  createdAt: string;
};

export type ChangeRequest = {
  id: string;
  startsOn: string;
  endsOn: string;
  assignee: string | null;
  reason: string | null;
  status: 'pending' | 'approved' | 'declined' | 'withdrawn';
  requestedBy: string | null;
  respondedBy: string | null;
  respondedAt: string | null;
  responseNote: string | null;
  createdAt: string;
};

export interface ScheduleStore {
  get(space: string): Promise<Schedule | null>;
  history(space: string): Promise<ScheduleVersion[]>;
  set(space: string, startsOn: string, pattern: (string | null)[]): Promise<DataResult>;
  requests(space: string): Promise<ChangeRequest[]>;
  request(
    space: string,
    input: { from: string; to: string; assignee: string; reason: string | null },
  ): Promise<DataResult<string>>;
  respond(request: string, approve: boolean, note: string | null): Promise<DataResult>;
  withdraw(request: string): Promise<DataResult>;
}
