'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HOME, SETTINGS } from '../../auth/routes';
import { focusRing } from '../../ui/styles';

/** Hardcoded until the dashboard reads a space. */
const NAV = [
  { href: HOME, label: 'Home', icon: 'layers' },
  { href: SETTINGS, label: 'Settings', icon: 'gear' },
] as const;

const WEEK = [
  { when: 'Mon', title: 'Handoff' },
  { when: 'Wed', title: 'School' },
  { when: 'Fri', title: 'Appointment' },
] as const;

const item = 'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium leading-[1.5]';

/** The dashboard rail: a card with the small elevation (`shadow-sm`). */
export function Sidebar() {
  const path = usePathname();

  return (
    <aside
      aria-label="Dashboard"
      className="w-full shrink-0 rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-sm)] md:sticky md:top-6 md:w-60"
    >
      <nav aria-label="Places" className="grid gap-1">
        {NAV.map((entry) => {
          const current = entry.href === SETTINGS ? path.startsWith(SETTINGS) : path === entry.href;
          return (
            <Link
              aria-current={current ? 'page' : undefined}
              className={`${item} ${focusRing} ${
                current ? 'bg-neutral-200 text-foreground' : 'text-neutral-700 hover:bg-neutral-200'
              }`}
              href={entry.href}
              key={entry.href}
            >
              <Icon name={entry.icon} />
              {entry.label}
            </Link>
          );
        })}
      </nav>

      <section aria-labelledby="sidebar-week" className="mt-6 border-t border-border pt-5">
        <h2 className="px-3 text-[13px] font-medium leading-[1.4] text-subtitle" id="sidebar-week">
          This week
        </h2>
        <ul className="mt-2 grid">
          {WEEK.map((entry) => (
            <li className="flex items-baseline gap-3 px-3 py-2" key={entry.when}>
              <span className="w-8 shrink-0 text-[13px] leading-[1.4] text-subtitle">
                {entry.when}
              </span>
              <span className="text-sm font-medium leading-[1.5] text-foreground">
                {entry.title}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

/** Lucide outline from the design set, drawn in the current text color. */
function Icon({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="size-5 shrink-0 bg-current"
      style={{
        mask: `url(/design/icons/${name}.svg) center / contain no-repeat`,
        WebkitMask: `url(/design/icons/${name}.svg) center / contain no-repeat`,
      }}
    />
  );
}
