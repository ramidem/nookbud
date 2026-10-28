import Image from 'next/image';
import { Button } from './Button';
import { WAITLIST_HREF, container, focusRing } from './config';

const link = `hidden rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 sm:inline ${focusRing}`;

export function Nav() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
      <div className={`${container} flex h-16 items-center justify-between`}>
        <a className={`flex items-center gap-2.5 rounded-md ${focusRing}`} href="/">
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
        </a>
        <nav aria-label="Main" className="flex items-center gap-1 md:gap-2">
          <a className={link} href="#record">
            How it works
          </a>
          <a className={link} href="#faq">
            Questions
          </a>
          <Button className="ml-2 min-h-9" href={WAITLIST_HREF}>
            Join the waitlist
          </Button>
        </nav>
      </div>
    </header>
  );
}
