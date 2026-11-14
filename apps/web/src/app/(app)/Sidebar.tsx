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

const item = 'flex min-h-11 w-full items-center gap-3 rounded-lg px-4 text-sm leading-[1.5]';

function isCurrent(path: string, href: string) {
  if (href === SETTINGS) return path.startsWith(SETTINGS);
  if (href === SPACES) return path === SPACES || path.startsWith(`${SPACES}/`);
  return path === href;
}

/**
 * The dashboard rail. Only the current place is a white button. Nothing else wraps the stack.
 * On a phone the shell shows it full height from the menu button. From `md` up it is the left-hand rail.
 */
export function Sidebar({ fill = false }: { fill?: boolean }) {
  const path = usePathname();

  return (
    <aside
      aria-label="Dashboard"
      className={
        fill
          ? 'flex h-full min-h-0 w-full flex-1 flex-col overflow-y-auto px-6 pt-2'
          : 'sticky top-0 hidden w-64 shrink-0 flex-col self-start px-8 pt-8 md:flex'
      }
    >
      <nav aria-label="Places" className="grid gap-2">
        {NAV.map((entry) => {
          const current = isCurrent(path, entry.href);
          return (
            <Link
              aria-current={current ? 'page' : undefined}
              className={`${item} ${focusRing} ${
                current
                  ? 'bg-surface font-semibold text-foreground shadow-[var(--shadow-card)]'
                  : 'font-medium text-neutral-700 hover:bg-neutral-200'
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
