import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getProfiles, getRecords, getSchedules, getSpaces } from '@/data';
import { WELCOME } from '../../../auth/routes';
import { addDays, localToUtc, todayIn, zoneOf } from '../../../profile/time';
import { spaceContext } from '../../../records/context';
import { Notice } from '../../../ui/Notice';
import { type SearchParams, param } from '../../../ui/page-props';
import { EmptyHome, HomeGlance } from './HomeGlance';
import {
  HOME_SPACE_COOKIE,
  LATEST_LIMIT,
  UPCOMING_DAYS,
  buildGlanceView,
  pickHomeSpace,
  requestsNeedingAnswer,
  upcomingEvents,
} from './glance';

export const metadata: Metadata = { title: 'Home · Nookbud' };

const notes: Record<string, string> = {
  'space-deleted': 'The space was deleted. Nobody can open it any more.',
  left: 'You left the space.',
  'invitation-failed':
    'That invitation could not be accepted. It may have expired or been withdrawn.',
};

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const [profile, spacesStore] = await Promise.all([(await getProfiles()).get(), getSpaces()]);
  if (profile && !profile.onboardedAt) redirect(WELCOME);
  const [mine, invitations] = await Promise.all([
    spacesStore.list(),
    spacesStore.invitationsForMe(),
  ]);
  const note = notes[param((await searchParams).note) ?? ''];

  if (mine.length === 0) {
    return (
      <>
        {note ? <Notice>{note}</Notice> : null}
        <EmptyHome name={profile?.displayName ?? null} />
      </>
    );
  }

  const me = profile?.id ?? '';
  const zone = zoneOf(profile?.timeZone);
  const today = todayIn(zone);
  const cookieId = (await cookies()).get(HOME_SPACE_COOKIE)?.value;
  const schedules = await getSchedules();
  const recordsStore = await getRecords();
  const from = localToUtc(`${today}T00:00`, zone);
  const until = localToUtc(`${addDays(today, UPCOMING_DAYS + 1)}T00:00`, zone);

  const requestEntries = await Promise.all(
    mine.map(async (space) => [space.id, await schedules.requests(space.id)] as const),
  );
  const requestsBySpace = new Map(requestEntries);
  const pendingToAnswer = mine
    .filter((space) => requestsNeedingAnswer(requestsBySpace.get(space.id) ?? [], me).length > 0)
    .map((space) => space.id);

  const remembered = cookieId && mine.some((space) => space.id === cookieId) ? cookieId : undefined;
  const soonestEvent: Record<string, string> = {};
  const eventsBySpace = new Map<string, Awaited<ReturnType<typeof recordsStore.events>>>();
  if (!remembered) {
    const eventEntries = await Promise.all(
      mine.map(
        async (space) => [space.id, await recordsStore.events(space.id, from, until)] as const,
      ),
    );
    for (const [id, events] of eventEntries) {
      eventsBySpace.set(id, events);
      const first = upcomingEvents(events, zone, today)[0];
      if (first?.content.starts_at) soonestEvent[id] = first.content.starts_at;
    }
  }

  const selectedId = pickHomeSpace({
    spaces: mine,
    cookieId: remembered,
    pendingToAnswer,
    soonestEvent,
  });
  const selected = mine.find((space) => space.id === selectedId) ?? mine[0];
  const ctx = await spaceContext(selected.id);
  const selectedEvents =
    eventsBySpace.get(selected.id) ?? (await recordsStore.events(selected.id, from, until));
  const [schedule, latest] = await Promise.all([
    schedules.get(selected.id),
    recordsStore.list(selected.id, { limit: LATEST_LIMIT }),
  ]);

  const view = buildGlanceView({
    displayName: profile?.displayName ?? null,
    me,
    zone: ctx.zone,
    today,
    timeZone: profile?.timeZone,
    spaces: mine,
    selected,
    owner: ctx.owner,
    schedule,
    requestsBySpace,
    events: selectedEvents,
    records: latest,
    invitations,
    names: ctx.names,
    children: ctx.childName,
  });

  return <HomeGlance note={note} view={view} />;
}
