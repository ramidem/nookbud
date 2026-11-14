import Image from 'next/image';
import Link from 'next/link';
import { requireUser } from '@/auth';
import { getProfiles, getSpaces } from '@/data';
import { signOut } from '../../auth-actions/sign-out';
import { HOME, SETTINGS, SPACES } from '../../auth/routes';
import { AppRoot } from '../../ui/AppRoot';
import { button, focusRing } from '../../ui/styles';
import { MobileNav } from './MobileNav';
import { AppScroll, SidebarDrawerProvider, SidebarMenuButton } from './SidebarDrawer';
import { Sidebar } from './Sidebar';

const navLink = `inline-flex min-h-11 items-center rounded-md px-2 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 sm:px-3 md:px-4 ${focusRing}`;

/**
 * The signed-in app. On a phone the menu button to the left of the logo opens a full-height
 * sidebar. The Spaces button shows the space you are in, and Settings and Sign out sit on the avatar.
 * From the `md` breakpoint up, the sidebar docks on the left and those links stay in the top bar.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [profile, spaces] = await Promise.all([
    (await getProfiles()).get(),
    (await getSpaces()).list(),
  ]);
  return (
    <AppRoot>
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-20 focus:rounded-lg focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
        href="#main"
      >
        Skip to content
      </a>
      <SidebarDrawerProvider>
        <AppScroll>
          <header className="relative z-20 shrink-0 bg-background">
            <div className="flex w-full flex-wrap items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-8 sm:py-5 md:px-12 md:py-6">
              <div className="flex shrink-0 items-center gap-2">
                <SidebarMenuButton />
                <Link
                  className={`flex shrink-0 items-center gap-2.5 rounded-md ${focusRing}`}
                  href={HOME}
                >
                  <Image
                    alt=""
                    className="rounded-md"
                    height={28}
                    src="/design/logos/nookbud-app-icon.png"
                    width={28}
                  />
                  <span className="hidden text-[1.0625rem] font-semibold tracking-[-0.2px] text-foreground min-[23.5rem]:inline">
                    Nookbud
                  </span>
                </Link>
              </div>
              <div className="flex min-w-0 flex-1 items-center justify-end">
                <MobileNav
                  email={user.email}
                  name={profile?.displayName ?? null}
                  signOut={signOut}
                  spaces={spaces.map((space) => ({ id: space.id, name: space.name }))}
                />
                <nav
                  aria-label="Main"
                  className="hidden flex-wrap items-center justify-end gap-1 sm:gap-2 md:flex md:gap-3"
                >
                  <Link className={navLink} href={HOME}>
                    Home
                  </Link>
                  <Link className={navLink} href={SPACES}>
                    Spaces
                  </Link>
                  <Link className={navLink} href={SETTINGS}>
                    Settings
                  </Link>
                  <form action={signOut}>
                    <button
                      className={`${button.ghost} whitespace-nowrap px-2 sm:px-4`}
                      type="submit"
                    >
                      Sign out
                    </button>
                  </form>
                </nav>
              </div>
            </div>
          </header>
          <div className="flex flex-1 flex-col md:flex-row">
            <Sidebar />
            <main
              className="m-3 min-w-0 flex-1 break-words rounded-xl bg-surface p-4 shadow-[var(--shadow-sm)] sm:m-4 sm:p-6 md:m-0 md:rounded-none md:rounded-tl-[var(--radius-3xl)] md:p-6 lg:p-8"
              id="main"
            >
              <div className="mx-auto w-full max-w-[1440px]">{children}</div>
            </main>
          </div>
        </AppScroll>
      </SidebarDrawerProvider>
    </AppRoot>
  );
}
