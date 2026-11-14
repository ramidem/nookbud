import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ChangeRequest, Entry, Schedule } from '../src/data/records-types';
import type { Space } from '../src/data/types';
import { EmptyHome, HomeGlance } from '../src/app/(app)/home/HomeGlance';
import {
  type GlanceView,
  buildGlanceView,
  nextHandover,
  otherSpaceAlerts,
  pickHomeSpace,
  requestsNeedingAnswer,
  requestsWaitingOn,
  upcomingEvents,
} from '../src/app/(app)/home/glance';
import { presetPattern } from '../src/profile/schedule';

vi.mock('../src/auth-actions/home', () => ({ selectHomeSpace: vi.fn() }));
vi.mock('../src/auth-actions/spaces', () => ({ acceptMyInvitation: vi.fn() }));

const priya = '11111111-1111-4111-8111-111111111111';
const tom = '22222222-2222-4222-8222-222222222222';
const spaceA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const spaceB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

const schedule: Schedule = {
  startsOn: '2026-11-02',
  pattern: presetPattern('week', priya, tom),
  version: 1,
  updatedBy: null,
  updatedAt: '',
};

const request = (over: Partial<ChangeRequest>): ChangeRequest => ({
  id: 'r',
  startsOn: '2026-11-16',
  endsOn: '2026-11-17',
  assignee: tom,
  reason: 'A trip',
  status: 'pending',
  requestedBy: tom,
  respondedBy: null,
  respondedAt: null,
  responseNote: null,
  createdAt: '',
  ...over,
});

const space = (over: Partial<Space>): Space => ({
  id: spaceA,
  name: 'Ava’s week',
  role: 'owner',
  createdAt: '2026-11-01T00:00:00Z',
  ...over,
});

const entry = (over: Partial<Entry> & { content?: Entry['content'] }): Entry => ({
  id: 'e1',
  spaceId: spaceA,
  type: 'event',
  childId: null,
  createdBy: priya,
  createdAt: '2026-11-10T00:00:00Z',
  version: 1,
  removedAt: null,
  content: { title: 'Handoff', ...over.content },
  ...over,
});

describe('which space Home opens', () => {
  it('remembers the space in the cookie', () => {
    expect(
      pickHomeSpace({
        spaces: [{ id: spaceA }, { id: spaceB }],
        cookieId: spaceB,
        pendingToAnswer: [spaceA],
        soonestEvent: { [spaceA]: '2026-11-14T00:00:00Z' },
      }),
    ).toBe(spaceB);
  });

  it('ignores a cookie for a space the person left', () => {
    expect(
      pickHomeSpace({
        spaces: [{ id: spaceA }],
        cookieId: spaceB,
        pendingToAnswer: [],
        soonestEvent: {},
      }),
    ).toBe(spaceA);
  });

  it('opens the space with a pending request this person must answer', () => {
    expect(
      pickHomeSpace({
        spaces: [{ id: spaceA }, { id: spaceB }],
        cookieId: undefined,
        pendingToAnswer: [spaceB],
        soonestEvent: { [spaceA]: '2026-11-14T00:00:00Z' },
      }),
    ).toBe(spaceB);
  });

  it('opens the space with the soonest event when none need an answer', () => {
    expect(
      pickHomeSpace({
        spaces: [{ id: spaceA }, { id: spaceB }],
        cookieId: undefined,
        pendingToAnswer: [],
        soonestEvent: {
          [spaceA]: '2026-11-20T08:00:00Z',
          [spaceB]: '2026-11-15T08:00:00Z',
        },
      }),
    ).toBe(spaceB);
  });

  it('opens the first space when nothing else applies', () => {
    expect(
      pickHomeSpace({
        spaces: [{ id: spaceA }, { id: spaceB }],
        cookieId: undefined,
        pendingToAnswer: [],
        soonestEvent: {},
      }),
    ).toBe(spaceA);
  });
});

