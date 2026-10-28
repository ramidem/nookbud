import type { CSSProperties } from 'react';

const days = [
  { label: 'Mon', home: 'a' },
  { label: 'Tue', home: 'a' },
  { label: 'Wed', home: 'handoff' },
  { label: 'Thu', home: 'b' },
  { label: 'Fri', home: 'b' },
  { label: 'Sat', home: 'b' },
  { label: 'Sun', home: 'b' },
] as const;

const homeA = 'var(--home-a)';
const homeB = 'var(--home-b)';

const fills = {
  a: homeA,
  b: homeB,
  handoff: `linear-gradient(90deg, ${homeA} 50%, ${homeB} 50%)`,
};

const entries = [
  { day: 'Wed', text: 'Handoff at school, 3:30 pm', seen: true },
  { day: 'Thu', text: 'Dentist, 4:00 pm. Tom drives.', seen: true },
  { day: 'Fri', text: 'Football boots, $42. Priya paid.', seen: false },
];

function Check({ seen }: { seen: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="9" />
      {seen && <path d="m8.5 12.5 2.5 2.5 4.5-5" />}
    </svg>
  );
}

export function WeekCard() {
  return (
    <figure className="m-0 rounded-xl border border-border bg-surface p-5 text-left text-foreground shadow-mockup md:p-7">
      <figcaption className="flex items-baseline justify-between gap-4">
        <span className="text-[1.375rem] font-semibold leading-[1.3]">Ava&rsquo;s week</span>
        <span className="rounded-sm bg-neutral-200 px-2 py-0.5 text-[0.8125rem] font-semibold text-neutral-700">
          Example
        </span>
      </figcaption>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-subtitle">
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full" style={{ background: homeA }} />
          At Priya&rsquo;s
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full" style={{ background: homeB }} />
          At Tom&rsquo;s
        </span>
      </div>

      <div
        aria-label="Example week: Ava is at Priya's Monday and Tuesday, hands over at school on Wednesday at 3:30 pm, and is at Tom's from Wednesday afternoon to Sunday."
        className="mt-5 grid grid-cols-7 gap-1.5"
        role="img"
      >
        {days.map((day, i) => (
          <div className="min-w-0" key={day.label}>
            <p className="mb-1.5 text-center text-xs text-subtitle">{day.label}</p>
            <div
              className="nb-day h-16 rounded-lg"
              style={{ '--i': i, background: fills[day.home] } as CSSProperties}
            />
          </div>
        ))}
      </div>

      <ul className="mt-6 m-0 list-none p-0">
        {entries.map((entry) => (
          <li
            className="flex items-start justify-between gap-4 border-t border-divider py-3 text-[0.9375rem]"
            key={entry.day}
          >
            <p className="min-w-0 text-foreground">
              <span className="mr-2 inline-block w-8 text-subtitle">{entry.day}</span>
              {entry.text}
            </p>
            <p
              className={`flex shrink-0 items-center gap-1.5 text-sm ${
                entry.seen ? 'font-medium text-primary' : 'text-subtitle'
              }`}
            >
              <Check seen={entry.seen} />
              {entry.seen ? 'Seen by both' : 'Waiting for Tom'}
            </p>
          </li>
        ))}
      </ul>
    </figure>
  );
}
