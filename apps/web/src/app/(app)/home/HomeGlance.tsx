import Link from 'next/link';
import { selectHomeSpace } from '../../../auth-actions/home';
import { acceptMyInvitation } from '../../../auth-actions/spaces';
import { SPACES, calendarPath, recordPath } from '../../../auth/routes';
import { TYPE_LABELS, TYPE_TINTS } from '../../../records/labels';
import { Notice } from '../../../ui/Notice';
import { body, button, card, focusRing, heading, link } from '../../../ui/styles';
import type { GlanceAlert, GlanceView } from './glance';

const sectionTitle = 'text-[1.375rem] font-semibold leading-[1.3] text-foreground';
const row = `${card} block p-5 transition-colors hover:border-border-strong md:p-5 ${focusRing}`;
const pill = 'inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium';

function Switcher({
  spaces,
  selectedId,
}: {
  spaces: { id: string; name: string }[];
  selectedId: string;
}) {
  if (spaces.length < 2) return null;
  return (
    <nav aria-label="Your spaces" className="mt-4 flex flex-wrap gap-2">
      {spaces.map((space) =>
        space.id === selectedId ? (
          <span
            aria-current="page"
            className={`${pill} border-foreground bg-foreground text-background`}
            key={space.id}
          >
            {space.name}
          </span>
        ) : (
          <form action={selectHomeSpace} key={space.id}>
            <input name="space" type="hidden" value={space.id} />
            <button
              className={`${pill} ${focusRing} border-border text-subtitle hover:text-foreground`}
              type="submit"
            >
              {space.name}
            </button>
          </form>
        ),
      )}
    </nav>
  );
}

function OtherSpaceLine({ alert, label }: { alert: GlanceAlert; label: string }) {
  return (
    <form action={selectHomeSpace}>
      <input name="space" type="hidden" value={alert.id} />
      <button
        aria-label={`${label}: ${alert.name}, ${alert.count}`}
        className={`${row} w-full text-left`}
        type="submit"
      >
        <span className="font-semibold text-foreground">{alert.name}</span>
        <span className="mt-1 block text-sm text-subtitle">{alert.count}</span>
      </button>
    </form>
  );
}

