'use client';

import { useActionState, useState } from 'react';
import { type CodeState, signInWithCode } from '../../../../auth-actions/sign-in';
import { Field } from '../../../../ui/Field';
import { Notice } from '../../../../ui/Notice';
import { SubmitButton } from '../../../../ui/SubmitButton';
import { button } from '../../../../ui/styles';

export function CodeForm({ next }: { next?: string }) {
  const [state, action] = useActionState<CodeState, FormData>(signInWithCode, {});
  const [recovery, setRecovery] = useState(false);
  return (
    <div className="grid gap-5">
      <form action={action} className="grid gap-5" key={recovery ? 'recovery' : 'app'} noValidate>
        {state.message ? <Notice title="Sign-in failed">{state.message}</Notice> : null}
        {next ? <input name="next" type="hidden" value={next} /> : null}
        <input name="mode" type="hidden" value={recovery ? 'recovery' : 'app'} />
        {recovery ? (
          <Field
            autoComplete="off"
            hint="One of the codes you saved when you turned on two-step sign-in, like K4M9-X7QP. Using one turns two-step sign-in off, so you can set it up again on a new phone."
            label="Recovery code"
            name="code"
            required
          />
        ) : (
          <Field
            autoComplete="one-time-code"
            hint="The 6-digit code in your authenticator app."
            inputMode="numeric"
            label="Code"
            maxLength={8}
            name="code"
            pattern="[0-9 ]*"
            required
          />
        )}
        <SubmitButton pendingLabel="Checking…">Continue</SubmitButton>
      </form>
      <button
        className={`${button.ghost} justify-self-start`}
        onClick={() => setRecovery(!recovery)}
        type="button"
      >
        {recovery ? 'Use the code from your app instead' : 'Lost your phone? Use a recovery code'}
      </button>
    </div>
  );
}
