'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getAuth, getRateLimiter, requestAddress } from '@/auth';
import { SIGN_IN_CODE, safeNext } from '../auth/routes';
import { email } from './validation';

const schema = z.object({
  email,
  password: z.string().min(1, { error: 'Enter your password.' }).max(128),
  next: z.string().optional(),
});

const LIMITED = 'Too many attempts. Wait a few minutes, then try again.';

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

  // Checked before the password, and the same answer whether or not the account exists (R16).
  const limiter = getRateLimiter();
  const who = { email: parsed.data.email, address: await requestAddress() };
  if (!(await limiter.allowed('sign_in', who))) {
    return { email: parsed.data.email, message: LIMITED };
  }

  const auth = await getAuth();
  const result = await auth.signIn({ email: parsed.data.email, password: parsed.data.password });
  if (!result.ok) {
    if (result.error.code === 'invalid_credentials') await limiter.record('sign_in', who);
    return {
      email: parsed.data.email,
      message: result.error.message,
      unverified: result.error.code === 'email_not_verified',
    };
  }

  const next = safeNext(parsed.data.next);
  if ((await auth.twoStepStatus()).codeNeeded) {
    redirect(`${SIGN_IN_CODE}?next=${encodeURIComponent(next)}`);
  }
  redirect(next);
}

export type CodeState = { message?: string; recovery?: boolean };

const codeSchema = z.object({
  code: z.string().trim().min(1).max(20),
  mode: z.enum(['app', 'recovery']).default('app'),
  next: z.string().optional(),
});

/** The second step of signing in (R21): a code from the app, or one of the recovery codes. */
export async function signInWithCode(_previous: CodeState, form: FormData): Promise<CodeState> {
  const parsed = codeSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { message: 'Enter the code.' };
  const auth = await getAuth();
  const user = await auth.getUser();
  const limiter = getRateLimiter();
  const who = { email: user?.email ?? undefined, address: await requestAddress() };
  if (!(await limiter.allowed('code', who))) return { message: LIMITED };
  const recovery = parsed.data.mode === 'recovery';
  const result = recovery
    ? await auth.useRecoveryCode(parsed.data.code)
    : await auth.verifyTwoStepCode(parsed.data.code.replace(/\s/g, ''));
  if (!result.ok) {
    if (result.error.code === 'code_invalid') await limiter.record('code', who);
    return { message: result.error.message, recovery };
  }
  redirect(recovery ? '/settings/security?note=recovery-used' : safeNext(parsed.data.next));
}
