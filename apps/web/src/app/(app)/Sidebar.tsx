'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HOME, SETTINGS, SPACES } from '../../auth/routes';
import { focusRing } from '../../ui/styles';

const NAV = [
  { href: HOME, label: 'Home', icon: 'layers' },
  { href: SPACES, label: 'Spaces', icon: 'users' },
  { href: SETTINGS, label: 'Settings', icon: 'gear' },
] as const;

const item = 'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium leading-[1.5]';

function isCurrent(path: string, href: string) {
  if (href === SETTINGS) return path.startsWith(SETTINGS);
  if (href === SPACES) return path === SPACES || path.startsWith(`${SPACES}/`);
  return path === href;
}

/** The dashboard rail: a card with the small elevation (`shadow-sm`). */
export function Sidebar() {
  const path = usePathname();

  return (
    <aside
      aria-label="Dashboard"
      className="w-56 shrink-0 rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-sm)]"
    >
      <nav aria-label="Places" className="grid gap-1">
        {NAV.map((entry) => {
          const current = isCurrent(path, entry.href);
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
