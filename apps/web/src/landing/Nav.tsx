import Image from 'next/image';
import { Button } from './Button';
import { WAITLIST_HREF, container } from './config';

export function Nav() {
  return (
    <header className={`${container} flex items-center justify-between py-5 md:py-6`}>
      <a
        className="flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        href="/"
      >
        <Image
          alt=""
          className="rounded-lg"
          height={32}
          src="/design/logos/nookbud-app-icon.png"
          width={32}
        />
        <span className="font-serif text-xl font-semibold text-foreground">Nookbud</span>
      </a>
      <nav aria-label="Main" className="flex items-center gap-6 md:gap-8">
        <a
          className="hidden text-[0.9375rem] text-neutral-700 hover:text-foreground sm:inline"
          href="#record"
        >
          How it works
        </a>
        <a
          className="hidden text-[0.9375rem] text-neutral-700 hover:text-foreground sm:inline"
          href="#faq"
        >
          Questions
        </a>
        <Button className="min-h-11 px-5 text-[0.9375rem]" href={WAITLIST_HREF}>
          Join the waitlist
        </Button>
      </nav>
    </header>
  );
}
