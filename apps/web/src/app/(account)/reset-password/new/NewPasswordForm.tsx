'use client';

import { useActionState } from 'react';
import { type NewPasswordState, setNewPassword } from '../../../../auth-actions/password';
import { PASSWORD_HINT, PASSWORD_MIN } from '../../../../auth-actions/validation';
import { Field } from '../../../../ui/Field';
import { Notice } from '../../../../ui/Notice';
import { SubmitButton } from '../../../../ui/SubmitButton';

export function NewPasswordForm() {
  const [state, action] = useActionState<NewPasswordState, FormData>(setNewPassword, {});
  return (
    <form action={action} className="grid gap-5" noValidate>
      {state.message ? <Notice>{state.message}</Notice> : null}
      <Field
        autoComplete="new-password"
        error={state.errors?.password}
        hint={PASSWORD_HINT}
        label="New password"
        minLength={PASSWORD_MIN}
        name="password"
        required
        type="password"
      />
      <Field
        autoComplete="new-password"
        error={state.errors?.confirm}
        label="Type it again"
        name="confirm"
        required
        type="password"
      />
      <SubmitButton pendingLabel="Saving…">Save new password</SubmitButton>
    </form>
  );
}
