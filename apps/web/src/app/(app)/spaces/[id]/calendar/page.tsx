import type { Metadata } from 'next';
import Link from 'next/link';
import { getSchedules } from '@/data';
import { calendarPath, recordPath, spacePath } from '../../../../../auth/routes';
import { whoseDay } from '../../../../../profile/schedule';
import {
  addDays,
  dateInZone,
  formatDate,
  formatTime,
  localToUtc,
  todayIn,
} from '../../../../../profile/time';
import { EntryForm } from '../../../../../records/EntryForm';
import { spaceContext } from '../../../../../records/context';
import { nameOf } from '../../../../../records/labels';
import { type SearchParams, param } from '../../../../../ui/page-props';
import { body, button, card, focusRing, link } from '../../../../../ui/styles';
import { AnswerForm, RequestForm, ScheduleForm } from './ScheduleForms';

export const metadata: Metadata = { title: 'Calendar · Nookbud' };

// Each person's days get a color from the brand palette, always with their name beside it.
const HOME_COLORS = [
  'bg-home-a',
  'bg-home-b',
  'bg-tint-taupe',
  'bg-tint-terracotta',
  'bg-tint-sage',
];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const STATUS_WORDS = {
  approved: 'Approved',
  declined: 'Declined',
  pending: 'Waiting',
  withdrawn: 'Withdrawn',
};
const sectionTitle = 'text-[1.375rem] font-semibold leading-[1.3] text-foreground';

