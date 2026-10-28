'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { type TwoStepSetup, getAuth, requireUser } from '@/auth';
import { SECURITY } from '../auth/routes';
import { type FieldErrors, fieldErrors, newPassword } from './validation';

export type ChangePasswordState = {
  done?: boolean;
  message?: string;
  errors?: FieldErrors<'current' | 'password' | 'confirm'>;
};

/** Settings → Password (R22): the current password first, then every other session ends. */
export async function changePassword(
  _previous: ChangePasswordState,
  form: FormData,
): Promise<ChangePasswordState> {
  await requireUser(SECURITY);
  const parsed = z
    .object({
      current: z.string().min(1, { error: 'Enter your current password.' }).max(128),
      password: newPassword,
      confirm: z.string(),
    })
    .refine((v) => v.password === v.confirm, {
      error: 'The two passwords do not match.',
      path: ['confirm'],
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const auth = await getAuth();
  const check = await auth.checkPassword(parsed.data.current);
  if (!check.ok) {
    return check.error.code === 'wrong_password'
      ? { errors: { current: check.error.message } }
      : { message: check.error.message };
  }
  const result = await auth.updatePassword(parsed.data.password, 'changed');
  if (!result.ok) {
    return result.error.code === 'weak_password'
      ? { errors: { password: result.error.message } }
      : { message: result.error.message };
  }
  await auth.signOut({ others: true });
  revalidatePath(SECURITY);
  return { done: true };
}

export type TwoStepState = {
  setup?: TwoStepSetup;
  recoveryCodes?: string[];
  message?: string;
  off?: boolean;
};

/** One action drives the whole setup: start, then confirm with a code, then show recovery codes. */
export async function twoStep(previous: TwoStepState, form: FormData): Promise<TwoStepState> {
  await requireUser(SECURITY);
  const auth = await getAuth();
  const step = String(form.get('step') ?? '');

  if (step === 'start') {
    const started = await auth.startTwoStep();
    return started.ok ? { setup: started.data } : { message: started.error.message };
  }

  if (step === 'confirm' && previous.setup) {
    const code = String(form.get('code') ?? '').replace(/\s/g, '');
    const confirmed = await auth.confirmTwoStep({ factorId: previous.setup.factorId, code });
    if (!confirmed.ok) return { setup: previous.setup, message: confirmed.error.message };
    revalidatePath(SECURITY);
    return { recoveryCodes: confirmed.data };
  }

  if (step === 'off') {
    const off = await auth.turnOffTwoStep();
    revalidatePath(SECURITY);
    return off.ok ? { off: true } : { message: off.error.message };
  }

  return {};
}