describe('whose day and the next handover', () => {
  it('names the next day the pattern gives to someone else', () => {
    const next = nextHandover('2026-11-02', schedule, []);
    expect(next).toEqual({ date: '2026-11-09', assignee: tom });
  });

  it('lets an approved request move the handover', () => {
    const next = nextHandover('2026-11-02', schedule, [
      request({
        status: 'approved',
        startsOn: '2026-11-04',
        endsOn: '2026-11-04',
        assignee: tom,
        respondedAt: '2026-11-01T00:00:00Z',
      }),
    ]);
    expect(next).toEqual({ date: '2026-11-04', assignee: tom });
  });

  it('is nobody’s when there is no schedule', () => {
    expect(nextHandover('2026-11-14', null, [])).toBeNull();
  });
});

describe('upcoming events', () => {
  const zone = 'UTC';
  const today = '2026-11-14';

  it('keeps events from today through the next 7 days, five at most', () => {
    const events = [0, 1, 2, 3, 4, 5, 8].map((day, i) =>
      entry({
        id: `e${i}`,
        content: {
          title: `Day ${day}`,
          starts_at: `2026-11-${String(14 + day).padStart(2, '0')}T10:00:00.000Z`,
        },
      }),
    );
    const picked = upcomingEvents(events, zone, today);
    expect(picked.map((e) => e.content.title)).toEqual([
      'Day 0',
      'Day 1',
      'Day 2',
      'Day 3',
      'Day 4',
    ]);
  });

  it('drops an event after the window', () => {
    const later = entry({
      content: { title: 'Later', starts_at: '2026-11-22T10:00:00.000Z' },
    });
    expect(upcomingEvents([later], zone, today)).toEqual([]);
  });
});

describe('requests that need you or that you are waiting on', () => {
  it('keeps pending requests this person did not ask for', () => {
    const mine = request({ id: 'mine', requestedBy: priya, assignee: tom });
    const theirs = request({ id: 'theirs', requestedBy: tom, assignee: priya });
    expect(requestsNeedingAnswer([mine, theirs], priya).map((r) => r.id)).toEqual(['theirs']);
    expect(requestsWaitingOn([mine, theirs], priya).map((r) => r.id)).toEqual(['mine']);
  });

  it('names another space that still has something waiting', () => {
    expect(
      otherSpaceAlerts(
        [
          { id: spaceA, name: 'Ava’s week' },
          { id: spaceB, name: 'Leo’s week' },
        ],
        spaceA,
        (id) => (id === spaceB ? 2 : 0),
      ),
    ).toEqual([{ id: spaceB, name: 'Leo’s week', count: 2 }]);
  });
});

describe('the glance view', () => {
  const names = new Map<string, string | null>([
    [priya, 'Priya'],
    [tom, 'Tom'],
  ]);
  const children = new Map([['child-1', 'Ava']]);

  it('says there is no schedule yet', () => {
    const view = buildGlanceView({
      displayName: 'Priya',
      me: priya,
      zone: 'UTC',
      today: '2026-11-14',
      timeZone: 'UTC',
      spaces: [space({})],
      selected: space({}),
      owner: true,
      schedule: null,
      requestsBySpace: new Map(),
      events: [],
      records: [],
      invitations: [],
      names,
      children,
    });
    expect(view.whoseDay).toEqual({ kind: 'none' });
    expect(view.greeting).toBe('Hello, Priya');
  });

  it('names whose day it is and the next handover', () => {
    const view = buildGlanceView({
      displayName: 'Priya',
      me: priya,
      zone: 'UTC',
      today: '2026-11-02',
      timeZone: 'UTC',
      spaces: [space({})],
      selected: space({}),
      owner: true,
      schedule,
      requestsBySpace: new Map(),
      events: [],
      records: [],
      invitations: [],
      names,
      children,
    });
    expect(view.whoseDay).toEqual({
      kind: 'today',
      name: 'Priya',
      next: { name: 'Tom', date: 'Mon, 9 Nov 2026' },
    });
  });

  it('shows an expense amount and who paid', () => {
    const view = buildGlanceView({
      displayName: 'Priya',
      me: priya,
      zone: 'UTC',
      today: '2026-11-14',
      timeZone: 'UTC',
      spaces: [space({})],
      selected: space({}),
      owner: true,
      schedule: null,
      requestsBySpace: new Map(),
      events: [],
      records: [
        entry({
          id: 'exp',
          type: 'expense',
          content: { title: 'Shoes', amount: 45, currency: 'PHP', paid_by: priya },
        }),
      ],
      invitations: [],
      names,
      children,
    });
    expect(view.records[0].type).toBe('expense');
    expect(view.records[0].expense?.amount).toContain('45');
    expect(view.records[0].expense?.paidBy).toBe('Priya');
  });
});

