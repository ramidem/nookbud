'use client';

import { useActionState, useState } from 'react';
import {
  type ScheduleState,
  answerChange,
  requestChange,
  saveSchedule,
} from '../../../../../auth-actions/schedule';
import { Field } from '../../../../../ui/Field';
import { Notice } from '../../../../../ui/Notice';
import { SubmitButton } from '../../../../../ui/SubmitButton';
import { button, input } from '../../../../../ui/styles';

type Person = { id: string; name: string };

function PersonSelect({
  label,
  name,
  people,
  defaultValue,
  allowNobody,
}: {
  label: string;
  name: string;
  people: Person[];
  defaultValue?: string | null;
  allowNobody?: boolean;
}) {
  const id = `${name}-${label.replace(/\W/g, '')}`;
  return (
    <div className="grid gap-1.5">
      <label className="text-sm font-medium text-foreground" htmlFor={id}>
        {label}
      </label>
      <select className={input} defaultValue={defaultValue ?? ''} id={id} name={name}>
        {allowNobody ? <option value="">Nobody</option> : <option value="">Choose someone</option>}
        {people.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}

const PRESETS = [
  ['week', 'A week each'],
  ['alternate', 'Every other day'],
  ['2-2-3', '2-2-3 (over two weeks)'],
  ['custom', 'Day by day'],
] as const;

/** R57: the parenting schedule, from a preset or day by day. */
export function ScheduleForm({
  space,
  people,
  current,
}: {
  space: string;
  people: Person[];
  current: { startsOn: string; pattern: (string | null)[] } | null;
}) {
  const [state, action] = useActionState<ScheduleState, FormData>(saveSchedule, {});
  const [preset, setPreset] = useState<(typeof PRESETS)[number][0]>(current ? 'custom' : 'week');
  const [length, setLength] = useState(current?.pattern.length ?? 14);
  const firsts = current?.pattern ?? [];

  return (
    <form action={action} className="grid gap-4">
      <input name="space" type="hidden" value={space} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="preset">
            Pattern
          </label>
          <select
            className={input}
            id="preset"
            name="preset"
            onChange={(e) => setPreset(e.target.value as typeof preset)}
            value={preset}
          >
            {PRESETS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <Field
          defaultValue={current?.startsOn ?? ''}
          hint="The pattern repeats from this day."
          label="First day"
          name="startsOn"
          required
          type="date"
        />
      </div>
      {preset === 'custom' ? (
        <>
          <div className="grid gap-1.5 sm:max-w-[12rem]">
            <label className="text-sm font-medium text-foreground" htmlFor="length">
              Days before it repeats
            </label>
            <input
              className={input}
              id="length"
              max={28}
              min={1}
              onChange={(e) => setLength(Math.min(28, Math.max(1, Number(e.target.value) || 1)))}
              type="number"
              value={length}
            />
          </div>
          <ol className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length }, (_, i) => (
              <li key={i}>
                <PersonSelect
                  allowNobody
                  defaultValue={firsts[i] ?? null}
                  label={`Day ${i + 1}`}
                  name="day"
                  people={people}
                />
              </li>
            ))}
          </ol>
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <PersonSelect label="First" name="first" people={people} />
          <PersonSelect label="Then" name="second" people={people} />
        </div>
      )}
      {state.message ? <Notice>{state.message}</Notice> : null}
      {state.done ? (
        <Notice tone="success">
          Saved. The calendar shows the new pattern, and the change is in the history.
        </Notice>
      ) : null}
      <SubmitButton className="justify-self-start" pendingLabel="Saving…" variant="secondary">
        Save the schedule
      </SubmitButton>
    </form>
  );
}

/** R58: ask for some days. */
export function RequestForm({ space, people }: { space: string; people: Person[] }) {
  const [state, action] = useActionState<ScheduleState, FormData>(requestChange, {});
  return (
    <form action={action} className="grid gap-4" key={state.done ? 'sent' : 'form'}>
      <input name="space" type="hidden" value={space} />
      {state.done ? (
        <Notice tone="success">Asked. Someone else in the space can approve or decline it.</Notice>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="From" name="from" required type="date" />
        <Field label="To" name="to" required type="date" />
        <PersonSelect label="Whose days" name="assignee" people={people} />
      </div>
      <Field label="Why (optional)" maxLength={500} name="reason" />
      {state.message ? <Notice>{state.message}</Notice> : null}
      <SubmitButton className="justify-self-start" pendingLabel="Sending…" variant="secondary">
        Ask for the change
      </SubmitButton>
    </form>
  );
}

export function AnswerForm({
  space,
  request,
  mine,
}: {
  space: string;
  request: string;
  mine: boolean;
}) {
  const [state, action] = useActionState<ScheduleState, FormData>(answerChange, {});
  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <input name="space" type="hidden" value={space} />
      <input name="request" type="hidden" value={request} />
      {mine ? (
        <button className={`${button.ghost} text-sm`} name="answer" type="submit" value="withdraw">
          Withdraw
        </button>
      ) : (
        <>
          <div className="min-w-[12rem] flex-1">
            <Field id={`note-${request}`} label="Note (optional)" maxLength={500} name="note" />
          </div>
          <button className={button.primary} name="answer" type="submit" value="approve">
            Approve
          </button>
          <button className={button.secondary} name="answer" type="submit" value="decline">
            Decline
          </button>
        </>
      )}
      {state.message ? (
        <div className="basis-full">
          <Notice>{state.message}</Notice>
        </div>
      ) : null}
    </form>
  );
}
