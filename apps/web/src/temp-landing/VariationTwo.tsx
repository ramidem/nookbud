import { PRIVACY_HREF, TERMS_HREF } from '../legal/policies';
import { Logo, Pill, WAITLIST_HREF } from './bits';

const steps = [
  ['01', 'Open a space', 'Add the child. You can start on your own and invite someone later.'],
  [
    '02',
    'Invite who helps',
    'They only see a space you share with them. Nothing else is visible to them.',
  ],
  [
    '03',
    'Keep one calendar',
    'School pickup, the dentist, and the things the child needs live in the same week.',
  ],
  [
    '04',
    'Write the money down',
    'Log what was spent, who paid, and the receipt when you have one.',
  ],
  [
    '05',
    'Show what changed',
    'An entry is not edited in silence. If something changes, the history shows it.',
  ],
] as const;

const starts = [
  [
    '1',
    'Leave your email',
    'Join the waitlist. We’ll write when early access opens. Pricing comes before anyone is asked to pay.',
  ],
  [
    '2',
    'Open the first space',
    'Put the child, the schedule and what you have already agreed into one place.',
  ],
  [
    '3',
    'Invite who helps',
    'When you are ready. They can join later, and they only see that space.',
  ],
] as const;

const sideQuotes = [
  [
    'I can see who paid for the boots without asking again.',
    '/temp-landing/face-parent.jpg',
    'object-[40%_45%]',
  ],
  [
    'What we agreed is dated. I don’t have to remember the wording.',
    '/temp-landing/face-child.jpg',
    'object-[28%_40%]',
  ],
] as const;

const values = [
  ['bg-tint-sage', 'The week', 'School, health, and the things the child needs sit together.'],
  [
    'bg-tint-terracotta',
    'Starting alone',
    'The other parent does not have to join on the first day.',
  ],
  ['bg-tint-rose', 'No sides', 'It records what happened. It does not take an argument.'],
  ['bg-tint-taupe', 'The child', 'School, care and what you decided stay findable.'],
] as const;

const faqs = [
  [
    'Is Nookbud available yet?',
    'Not yet. We’re building it now. Join the waitlist and we’ll email you when early access opens.',
  ],
  [
    'Does the other parent have to use it?',
    'No. You can start on your own and invite them later. They only see what’s in a space you share with them.',
  ],
  [
    'Who can see what I add?',
    'Only the people you invite to a space. One family’s records are never visible to another.',
  ],
  [
    'Who is Nookbud for?',
    'Parents, grandparents, and guardians keep it together. A parent abroad sees the same week. A lawyer can be invited to read it.',
  ],
  [
    'How much will it cost?',
    'We haven’t set pricing yet. We’ll share it before anyone is asked to pay.',
  ],
  [
    'What happens to my records if I leave?',
    'We’re still deciding the retention rules. We’ll publish them before launch.',
  ],
] as const;

/**
 * Mix landing. `/` and `/temp-landing2` both render it. Split hero with the sage-bar quote on the photo,
 * numbered steps beside a sample note, and the tint tiles beside a card.
 */