const view = (over: Partial<GlanceView> = {}): GlanceView => ({
  greeting: 'Hello, Priya',
  spaceId: spaceA,
  spaceName: 'Ava’s week',
  owner: true,
  spaces: [{ id: spaceA, name: 'Ava’s week' }],
  whoseDay: { kind: 'none' },
  events: [],
  needsYou: [],
  invitations: [],
  otherNeeds: [],
  waitingOn: [],
  otherWaiting: [],
  records: [],
  ...over,
});

describe('the home glance', () => {
  it('says when there is no schedule and links an owner to the calendar', () => {
    render(<HomeGlance view={view()} />);
    expect(screen.getByText(/No schedule yet/)).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Set it up on the calendar' }).getAttribute('href'),
    ).toBe(`/spaces/${spaceA}/calendar`);
  });

  it('hides what needs you and what you are waiting on when both are empty', () => {
    render(<HomeGlance view={view()} />);
    expect(screen.queryByRole('heading', { name: 'What needs you' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'What you are waiting on' })).toBeNull();
    expect(screen.getByText('Nothing scheduled.')).toBeTruthy();
  });

  it('has no switcher for one space', () => {
    render(<HomeGlance view={view()} />);
    expect(screen.queryByRole('navigation', { name: 'Your spaces' })).toBeNull();
  });

  it('switches between spaces by name', () => {
    render(
      <HomeGlance
        view={view({
          spaces: [
            { id: spaceA, name: 'Ava’s week' },
            { id: spaceB, name: 'Leo’s week' },
          ],
        })}
      />,
    );
    const switcher = screen.getByRole('navigation', { name: 'Your spaces' });
    expect(switcher.textContent).toContain('Ava’s week');
    expect(switcher.textContent).toContain('Leo’s week');
  });

  it('keeps another space’s pending request visible', () => {
    render(
      <HomeGlance
        view={view({
          otherNeeds: [{ id: spaceB, name: 'Leo’s week', count: 2 }],
        })}
      />,
    );
    expect(screen.getByRole('heading', { name: 'What needs you' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Needs you in: Leo’s week, 2' })).toBeTruthy();
  });

  it('opens an event as a record', () => {
    render(
      <HomeGlance
        view={view({
          events: [
            {
              id: 'evt',
              title: 'School',
              when: 'Mon 16 Nov, 9:00 am',
              child: 'Ava',
              assignedTo: 'Priya',
              outcome: 'done',
            },
          ],
        })}
      />,
    );
    expect(screen.getByRole('link', { name: /School/ }).getAttribute('href')).toBe(
      `/spaces/${spaceA}/records/evt`,
    );
    expect(screen.getByText(/Done/)).toBeTruthy();
    expect(screen.getByText(/Assigned to Priya/)).toBeTruthy();
  });

  it('shows Join on an invitation', () => {
    render(
      <HomeGlance
        view={view({
          invitations: [
            {
              id: 'inv',
              spaceName: 'Leo’s week',
              role: 'member',
              until: '21 Nov 2026, 12:00',
            },
          ],
        })}
      />,
    );
    expect(screen.getByRole('button', { name: 'Join Leo’s week' })).toBeTruthy();
  });
});

describe('home with no spaces', () => {
  it('sends the person to Spaces and does not host the create form', () => {
    render(<EmptyHome name="Priya" />);
    expect(screen.getByRole('link', { name: 'Spaces' }).getAttribute('href')).toBe('/spaces');
    expect(screen.queryByRole('button', { name: 'Create space' })).toBeNull();
    expect(screen.getByText(/You have no spaces yet/)).toBeTruthy();
  });
});
