import Image from 'next/image';
import Link from 'next/link';
import { requireUser } from '@/auth';
import { signOut } from '../../auth-actions/sign-out';
import { HOME, SETTINGS } from '../../auth/routes';
import { AppRoot } from '../../ui/AppRoot';
import { button, focusRing } from '../../ui/styles';
import { Sidebar } from './Sidebar';

const navLink = `rounded-md px-2 py-2 sm:px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-200 ${focusRing}`;

/** The signed-in app, laid out as a dashboard: a top bar and a sidebar. */
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
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 w-full max-w-[64rem] items-center justify-between gap-4 px-4 md:px-8">
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
          <nav aria-label="Main" className="flex items-center gap-1">
            <Link className={navLink} href={HOME}>
              Spaces
            </Link>
            <Link className={navLink} href={SETTINGS}>
              Settings
            </Link>
            <form action={signOut}>
              <button className={`${button.ghost} whitespace-nowrap px-2 sm:px-3`} type="submit">
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-[64rem] flex-col gap-6 px-4 py-6 md:flex-row md:items-start md:px-8 md:py-8">
        <Sidebar />
        <main className="min-w-0 flex-1" id="main">
          {children}
        </main>
      </div>
    </AppRoot>
  );
}
