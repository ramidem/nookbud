import { PRIVACY_HREF, TERMS_HREF } from '../legal/policies';
import { WAITLIST_HREF } from '../landing/config';

const shell = 'mx-auto w-full max-w-[89.375rem]';
const pad = 'px-6 lg:px-10 xl:px-28';

const steps = [
  {
    title: 'Open a space',
    text: 'Add the child and the homes. You can start on your own and invite someone later.',
    icon: 'calendar',
  },
  {
    title: 'Invite the other home',
    text: 'They only see a space you share with them. Nothing else on Nookbud is visible to them.',
    icon: 'users',
  },
  {
    title: 'Keep one calendar',
    text: 'School runs, handoffs and appointments live in the same week, for both homes.',
    icon: 'bell',
  },
  {
    title: 'Write the money down',
    text: 'Log what was spent, who paid, and the receipt when you have one.',
    icon: 'wallet',
  },
  {
    title: 'Show what changed',
    text: 'An entry is not edited in silence. If something changes, the history shows it.',
    icon: 'check',
  },
] as const;

const starts = [
  {
    n: '1',
    title: 'Leave your email',
    text: 'Join the waitlist. We’ll write when early access opens. Pricing comes before anyone is asked to pay.',
  },
  {
    n: '2',
    title: 'Open the first space',
    text: 'Put the child, the schedule and what you have already agreed into one place.',
  },
  {
    n: '3',
    title: 'Invite the other home',
    text: 'When you are ready. They can join later, and they only see that space.',
  },
];

const examples = [
  {
    quote: 'The handoff used to live in a thread. A shared week is calmer.',
    src: '/temp-landing/face-care.jpg',
    position: 'object-[72%_42%]',
  },
  {
    quote: 'I can see who paid for the boots without asking again.',
    src: '/temp-landing/face-parent.jpg',
    position: 'object-[40%_45%]',
  },
  {
    quote: 'What we agreed is dated. I don’t have to remember the wording.',
    src: '/temp-landing/face-child.jpg',
    position: 'object-[28%_40%]',
  },
];

const values = [
  {
    title: 'Two homes',
    text: 'The schedule, the expenses and the agreements sit together, so neither home is working from a different story.',
  },
  {
    title: 'Starting alone',
    text: 'The other parent does not have to join on the first day. You can invite them when you want to.',
  },
  {
    title: 'No sides',
    text: 'Nookbud records what happened. It is not built for an argument, and it does not take one.',
  },
  {
    title: 'The child',
    text: 'School, care and what you decided stay findable, for whoever is looking after them.',
  },
];

const faqs = [
  {
    q: 'Is Nookbud available yet?',
    a: 'Not yet. We’re building it now. Join the waitlist and we’ll email you when early access opens.',
  },
  {
    q: 'Does the other parent have to use it?',
    a: 'No. You can start on your own and invite them later. They only see what’s in a space you share with them.',
  },
  {
    q: 'Who can see what I add?',
    a: 'Only the people you invite to a space. We’re designing Nookbud so one family’s records are never visible to another.',
  },
  {
    q: 'Is it only for separated parents?',
    a: 'No. It’s for any family where a child lives or spends time in more than one home.',
  },
  {
    q: 'How much will it cost?',
    a: 'We haven’t set pricing yet. We’ll share it before anyone is asked to pay.',
  },
  {
    q: 'What happens to my records if I leave?',
    a: 'We’re still deciding the retention rules. Whatever they are, we’ll publish them before launch.',
  },
];

export function TempLanding() {
  return (
    <>
      <Header />
      <main id="main">
        <Promo />
        <Hero />
        <How />
        <Start />
        <Examples />
        <Values />
        <Questions />
        <Closer />
      </main>
      <Footer />
    </>
  );
}

