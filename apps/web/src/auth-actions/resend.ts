'use server';

import { z } from 'zod';
import { getAuth, getRateLimiter, requestAddress } from '@/auth';
import { CONFIRM, WELCOME } from '../auth/routes';
import { siteOrigin } from './origin';
import { email } from './validation';

export type ResendState = { sent?: boolean; message?: string };

export async function resendConfirmation(
  _previous: ResendState,
  form: FormData,
): Promise<ResendState> {
  const parsed = z.object({ email }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { message: 'Enter the email address you signed up with.' };

  const limiter = getRateLimiter();
  const who = { email: parsed.data.email, address: await requestAddress() };
  if (!(await limiter.allowed('resend', who))) {
    return { message: 'Too many attempts. Wait a few minutes, then try again.' };
  }
  await limiter.record('resend', who);

  const auth = await getAuth();
  const result = await auth.resendConfirmation({
    email: parsed.data.email,
    redirectTo: `${await siteOrigin()}${CONFIRM}?next=${WELCOME}`,
  });
  // Rate limited is the only failure we name; anything else looks like success (AUTH-7).
  return result.ok ? { sent: true } : { message: result.error.message };
}
