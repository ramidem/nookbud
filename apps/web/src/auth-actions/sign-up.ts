'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getAuth, getRateLimiter, requestAddress } from '@/auth';
import { CHECK_EMAIL, CONFIRM, WELCOME } from '../auth/routes';
import { POLICY_VERSION } from '../legal/policies';
import { siteOrigin } from './origin';
import { type FieldErrors, email, fieldErrors, newPassword, ticked } from './validation';

const schema = z.object({
  email,
  password: newPassword,
  adult: ticked('Confirm you are 18 or older.'),
  terms: ticked('Accept the terms and privacy policy to continue.'),
  timeZone: z.string().max(64).optional(),
});

export type SignUpState = {
  email?: string;
  errors?: FieldErrors<'email' | 'password' | 'adult' | 'terms'>;
  message?: string;
};

export async function signUp(_previous: SignUpState, form: FormData): Promise<SignUpState> {
  const raw = Object.fromEntries(form);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { email: String(raw.email ?? ''), errors: fieldErrors(parsed.error) };
  }

  const limiter = getRateLimiter();
  const who = { address: await requestAddress() };
  if (!(await limiter.allowed('sign_up', who))) {
    return {
      email: parsed.data.email,
      message: 'Too many attempts. Wait a few minutes, then try again.',
    };
  }
  await limiter.record('sign_up', who);

  const auth = await getAuth();
  const result = await auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: `${await siteOrigin()}${CONFIRM}?next=${WELCOME}`,
    consent: { adultConfirmed: true, termsAccepted: true, termsVersion: POLICY_VERSION },
    timeZone: parsed.data.timeZone || undefined,
  });

  if (!result.ok) {
    if (result.error.code === 'weak_password') {
      return { email: parsed.data.email, errors: { password: result.error.message } };
    }
    return { email: parsed.data.email, message: result.error.message };
  }

  // The same page whether the email was new or already had an account (AUTH-7).
  redirect(`${CHECK_EMAIL}?email=${encodeURIComponent(parsed.data.email)}`);
}
