'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/auth';
import { getSchedules } from '@/data';
import { calendarPath } from '../auth/routes';
import { presetPattern } from '../profile/schedule';

export type ScheduleState = { message?: string; done?: boolean };

const blank = (v: unknown) => (v === '' ? null : v);

/** R57: an owner sets the repeating pattern, from a preset or day by day. */
export async function saveSchedule(_p: ScheduleState, form: FormData): Promise<ScheduleState> {
  const parsed = z
    .object({
      space: z.uuid(),
      startsOn: z.iso.date({ error: 'Choose the first day of the pattern.' }),
      preset: z.enum(['week', 'alternate', '2-2-3', 'custom']),
      first: z.preprocess(blank, z.uuid().nullable().optional()),
      second: z.preprocess(blank, z.uuid().nullable().optional()),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { message: parsed.error.issues[0]?.message ?? 'Check the form.' };
  const { space, startsOn, preset, first, second } = parsed.data;
  await requireUser(calendarPath(space));

  let pattern: (string | null)[];
  if (preset === 'custom') {
    pattern = form
      .getAll('day')
      .map((d) => (typeof d === 'string' && /^[0-9a-f-]{36}$/i.test(d) ? d : null));
    if (pattern.length === 0 || pattern.length > 28)
      return { message: 'A pattern has between 1 and 28 days.' };
  } else {
    if (!first || !second)
      return { message: 'Choose who has the first days and who has the next.' };
    if (first === second) return { message: 'Choose two different people.' };
    pattern = presetPattern(preset, first, second);
  }

  const result = await (await getSchedules()).set(space, startsOn, pattern);
  if (!result.ok) return { message: result.message };
  revalidatePath(calendarPath(space));
  return { done: true };
}

/** R58: ask for some days. */
export async function requestChange(_p: ScheduleState, form: FormData): Promise<ScheduleState> {
  const parsed = z
    .object({
      space: z.uuid(),
      from: z.iso.date({ error: 'Choose the first day.' }),
      to: z.iso.date({ error: 'Choose the last day.' }),
      assignee: z.uuid({ error: 'Choose whose days they would be.' }),
      reason: z.preprocess(blank, z.string().trim().max(500).nullable().optional()),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { message: parsed.error.issues[0]?.message ?? 'Check the form.' };
  await requireUser(calendarPath(parsed.data.space));
  const result = await (
    await getSchedules()
  ).request(parsed.data.space, { ...parsed.data, reason: parsed.data.reason ?? null });
  if (!result.ok) return { message: result.message };
  revalidatePath(calendarPath(parsed.data.space));
  return { done: true };
}

export async function answerChange(_p: ScheduleState, form: FormData): Promise<ScheduleState> {
  const parsed = z
    .object({
      space: z.uuid(),
      request: z.uuid(),
      answer: z.enum(['approve', 'decline', 'withdraw']),
      note: z.preprocess(blank, z.string().trim().max(500).nullable().optional()),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { message: 'That did not work. Try again.' };
  await requireUser(calendarPath(parsed.data.space));
  const schedules = await getSchedules();
  const { request, answer, note } = parsed.data;
  const result =
    answer === 'withdraw'
      ? await schedules.withdraw(request)
      : await schedules.respond(request, answer === 'approve', note ?? null);
  if (!result.ok) return { message: result.message };
  revalidatePath(calendarPath(parsed.data.space));
  return { done: true };
}
