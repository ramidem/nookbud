import type { ChangeRequest, Entry, EntryType, Schedule } from '../../../data/records-types';
import type { InvitationForMe, Role, Space } from '../../../data/types';
import { formatWhen } from '../../../profile/device';
import { whoseDay } from '../../../profile/schedule';
import { addDays, dateInZone, formatDate, formatTime } from '../../../profile/time';
import { formatMoney, nameOf } from '../../../records/labels';

/** Remembers which space Home last opened. Set only when the person chooses one. */
export const HOME_SPACE_COOKIE = 'nookbud-home-space';

export const UPCOMING_DAYS = 7;
export const UPCOMING_LIMIT = 5;
export const LATEST_LIMIT = 5;

export type GlanceAlert = { id: string; name: string; count: number };

export type GlanceEventRow = {
  id: string;
  title: string;
  when: string;
  child: string | null;
  assignedTo: string | null;
  outcome: 'done' | 'missed' | null;
};

export type GlanceRequestRow = {
  id: string;
  dates: string;
  who: string;
  reason: string | null;
};

export type GlanceWaitingRow = {
  id: string;
  dates: string;
  assignee: string;
};

export type GlanceInvitationRow = {
  id: string;
  spaceName: string;
  role: Role;
  until: string;
};

export type GlanceRecordRow = {
  id: string;
  type: EntryType;
  title: string;
  who: string;
  when: string;
  expense: { amount: string; paidBy: string | null } | null;
};

export type GlanceView = {
  greeting: string;
  spaceId: string;
  spaceName: string;
  owner: boolean;
  spaces: { id: string; name: string }[];
  whoseDay:
    { kind: 'none' } | { kind: 'today'; name: string; next: { name: string; date: string } | null };
  events: GlanceEventRow[];
  needsYou: GlanceRequestRow[];
  invitations: GlanceInvitationRow[];
  otherNeeds: GlanceAlert[];
  waitingOn: GlanceWaitingRow[];
  otherWaiting: GlanceAlert[];
  records: GlanceRecordRow[];
};

/**
 * Which space Home opens. A remembered choice wins; otherwise a pending request this person
 * must answer, then the space with the soonest event, then the first space in the list.
 */
export function pickHomeSpace(input: {
  spaces: { id: string }[];
  cookieId: string | undefined;
  pendingToAnswer: Iterable<string>;
  soonestEvent: Record<string, string>;
}): string | null {
  const { spaces, cookieId, soonestEvent } = input;
  if (spaces.length === 0) return null;
  if (cookieId && spaces.some((space) => space.id === cookieId)) return cookieId;
  const pending = new Set(input.pendingToAnswer);
  const needsAnswer = spaces.find((space) => pending.has(space.id));
  if (needsAnswer) return needsAnswer.id;
  let best: { id: string; start: string } | null = null;
  for (const space of spaces) {
    const start = soonestEvent[space.id];
    if (!start) continue;
    if (!best || start < best.start) best = { id: space.id, start };
  }
  return best?.id ?? spaces[0].id;
}

/** The next day the pattern or an approved request gives to someone else. */
export function nextHandover(
  today: string,
  schedule: Schedule | null,
  requests: ChangeRequest[],
): { date: string; assignee: string } | null {
  const current = whoseDay(today, schedule, requests);
  if (!current) return null;
  for (let i = 1; i <= 365; i++) {
    const date = addDays(today, i);
    const who = whoseDay(date, schedule, requests);
    if (who && who !== current) return { date, assignee: who };
  }
  return null;
}

/** Events that overlap today through the next `UPCOMING_DAYS` days, soonest first. */
export function upcomingEvents(
  events: Entry[],
  zone: string,
  today: string,
  limit = UPCOMING_LIMIT,
): Entry[] {
  const end = addDays(today, UPCOMING_DAYS);
  return events
    .filter((entry) => {
      const start = dateInZone(entry.content.starts_at ?? entry.createdAt, zone);
      const last = entry.content.ends_at ? dateInZone(entry.content.ends_at, zone) : start;
      return start <= end && last >= today;
    })
    .sort((a, b) =>
      (a.content.starts_at ?? a.createdAt).localeCompare(b.content.starts_at ?? b.createdAt),
    )
    .slice(0, limit);
}

export function requestsNeedingAnswer(requests: ChangeRequest[], me: string): ChangeRequest[] {
  return requests.filter((request) => request.status === 'pending' && request.requestedBy !== me);
}

