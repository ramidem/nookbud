'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/auth';
import { getProfiles } from '@/data';
import { HOME, SETTINGS } from '../auth/routes';
import { SHARES_WITH } from '../data/types';
import { CURRENCIES, isTimeZone } from '../profile/options';
import { type FieldErrors, fieldErrors } from './validation';

const optional = (s: z.ZodString) =>
  z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? null : v),
    s.nullable().optional(),
  );

const name = optional(z.string().trim().max(80, { error: 'Use 80 characters or fewer.' }));

/** Onboarding (R27). Every answer is optional, and skipping finishes it too. */
export async function finishWelcome(form: FormData) {
  await requireUser();
  const parsed = z
    .object({
      displayName: name,
      sharesWith: z.enum(SHARES_WITH).optional().catch(undefined),
      skip: z.string().optional(),
    })
    .safeParse(Object.fromEntries(form));
  const profiles = await getProfiles();
  const answers = parsed.success && !parsed.data.skip ? parsed.data : {};
  await profiles.update({
    ...(answers.displayName !== undefined ? { displayName: answers.displayName } : {}),
    ...(answers.sharesWith ? { sharesWith: answers.sharesWith } : {}),
    onboarded: true,
  });
  redirect(HOME);
}

export type ProfileState = {
  saved?: boolean;
  message?: string;
  errors?: FieldErrors<'displayName' | 'timeZone' | 'currency'>;
};

/** Settings → Profile (R24, R25). */
export async function saveProfile(_previous: ProfileState, form: FormData): Promise<ProfileState> {
  await requireUser(SETTINGS);
  const parsed = z
    .object({
      displayName: name,
      timeZone: optional(
        z.string().refine(isTimeZone, { error: 'Choose a time zone from the list.' }),
      ),
      currency: optional(
        z
          .string()
          .refine((c) => CURRENCIES.includes(c), { error: 'Choose a currency from the list.' }),
      ),
      sharesWith: z.preprocess(
        (v) => (v === '' ? null : v),
        z.enum(SHARES_WITH).nullable().optional(),
      ),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const result = await (await getProfiles()).update(parsed.data);
  if (!result.ok) return { message: result.message };
  revalidatePath(SETTINGS);
  return { saved: true };
}