function Header() {
  return (
    <header className="bg-background">
      <div className={`${shell} hidden h-[5.875rem] items-center justify-between lg:flex ${pad}`}>
        <div className="flex items-center gap-11">
          <Logo />
          <nav aria-label="Main" className="flex items-center gap-6">
            <NavLink href="#how">How it works</NavLink>
            <NavLink href="#questions">Questions</NavLink>
          </nav>
        </div>
        <NavLink href="/sign-in">Sign in</NavLink>
      </div>
      <div className={`${shell} relative h-[4.75rem] lg:hidden`}>
        <div className="absolute left-6 top-[1.4rem]">
          <Logo />
        </div>
        <details className="group absolute right-4 top-4">
          <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-md text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="sr-only">Menu</span>
            <MenuIcon />
          </summary>
          <nav
            aria-label="Main"
            className="fixed inset-x-0 bottom-0 top-[4.75rem] z-20 grid content-start gap-1 bg-background px-6 py-6"
          >
            <MenuItem href="#how">How it works</MenuItem>
            <MenuItem href="#questions">Questions</MenuItem>
            <MenuItem href="/sign-in">Sign in</MenuItem>
          </nav>
        </details>
      </div>
    </header>
  );
}

function Promo() {
  return (
    <div>
      <div className={`${shell} hidden px-6 lg:block`}>
        <div className="flex h-[6.875rem] items-center justify-between rounded-[14px] border border-border-strong bg-surface px-10 shadow-card xl:px-12">
          <p className="display text-2xl leading-none tracking-[-0.04em] text-foreground">
            Two homes. One childhood.
          </p>
          <Pill href={WAITLIST_HREF}>Join the waitlist</Pill>
        </div>
      </div>
      <div className="flex justify-center px-2.5 lg:hidden">
        <div className="rounded-full border border-border-strong bg-surface/95 px-2 py-2 shadow-card">
          <Pill href={WAITLIST_HREF}>Join the waitlist</Pill>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative pb-16 lg:pb-0">
      <div className={`${shell} ${pad} pt-6 lg:pb-14 lg:pt-16 xl:pt-[4.5rem]`}>
        <div className="flex min-w-0 flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <h1 className="display min-w-0 text-[3rem] leading-[0.92] tracking-[-0.04em] text-foreground sm:text-[3.75rem] lg:w-[26rem] lg:text-[4.25rem] xl:w-[33.5rem] xl:text-[5.125rem]">
            One record <span className="italic">for both homes</span>
          </h1>
          <div className="max-w-md lg:w-[22rem] lg:pt-1 xl:w-[28rem]">
            <p className="text-lg leading-[1.4] tracking-[-0.01em] text-foreground">
              Share the schedule.
              <br />
              Log what you spent.
              <br />
              Keep what you agreed.
            </p>
            <Pill className="mt-8 lg:mt-8" href={WAITLIST_HREF}>
              Join the waitlist
            </Pill>
            <p className="mt-4 max-w-sm text-sm leading-snug text-subtitle">
              Nookbud is in development. Leave your email and we’ll tell you when early access
              opens.
            </p>
          </div>
        </div>
      </div>
      <div className={`${shell} relative mt-8 h-[28rem] lg:mt-0 lg:h-[40rem] xl:h-[47rem]`}>
        <div className="absolute inset-x-0 top-0 h-[15rem] overflow-hidden lg:inset-0 lg:h-full">
          <img
            alt="A family standing together outdoors in warm light"
            className="h-full w-full object-cover object-[center_32%]"
            src="/temp-landing/hero.jpg"
          />
        </div>
        <article className="absolute left-6 right-6 top-[8.4rem] h-[18.75rem] overflow-hidden rounded-[20px] bg-surface shadow-mockup lg:left-auto lg:right-10 lg:top-auto lg:bottom-16 lg:h-[18.5rem] lg:w-[22rem] xl:right-28 xl:w-[23.5rem]">
          <div className="h-2.5 bg-primary" />
          <p className="display max-w-[18rem] px-7 pt-7 text-[1.35rem] leading-[1.2] tracking-[-0.03em] text-foreground lg:px-8 lg:pt-8 lg:text-[1.375rem]">
            “Both homes see the same week. Nobody has to piece it together.”
          </p>
          <div className="absolute bottom-7 left-7 flex items-center gap-3 lg:bottom-8 lg:left-8">
            <img
              alt=""
              className="size-10 rounded-full object-cover object-[28%_40%]"
              src="/temp-landing/face-child.jpg"
            />
            <div>
              <p className="text-base font-semibold leading-tight tracking-[-0.01em] lg:text-lg">
                A parent
              </p>
              <p className="text-sm leading-tight text-subtitle">Example</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function How() {
  return (
    <section className={`${shell} ${pad} py-16 lg:py-24`} id="how">
      <div className="grid items-start gap-14 lg:grid-cols-2 lg:gap-16 xl:gap-28">
        <div>
          <h2 className="display text-[2.625rem] leading-none tracking-[-0.04em] text-foreground lg:text-[2.875rem] xl:text-[3.25rem]">
            Take the tangle
            <br />
            out of the week
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-[1.35] tracking-[-0.01em] text-subtitle">
            Nookbud holds the schedule, the expenses and what you agreed, for the people raising a
            child across homes.
          </p>
          <Pill className="mt-7" href={WAITLIST_HREF}>
            Join the waitlist
          </Pill>
          <div className="relative mt-20 max-w-xl">
            <div className="absolute -top-6 left-8 z-10 flex h-12 items-center gap-1 rounded-[14px] border border-border-strong bg-background px-4 text-accent">
              <Stars />
            </div>
            <article className="rounded-[14px] border border-border-strong px-7 pb-8 pt-12 lg:px-8">
              <p className="text-lg leading-snug tracking-[-0.01em] text-subtitle">
                From a parent · example
              </p>
              <p className="display mt-6 text-[1.7rem] leading-[1.12] tracking-[-0.03em] text-foreground">
                “I used to scroll three chats to find the dentist. Now the week is just there.”
              </p>
              <div className="mt-8">
                <p className="text-lg font-semibold tracking-[-0.01em]">A parent</p>
                <p className="mt-1 text-sm text-subtitle">Example, not a review</p>
              </div>
            </article>
          </div>
        </div>
        <ol className="m-0 grid list-none p-0">
          {steps.map((step, index) => (
            <li className="flex items-stretch gap-6 lg:gap-8" key={step.title}>
              <div className="flex w-[3.375rem] shrink-0 flex-col items-center">
                <div className="flex size-[3.375rem] items-center justify-center rounded-md bg-surface-raised text-primary">
                  <StepIcon name={step.icon} />
                </div>
                {index < steps.length - 1 ? <div className="w-px flex-1 bg-border" /> : null}
              </div>
              <div className={index < steps.length - 1 ? 'pb-8' : ''}>
                <h3 className="display text-xl leading-[1.2] tracking-[-0.03em] text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-md text-base leading-[1.35] tracking-[-0.01em] text-subtitle">
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Start() {
  return (
    <section className={`${shell} ${pad} pb-16 lg:pb-24`}>
      <div className="rounded-[14px] border border-border-strong bg-surface px-6 py-14 shadow-card sm:px-10 lg:px-16 lg:py-20">
        <h2 className="display mx-auto max-w-[18ch] text-center text-[2.625rem] leading-none tracking-[-0.04em] text-foreground lg:text-[3.25rem]">
          Start with one child.
          <br />
          No new group chat.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-center text-lg leading-[1.35] tracking-[-0.01em] text-subtitle">
          No big setup. Join the list, and we’ll tell you when you can open the first space.
        </p>
        <ol className="m-0 mt-12 grid list-none gap-4 p-0 lg:grid-cols-3 lg:gap-6">
          {starts.map((item) => (
            <li className="rounded-[14px] bg-surface-raised px-7 py-7" key={item.n}>
              <span className="flex size-10 items-center justify-center rounded-full border border-border-strong bg-surface text-base shadow-card">
                {item.n}
              </span>
              <h3 className="display mt-4 text-xl leading-[1.2] tracking-[-0.03em]">
                {item.title}
              </h3>
              <p className="mt-2 text-base leading-[1.35] tracking-[-0.01em] text-subtitle">
                {item.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Examples() {
  return (
    <section className={`${shell} ${pad} pb-16 lg:pb-24`}>
      <h2 className="display max-w-[16ch] text-[2.625rem] leading-none tracking-[-0.04em] lg:text-[3.25rem]">
        What families might say
      </h2>
      <p className="mt-4 max-w-xl text-lg leading-[1.35] text-subtitle">
        Examples of the note we hope to hear. These are not reviews. Nookbud is still in
        development.
      </p>
      <ul className="m-0 mt-10 grid list-none gap-4 p-0 lg:grid-cols-3 lg:gap-6">
        {examples.map((item) => (
          <li
            className="flex min-h-64 flex-col justify-between rounded-[14px] border border-border-strong bg-surface p-7 shadow-card"
            key={item.quote}
          >
            <p className="display text-[1.35rem] leading-[1.25] tracking-[-0.03em]">
              “{item.quote}”
            </p>
            <div className="mt-8 flex items-center gap-3">
              <img
                alt=""
                className={`size-10 rounded-full object-cover ${item.position}`}
                src={item.src}
              />
              <div>
                <p className="font-semibold tracking-[-0.01em]">A parent</p>
                <p className="text-sm text-subtitle">Example</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Values() {
  return (
    <section className={`${shell} ${pad} pb-16 lg:pb-28`}>
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16 xl:gap-24">
        <div>
          <h2 className="display max-w-[16ch] text-[2.625rem] leading-none tracking-[-0.04em] lg:text-[3.25rem]">
            We keep the week in one place
          </h2>
          <ul className="m-0 mt-8 grid list-none gap-5 p-0">
            {values.map((item) => (
              <li className="flex items-start gap-3" key={item.title}>
                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center text-primary">
                  <CheckBadge />
                </span>
                <p className="text-base leading-[1.45] tracking-[-0.01em] text-foreground">
                  <span className="font-semibold">{item.title}: </span>
                  <span className="text-subtitle">{item.text}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
        <article className="overflow-hidden rounded-[14px] border border-border-strong bg-surface shadow-card">
          <div className="h-6 bg-primary" />
          <div className="px-8 py-10 lg:px-12 lg:py-12">
            <p className="display text-[2.75rem] leading-[0.95] tracking-[-0.04em] lg:text-[3.25rem]">
              For any home <span className="italic">a child lives in</span>
            </p>
            <p className="mt-5 max-w-sm text-lg leading-[1.35] tracking-[-0.01em]">
              Separated parents, grandparents, blended families, and parents working far away.
            </p>
            <Pill className="mt-8" href={WAITLIST_HREF}>
              Join the waitlist
            </Pill>
          </div>
        </article>
      </div>
    </section>
  );
}

function Questions() {
  return (
    <section className={`${shell} ${pad} pb-16 lg:pb-28`} id="questions">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-16">
        <h2 className="display text-[2.625rem] leading-none tracking-[-0.04em] lg:pt-16 lg:text-[3.25rem]">
          Frequently
          <br />
          asked questions
        </h2>
        <div className="border-t border-border">
          {faqs.map((faq, index) => (
            <details className="group border-b border-border" key={faq.q}>
              <summary className="flex cursor-pointer items-center gap-4 py-5 marker:content-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                <span className="w-8 shrink-0 text-sm tracking-[-0.01em] text-subtitle">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="display flex-1 text-xl leading-snug tracking-[-0.03em]">
                  {faq.q}
                </span>
                <span
                  aria-hidden="true"
                  className="text-2xl leading-none text-subtitle transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-xl pb-5 pl-12 text-base leading-[1.4] text-subtitle">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Closer() {
  return (
    <section className={`${shell} px-0`}>
      <div className="relative h-[34rem] overflow-hidden lg:h-[42rem]">
        <img
          alt="A family holding hands, seen in silhouette against a sunset"
          className="absolute inset-0 h-full w-full object-cover object-[center_40%]"
          src="/temp-landing/close.jpg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-12 text-neutral-50 lg:bottom-20">
          <div
            className={`${pad} mx-auto flex w-full max-w-[89.375rem] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between`}
          >
            <p className="display max-w-[12ch] text-[2.625rem] leading-none tracking-[-0.04em] lg:text-[4.5rem]">
              Two homes. <span className="italic">One childhood.</span>
            </p>
            <div className="max-w-sm lg:pb-2">
              <p className="text-lg leading-[1.35] tracking-[-0.01em]">
                We’ll email you when early access opens.
              </p>
              <Pill className="mt-6" href={WAITLIST_HREF}>
                Join the waitlist
              </Pill>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-background">
      <div
        className={`${shell} grid gap-8 px-6 py-12 lg:grid-cols-[16rem_1fr] lg:items-start lg:px-10 lg:py-16 xl:px-28`}
      >
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-lg leading-snug tracking-[-0.01em] text-subtitle">
            The safe corner where your child grows.
          </p>
        </div>
        <nav aria-label="Footer" className="lg:justify-self-end">
          <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0">
            <li>
              <FooterLink href="/documentation">Documentation</FooterLink>
            </li>
            <li>
              <FooterLink href="/">Current landing</FooterLink>
            </li>
            <li>
              <FooterLink href="/sign-in">Sign in</FooterLink>
            </li>
          </ul>
          <ul className="m-0 mt-3 flex list-none flex-wrap gap-x-5 gap-y-1 p-0 text-sm text-subtitle">
            <li>
              <a className="hover:text-foreground" href={TERMS_HREF}>
                Terms
              </a>
            </li>
            <li>
              <a className="hover:text-foreground" href={PRIVACY_HREF}>
                Privacy
              </a>
            </li>
            <li>
              <a className="hover:text-foreground" href="mailto:hello@nookbud.com">
                hello@nookbud.com
              </a>
            </li>
            <li>© {new Date().getFullYear()} Nookbud</li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}

function Logo() {
  return (
    <a className="inline-flex items-center gap-2.5 rounded-md" href="/temp-landing">
      <img
        alt=""
        className="size-8 rounded-md"
        height={32}
        src="/design/logos/nookbud-app-icon.png"
        width={32}
      />
      <span className="display text-[1.65rem] leading-none tracking-[-0.04em] text-foreground">
        Nookbud
      </span>
    </a>
  );
}

function Pill({
  href,
  children,
  className = '',
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      className={`inline-flex h-[3.8125rem] items-center justify-center rounded-full bg-primary px-8 text-base font-semibold leading-none tracking-[-0.02em] text-background hover:bg-primary-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
      href={href}
    >
      {children}
    </a>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      className="text-base font-semibold leading-none tracking-[-0.02em] text-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      href={href}
    >
      {children}
    </a>
  );
}

function MenuItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      className="rounded-md px-3 py-3 text-base font-semibold tracking-[-0.02em] hover:bg-surface-raised"
      href={href}
    >
      {children}
    </a>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      className="text-sm font-medium tracking-[-0.01em] underline decoration-transparent underline-offset-4 hover:decoration-border"
      href={href}
    >
      {children}
    </a>
  );
}

function Stars() {
  return (
    <span aria-label="5 stars" className="flex gap-0.5" role="img">
      {Array.from({ length: 5 }, (_, index) => (
        <svg
          aria-hidden="true"
          className="size-4"
          fill="currentColor"
          key={index}
          viewBox="0 0 20 20"
        >
          <path d="M10 1.8 12.2 7l5.6.5-4.2 3.7 1.3 5.5L10 13.8 5.1 16.7 6.4 11.2 2.2 7.5 7.8 7 10 1.8Z" />
        </svg>
      ))}
    </span>
  );
}

function CheckBadge() {
  return (
    <svg aria-hidden="true" className="size-10" fill="none" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M13.5 20.5 18 25l9-10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
      <path
        className="group-open:hidden"
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        className="hidden group-open:block"
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function StepIcon({ name }: { name: (typeof steps)[number]['icon'] }) {
  const common = {
    'aria-hidden': true,
    className: 'size-5',
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 1.8,
    viewBox: '0 0 24 24',
  };
  if (name === 'calendar') {
    return (
      <svg {...common}>
        <path d="M8 3v3M16 3v3M4 9h16" />
        <rect height="14" rx="2" width="16" x="4" y="5" />
      </svg>
    );
  }
  if (name === 'users') {
    return (
      <svg {...common}>
        <path d="M16 20v-1.2A3.8 3.8 0 0 0 12.2 15H7.8A3.8 3.8 0 0 0 4 18.8V20" />
        <circle cx="10" cy="8" r="3" />
        <path d="M20 20v-1.1A3.4 3.4 0 0 0 17.2 15.6M15.2 5.2a3 3 0 0 1 0 5.6" />
      </svg>
    );
  }
  if (name === 'bell') {
    return (
      <svg {...common}>
        <path d="M6 16V10a6 6 0 1 1 12 0v6l1.5 2h-15L6 16Z" />
        <path d="M10 19a2 2 0 0 0 4 0" />
      </svg>
    );
  }
  if (name === 'wallet') {
    return (
      <svg {...common}>
        <rect height="14" rx="2" width="18" x="3" y="6" />
        <path d="M3 10h18" />
        <path d="M16 15h2" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8" />
      <path d="m8.5 12.2 2.3 2.3 4.7-5" />
    </svg>
  );
}
