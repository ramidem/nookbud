import Image from 'next/image';
import Link from 'next/link';
import { requireUser } from '@/auth';
import { signOut } from '../../auth-actions/sign-out';
import { HOME, SETTINGS } from '../../auth/routes';
import { AppRoot } from '../../ui/AppRoot';
import { button, focusRing } from '../../ui/styles';
import { Sidebar } from './Sidebar';

const navLink = `rounded-md px-2 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 sm:px-3 md:px-4 ${focusRing}`;

/** The signed-in app: a full-width top bar, a sidebar, and the page in a card that fills the right side. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <AppRoot>
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-20 focus:rounded-lg focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
        href="#main"
      >
        Skip to content
      </a>
      <div className="flex h-dvh flex-col overflow-y-auto">
        <header className="shrink-0 bg-background">
          <div className="flex w-full items-center justify-between gap-4 px-4 py-5 sm:px-8 md:px-12 md:py-6">
            <Link className={`flex items-center gap-2.5 rounded-md ${focusRing}`} href={HOME}>
              <Image
                alt=""
                className="rounded-md"
                height={28}
                src="/design/logos/nookbud-app-icon.png"
                width={28}
              />
              <span className="text-[1.0625rem] font-semibold tracking-[-0.2px] text-foreground">
                Nookbud
              </span>
            </Link>
            <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2 md:gap-3">
              <Link className={navLink} href={HOME}>
                Spaces
              </Link>
              <Link className={navLink} href={SETTINGS}>
                Settings
              </Link>
              <form action={signOut}>
                <button className={`${button.ghost} whitespace-nowrap px-2 sm:px-4`} type="submit">
                  Sign out
                </button>
              </form>
            </nav>
          </div>
        </header>
        <div className="flex flex-1">
          <div className="sticky top-0 shrink-0 self-start p-4 md:p-6">
            <Sidebar />
          </div>
          <main
            className="min-w-0 flex-1 rounded-tl-[var(--radius-3xl)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)] md:p-8"
            id="main"
          >
            {children}
          </main>
        </div>
      </div>
    </AppRoot>
  );
}
