import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getNav, loadDocs } from '../../documentation/content';
import { NavLinks } from '../../documentation/NavLinks';
import styles from '../../documentation/documentation.module.css';
import { buildTokenCss } from '../design/_data/tokens';

const ROOT_ID = 'documentation-root';

// Everything served here is written for the public. Internal docs live in `docs/` and never ship.
export const metadata: Metadata = {
  title: { default: 'Documentation · Nookbud', template: '%s · Nookbud documentation' },
};

export default function DocumentationLayout({ children }: { children: React.ReactNode }) {
  const groups = getNav(loadDocs()).map((group) => ({
    items: group.items.map((doc) => ({ href: doc.href, title: doc.title })),
    label: group.label,
  }));

  return (
    <div className={styles.root} id={ROOT_ID}>
      <style>{buildTokenCss(`#${ROOT_ID}`)}</style>

      <header className={styles.header}>
        <Link className={styles.brand} href="/">
          <Image
            alt=""
            className={styles.logo}
            height={28}
            src="/design/logos/nookbud-app-icon.png"
            width={28}
          />
          Nookbud
        </Link>
        <Link className={styles.headerTitle} href="/documentation">
          Documentation
        </Link>
        <Link className={styles.headerLink} href="/">
          nookbud.com
        </Link>
      </header>

      <details className={styles.mobileNav}>
        <summary>Pages</summary>
        <NavLinks groups={groups} />
      </details>

      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <NavLinks groups={groups} />
        </aside>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
