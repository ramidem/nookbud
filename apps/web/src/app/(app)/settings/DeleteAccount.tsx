'use client';

import { useActionState, useState } from 'react';
import { type DeleteAccountState, deleteAccount } from '../../../auth-actions/security';
import { Field } from '../../../ui/Field';
import { Notice } from '../../../ui/Notice';
import { SubmitButton } from '../../../ui/SubmitButton';
import { button } from '../../../ui/styles';

/** Deleting the account (R28). It says what happens first, and asks twice. */
export function DeleteAccount() {
  const [state, action] = useActionState<DeleteAccountState, FormData>(deleteAccount, {});
  const [open, setOpen] = useState(false);

  return (
    <div className="grid gap-4">
      <ul className="grid list-disc gap-1.5 pl-5 text-base leading-[1.55] text-subtitle">
        <li>Your profile, settings and two-step sign-in are deleted straight away.</li>
        <li>You are signed out on every device, and you cannot undo it.</li>
        <li>
          Anything you shared in a space stays there for the others, shown as from a “Former
          member”. Spaces are not open yet, so for now there is nothing shared.
        </li>
      </ul>
      {open ? (
        <form action={action} className="grid gap-5 rounded-xl border border-error p-5">
          {state.message ? <Notice tone="alert">{state.message}</Notice> : null}
          <Field
            autoComplete="current-password"
            error={state.errors?.password}
            label="Your password"
            name="password"
            required
            type="password"
          />
          <Field
            autoComplete="off"
            error={state.errors?.confirm}
            hint="Type DELETE to confirm."
            label="Confirm"
            name="confirm"
            required
          />
          <div className="flex flex-wrap gap-3">
            <SubmitButton pendingLabel="Deleting…" variant="danger">
              Delete my account
            </SubmitButton>
            <button className={button.ghost} onClick={() => setOpen(false)} type="button">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          className={`${button.secondary} justify-self-start`}
          onClick={() => setOpen(true)}
          type="button"
        >
          Delete account…
        </button>
      )}
    </div>
  );
}
