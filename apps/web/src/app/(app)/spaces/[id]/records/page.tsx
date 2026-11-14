import type { Metadata } from 'next';
import Link from 'next/link';
import { ENTRY_TYPES, type Entry, type EntryType } from '../../../../../data/records-types';
import { recordPath, recordsPath } from '../../../../../auth/routes';
import { formatDate, formatTime } from '../../../../../profile/time';
import { EntryForm } from '../../../../../records/EntryForm';
import { spaceContext } from '../../../../../records/context';
import { TYPE_LABELS, TYPE_TINTS, formatMoney, nameOf } from '../../../../../records/labels';
import { type SearchParams, param } from '../../../../../ui/page-props';
import { body, card, focusRing } from '../../../../../ui/styles';

export const metadata: Metadata = { title: 'Records · Nookbud' };

function summary(entry: Entry, zone: string) {
  const c = entry.content;
  if (entry.type === 'expense' && c.amount && c.currency) return formatMoney(c.amount, c.currency);
  if (entry.type === 'event' && c.starts_at) {
    return c.all_day ? formatDate(c.starts_at.slice(0, 10)) : formatTime(c.starts_at, zone);
  }
  if (entry.type === 'agreement' && c.agreed_on) return `Agreed ${formatDate(c.agreed_on)}`;
  return null;
}

/** The timeline (R54, REC-5): every record in the space, newest first, as evidence, not chat. */
export default async function RecordsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const filter = param((await searchParams).type);
  const removed = filter === 'removed';
  const type =
    filter && ENTRY_TYPES.includes(filter as EntryType) ? (filter as EntryType) : undefined;
  const ctx = await spaceContext(id);
  const entries = await ctx.records.list(id, { type, removed });

  const pill = (active: boolean) =>
    `inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium ${focusRing} ${
      active
        ? 'border-foreground bg-foreground text-background'
        : 'border-border text-subtitle hover:text-foreground'
    }`;

  return (
    <div className="grid max-w-[48rem] gap-6">
      <section aria-labelledby="add" className={card}>
        <h2 className="text-[1.375rem] font-semibold leading-[1.3] text-foreground" id="add">
          Add a record
        </h2>
        <p className={`${body} mt-1 text-sm`}>
          Records are never changed silently. If you correct one later, everyone can see what
          changed and when.
        </p>
        <div className="mt-5">
          <EntryForm
            childOptions={ctx.children}
            currencies={ctx.currencies}
            defaultCurrency={ctx.currency}
            people={ctx.people}
            space={id}
            startType={type}
            zone={ctx.zone}
          />
        </div>
      </section>

      <section aria-labelledby="timeline">
        <h2 className="text-[1.375rem] font-semibold leading-[1.3] text-foreground" id="timeline">
          Timeline
        </h2>
        <nav aria-label="Filter records" className="mt-3 flex flex-wrap gap-2">
          <Link
            aria-current={!type && !removed ? 'page' : undefined}
            className={pill(!type && !removed)}
            href={recordsPath(id)}
          >
            All
          </Link>
          {ENTRY_TYPES.map((t) => (
            <Link
              aria-current={type === t ? 'page' : undefined}
              className={pill(type === t)}
              href={`${recordsPath(id)}?type=${t}`}
              key={t}
            >
              {TYPE_LABELS[t]}s
            </Link>
          ))}
          <Link
            aria-current={removed ? 'page' : undefined}
            className={pill(removed)}
            href={`${recordsPath(id)}?type=removed`}
          >
            Removed
          </Link>
        </nav>
        {entries.length === 0 ? (
          <p className={`${body} mt-5`}>
            {removed
              ? 'Nothing has been removed.'
              : type
                ? `No ${TYPE_LABELS[type].toLowerCase()}s yet.`
                : 'Nothing recorded yet.'}
          </p>
        ) : (
          <ol className="mt-5 grid gap-3">
            {entries.map((entry) => {
              const extra = summary(entry, ctx.zone);
              return (
                <li key={entry.id}>
                  <Link
                    className={`${card} block p-5 transition-colors md:p-5 ${focusRing}`}
                    href={recordPath(id, entry.id)}
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-sm px-2 py-0.5 text-[0.8125rem] font-semibold text-foreground ${TYPE_TINTS[entry.type]}`}
                      >
                        {TYPE_LABELS[entry.type]}
                      </span>
                      {entry.removedAt ? (
                        <span className="text-[0.8125rem] font-medium text-subtitle">Removed</span>
                      ) : entry.version > 1 ? (
                        <span className="text-[0.8125rem] font-medium text-subtitle">Edited</span>
                      ) : null}
                      {entry.childId && ctx.childName.get(entry.childId) ? (
                        <span className="text-[0.8125rem] text-subtitle">
                          {ctx.childName.get(entry.childId)}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-2 block break-words text-[1.0625rem] font-semibold text-foreground">
                      {entry.content.title}
                    </span>
                    {extra ? (
                      <span className="mt-0.5 block text-base text-foreground">{extra}</span>
                    ) : null}
                    <span className="mt-1 block text-sm text-subtitle">
                      Added by {nameOf(ctx.names, entry.createdBy)} ·{' '}
                      {formatTime(entry.createdAt, ctx.zone)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
