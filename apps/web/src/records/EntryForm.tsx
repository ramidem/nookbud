'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { type EntryFormState, addRecord, editRecord } from '../auth-actions/records';
import { ENTRY_TYPES, type EntryContent, type EntryType } from '../data/records-types';
import { utcToLocal } from '../profile/time';
import { Field } from '../ui/Field';
import { Notice } from '../ui/Notice';
import { SubmitButton } from '../ui/SubmitButton';
import { input } from '../ui/styles';
import { TYPE_LABELS } from './labels';

type Option = { id: string; name: string };

type Props = {
  space: string;
  people: Option[];
  childOptions: Option[];
  zone: string;
  currencies: string[];
  defaultCurrency: string;
  /** Editing: the record, its type and what it holds now. */
  entry?: { id: string; type: EntryType; content: EntryContent };
  /** Adding: start on this type, and on this day for an event. */
  startType?: EntryType;
  startDate?: string;
  onlyType?: EntryType;
};

function Select({
  label,
  name,
  children,
  defaultValue,
}: {
  label: string;
  name: string;
  children: React.ReactNode;
  defaultValue?: string;
}) {
  const id = `${name}-select`;
  return (
    <div className="grid gap-1.5">
      <label className="text-sm font-medium text-foreground" htmlFor={id}>
        {label}
      </label>
      <select className={input} defaultValue={defaultValue} id={id} name={name}>
        {children}
      </select>
    </div>
  );
}

/** Adding or correcting a record (R54, R55, R56). The fields follow the type. */
export function EntryForm({
  space,
  people,
  childOptions,
  zone,
  currencies,
  defaultCurrency,
  entry,
  startType,
  startDate,
  onlyType,
}: Props) {
  const editing = Boolean(entry);
  const [state, action] = useActionState<EntryFormState, FormData>(
    editing ? editRecord : addRecord,
    {},
  );
  const [type, setType] = useState<EntryType>(entry?.type ?? onlyType ?? startType ?? 'note');
  const c = entry?.content ?? { title: '' };
  const [allDay, setAllDay] = useState(Boolean(c.all_day));
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.done && !editing) form.current?.reset();
  }, [state, editing]);

  const localStart = c.starts_at
    ? utcToLocal(c.starts_at, zone)
    : startDate
      ? `${startDate}T09:00`
      : '';
  const localEnd = c.ends_at ? utcToLocal(c.ends_at, zone) : '';

  return (
    <form action={action} className="grid gap-4" ref={form}>
      <input name="space" type="hidden" value={space} />
      {entry ? <input name="entry" type="hidden" value={entry.id} /> : null}
      {editing || onlyType ? (
        <input name="type" type="hidden" value={type} />
      ) : (
        <fieldset className="grid gap-2">
          <legend className="mb-1 text-sm font-medium text-foreground">Kind of record</legend>
          <div className="flex flex-wrap gap-2">
            {ENTRY_TYPES.map((t) => (
              <label
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-border px-4 text-sm font-medium text-foreground has-[:checked]:border-foreground has-[:checked]:bg-foreground has-[:checked]:text-background"
                key={t}
              >
                <input
                  checked={type === t}
                  className="sr-only"
                  name="type"
                  onChange={() => setType(t)}
                  type="radio"
                  value={t}
                />
                {TYPE_LABELS[t]}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <Field defaultValue={c.title} label="Title" maxLength={120} name="title" required />

      {type === 'event' ? (
        <>
          <label className="flex min-h-11 items-center gap-3 text-sm text-foreground">
            <input
              checked={allDay}
              className="size-5 accent-[var(--primary)]"
              name="allDay"
              onChange={(e) => setAllDay(e.target.checked)}
              type="checkbox"
              value="yes"
            />
            All day
          </label>
          {allDay ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                defaultValue={localStart.slice(0, 10)}
                label="Day"
                name="startDate"
                required
                type="date"
              />
              <Field
                defaultValue={localEnd.slice(0, 10)}
                hint="For an event over several days."
                label="Last day (optional)"
                name="endDate"
                type="date"
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                defaultValue={localStart}
                hint={`Your time zone: ${zone.replaceAll('_', ' ')}.`}
                label="Starts"
                name="startsAt"
                required
                type="datetime-local"
              />
              <Field
                defaultValue={localEnd}
                label="Ends (optional)"
                name="endsAt"
                type="datetime-local"
              />
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              defaultValue={c.location ?? ''}
              label="Place (optional)"
              maxLength={200}
              name="location"
            />
            <Select defaultValue={c.assigned_to ?? ''} label="Who is responsible" name="assignedTo">
              <option value="">Nobody in particular</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
        </>
      ) : null}

      {type === 'expense' ? (
        <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
          <Field
            defaultValue={c.amount ?? ''}
            inputMode="decimal"
            label="Amount"
            min="0.01"
            name="amount"
            required
            step="0.01"
            type="number"
          />
          <Select defaultValue={c.currency ?? defaultCurrency} label="Currency" name="currency">
            {currencies.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </Select>
          <Field
            defaultValue={c.spent_on ?? ''}
            label="Date spent (optional)"
            name="spentOn"
            type="date"
          />
          <Select defaultValue={c.paid_by ?? ''} label="Who paid" name="paidBy">
            <option value="">Not said</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
      ) : null}

      {type === 'agreement' ? (
        <Field
          defaultValue={c.agreed_on ?? ''}
          label="Date agreed (optional)"
          name="agreedOn"
          type="date"
        />
      ) : null}

      {childOptions.length ? (
        <Select defaultValue={c.child_id ?? ''} label="Child (optional)" name="child">
          <option value="">Not about one child</option>
          {childOptions.map((ch) => (
            <option key={ch.id} value={ch.id}>
              {ch.name}
            </option>
          ))}
        </Select>
      ) : null}

      <div className="grid gap-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="body">
          Details (optional)
        </label>
        <textarea
          className={`${input} min-h-24`}
          defaultValue={c.body ?? ''}
          id="body"
          maxLength={5000}
          name="body"
        />
      </div>

      {editing ? (
        <Field
          hint="Everyone in the space sees it in the history."
          label="Why the change (optional)"
          maxLength={500}
          name="reason"
        />
      ) : null}

      {state.message ? <Notice>{state.message}</Notice> : null}
      {state.done ? (
        <Notice tone="success">
          {editing ? 'Saved as a new version.' : 'Added. Everyone in the space can see it.'}
        </Notice>
      ) : null}
      <SubmitButton className="justify-self-start" pendingLabel="Saving…">
        {editing ? 'Save changes' : 'Add record'}
      </SubmitButton>
    </form>
  );
}