/** The shared calendar (R56–R58): a month, whose day each day is, events, and change requests. */
export default async function CalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const ctx = await spaceContext(id);
  const today = todayIn(ctx.zone);
  const month = /^\d{4}-\d{2}$/.test(param((await searchParams).month) ?? '')
    ? (param((await searchParams).month) as string)
    : today.slice(0, 7);

  const first = `${month}-01`;
  const weekday = (new Date(`${first}T00:00:00Z`).getUTCDay() + 6) % 7; // Monday is 0
  const gridStart = addDays(first, -weekday);
  const nextMonth = addDays(first, 32).slice(0, 7);
  const prevMonth = addDays(first, -1).slice(0, 7);
  const lastOfMonth = addDays(`${nextMonth}-01`, -1);
  const weeks = Math.ceil((weekday + Number(lastOfMonth.slice(8))) / 7);
  const days = Array.from({ length: weeks * 7 }, (_, i) => addDays(gridStart, i));

  const schedules = await getSchedules();
  const [events, schedule, requests] = await Promise.all([
    ctx.records.events(
      id,
      localToUtc(`${days[0]}T00:00`, ctx.zone),
      localToUtc(`${addDays(days[days.length - 1], 1)}T00:00`, ctx.zone),
    ),
    schedules.get(id),
    schedules.requests(id),
  ]);

  const colorOf = new Map(ctx.people.map((p, i) => [p.id, HOME_COLORS[i % HOME_COLORS.length]]));
  const eventsOn = (day: string) =>
    events.filter((e) => {
      const start = dateInZone(e.content.starts_at ?? e.createdAt, ctx.zone);
      const end = e.content.ends_at ? dateInZone(e.content.ends_at, ctx.zone) : start;
      return start <= day && day <= end;
    });
  const pending = requests.filter((r) => r.status === 'pending');
  const answered = requests.filter((r) => r.status !== 'pending').slice(0, 10);
  const monthName = formatDate(first, {
    weekday: undefined,
    day: undefined,
    month: 'long',
    year: 'numeric',
  });
  const anyoneHasDays = schedule !== null || requests.some((r) => r.status === 'approved');

  return (
    <div className="grid gap-6 [&>*]:min-w-0">
      {!ctx.zoneIsSet ? (
        <p className={`${body} text-sm`}>
          Times are shown in UTC. Set your time zone in{' '}
          <Link className={link} href="/settings">
            Settings
          </Link>
          .
        </p>
      ) : null}

      <section aria-labelledby="month" className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className={sectionTitle} id="month">
            {monthName}
          </h2>
          <nav aria-label="Months" className="flex max-w-full flex-wrap gap-1">
            <Link
              className={`${button.ghost} text-sm`}
              href={`${calendarPath(id)}?month=${prevMonth}`}
            >
              ← Previous
            </Link>
            <Link className={`${button.ghost} text-sm`} href={calendarPath(id)}>
              Today
            </Link>
            <Link
              className={`${button.ghost} text-sm`}
              href={`${calendarPath(id)}?month=${nextMonth}`}
            >
              Next →
            </Link>
          </nav>
        </div>

        {anyoneHasDays ? (
          <ul
            aria-label="Whose days"
            className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-subtitle"
          >
            {ctx.people.map((p) => (
              <li className="flex items-center gap-2" key={p.id}>
                <span aria-hidden="true" className={`size-3 rounded-full ${colorOf.get(p.id)}`} />
                {p.name}’s days
              </li>
            ))}
          </ul>
        ) : null}

        <ol className="mt-4 grid gap-2 md:hidden">
          {days
            .filter((day) => day.startsWith(month))
            .map((day) => {
              const owner = whoseDay(day, schedule, requests);
              const list = eventsOn(day);
              return (
                <li
                  className={`rounded-lg border border-border p-3 ${day === today ? 'bg-neutral-50' : 'bg-surface'}`}
                  key={day}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">
                      <time dateTime={day}>{formatDate(day, { year: undefined })}</time>
                      {day === today ? <span className="text-subtitle"> · Today</span> : null}
                    </p>
                    {owner ? (
                      <p
                        className={`truncate rounded-sm px-1.5 py-0.5 text-[0.75rem] font-medium text-foreground ${colorOf.get(owner) ?? 'bg-neutral-200'}`}
                      >
                        {nameOf(ctx.names, owner)}
                      </p>
                    ) : null}
                  </div>
                  {list.length ? (
                    <ul className="mt-2 grid gap-1">
                      {list.map((e) => (
                        <li key={e.id}>
                          <Link
                            className={`block text-sm leading-[1.4] text-foreground underline-offset-2 hover:underline ${focusRing}`}
                            href={recordPath(id, e.id)}
                          >
                            {e.content.all_day
                              ? ''
                              : `${formatTime(e.content.starts_at ?? e.createdAt, ctx.zone, { weekday: undefined, day: undefined, month: undefined })} `}
                            {e.content.title}
                            {e.content.outcome === 'missed'
                              ? ' (missed)'
                              : e.content.outcome === 'done'
                                ? ' ✓'
                                : ''}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
        </ol>

        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full table-fixed border-collapse">
            <caption className="sr-only">
              {monthName}: whose day each day is, and the events
            </caption>
            <thead>
              <tr>
                {WEEKDAYS.map((d) => (
                  <th
                    className="pb-2 text-left text-[0.8125rem] font-medium text-subtitle"
                    key={d}
                    scope="col"
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: weeks }, (_, w) => (
                <tr key={w}>
                  {days.slice(w * 7, w * 7 + 7).map((day) => {
                    const owner = whoseDay(day, schedule, requests);
                    const inMonth = day.startsWith(month);
                    const list = eventsOn(day);
                    return (
                      <td
                        className={`h-28 border border-border p-1.5 align-top ${inMonth ? 'bg-surface' : 'bg-neutral-50'}`}
                        key={day}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span
                            aria-label={formatDate(day)}
                            className={`text-sm ${day === today ? 'flex size-7 items-center justify-center rounded-full bg-foreground font-semibold text-background' : inMonth ? 'text-foreground' : 'text-subtitle'}`}
                          >
                            {Number(day.slice(8))}
                          </span>
                        </div>
                        {owner ? (
                          <p
                            className={`mt-1 truncate rounded-sm px-1.5 py-0.5 text-[0.75rem] font-medium text-foreground ${colorOf.get(owner) ?? 'bg-neutral-200'}`}
                          >
                            {nameOf(ctx.names, owner)}
                          </p>
                        ) : null}
                        <ul className="mt-1 grid gap-0.5">
                          {list.map((e) => (
                            <li key={e.id}>
                              <Link
                                className={`block truncate rounded-sm text-[0.75rem] leading-[1.4] text-foreground underline-offset-2 hover:underline ${focusRing}`}
                                href={recordPath(id, e.id)}
                              >
                                {e.content.all_day
                                  ? ''
                                  : `${formatTime(e.content.starts_at ?? e.createdAt, ctx.zone, { weekday: undefined, day: undefined, month: undefined })} `}
                                {e.content.title}
                                {e.content.outcome === 'missed'
                                  ? ' (missed)'
                                  : e.content.outcome === 'done'
                                    ? ' ✓'
                                    : ''}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <section aria-labelledby="add-event" className={card}>
          <h2 className={sectionTitle} id="add-event">
            Add an event
          </h2>
          <p className={`${body} mt-1 text-sm`}>
            Handoffs, appointments, school events. Name who is responsible.
          </p>
          <div className="mt-4">
            <EntryForm
              childOptions={ctx.children}
              currencies={ctx.currencies}
              defaultCurrency={ctx.currency}
              onlyType="event"
              people={ctx.people}
              space={id}
              startDate={today}
              zone={ctx.zone}
            />
          </div>
        </section>

        <section aria-labelledby="changes" className={card}>
          <h2 className={sectionTitle} id="changes">
            Change some days
          </h2>
          <p className={`${body} mt-1 text-sm`}>
            Ask for days to be someone else’s. Another person in the space approves or declines.
          </p>
          {pending.length ? (
            <ul className="mt-4 grid gap-4">
              {pending.map((r) => (
                <li className="rounded-xl p-4" key={r.id}>
                  <p className="text-base text-foreground">
                    <strong className="font-semibold">{nameOf(ctx.names, r.requestedBy)}</strong>{' '}
                    asks for {formatDate(r.startsOn)}
                    {r.endsOn !== r.startsOn ? ` to ${formatDate(r.endsOn)}` : ''} to be{' '}
                    <strong className="font-semibold">{nameOf(ctx.names, r.assignee)}</strong>’s.
                  </p>
                  {r.reason ? <p className="mt-1 text-sm text-subtitle">“{r.reason}”</p> : null}
                  <div className="mt-3">
                    <AnswerForm mine={r.requestedBy === ctx.me} request={r.id} space={id} />
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-5">
            <RequestForm people={ctx.people} space={id} />
          </div>
          {answered.length ? (
            <div className="mt-6">
              <h3 className="text-base font-semibold text-foreground">Earlier requests</h3>
              <ul className="mt-2 divide-y divide-border border-y border-border text-sm">
                {answered.map((r) => (
                  <li className="py-3 text-foreground" key={r.id}>
                    {formatDate(r.startsOn)}
                    {r.endsOn !== r.startsOn ? ` to ${formatDate(r.endsOn)}` : ''} for{' '}
                    {nameOf(ctx.names, r.assignee)} ·{' '}
                    <span className="font-medium">{STATUS_WORDS[r.status]}</span>
                    <span className="text-subtitle">
                      {' '}
                      · asked by {nameOf(ctx.names, r.requestedBy)}
                      {r.respondedBy ? `, answered by ${nameOf(ctx.names, r.respondedBy)}` : ''}
                      {r.respondedAt ? `, ${formatTime(r.respondedAt, ctx.zone)}` : ''}
                    </span>
                    {r.responseNote ? (
                      <span className="text-subtitle"> · “{r.responseNote}”</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      </div>

      <section aria-labelledby="schedule" className={card}>
        <h2 className={sectionTitle} id="schedule">
          Parenting schedule
        </h2>
        {schedule ? (
          <p className={`${body} mt-1`}>
            A {schedule.pattern.length}-day pattern from {formatDate(schedule.startsOn)}. Last
            changed by {nameOf(ctx.names, schedule.updatedBy)},{' '}
            {formatTime(schedule.updatedAt, ctx.zone)} (version {schedule.version}).
          </p>
        ) : (
          <p className={`${body} mt-1`}>
            No schedule yet.{' '}
            {ctx.owner
              ? 'Set up which home a child is in, day by day.'
              : 'An owner of the space can set it up.'}
          </p>
        )}
        {ctx.owner ? (
          <div className="mt-4">
            {ctx.people.length < 2 ? (
              <p className={`${body} text-sm`}>
                A schedule shares days between people.{' '}
                <Link className={link} href={spacePath(id)}>
                  Invite someone
                </Link>{' '}
                first, or set it up day by day.
              </p>
            ) : null}
            <div className="mt-3">
              <ScheduleForm current={schedule} people={ctx.people} space={id} />
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
