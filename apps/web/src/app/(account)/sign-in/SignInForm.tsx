'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { type SignInState, signIn } from '../../../auth-actions/sign-in';
import { FORGOT_PASSWORD } from '../../../auth/routes';
import { Field } from '../../../ui/Field';
import { Notice } from '../../../ui/Notice';
import { SubmitButton } from '../../../ui/SubmitButton';
import { link } from '../../../ui/styles';
import { ResendForm } from '../check-email/ResendForm';

export function SignInForm({ next }: { next?: string }) {
  const [state, action] = useActionState<SignInState, FormData>(signIn, {});
  return (
    <div className="grid gap-5">
      <form action={action} className="grid gap-5" noValidate>
        {state.message ? (
          <Notice
            title={
              state.locked
                ? 'Sign-in paused'
                : state.unverified
                  ? 'Confirm your email first'
                  : 'Sign-in failed'
            }
            tone={state.locked ? 'alert' : 'status'}
          >
            {state.message}
          </Notice>
        ) : null}
        {next ? <input name="next" type="hidden" value={next} /> : null}
        <Field
          autoComplete="email"
          defaultValue={state.email}
          inputMode="email"
          label="Email"
          name="email"
          required
          type="email"
        />
        <Field
          autoComplete="current-password"
          label="Password"
          name="password"
          required
          type="password"
        />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>
          <Link className={`${link} text-sm`} href={FORGOT_PASSWORD}>
            Forgot your password?
          </Link>
        </div>
      </form>
      {state.unverified && state.email ? <ResendForm email={state.email} /> : null}
    </div>
  );
}
