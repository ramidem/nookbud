'use client';

import { useActionState } from 'react';
import { type TwoStepState, twoStep } from '../../../../auth-actions/security';
import { Field } from '../../../../ui/Field';
import { Notice } from '../../../../ui/Notice';
import { SubmitButton } from '../../../../ui/SubmitButton';

/** Two-step sign-in (R21): set up with a QR code, confirm with a code, keep the recovery codes. */
export function TwoStep({ enabled }: { enabled: boolean }) {
  const [state, action] = useActionState<TwoStepState, FormData>(twoStep, {});

  if (state.recoveryCodes) {
    return (
      <div className="grid gap-4">
        <Notice title="Two-step sign-in is on" tone="success">
          From now on, signing in asks for a code from your app.
        </Notice>
        <p className="text-base leading-[1.55] text-foreground">
          <strong className="font-semibold">Save these recovery codes now.</strong> They are shown
          only once. If you lose your phone, each one lets you sign in once.
        </p>
        <ul
          className="grid grid-cols-2 gap-2 rounded-xl bg-neutral-200 p-4 font-mono text-sm text-foreground sm:grid-cols-5"
          aria-label="Recovery codes"
        >
          {state.recoveryCodes.map((code) => (
            <li key={code}>{code}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (state.setup) {
    return (
      <form action={action} className="grid gap-5">
        <input name="step" type="hidden" value="confirm" />
        <ol className="grid list-decimal gap-2 pl-5 text-base leading-[1.55] text-foreground">
          <li>
            Open an authenticator app on your phone, such as Google Authenticator, Microsoft
            Authenticator or 1Password.
          </li>
          <li>Scan this code with it.</li>
          <li>Enter the 6-digit code the app shows.</li>
        </ol>
        {/* The QR code is an SVG from the provider; it is not user content. */}
        <img
          alt="QR code to scan with your authenticator app"
          className="size-48 rounded-lg border border-border bg-white p-2"
          src={state.setup.qrCode}
        />
        <details className="text-sm text-subtitle">
          <summary className="cursor-pointer font-medium text-foreground">
            Can’t scan it? Type this key instead
          </summary>
          <code className="mt-2 block break-all rounded-lg bg-neutral-200 p-3 font-mono text-foreground">
            {state.setup.secret}
          </code>
        </details>
        {state.message ? <Notice>{state.message}</Notice> : null}
        <Field
          autoComplete="one-time-code"
          inputMode="numeric"
          label="Code from the app"
          maxLength={8}
          name="code"
          required
        />
        <SubmitButton className="justify-self-start" pendingLabel="Checking…">
          Turn on two-step sign-in
        </SubmitButton>
      </form>
    );
  }

  const on = enabled && !state.off;
  return (
    <form action={action} className="grid gap-4">
      {state.off ? (
        <Notice>Two-step sign-in is off. Signing in needs only your password.</Notice>
      ) : null}
      {state.message ? <Notice>{state.message}</Notice> : null}
      <p className="text-base leading-[1.55] text-subtitle">
        {on
          ? 'On. Signing in asks for a code from your authenticator app.'
          : 'Off. Turn it on so that a password alone is not enough to get into your account.'}
      </p>
      <input name="step" type="hidden" value={on ? 'off' : 'start'} />
      <SubmitButton
        className="justify-self-start"
        pendingLabel={on ? 'Turning off…' : 'Starting…'}
        variant={on ? 'secondary' : 'primary'}
      >
        {on ? 'Turn off two-step sign-in' : 'Set up two-step sign-in'}
      </SubmitButton>
    </form>
  );
}
