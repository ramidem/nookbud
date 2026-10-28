'use client';

import { useActionState, useState } from 'react';
import {
  type EntryFormState,
  removeRecord,
  setOutcome,
} from '../../../../../../auth-actions/records';
import { Field } from '../../../../../../ui/Field';
import { Notice } from '../../../../../../ui/Notice';
import { SubmitButton } from '../../../../../../ui/SubmitButton';
import { button } from '../../../../../../ui/styles';

export function OutcomeForm({
  space,
  entry,
  outcome,
}: {
  space: string;
  entry: string;
  outcome: 'done' | 'missed' | null;
}) {
  const [state, action] = useActionState<EntryFormState, FormData>(setOutcome, {});
  return (
    <form action={action} className="grid gap-4">
      <input name="space" type="hidden" value={space} />
      <input name="entry" type="hidden" value={entry} />
      <fieldset className="flex flex-wrap gap-2">
        <legend className="mb-2 text-sm font-medium text-foreground">What happened</legend>
        {(
          [
            ['done', 'It happened'],
            ['missed', 'It was missed'],
            ['', 'Not recorded'],
          ] as const
        ).map(([value, label]) => (
          <label
            className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-border px-4 text-sm font-medium text-foreground has-[:checked]:border-foreground has-[:checked]:bg-foreground has-[:checked]:text-background"
            key={value}
          >
            <input
              className="sr-only"
              defaultChecked={(outcome ?? '') === value}
              name="outcome"
              type="radio"
              value={value}
            />
            {label}
          </label>
        ))}
      </fieldset>
      <Field label="Note (optional)" maxLength={500} name="note" />
      {state.message ? <Notice>{state.message}</Notice> : null}
      {state.done ? <Notice tone="success">Recorded.</Notice> : null}
      <SubmitButton className="justify-self-start" pendingLabel="Saving…" variant="secondary">
        Save what happened
      </SubmitButton>
    </form>
  );
}

export function RemoveForm({ space, entry }: { space: string; entry: string }) {
  const [state, action] = useActionState<EntryFormState, FormData>(removeRecord, {});
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button
        className={`${button.secondary} justify-self-start`}
        onClick={() => setOpen(true)}
        type="button"
      >
        Remove record…
      </button>
    );
  }
  return (
    <form action={action} className="grid gap-4 rounded-xl border border-error p-5">
      <input name="space" type="hidden" value={space} />
      <input name="entry" type="hidden" value={entry} />
      <p className="text-base leading-[1.55] text-foreground">
        It leaves the timeline, but stays in its history, marked removed. Everyone in the space can
        still see that it existed.
      </p>
      <Field label="Why (optional)" maxLength={500} name="reason" />
      {state.message ? <Notice>{state.message}</Notice> : null}
      <div className="flex flex-wrap gap-3">
        <SubmitButton pendingLabel="Removing…" variant="danger">
          Remove
        </SubmitButton>
        <button className={button.ghost} onClick={() => setOpen(false)} type="button">
          Cancel
        </button>
      </div>
    </form>
  );
}
