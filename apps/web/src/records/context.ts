import 'server-only';
import { getProfiles, getRecords, getSpaces } from '@/data';
import { CURRENCIES } from '../profile/options';
import { zoneOf } from '../profile/time';

/** What every records and calendar screen needs about the space and the viewer. */
export async function spaceContext(space: string) {
  const [spaces, records, profile] = await Promise.all([
    getSpaces(),
    getRecords(),
    (await getProfiles()).get(),
  ]);
  const [people, children, names, current] = await Promise.all([
    spaces.people(space),
    spaces.children(space),
    records.names(space),
    spaces.get(space),
  ]);
  const me = people.find((p) => p.isMe)?.userId ?? null;
  return {
    records,
    me,
    owner: current?.role === 'owner',
    zone: zoneOf(profile?.timeZone),
    zoneIsSet: Boolean(profile?.timeZone),
    currency: profile?.currency ?? 'PHP',
    currencies: CURRENCIES,
    names,
    people: people.map((p) => ({ id: p.userId, name: p.displayName ?? 'Unnamed member' })),
    children: children.map((c) => ({ id: c.id, name: c.name })),
    childName: new Map(children.map((c) => [c.id, c.name])),
  };
}
