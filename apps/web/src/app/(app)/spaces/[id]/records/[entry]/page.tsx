import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { EntryContent, EntryVersion } from '../../../../../../data/records-types';
import { calendarPath, recordsPath } from '../../../../../../auth/routes';
import { formatDate, formatTime } from '../../../../../../profile/time';
import { EntryForm } from '../../../../../../records/EntryForm';
import { spaceContext } from '../../../../../../records/context';
import { diffContent } from '../../../../../../records/diff';
import { TYPE_LABELS, TYPE_TINTS, formatMoney, nameOf } from '../../../../../../records/labels';
import { Notice } from '../../../../../../ui/Notice';
import { type SearchParams, param } from '../../../../../../ui/page-props';
import { body, card, link } from '../../../../../../ui/styles';
import { OutcomeForm, RemoveForm } from './EntryActions';

export const metadata: Metadata = { title: 'Record · Nookbud' };

const CHANGE_WORDS: Record<EntryVersion['change'], string> = {
  created: 'Added',
  edited: 'Edited',
  outcome: 'Outcome recorded',
  removed: 'Removed',
};

export default async function RecordPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; entry: string }>;
  searchParams: SearchParams;
}) {
  const { id, entry: entryId } = await params;
  const note = param((await searchParams).note);
  const ctx = await spaceContext(id);
  const found = await ctx.records.get(entryId);
  if (!found || found.entry.spaceId !== id) notFound();
  const { entry, versions } = found;
  const c = entry.content;
  const author = entry.createdBy !== null && entry.createdBy === ctx.me;
  const responsible = c.assigned_to !== null && c.assigned_to === ctx.me;

  const show = (field: keyof EntryContent, value: unknown): string => {
    if (value === null || value === undefined || value === '') return '—';
    if (field === 'starts_at' || field === 'ends_at') return formatTime(String(value), ctx.zone);
    if (field === 'spent_on' || field === 'agreed_on') return formatDate(String(value));
    if (field === 'assigned_to' || field === 'paid_by') return nameOf(ctx.names, String(value));
    if (field === 'child_id')
      return ctx.childName.get(String(value)) ?? 'A child no longer in the space';
    if (field === 'all_day') return value ? 'Yes' : 'No';
    if (field === 'amount') return formatMoney(Number(value), c.currency ?? 'PHP');
    if (field === 'outcome') return value === 'done' ? 'It happened' : 'It was missed';
    return String(value);
  };

  const facts: [string, string][] = [];
  if (entry.type === 'event' && c.starts_at) {
    facts.push([
      'When',
      c.all_day
        ? `${formatDate(c.starts_at.slice(0, 10))}, all day`
        : `${formatTime(c.starts_at, ctx.zone)}${c.ends_at ? ` to ${formatTime(c.ends_at, ctx.zone)}` : ''}`,
    ]);
    if (c.location) facts.push(['Place', c.location]);
    facts.push([
      'Responsible',
      c.assigned_to ? nameOf(ctx.names, c.assigned_to) : 'Nobody in particular',
    ]);
    if (c.outcome)
      facts.push([
        'What happened',
        `${show('outcome', c.outcome)}${c.outcome_note ? `: ${c.outcome_note}` : ''}`,
      ]);
  }
  if (entry.type === 'expense' && c.amount && c.currency) {
    facts.push(['Amount', formatMoney(c.amount, c.currency)]);
    if (c.spent_on) facts.push(['Spent', formatDate(c.spent_on)]);
    if (c.paid_by) facts.push(['Paid by', nameOf(ctx.names, c.paid_by)]);
  }
  if (entry.type === 'agreement' && c.agreed_on) facts.push(['Agreed', formatDate(c.agreed_on)]);
  if (entry.childId) facts.push(['Child', show('child_id', entry.childId)]);
  facts.push([
    'Added',
    `${nameOf(ctx.names, entry.createdBy)}, ${formatTime(entry.createdAt, ctx.zone)}`,
  ]);

  return (
    <div className="grid max-w-[48rem] gap-6">
      <Link
        className={`${link} text-sm`}
        href={entry.type === 'event' ? calendarPath(id) : recordsPath(id)}
      >
        {entry.type === 'event' ? 'Back to the calendar' : 'Back to the timeline'}
      </Link>

      {note === 'removed' || entry.removedAt ? (
        <Notice title="This record was removed">
          It is no longer in the timeline, but it is listed under Removed, and its history below is
          kept, so everyone can see it existed.
        </Notice>
      ) : null}

      <article className={card}>
        <span
          className={`rounded-sm px-2 py-0.5 text-[0.8125rem] font-semibold text-foreground ${TYPE_TINTS[entry.type]}`}
        >
          {TYPE_LABELS[entry.type]}
        </span>
        <h2 className="mt-3 break-words text-[1.5rem] font-semibold leading-[1.25] tracking-[-0.5px] text-foreground sm:text-[1.75rem]">
          {c.title}
        </h2>
        <dl className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-[10rem_1fr]">
          {facts.map(([label, value]) => (
            <div className="contents" key={label}>
              <dt className="text-sm font-medium text-subtitle">{label}</dt>
              <dd className="m-0 min-w-0 break-words text-base text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
        {c.body ? (
          <p className="mt-4 whitespace-pre-line break-words text-base leading-[1.55] text-foreground">
            {c.body}
          </p>
        ) : null}
      </article>

      {entry.type === 'event' && !entry.removedAt && (author || responsible) ? (
        <section aria-labelledby="outcome" className={card}>
          <h2 className="text-[1.375rem] font-semibold text-foreground" id="outcome">
            What happened
          </h2>
          <p className={`${body} mt-1 text-sm`}>
            The person who added the event or the person responsible records this.
          </p>
          <div className="mt-4">
            <OutcomeForm entry={entry.id} outcome={c.outcome ?? null} space={id} />
          </div>
        </section>
      ) : null}

      {author && !entry.removedAt ? (
        <section aria-labelledby="correct" className={card}>
          <h2 className="text-[1.375rem] font-semibold text-foreground" id="correct">
            Correct this record
          </h2>
          <p className={`${body} mt-1 text-sm`}>
            Your change is saved as a new version. The earlier ones stay in the history.
          </p>
          <div className="mt-4 grid gap-6">
            <EntryForm
              childOptions={ctx.children}
              currencies={ctx.currencies}
              defaultCurrency={ctx.currency}
              entry={{ id: entry.id, type: entry.type, content: c }}
              people={ctx.people}
              space={id}
              zone={ctx.zone}
            />
            <RemoveForm entry={entry.id} space={id} />
          </div>
        </section>
      ) : null}

      <section aria-labelledby="history" className={card}>
        <h2 className="text-[1.375rem] font-semibold text-foreground" id="history">
          History
        </h2>
        <p className={`${body} mt-1 text-sm`}>
          Every version of this record, oldest first. Nothing here can be changed.
        </p>
        <ol className="mt-4 grid gap-4 border-l-2 border-border pl-5">
          {versions.map((v, i) => {
            const changes = i === 0 ? [] : diffContent(versions[i - 1].content, v.content);
            return (
              <li key={v.version}>
                <p className="text-base font-semibold text-foreground">
                  {CHANGE_WORDS[v.change]} by {nameOf(ctx.names, v.changedBy)}
                </p>
                <p className="text-sm text-subtitle">
                  Version {v.version} · {formatTime(v.createdAt, ctx.zone)}
                </p>
                {v.reason ? <p className="mt-1 text-sm text-foreground">“{v.reason}”</p> : null}
                {changes.length ? (
                  <ul className="mt-2 grid gap-1 break-words text-sm">
                    {changes.map((ch) => (
                      <li className="text-foreground" key={ch.field}>
                        <span className="font-medium">{ch.label}:</span>{' '}
                        <del className="text-subtitle">{show(ch.field, ch.before)}</del> →{' '}
                        <ins className="no-underline">{show(ch.field, ch.after)}</ins>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
