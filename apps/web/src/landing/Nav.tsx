'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from './Button';
import { WAITLIST_HREF, container, focusRing } from './config';

const link = `rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 ${focusRing}`;

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
      <div className={`${container} flex h-16 items-center justify-between gap-3`}>
        <a className={`flex min-w-0 items-center gap-2.5 rounded-md ${focusRing}`} href="/">
          <Image
            alt=""
            className="rounded-md"
            height={28}
            src="/design/logos/nookbud-app-icon.png"
            width={28}
          />
          <span className="hidden truncate text-[1.0625rem] font-semibold tracking-[-0.2px] text-foreground min-[23.5rem]:inline">
            Nookbud
          </span>
        </a>
        <nav aria-label="Main" className="relative flex items-center gap-1 md:gap-2">
          <a className={`${link} hidden sm:inline`} href="#record">
            How it works
          </a>
          <a className={`${link} hidden sm:inline`} href="#faq">
            Questions
          </a>
          <Button className="ml-1 min-h-11 px-3 sm:ml-2 sm:px-[18px]" href={WAITLIST_HREF}>
            <span className="sm:hidden">Waitlist</span>
            <span className="hidden sm:inline">Join the waitlist</span>
          </Button>
          <button
            aria-controls="landing-menu"
            aria-expanded={open}
            className={`min-h-11 rounded-md px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-200 sm:hidden ${focusRing}`}
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            Menu
          </button>
          {open ? (
            <div
              className="absolute right-0 top-full z-20 mt-2 grid w-44 rounded-xl border border-border bg-surface p-2 shadow-[var(--shadow-sm)] sm:hidden"
              id="landing-menu"
            >
              <a className={link} href="#record" onClick={() => setOpen(false)}>
                How it works
              </a>
              <a className={link} href="#faq" onClick={() => setOpen(false)}>
                Questions
              </a>
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
