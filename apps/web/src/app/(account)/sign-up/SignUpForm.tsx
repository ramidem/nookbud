'use client';

import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import { type SignUpState, signUp } from '../../../auth-actions/sign-up';
import { PASSWORD_HINT, PASSWORD_MIN } from '../../../auth-actions/validation';
import { PRIVACY_HREF, TERMS_HREF } from '../../../legal/policies';
import { Checkbox, Field } from '../../../ui/Field';
import { Notice } from '../../../ui/Notice';
import { SubmitButton } from '../../../ui/SubmitButton';
import { link } from '../../../ui/styles';

export function SignUpForm() {
  const [state, action] = useActionState<SignUpState, FormData>(signUp, {});
  // The device's time zone starts the profile off (R24); it can be changed later in Settings.
  const [timeZone, setTimeZone] = useState('');
  useEffect(() => setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''), []);

  return (
    <form action={action} className="grid gap-5" noValidate>
      {state.message ? <Notice tone="alert">{state.message}</Notice> : null}
      <Field
        autoComplete="email"
        defaultValue={state.email}
        error={state.errors?.email}
        inputMode="email"
        label="Email"
        name="email"
        required
        type="email"
      />
      <Field
        autoComplete="new-password"
        error={state.errors?.password}
        hint={PASSWORD_HINT}
        label="Password"
        minLength={PASSWORD_MIN}
        name="password"
        required
        type="password"
      />
      <input name="timeZone" type="hidden" value={timeZone} />
      <fieldset className="grid gap-1">
        <legend className="sr-only">Before you continue</legend>
        <Checkbox error={state.errors?.adult} name="adult" required>
          I am 18 or older.
        </Checkbox>
        <Checkbox error={state.errors?.terms} name="terms" required>
          I accept the{' '}
          <Link className={link} href={TERMS_HREF} target="_blank">
            terms of service
          </Link>{' '}
          and the{' '}
          <Link className={link} href={PRIVACY_HREF} target="_blank">
            privacy policy
          </Link>
          .
        </Checkbox>
      </fieldset>
      <SubmitButton pendingLabel="Creating your account…">Create account</SubmitButton>
    </form>
  );
}
