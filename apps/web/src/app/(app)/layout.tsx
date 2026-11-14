import Image from 'next/image';
import Link from 'next/link';
import { requireUser } from '@/auth';
import { getProfiles, getSpaces } from '@/data';
import { signOut } from '../../auth-actions/sign-out';
import { HOME } from '../../auth/routes';
import { AppRoot } from '../../ui/AppRoot';
import { focusRing } from '../../ui/styles';
import { MobileNav } from './MobileNav';
import { AppScroll, SidebarDrawerProvider, SidebarMenuButton } from './SidebarDrawer';
import { Sidebar } from './Sidebar';

/**
 * The signed-in app. On a phone the menu button to the left of the logo opens a full-height
 * sidebar. The top bar keeps the Spaces button just left of the avatar. Settings and Sign out
 * sit on the avatar. From `md` up the sidebar docks on the left.
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
              <MobileNav
                email={user.email}
                name={profile?.displayName ?? null}
                signOut={signOut}
                spaces={spaces.map((space) => ({ id: space.id, name: space.name }))}
              />
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
