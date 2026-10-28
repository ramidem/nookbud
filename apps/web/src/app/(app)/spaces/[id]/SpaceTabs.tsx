'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { calendarPath, recordsPath, spacePath } from '../../../../auth/routes';
import { focusRing } from '../../../../ui/styles';

/** The places inside a space. */
export function SpaceTabs({ space }: { space: string }) {
  const path = usePathname();
  const tabs = [
    { href: calendarPath(space), label: 'Calendar', active: path.startsWith(calendarPath(space)) },
    { href: recordsPath(space), label: 'Records', active: path.startsWith(recordsPath(space)) },
    { href: spacePath(space), label: 'People and children', active: path === spacePath(space) },
  ];
  return (
    <nav
      aria-label="In this space"
      className="mt-5 flex gap-1 overflow-x-auto border-b border-border"
    >
      {tabs.map((tab) => (
        <Link
          aria-current={tab.active ? 'page' : undefined}
          className={`-mb-px min-h-11 shrink-0 border-b-2 px-4 py-3 text-sm font-medium ${focusRing} ${
            tab.active
              ? 'border-foreground text-foreground'
              : 'border-transparent text-subtitle hover:text-foreground'
          }`}
          href={tab.href}
          key={tab.href}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
