'use client';

import { useActionState } from 'react';
import { type ResendState, resendConfirmation } from '../../../auth-actions/resend';
import { Notice } from '../../../ui/Notice';
import { SubmitButton } from '../../../ui/SubmitButton';

export function ResendForm({ email }: { email: string }) {
  const [state, action] = useActionState<ResendState, FormData>(resendConfirmation, {});
  return (
    <form action={action} className="grid gap-4">
      <input name="email" type="hidden" value={email} />
      {state.sent ? (
        <Notice tone="success">Sent again. It can take a minute to arrive.</Notice>
      ) : null}
      {state.message ? <Notice>{state.message}</Notice> : null}
      <SubmitButton pendingLabel="Sending…" variant="secondary">
        Send the email again
      </SubmitButton>
    </form>
  );
}