export function VariationTwo({ logoHref = '/temp-landing2' }: { logoHref?: string }) {
  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4">
          <Logo href={logoHref} />
          <nav
            aria-label="Main"
            className="order-last flex w-full gap-5 text-sm font-semibold sm:order-none sm:w-auto"
          >
            <a href="#how">How it works</a>
            <a href="#questions">Questions</a>
            <a href="/sign-in">Sign in</a>
          </nav>
          <Pill className="h-11 px-5 text-sm" href={WAITLIST_HREF}>
            <span className="sm:hidden">Waitlist</span>
            <span className="hidden sm:inline">Join the waitlist</span>
          </Pill>
        </div>
      </header>
      <main id="main">
        <section className="mx-auto grid max-w-[1440px] items-center gap-10 px-6 py-12 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <div className="min-w-0">
            <p className="display text-xl italic text-primary">The week in one place.</p>
            <h1 className="display mt-4 text-[2.75rem] leading-[0.95] text-balance sm:text-6xl lg:text-7xl">
              One record <span className="italic">for the kids.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed">
              Share the schedule.
              <br />
              Log what you spent.
              <br />
              Keep what you agreed.
            </p>
            <Pill className="mt-8" href={WAITLIST_HREF}>
              Join the waitlist
            </Pill>
            <p className="mt-4 max-w-sm text-sm leading-snug text-subtitle">
              Nookbud is in development. Leave your email and we’ll tell you when early access
              opens.
            </p>
          </div>
          <figure className="relative min-w-0">
            <img
              alt="A family standing together outdoors in warm light"
              className="aspect-[4/5] w-full rounded-[1.75rem] object-cover object-[center_30%] sm:aspect-[5/4] lg:aspect-[4/5]"
              src="/temp-landing/hero.jpg"
            />
            <article className="relative z-10 -mt-24 overflow-hidden rounded-[20px] bg-surface shadow-mockup sm:-mt-28 lg:absolute lg:inset-x-6 lg:bottom-6 lg:mt-0">
              <div className="h-2.5 bg-primary" />
              <p className="display px-6 pb-2 pt-6 text-xl leading-snug sm:px-7 sm:text-2xl">
                “The people you invite see the same week. Nobody has to piece it together.”
              </p>
              <div className="flex items-center gap-3 px-6 py-5 sm:px-7">
                <img
                  alt=""
                  className="size-10 rounded-full object-cover object-[28%_40%]"
                  src="/temp-landing/face-child.jpg"
                />
                <div>
                  <p className="font-semibold leading-tight">A parent</p>
                  <p className="text-sm text-subtitle">Example</p>
                </div>
              </div>
            </article>
          </figure>
        </section>

        <section className="bg-surface py-16 lg:py-24" id="how">
          <div className="mx-auto grid max-w-[1440px] gap-12 px-6 lg:grid-cols-2 lg:gap-16">
            <div className="flex min-w-0 flex-col">
              <h2 className="display text-4xl leading-none text-balance sm:text-5xl">
                Take the tangle out of the week
              </h2>
              <p className="mt-4 max-w-xl text-lg text-subtitle">
                Nookbud holds the schedule, the tasks, and the money spent on the child: school,
                health, and the things the child needs.
              </p>
              <Pill className="mt-8 self-start" href={WAITLIST_HREF}>
                Join the waitlist
              </Pill>
              <article className="mt-10 rounded-[14px] border border-border-strong bg-background px-6 py-7 sm:px-8 lg:mt-auto">
                <p className="text-sm text-subtitle">From a parent · example</p>
                <p className="display mt-4 text-2xl leading-snug">
                  “I used to scroll three chats to find the dentist. Now the week is just there.”
                </p>
                <p className="mt-5 text-sm text-subtitle">Example, not a review</p>
              </article>
            </div>
            <ol className="grid list-none gap-3">
              {steps.map(([n, title, text]) => (
                <li
                  className="grid grid-cols-[3rem_minmax(0,1fr)] gap-3 rounded-2xl bg-background p-5"
                  key={n}
                >
                  <p className="display text-2xl text-primary">{n}</p>
                  <div className="min-w-0">
                    <h3 className="font-semibold leading-snug">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-subtitle">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-6 py-16 lg:py-24">
          <div className="rounded-[14px] border border-border-strong bg-surface px-6 py-12 shadow-card sm:px-10 lg:px-16 lg:py-16">
            <h2 className="display mx-auto max-w-[18ch] text-center text-4xl leading-none text-balance sm:text-5xl">
              Start with one child. No new group chat.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-lg text-subtitle">
              No big setup. Join the list, and we’ll tell you when you can open the first space.
            </p>
            <ol className="mt-12 grid list-none gap-8 sm:grid-cols-3">
              {starts.map(([n, title, text]) => (
                <li className="min-w-0" key={n}>
                  <p className="display text-5xl text-accent">{n}</p>
                  <h3 className="mt-3 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-subtitle">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-6 pb-16 lg:pb-24">
          <h2 className="display text-4xl leading-none text-balance sm:text-5xl">
            What families might say
          </h2>
          <p className="mt-4 max-w-xl text-lg text-subtitle">
            Examples of the note we hope to hear. These are not reviews. Nookbud is still in
            development.
          </p>
          <div className="mt-10 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <blockquote className="flex min-w-0 flex-col justify-between rounded-[1.75rem] bg-foreground px-8 py-10 text-background sm:px-12 sm:py-14">
              <p className="display text-3xl leading-snug text-balance sm:text-4xl">
                “School pickup used to live in a thread. A shared week is calmer.”
              </p>
              <footer className="mt-8 flex items-center gap-3 text-sm">
                <img
                  alt=""
                  className="size-10 rounded-full object-cover object-[72%_42%]"
                  src="/temp-landing/face-care.jpg"
                />
                A parent · example
              </footer>
            </blockquote>
            <div className="grid content-start gap-4">
              {sideQuotes.map(([quote, src, position]) => (
                <blockquote
                  className="rounded-[14px] border border-border-strong bg-surface p-6 shadow-card"
                  key={quote}
                >
                  <p className="display text-xl leading-snug">“{quote}”</p>
                  <footer className="mt-5 flex items-center gap-3 text-sm text-subtitle">
                    <img
                      alt=""
                      className={`size-9 rounded-full object-cover ${position}`}
                      src={src}
                    />
                    A parent · example
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1440px] items-stretch gap-6 px-6 pb-16 lg:grid-cols-2 lg:gap-8 lg:pb-24">
          <article className="min-w-0 overflow-hidden rounded-[14px] border border-border-strong bg-surface shadow-card">
            <div className="h-2.5 bg-primary" />
            <div className="px-8 py-10 sm:px-10">
              <h2 className="display text-4xl leading-[0.95] text-balance sm:text-5xl">
                For any home <span className="italic">a child lives in</span>
              </h2>
              <p className="mt-4 max-w-sm text-lg">
                Parents, grandparents, and guardians. A parent abroad sees the same week.
              </p>
              <Pill className="mt-8" href={WAITLIST_HREF}>
                Join the waitlist
              </Pill>
            </div>
          </article>
          <ul className="grid list-none gap-3 sm:grid-cols-2">
            {values.map(([tint, title, text]) => (
              <li className={`min-w-0 rounded-2xl p-5 ${tint}`} key={title}>
                <h3 className="display text-2xl leading-tight">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-border" id="questions">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-16 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:py-24">
            <h2 className="display text-4xl leading-none sm:text-5xl">Questions</h2>
            <dl className="m-0">
              {faqs.map(([q, a], index) => (
                <div
                  className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 border-b border-border py-5"
                  key={q}
                >
                  <span className="display text-lg text-primary">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <dt className="font-semibold">{q}</dt>
                    <dd className="m-0 mt-2 text-sm leading-relaxed text-subtitle">{a}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-6 pb-16 lg:pb-24">
          <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-0">
            <div className="relative z-10 flex min-w-0 flex-col justify-center rounded-[1.75rem] bg-tint-sage-bold px-8 py-12 sm:px-12 lg:-mr-12 lg:my-10">
              <h2 className="display text-4xl leading-none text-balance sm:text-5xl">
                The week <span className="italic">in one place.</span>
              </h2>
              <p className="mt-4 max-w-sm text-lg">We’ll email you when early access opens.</p>
              <Pill className="mt-8" href={WAITLIST_HREF}>
                Join the waitlist
              </Pill>
            </div>
            <img
              alt="A family holding hands, seen in silhouette against a sunset"
              className="h-72 w-full min-w-0 rounded-[1.75rem] object-cover object-[center_40%] sm:h-96 lg:h-auto lg:min-h-[28rem]"
              src="/temp-landing/close.jpg"
            />
          </div>
        </section>
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-6 py-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Logo href={logoHref} />
            <p className="mt-3 max-w-xs text-sm text-subtitle">
              The safe corner where your child grows.
            </p>
          </div>
          <div className="grid gap-3 text-sm">
            <p className="flex flex-wrap gap-x-4 gap-y-1 text-subtitle">
              <a href="/documentation">Documentation</a>
              {logoHref === '/' ? null : <a href="/">Current landing</a>}
              <a href={TERMS_HREF}>Terms</a>
              <a href={PRIVACY_HREF}>Privacy</a>
              <a href="mailto:hello@nookbud.com">hello@nookbud.com</a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
