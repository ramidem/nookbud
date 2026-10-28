'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getAuth } from '@/auth';
import { safeNext } from '../auth/routes';
import { email } from './validation';

const schema = z.object({
  email,
  password: z.string().min(1, { error: 'Enter your password.' }).max(128),
  next: z.string().optional(),
});

export type SignInState = {
  email?: string;
  message?: string;
  /** The email is not confirmed yet: offer to send the link again. */
  unverified?: boolean;
};

export async function signIn(_previous: SignInState, form: FormData): Promise<SignInState> {
  const raw = Object.fromEntries(form);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { email: String(raw.email ?? ''), message: 'Enter your email and password.' };
  }

  const auth = await getAuth();
  const result = await auth.signIn({ email: parsed.data.email, password: parsed.data.password });
  if (!result.ok) {
    return {
      email: parsed.data.email,
      message: result.error.message,
      unverified: result.error.code === 'email_not_verified',
    };
  }

  redirect(safeNext(parsed.data.next));
}
