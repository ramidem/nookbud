'use client';

import { useActionState, useEffect, useState } from 'react';
import {
  type FormState,
  type InviteState,
  addChild,
  deleteSpace,
  invite,
  leaveSpace,
  renameSpace,
  updateChild,
} from '../../../../auth-actions/spaces';
import { Field } from '../../../../ui/Field';
import { Notice } from '../../../../ui/Notice';
import { SubmitButton } from '../../../../ui/SubmitButton';
import { button, input } from '../../../../ui/styles';

export function AddChildForm({ space }: { space: string }) {
  const [state, action] = useActionState<FormState<'name' | 'birthDate'>, FormData>(addChild, {});
  return (
    <form
      action={action}
      className="grid gap-4 sm:grid-cols-[1fr_12rem_auto] sm:items-start"
      key={state.done ? Date.now() : 'form'}
    >
      <input name="space" type="hidden" value={space} />
      <Field
        error={state.errors?.name}
        label="Name or nickname"
        maxLength={60}
        name="name"
        required
      />
      <Field
        error={state.errors?.birthDate}
        label="Birth date (optional)"
        name="birthDate"
        type="date"
      />
      <div className="sm:pt-[1.625rem]">
        <SubmitButton pendingLabel="Adding…" variant="secondary">
          Add child
        </SubmitButton>
      </div>
      {state.message ? (
        <div className="sm:col-span-3">
          <Notice>{state.message}</Notice>
        </div>
      ) : null}
    </form>
  );
}

export function InviteForm({ space }: { space: string }) {
  const [state, action] = useActionState<InviteState, FormData>(invite, {});
  const [copied, setCopied] = useState(false);

  return (
    <div className="grid gap-4">
      <form action={action} className="grid gap-4 sm:grid-cols-[1fr_10rem_auto] sm:items-start">
        <input name="space" type="hidden" value={space} />
        <Field
          autoComplete="off"
          error={state.errors?.email}
          inputMode="email"
          label="Their email"
          name="email"
          required
          type="email"
        />
        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="role">
            Role
          </label>
          <select className={input} defaultValue="member" id="role" name="role">
            <option value="member">Member</option>
            <option value="owner">Owner</option>
          </select>
        </div>
        <div className="sm:pt-[1.625rem]">
          <SubmitButton pendingLabel="Creating link…">Invite</SubmitButton>
        </div>
      </form>
      {state.message ? <Notice>{state.message}</Notice> : null}
      {state.link ? (
        <Notice title="Invitation ready" tone="success">
          <p>
            Send this link to {state.invited}. Only they can use it, once, within 7 days. Copy it
            now: it is not shown again.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              aria-label="Invitation link"
              className={`${input} min-w-0 flex-1 font-mono text-sm`}
              readOnly
              value={state.link}
            />
            <button
              className={button.secondary}
              onClick={async () => {
                await navigator.clipboard.writeText(state.link ?? '');
                setCopied(true);
              }}
              type="button"
            >
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
        </Notice>
      ) : null}
    </div>
  );
}

export function RenameForm({ space, name }: { space: string; name: string }) {
  const [state, action] = useActionState<FormState<'name'>, FormData>(renameSpace, {});
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
      <input name="space" type="hidden" value={space} />
      <Field
        defaultValue={name}
        error={state.errors?.name}
        label="Space name"
        maxLength={80}
        name="name"
        required
      />
      <div className="sm:pt-[1.625rem]">
        <SubmitButton pendingLabel="Saving…" variant="secondary">
          Rename
        </SubmitButton>
      </div>
      {state.done ? <Notice tone="success">Renamed.</Notice> : null}
      {state.message ? <Notice>{state.message}</Notice> : null}
    </form>
  );
}

export function DeleteSpaceForm({ space, name }: { space: string; name: string }) {
  const [state, action] = useActionState<FormState<'confirm'>, FormData>(deleteSpace, {});
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button
        className={`${button.secondary} justify-self-start`}
        onClick={() => setOpen(true)}
        type="button"
      >
        Delete space…
      </button>
    );
  }
  return (
    <form action={action} className="grid gap-4 rounded-xl border border-error p-5">
      <input name="space" type="hidden" value={space} />
      <p className="text-base leading-[1.55] text-foreground">
        Everyone loses access to <strong className="font-semibold">{name}</strong> at once, and open
        invitations stop working. You cannot undo it.
      </p>
      {state.message ? <Notice tone="alert">{state.message}</Notice> : null}
      <Field
        autoComplete="off"
        error={state.errors?.confirm}
        hint={`Type “${name}” to confirm.`}
        label="Space name"
        name="confirm"
        required
      />
      <div className="flex flex-wrap gap-3">
        <SubmitButton pendingLabel="Deleting…" variant="danger">
          Delete space
        </SubmitButton>
        <button className={button.ghost} onClick={() => setOpen(false)} type="button">
          Cancel
        </button>
      </div>
    </form>
  );
}

export function LeaveForm({ space }: { space: string }) {
  const [state, action] = useActionState<FormState, FormData>(leaveSpace, {});
  return (
    <form action={action} className="grid gap-3">
      <input name="space" type="hidden" value={space} />
      {state.message ? <Notice>{state.message}</Notice> : null}
      <SubmitButton className="justify-self-start" pendingLabel="Leaving…" variant="secondary">
        Leave space
      </SubmitButton>
    </form>
  );
}

/** Correcting a child's details (R52). Opens in place, under the child's name. */
export function EditChildForm({
  space,
  child,
}: {
  space: string;
  child: { id: string; name: string; birthDate: string | null };
}) {
  const [state, action] = useActionState<FormState<'name' | 'birthDate'>, FormData>(
    updateChild,
    {},
  );
  const [open, setOpen] = useState(false);
  // A saved change closes the form; the page shows the new details.
  useEffect(() => {
    if (state.done) setOpen(false);
  }, [state]);
  if (!open) {
    return (
      <button
        aria-label={`Edit ${child.name}`}
        className={`${button.ghost} text-sm`}
        onClick={() => setOpen(true)}
        type="button"
      >
        Edit
      </button>
    );
  }
  return (
    <form
      action={action}
      className="grid basis-full gap-4 sm:grid-cols-[1fr_12rem_auto] sm:items-start"
    >
      <input name="space" type="hidden" value={space} />
      <input name="child" type="hidden" value={child.id} />
      <Field
        defaultValue={child.name}
        error={state.errors?.name}
        id={`name-${child.id}`}
        label="Name or nickname"
        maxLength={60}
        name="name"
        required
      />
      <Field
        defaultValue={child.birthDate ?? ''}
        error={state.errors?.birthDate}
        id={`birth-${child.id}`}
        label="Birth date (optional)"
        name="birthDate"
        type="date"
      />
      <div className="flex gap-2 sm:pt-[1.625rem]">
        <SubmitButton pendingLabel="Saving…" variant="secondary">
          Save
        </SubmitButton>
        <button className={button.ghost} onClick={() => setOpen(false)} type="button">
          Cancel
        </button>
      </div>
      {state.message ? (
        <div className="sm:col-span-3">
          <Notice>{state.message}</Notice>
        </div>
      ) : null}
    </form>
  );
}
