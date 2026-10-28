'use client';

import { useActionState } from 'react';
import { type FormState, createSpace } from '../../../auth-actions/spaces';
import { Field } from '../../../ui/Field';
import { Notice } from '../../../ui/Notice';
import { SubmitButton } from '../../../ui/SubmitButton';

export function CreateSpaceForm({ first }: { first: boolean }) {
  const [state, action] = useActionState<FormState<'name'>, FormData>(createSpace, {});
  return (
    <form action={action} className="grid gap-4">
      {state.message ? <Notice>{state.message}</Notice> : null}
      <Field
        error={state.errors?.name}
        hint="Something you will all recognise, like “Ava’s week” or “Our family”."
        label={first ? 'Name your first space' : 'Name'}
        maxLength={80}
        name="name"
        required
      />
      <SubmitButton className="justify-self-start" pendingLabel="Creating…">
        Create space
      </SubmitButton>
    </form>
  );
}
