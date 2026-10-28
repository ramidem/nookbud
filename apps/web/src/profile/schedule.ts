import type { ChangeRequest, Schedule } from '../data/records-types';
import { daysBetween } from './time';

/**
 * Whose day it is (R57, R58): the latest approved change request covering the day wins,
 * otherwise the repeating pattern. Before the pattern starts, nobody's.
 */
export function whoseDay(
  date: string,
  schedule: Schedule | null,
  requests: ChangeRequest[],
): string | null {
  const approved = requests
    .filter((r) => r.status === 'approved' && r.startsOn <= date && date <= r.endsOn)
    .sort((a, b) => (b.respondedAt ?? '').localeCompare(a.respondedAt ?? ''));
  if (approved.length) return approved[0].assignee;
  if (!schedule || schedule.pattern.length === 0) return null;
  const offset = daysBetween(schedule.startsOn, date);
  if (offset < 0) return null;
  return schedule.pattern[offset % schedule.pattern.length] ?? null;
}

/** A pattern from a preset: one week each, alternate days, or 2-2-3 (over two weeks). */
export function presetPattern(
  preset: 'week' | 'alternate' | '2-2-3',
  a: string,
  b: string,
): string[] {
  if (preset === 'alternate') return [a, b];
  if (preset === '2-2-3') return [a, a, b, b, a, a, a, b, b, a, a, b, b, b];
  return [a, a, a, a, a, a, a, b, b, b, b, b, b, b];
}
