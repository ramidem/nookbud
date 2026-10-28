'use client';

import { useActionState } from 'react';
import { type ProfileState, saveProfile } from '../../../auth-actions/profile';
import { SHARES_WITH, type Profile } from '../../../data/types';
import { SHARES_WITH_LABELS } from '../../../profile/options';
import { Field } from '../../../ui/Field';
import { Notice } from '../../../ui/Notice';
import { SubmitButton } from '../../../ui/SubmitButton';
import { input } from '../../../ui/styles';

type Props = { profile: Profile; timeZones: string[]; currencies: string[] };

function Select({
  label,
  name,
  hint,
  error,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  defaultValue: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <label className="text-sm font-medium text-foreground" htmlFor={name}>
        {label}
      </label>
      <select
        aria-describedby={hint ? `${name}-hint` : undefined}
        aria-invalid={error ? true : undefined}
        className={input}
        defaultValue={defaultValue}
        id={name}
        name={name}
      >
        {children}
      </select>
      {hint ? (
        <p className="text-sm text-subtitle" id={`${name}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? <p className="text-sm font-medium text-foreground">{error}</p> : null}
    </div>
  );
}

export function ProfileForm({ profile, timeZones, currencies }: Props) {
  const [state, action] = useActionState<ProfileState, FormData>(saveProfile, {});
  return (
    <form action={action} className="grid gap-5">
      {state.saved ? <Notice tone="success">Saved.</Notice> : null}
      {state.message ? (
        <Notice title="Not saved" tone="alert">
          {state.message}
        </Notice>
      ) : null}
      <Field
        autoComplete="name"
        defaultValue={profile.displayName ?? ''}
        error={state.errors?.displayName}
        hint="How you appear to the people you invite."
        label="Name"
        name="displayName"
      />
      <Select
        defaultValue={profile.timeZone ?? ''}
        error={state.errors?.timeZone}
        hint="Dates and times are shown in this zone. It started from your device."
        label="Time zone"
        name="timeZone"
      >
        <option value="">Use my device’s time zone</option>
        {timeZones.map((zone) => (
          <option key={zone} value={zone}>
            {zone.replaceAll('_', ' ')}
          </option>
        ))}
      </Select>
      <Select
        defaultValue={profile.currency ?? ''}
        error={state.errors?.currency}
        hint="Amounts you add start in this currency."
        label="Default currency"
        name="currency"
      >
        <option value="">Not set</option>
        {currencies.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </Select>
      <Select
        defaultValue={profile.sharesWith ?? ''}
        label="Who shares responsibility for a child with you?"
        name="sharesWith"
      >
        <option value="">Not saying</option>
        {SHARES_WITH.map((value) => (
          <option key={value} value={value}>
            {SHARES_WITH_LABELS[value]}
          </option>
        ))}
      </Select>
      <SubmitButton className="justify-self-start" pendingLabel="Saving…">
        Save changes
      </SubmitButton>
    </form>
  );
}
