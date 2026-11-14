'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { HOME, SETTINGS, calendarPath } from '../../auth/routes';
import { focusRing } from '../../ui/styles';

type SpaceLink = { id: string; name: string };

/** Letters for the account button: the name when there is one, otherwise the email. */
export function accountInitials(name: string | null, email: string | null): string {
  const trimmed = name?.trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/);
    const letters = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : trimmed.slice(0, 2);
    return letters.toUpperCase();
  }
  const local = (email ?? '').split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
  return (local.slice(0, 2) || '?').toUpperCase();
}

const menuItem = `flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-3 text-left text-sm text-foreground hover:bg-neutral-200 ${focusRing}`;
const panel =
  'absolute top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-xl border border-border bg-surface p-2 shadow-[var(--shadow-sm)]';
// Composed here, not from `button.secondary`: that style centers its label, and a later
// `justify-between` does not win in Tailwind 4. The name stays on the left, the chevron on the right.
const spacesControl = `inline-flex min-h-11 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-border-strong px-3 text-sm font-medium leading-[1.3] text-foreground transition-colors duration-150 hover:bg-neutral-200 ${focusRing}`;

/**
 * The phone top bar: a button that shows the space you are in and opens the list,
 * and an avatar that holds Settings and Sign out.
 * Hidden from `md` up, where those stay as links in the top bar.
 */
export function MobileNav({
  spaces,
  name,
  email,
  signOut,
}: {
  spaces: SpaceLink[];
  name: string | null;
  email: string | null;
  signOut: () => Promise<void>;
}) {
  const path = usePathname();
  const [open, setOpen] = useState<'spaces' | 'account' | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const spacesButton = useRef<HTMLButtonElement>(null);
  const accountButton = useRef<HTMLButtonElement>(null);
  const spacesId = useId();
  const accountId = useId();
  const currentId = path.startsWith('/spaces/') ? path.split('/')[2] : null;
  const current = spaces.find((space) => space.id === currentId);
  const label = current?.name ?? 'Spaces';

  useEffect(() => {
    setOpen(null);
  }, [path]);

  useEffect(() => {
    if (!open) return;
    const which = open;
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setOpen(null);
      (which === 'spaces' ? spacesButton : accountButton).current?.focus();
    }
    function onPointer(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(null);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <div className="relative flex min-w-0 flex-1 items-center gap-1 md:hidden" ref={root}>
      <div className="relative min-w-0 flex-1">
        <button
          aria-controls={open === 'spaces' ? spacesId : undefined}
          aria-expanded={open === 'spaces'}
          aria-label={current ? `${current.name}, spaces` : 'Spaces'}
          className={`${spacesControl} ${open === 'spaces' ? 'bg-neutral-200' : 'bg-surface'}`}
          onClick={() => setOpen((value) => (value === 'spaces' ? null : 'spaces'))}
          ref={spacesButton}
          type="button"
        >
          <span className={`min-w-0 truncate text-left ${current ? 'font-semibold' : ''}`}>
            {label}
          </span>
          <Chevron open={open === 'spaces'} />
        </button>
        {open === 'spaces' ? (
          <div className={`${panel} right-0 left-0`} id={spacesId}>
            {spaces.length ? (
              <ul>
                {spaces.map((space) => {
                  const selected = space.id === currentId;
                  return (
                    <li key={space.id}>
                      <Link
                        aria-current={selected ? 'page' : undefined}
                        className={`${menuItem} ${selected ? 'bg-neutral-200 font-semibold' : 'font-medium'}`}
                        href={calendarPath(space.id)}
                      >
                        <span className="min-w-0 truncate">{space.name}</span>
                        {selected ? <Check /> : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-3 py-2 text-sm text-subtitle">No spaces yet.</p>
            )}
            <Link className={`${menuItem} font-medium text-subtitle`} href={HOME}>
              {spaces.length ? 'All spaces' : 'Create a space'}
            </Link>
          </div>
        ) : null}
      </div>

      <button
        aria-controls={open === 'account' ? accountId : undefined}
        aria-expanded={open === 'account'}
        aria-label={name ? `${name}, account` : 'Account'}
        className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-foreground hover:bg-neutral-300 ${focusRing}`}
        onClick={() => setOpen((value) => (value === 'account' ? null : 'account'))}
        ref={accountButton}
        type="button"
      >
        <span aria-hidden="true">{accountInitials(name, email)}</span>
      </button>
      {open === 'account' ? (
        <div className={`${panel} right-0 w-52 max-w-[calc(100vw-1.5rem)]`} id={accountId}>
          <p className="truncate px-3 py-2 text-sm font-semibold text-foreground">
            {name || email || 'Your account'}
          </p>
          <Link className={`${menuItem} font-medium`} href={SETTINGS}>
            Settings
          </Link>
          <form action={signOut}>
            <button className={`${menuItem} font-medium`} type="submit">
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function Check() {
  return (
    <span
      aria-hidden="true"
      className="size-4 shrink-0 bg-current"
      style={{
        mask: 'url(/design/icons/check-circle.svg) center / contain no-repeat',
        WebkitMask: 'url(/design/icons/check-circle.svg) center / contain no-repeat',
      }}
    />
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`size-4 shrink-0 bg-current ${open ? 'rotate-180' : ''}`}
      style={{
        mask: 'url(/design/icons/chevron-down.svg) center / contain no-repeat',
        WebkitMask: 'url(/design/icons/chevron-down.svg) center / contain no-repeat',
      }}
    />
  );
}
