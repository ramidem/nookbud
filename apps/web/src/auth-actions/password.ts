'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getAuth } from '@/auth';
import { CONFIRM, NEW_PASSWORD, SIGN_IN } from '../auth/routes';
import { siteOrigin } from './origin';
import { type FieldErrors, email, fieldErrors, newPassword } from './validation';

export type ForgotState = { sent?: boolean; message?: string; email?: string };

/** Always answers the same way, so it never says whether an email has an account (AUTH-7). */
export async function requestPasswordReset(
  _previous: ForgotState,
  form: FormData,
): Promise<ForgotState> {
  const raw = Object.fromEntries(form);
  const parsed = z.object({ email }).safeParse(raw);
  if (!parsed.success)
    return {
      email: String(raw.email ?? ''),
      message: 'Enter your email address, like name@example.com.',
    };

  const auth = await getAuth();
  const result = await auth.requestPasswordReset({
    email: parsed.data.email,
    redirectTo: `${await siteOrigin()}${CONFIRM}?next=${NEW_PASSWORD}`,
  });
  if (!result.ok && result.error.code === 'rate_limited') {
    return { email: parsed.data.email, message: result.error.message };
  }
  return { sent: true, email: parsed.data.email };
}

export type NewPasswordState = { errors?: FieldErrors<'password' | 'confirm'>; message?: string };

/** Sets a new password after a reset link, then ends every other session. */
export async function setNewPassword(
  _previous: NewPasswordState,
  form: FormData,
): Promise<NewPasswordState> {
  const parsed = z
    .object({ password: newPassword, confirm: z.string() })
    .refine((v) => v.password === v.confirm, {
      error: 'The two passwords do not match.',
      path: ['confirm'],
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const auth = await getAuth();
  const result = await auth.updatePassword(parsed.data.password, 'reset');
  if (!result.ok) {
    if (result.error.code === 'weak_password')
      return { errors: { password: result.error.message } };
    return { message: result.error.message };
  }
  // Someone who had this account open elsewhere is signed out there too (R14).
  await auth.signOut({ everywhere: true });
  redirect(`${SIGN_IN}?note=password-changed`);
}
