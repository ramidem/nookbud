'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireUser } from '@/auth';
import { getProfiles, getRecords } from '@/data';
import { calendarPath, recordPath, recordsPath } from '../auth/routes';
import { ENTRY_TYPES, type EntryContent } from '../data/records-types';
import { localToUtc, zoneOf } from '../profile/time';

export type EntryFormState = { message?: string; done?: boolean };

const blank = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? null : v);
const optionalText = (max: number) =>
  z.preprocess(blank, z.string().trim().max(max).nullable().optional());
const optionalId = z.preprocess(blank, z.uuid().nullable().optional());
const optionalDate = z.preprocess(blank, z.iso.date().nullable().optional());
const localTime = z.preprocess(
  blank,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
    .nullable()
    .optional(),
);

const fields = z.object({
  space: z.uuid(),
  type: z.enum(ENTRY_TYPES),
  title: z
    .string()
    .trim()
    .min(1, { error: 'Give it a title.' })
    .max(120, { error: 'Use 120 characters or fewer.' }),
  body: optionalText(5000),
  child: optionalId,
  agreedOn: optionalDate,
  amount: z.preprocess(
    blank,
    z.coerce.number().positive({ error: 'Enter an amount above zero.' }).nullable().optional(),
  ),
  currency: z.preprocess(
    blank,
    z
      .string()
      .regex(/^[A-Z]{3}$/)
      .nullable()
      .optional(),
  ),
  spentOn: optionalDate,
  paidBy: optionalId,
  startsAt: localTime,
  endsAt: localTime,
  startDate: optionalDate,
  endDate: optionalDate,
  allDay: z.preprocess((v) => v === 'yes', z.boolean()),
  location: optionalText(200),
  assignedTo: optionalId,
  reason: optionalText(500),
});

/** Turns the form into the record's content. Times are the person's own, converted to UTC. */
async function toContent(form: FormData): Promise<
  | {
      space: string;
      type: (typeof ENTRY_TYPES)[number];
      content: EntryContent;
      reason: string | null;
    }
  | string
> {
  const parsed = fields.safeParse(Object.fromEntries(form));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? 'Check the form and try again.';
  const f = parsed.data;
  const content: EntryContent = { title: f.title, body: f.body ?? null, child_id: f.child ?? null };
  if (f.type === 'agreement') content.agreed_on = f.agreedOn ?? null;
  if (f.type === 'expense') {
    if (!f.amount) return 'Enter an amount above zero.';
    if (!f.currency) return 'Choose a currency.';
    Object.assign(content, {
      amount: f.amount,
      currency: f.currency,
      spent_on: f.spentOn ?? null,
      paid_by: f.paidBy ?? null,
    });
  }
  if (f.type === 'event') {
    const zone = zoneOf((await (await getProfiles()).get())?.timeZone);
    let starts: string | null;
    let ends: string | null;
    if (f.allDay) {
      if (!f.startDate) return 'Choose the day.';
      starts = localToUtc(`${f.startDate}T00:00`, zone);
      ends = localToUtc(`${f.endDate ?? f.startDate}T23:59`, zone);
    } else {
      if (!f.startsAt) return 'Choose when it starts.';
      starts = localToUtc(f.startsAt, zone);
      ends = f.endsAt ? localToUtc(f.endsAt, zone) : null;
    }
    if (ends && ends < starts) return 'It cannot end before it starts.';
    Object.assign(content, {
      starts_at: starts,
      ends_at: ends,
      all_day: f.allDay,
      location: f.location ?? null,
      assigned_to: f.assignedTo ?? null,
    });
  }
  return { space: f.space, type: f.type, content, reason: f.reason ?? null };
}

/** R54 */
export async function addRecord(_p: EntryFormState, form: FormData): Promise<EntryFormState> {
  const input = await toContent(form);
  if (typeof input === 'string') return { message: input };
  await requireUser(recordsPath(input.space));
  const result = await (await getRecords()).add(input.space, input.type, input.content);
  if (!result.ok) return { message: result.message };
  revalidatePath(recordsPath(input.space));
  revalidatePath(calendarPath(input.space));
  return { done: true };
}

/** R55: a new version, with an optional reason. */
export async function editRecord(_p: EntryFormState, form: FormData): Promise<EntryFormState> {
  const entry = z.uuid().safeParse(form.get('entry'));
  const input = await toContent(form);
  if (!entry.success) return { message: 'That did not work. Try again.' };
  if (typeof input === 'string') return { message: input };
  await requireUser(recordPath(input.space, entry.data));
  const result = await (await getRecords()).edit(entry.data, input.content, input.reason);
  if (!result.ok) return { message: result.message };
  revalidatePath(recordPath(input.space, entry.data));
  revalidatePath(calendarPath(input.space));
  return { done: true };
}

/** AUD-2: soft delete. */
export async function removeRecord(_p: EntryFormState, form: FormData): Promise<EntryFormState> {
  const parsed = z
    .object({ space: z.uuid(), entry: z.uuid(), reason: optionalText(500) })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { message: 'That did not work. Try again.' };
  await requireUser(recordPath(parsed.data.space, parsed.data.entry));
  const result = await (await getRecords()).remove(parsed.data.entry, parsed.data.reason ?? null);
  if (!result.ok) return { message: result.message };
  revalidatePath(recordsPath(parsed.data.space));
  revalidatePath(calendarPath(parsed.data.space));
  redirect(`${recordPath(parsed.data.space, parsed.data.entry)}?note=removed`);
}

/** CAL-1 */
export async function setOutcome(_p: EntryFormState, form: FormData): Promise<EntryFormState> {
  const parsed = z
    .object({
      space: z.uuid(),
      entry: z.uuid(),
      outcome: z.enum(['done', 'missed', '']),
      note: optionalText(500),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { message: 'Choose what happened.' };
  await requireUser(recordPath(parsed.data.space, parsed.data.entry));
  const result = await (
    await getRecords()
  ).setOutcome(
    parsed.data.entry,
    parsed.data.outcome === '' ? null : parsed.data.outcome,
    parsed.data.note ?? null,
  );
  if (!result.ok) return { message: result.message };
  revalidatePath(recordPath(parsed.data.space, parsed.data.entry));
  revalidatePath(calendarPath(parsed.data.space));
  return { done: true };
}
