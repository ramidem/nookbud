'use client';

import { useActionState } from 'react';
import { type ForgotState, requestPasswordReset } from '../../../auth-actions/password';
import { Field } from '../../../ui/Field';
import { Notice } from '../../../ui/Notice';
import { SubmitButton } from '../../../ui/SubmitButton';

export function ForgotForm() {
  const [state, action] = useActionState<ForgotState, FormData>(requestPasswordReset, {});
  if (state.sent) {
    return (
      <Notice title="Check your email" tone="success">
        If {state.email} has a Nookbud account, a link to reset the password is on its way. It works
        once and expires in an hour.
      </Notice>
    );
  }
  return (
    <form action={action} className="grid gap-5" noValidate>
      {state.message ? <Notice>{state.message}</Notice> : null}
      <Field
        autoComplete="email"
        defaultValue={state.email}
        inputMode="email"
        label="Email"
        name="email"
        required
        type="email"
      />
      <SubmitButton pendingLabel="Sending…">Send reset link</SubmitButton>
    </form>
  );
}
