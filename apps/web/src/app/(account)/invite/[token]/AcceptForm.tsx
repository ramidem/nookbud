'use client';

import { useActionState } from 'react';
import { type AcceptState, acceptInvitation } from '../../../../auth-actions/spaces';
import { Notice } from '../../../../ui/Notice';
import { SubmitButton } from '../../../../ui/SubmitButton';

export function AcceptForm({ token, spaceName }: { token: string; spaceName: string }) {
  const [state, action] = useActionState<AcceptState, FormData>(acceptInvitation, {});
  return (
    <form action={action} className="grid gap-4">
      <input name="token" type="hidden" value={token} />
      {state.message ? <Notice title="Could not join">{state.message}</Notice> : null}
      <SubmitButton className="justify-self-start" pendingLabel="Joining…">
        Join {spaceName}
      </SubmitButton>
    </form>
  );
}
