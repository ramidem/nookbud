import Image from 'next/image';
import Link from 'next/link';
import { AppRoot } from '../../ui/AppRoot';
import { focusRing } from '../../ui/styles';

/** Sign-up, sign-in and password screens: one centred card on the warm background. */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppRoot>
      <div className="mx-auto flex min-h-dvh w-full max-w-[28rem] flex-col px-4 py-8 md:py-12">
        <Link className={`flex items-center gap-2.5 self-start rounded-md ${focusRing}`} href="/">
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
        <main className="mt-10 flex-1 md:mt-14" id="main">
          {children}
        </main>
        <footer className="mt-10 flex gap-5 text-sm text-subtitle">
          <Link className="hover:text-foreground" href="/terms">
            Terms
          </Link>
          <Link className="hover:text-foreground" href="/privacy">
            Privacy
          </Link>
          <Link className="hover:text-foreground" href="/documentation">
            Help
          </Link>
        </footer>
      </div>
    </AppRoot>
  );
}