export function EmptyHome({ name }: { name: string | null }) {
  return (
    <div className="grid gap-8">
      <div>
        <h1 className={heading}>{name ? `Hello, ${name}` : 'Hello'}</h1>
        <p className={`${body} mt-2`}>
          You have no spaces yet. Create one on{' '}
          <Link className={link} href={SPACES}>
            Spaces
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

/** Ten seconds, one space: whose day, what is coming up, what needs you, and what was just written. */
export function HomeGlance({ note, view }: { note?: string; view: GlanceView }) {
  const showNeeds =
    view.needsYou.length > 0 || view.invitations.length > 0 || view.otherNeeds.length > 0;
  const showWaiting = view.waitingOn.length > 0 || view.otherWaiting.length > 0;
  const calendar = calendarPath(view.spaceId);

  return (
    <div className="grid gap-8">
      <div>
        <h1 className={heading}>{view.greeting}</h1>
        <p className={`${body} mt-2`}>{view.spaceName}</p>
        <Switcher selectedId={view.spaceId} spaces={view.spaces} />
      </div>

      {note ? <Notice>{note}</Notice> : null}

      <section aria-labelledby="whose-day" className={card}>
        <h2 className={sectionTitle} id="whose-day">
          Whose day it is
        </h2>
        {view.whoseDay.kind === 'none' ? (
          <p className={`${body} mt-2`}>
            No schedule yet.
            {view.owner ? (
              <>
                {' '}
                <Link className={link} href={calendar}>
                  Set it up on the calendar
                </Link>
                .
              </>
            ) : null}
          </p>
        ) : (
          <p className={`${body} mt-2`}>
            Today is {view.whoseDay.name}’s.
            {view.whoseDay.next
              ? ` Next, ${view.whoseDay.next.name}’s from ${view.whoseDay.next.date}.`
              : null}
          </p>
        )}
      </section>

      <section aria-labelledby="coming-up">
        <h2 className={sectionTitle} id="coming-up">
          What is coming up
        </h2>
        {view.events.length === 0 ? (
          <p className={`${body} mt-3`}>Nothing scheduled.</p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {view.events.map((event) => (
              <li key={event.id}>
                <Link className={row} href={recordPath(view.spaceId, event.id)}>
                  <span className="block text-[1.0625rem] font-semibold text-foreground">
                    {event.title}
                  </span>
                  <span className="mt-0.5 block text-base text-foreground">{event.when}</span>
                  {event.child || event.assignedTo || event.outcome ? (
                    <span className="mt-1 block text-sm text-subtitle">
                      {[
                        event.child,
                        event.assignedTo ? `Assigned to ${event.assignedTo}` : null,
                        event.outcome === 'done'
                          ? 'Done'
                          : event.outcome === 'missed'
                            ? 'Missed'
                            : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {showNeeds ? (
        <section aria-labelledby="needs-you" className="grid gap-3">
          <h2 className={sectionTitle} id="needs-you">
            What needs you
          </h2>
          {view.needsYou.map((request) => (
            <Link className={row} href={calendar} key={request.id}>
              <span className="block text-base text-foreground">
                <strong className="font-semibold">{request.who}</strong> asks for {request.dates}.
              </span>
              {request.reason ? (
                <span className="mt-1 block text-sm text-subtitle">“{request.reason}”</span>
              ) : null}
              <span className="mt-2 block text-sm font-medium text-foreground">
                Answer on the calendar
              </span>
            </Link>
          ))}
          {view.invitations.map((invitation) => (
            <div
              className={`${card} flex flex-wrap items-center justify-between gap-4 bg-tint-sage p-5 md:p-5`}
              key={invitation.id}
            >
              <p className="text-base text-foreground">
                You are invited to <strong className="font-semibold">{invitation.spaceName}</strong>
                {invitation.role === 'owner' ? ' as an owner' : ''}.{' '}
                <span className="text-subtitle">Open until {invitation.until}.</span>
              </p>
              <form action={acceptMyInvitation}>
                <input name="invitation" type="hidden" value={invitation.id} />
                <button className={button.primary} type="submit">
                  Join {invitation.spaceName}
                </button>
              </form>
            </div>
          ))}
          {view.otherNeeds.map((alert) => (
            <OtherSpaceLine alert={alert} key={alert.id} label="Needs you in" />
          ))}
        </section>
      ) : null}

      {showWaiting ? (
        <section aria-labelledby="waiting-on" className="grid gap-3">
          <h2 className={sectionTitle} id="waiting-on">
            What you are waiting on
          </h2>
          {view.waitingOn.map((request) => (
            <Link className={row} href={calendar} key={request.id}>
              <span className="block text-base text-foreground">
                {request.dates} would go to{' '}
                <strong className="font-semibold">{request.assignee}</strong>.
              </span>
              <span className="mt-2 block text-sm font-medium text-foreground">
                Open the calendar
              </span>
            </Link>
          ))}
          {view.otherWaiting.map((alert) => (
            <OtherSpaceLine alert={alert} key={alert.id} label="Waiting in" />
          ))}
        </section>
      ) : null}

      <section aria-labelledby="just-written">
        <h2 className={sectionTitle} id="just-written">
          What was just written
        </h2>
        {view.records.length === 0 ? (
          <p className={`${body} mt-3`}>Nothing recorded yet.</p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {view.records.map((entry) => (
              <li key={entry.id}>
                <Link className={row} href={recordPath(view.spaceId, entry.id)}>
                  <span className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-sm px-2 py-0.5 text-[0.8125rem] font-semibold text-foreground ${TYPE_TINTS[entry.type]}`}
                    >
                      {TYPE_LABELS[entry.type]}
                    </span>
                  </span>
                  <span className="mt-2 block text-[1.0625rem] font-semibold text-foreground">
                    {entry.title}
                  </span>
                  {entry.expense ? (
                    <span className="mt-0.5 block text-base text-foreground">
                      {entry.expense.amount}
                      {entry.expense.paidBy ? ` · Paid by ${entry.expense.paidBy}` : ''}
                    </span>
                  ) : null}
                  <span className="mt-1 block text-sm text-subtitle">
                    {entry.who} · {entry.when}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
