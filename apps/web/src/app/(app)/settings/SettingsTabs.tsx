'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SECURITY, SETTINGS } from '../../../auth/routes';
import { focusRing } from '../../../ui/styles';

const tabs = [
  { href: SETTINGS, label: 'Profile' },
  { href: SECURITY, label: 'Security' },
];

/** Underlined tabs between the settings pages. */
export function SettingsTabs() {
  const path = usePathname();
  return (
    <nav aria-label="Settings" className="mt-6 flex gap-2 border-b border-border">
      {tabs.map((tab) => {
        const active = path === tab.href;
        return (
          <Link
            aria-current={active ? 'page' : undefined}
            className={`-mb-px min-h-11 border-b-2 px-4 py-3 text-sm font-medium ${focusRing} ${
              active
                ? 'border-foreground text-foreground'
                : 'border-transparent text-subtitle hover:text-foreground'
            }`}
            href={tab.href}
            key={tab.href}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
