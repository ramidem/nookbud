import { describe, expect, it } from 'vitest';
import type { ChangeRequest, Schedule } from '../src/data/records-types';
import { presetPattern, whoseDay } from '../src/profile/schedule';
import { addDays, dateInZone, daysBetween, localToUtc, utcToLocal } from '../src/profile/time';

describe('times in a person’s own zone (R56)', () => {
  it('turns a Manila wall-clock time into UTC and back', () => {
    expect(localToUtc('2026-11-04T15:30', 'Asia/Manila')).toBe('2026-11-04T07:30:00.000Z');
    expect(utcToLocal('2026-11-04T07:30:00.000Z', 'Asia/Manila')).toBe('2026-11-04T15:30');
  });

  it('handles a daylight-saving change', () => {
    // London moves from BST to GMT on 25 October 2026.
    expect(localToUtc('2026-10-24T09:00', 'Europe/London')).toBe('2026-10-24T08:00:00.000Z');
    expect(localToUtc('2026-10-26T09:00', 'Europe/London')).toBe('2026-10-26T09:00:00.000Z');
  });

  it('puts the same moment on different days for different people', () => {
    const moment = '2026-11-04T20:00:00.000Z';
    expect(dateInZone(moment, 'Asia/Manila')).toBe('2026-11-05');
    expect(dateInZone(moment, 'America/Los_Angeles')).toBe('2026-11-04');
  });

  it('counts days', () => {
    expect(daysBetween('2026-11-01', '2026-11-15')).toBe(14);
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });
});

describe('whose day it is (R57, R58)', () => {
  const schedule: Schedule = {
    startsOn: '2026-11-02',
    pattern: presetPattern('week', 'priya', 'tom'),
    version: 1,
    updatedBy: null,
    updatedAt: '',
  };
  const request = (over: Partial<ChangeRequest>): ChangeRequest => ({
    id: 'r',
    startsOn: '2026-11-03',
    endsOn: '2026-11-04',
    assignee: 'tom',
    reason: null,
    status: 'approved',
    requestedBy: 'tom',
    respondedBy: 'priya',
    respondedAt: '2026-10-30T00:00:00Z',
    responseNote: null,
    createdAt: '',
    ...over,
  });

  it('follows the repeating pattern', () => {
    expect(whoseDay('2026-11-02', schedule, [])).toBe('priya');
    expect(whoseDay('2026-11-09', schedule, [])).toBe('tom');
    expect(whoseDay('2026-11-16', schedule, [])).toBe('priya');
  });

  it('is nobody’s before the pattern starts', () => {
    expect(whoseDay('2026-11-01', schedule, [])).toBeNull();
  });

  it('lets an approved request change those days only', () => {
    expect(whoseDay('2026-11-03', schedule, [request({})])).toBe('tom');
    expect(whoseDay('2026-11-05', schedule, [request({})])).toBe('priya');
  });

  it('ignores requests that were not approved', () => {
    for (const status of ['pending', 'declined', 'withdrawn'] as const) {
      expect(whoseDay('2026-11-03', schedule, [request({ status })])).toBe('priya');
    }
  });

  it('uses the most recently approved request when two overlap', () => {
    const later = request({ assignee: 'priya', respondedAt: '2026-10-31T00:00:00Z' });
    expect(whoseDay('2026-11-03', schedule, [request({}), later])).toBe('priya');
  });

  it('knows 2-2-3', () => {
    expect(presetPattern('2-2-3', 'a', 'b').join('')).toBe('aabbaaabbaabbb');
  });
});

describe('what changed between versions (AUD-1)', () => {
  it('lists each changed field, and nothing else', async () => {
    const { diffContent } = await import('../src/records/diff');
    const changes = diffContent(
      { title: 'Boots', amount: 42, currency: 'PHP', body: null },
      { title: 'Football boots', amount: 42, currency: 'PHP', body: '' },
    );
    expect(changes).toEqual([
      { field: 'title', label: 'Title', before: 'Boots', after: 'Football boots' },
    ]);
  });
});
