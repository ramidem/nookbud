'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './documentation.module.css';

export type NavLinkGroup = {
  label?: string;
  items: { href: string; title: string }[];
};

export function NavLinks({ groups }: { groups: NavLinkGroup[] }) {
  const pathname = usePathname().replace(/\/$/, '');

  return (
    <nav aria-label="Documentation">
      {groups.map((group) => (
        <div key={group.label ?? 'top'}>
          {group.label && <p className={styles.navLabel}>{group.label}</p>}
          <ul className={styles.navList}>
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    aria-current={active ? 'page' : undefined}
                    className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                    href={item.href}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
