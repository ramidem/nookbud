import type { EntryContent } from '../data/records-types';

const FIELDS: [keyof EntryContent, string][] = [
  ['title', 'Title'],
  ['starts_at', 'Starts'],
  ['ends_at', 'Ends'],
  ['all_day', 'All day'],
  ['location', 'Place'],
  ['assigned_to', 'Responsible'],
  ['amount', 'Amount'],
  ['currency', 'Currency'],
  ['spent_on', 'Date spent'],
  ['paid_by', 'Who paid'],
  ['agreed_on', 'Date agreed'],
  ['child_id', 'Child'],
  ['body', 'Details'],
  ['outcome', 'Outcome'],
  ['outcome_note', 'Outcome note'],
];

export type Change = { field: keyof EntryContent; label: string; before: unknown; after: unknown };

/** What changed between two versions of a record (AUD-1), field by field. */
export function diffContent(before: EntryContent, after: EntryContent): Change[] {
  const same = (a: unknown, b: unknown) =>
    (a ?? null) === (b ?? null) || String(a ?? '') === String(b ?? '');
  return FIELDS.filter(([field]) => !same(before[field], after[field])).map(([field, label]) => ({
    field,
    label,
    before: before[field] ?? null,
    after: after[field] ?? null,
  }));
}