export function requestsWaitingOn(requests: ChangeRequest[], me: string): ChangeRequest[] {
  return requests.filter((request) => request.status === 'pending' && request.requestedBy === me);
}

export function otherSpaceAlerts(
  spaces: { id: string; name: string }[],
  selectedId: string,
  countFor: (id: string) => number,
): GlanceAlert[] {
  return spaces
    .filter((space) => space.id !== selectedId)
    .map((space) => ({ id: space.id, name: space.name, count: countFor(space.id) }))
    .filter((space) => space.count > 0);
}

function requestDates(request: ChangeRequest): string {
  return request.endsOn !== request.startsOn
    ? `${formatDate(request.startsOn)} to ${formatDate(request.endsOn)}`
    : formatDate(request.startsOn);
}

export function buildGlanceView(input: {
  displayName: string | null;
  me: string;
  zone: string;
  today: string;
  timeZone: string | null | undefined;
  spaces: Space[];
  selected: Space;
  owner: boolean;
  schedule: Schedule | null;
  requestsBySpace: Map<string, ChangeRequest[]>;
  events: Entry[];
  records: Entry[];
  invitations: InvitationForMe[];
  names: Map<string, string | null>;
  children: Map<string, string>;
}): GlanceView {
  const { me, zone, today, selected, names, children } = input;
  const selectedRequests = input.requestsBySpace.get(selected.id) ?? [];
  const todayId = whoseDay(today, input.schedule, selectedRequests);
  const next = nextHandover(today, input.schedule, selectedRequests);
  const needsYou = requestsNeedingAnswer(selectedRequests, me);
  const waitingOn = requestsWaitingOn(selectedRequests, me);

  return {
    greeting: input.displayName ? `Hello, ${input.displayName}` : 'Hello',
    spaceId: selected.id,
    spaceName: selected.name,
    owner: input.owner,
    spaces: input.spaces.map((space) => ({ id: space.id, name: space.name })),
    whoseDay: todayId
      ? {
          kind: 'today',
          name: nameOf(names, todayId),
          next: next ? { name: nameOf(names, next.assignee), date: formatDate(next.date) } : null,
        }
      : { kind: 'none' },
    events: upcomingEvents(input.events, zone, today).map((entry) => {
      const c = entry.content;
      const when = c.starts_at
        ? c.all_day
          ? `${formatDate(c.starts_at.slice(0, 10))} · All day`
          : formatTime(c.starts_at, zone)
        : formatDate(today);
      return {
        id: entry.id,
        title: c.title,
        when,
        child: (entry.childId && children.get(entry.childId)) || null,
        assignedTo: c.assigned_to ? nameOf(names, c.assigned_to) : null,
        outcome: c.outcome === 'done' || c.outcome === 'missed' ? c.outcome : null,
      };
    }),
    needsYou: needsYou.map((request) => ({
      id: request.id,
      dates: requestDates(request),
      who: nameOf(names, request.requestedBy),
      reason: request.reason,
    })),
    invitations: input.invitations.map((invitation) => ({
      id: invitation.id,
      spaceName: invitation.spaceName,
      role: invitation.role,
      until: formatWhen(invitation.expiresAt, input.timeZone),
    })),
    otherNeeds: otherSpaceAlerts(
      input.spaces,
      selected.id,
      (id) => requestsNeedingAnswer(input.requestsBySpace.get(id) ?? [], me).length,
    ),
    waitingOn: waitingOn.map((request) => ({
      id: request.id,
      dates: requestDates(request),
      assignee: nameOf(names, request.assignee),
    })),
    otherWaiting: otherSpaceAlerts(
      input.spaces,
      selected.id,
      (id) => requestsWaitingOn(input.requestsBySpace.get(id) ?? [], me).length,
    ),
    records: input.records.slice(0, LATEST_LIMIT).map((entry) => {
      const c = entry.content;
      const expense =
        entry.type === 'expense' && c.amount && c.currency
          ? {
              amount: formatMoney(c.amount, c.currency),
              paidBy: c.paid_by ? nameOf(names, c.paid_by) : null,
            }
          : null;
      return {
        id: entry.id,
        type: entry.type,
        title: c.title,
        who: nameOf(names, entry.createdBy),
        when: formatTime(entry.createdAt, zone),
        expense,
      };
    }),
  };
}
