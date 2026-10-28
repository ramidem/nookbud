'use client';

import { useActionState } from 'react';
import { type ChangePasswordState, changePassword } from '../../../../auth-actions/security';
import { PASSWORD_HINT, PASSWORD_MIN } from '../../../../auth-actions/validation';
import { Field } from '../../../../ui/Field';
import { Notice } from '../../../../ui/Notice';
import { SubmitButton } from '../../../../ui/SubmitButton';

export function PasswordForm() {
  const [state, action] = useActionState<ChangePasswordState, FormData>(changePassword, {});
  return (
    <form action={action} className="grid gap-5" key={state.done ? 'done' : 'form'}>
      {state.done ? (
        <Notice title="Password changed" tone="success">
          Your other sessions have ended. This one stays signed in.
        </Notice>
      ) : null}
      {state.message ? <Notice>{state.message}</Notice> : null}
      <Field
        autoComplete="current-password"
        error={state.errors?.current}
        label="Current password"
        name="current"
        required
        type="password"
      />
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
      <SubmitButton className="justify-self-start" pendingLabel="Saving…">
        Change password
      </SubmitButton>
    </form>
  );
}
