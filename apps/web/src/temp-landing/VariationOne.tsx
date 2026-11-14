import { PRIVACY_HREF, TERMS_HREF } from '../legal/policies';
import { WAITLIST_HREF } from '../landing/config';
import { LayoutLinks, Logo, Pill } from './bits';

const steps = [
  ['01', 'Open a space', 'Add the child and the homes. You can start on your own.'],
  ['02', 'Invite the other home', 'They only see a space you share with them.'],
  ['03', 'Keep one calendar', 'School runs, handoffs and appointments, in the same week.'],
  ['04', 'Write the money down', 'What was spent, who paid, and the receipt when you have one.'],
  ['05', 'Show what changed', 'An entry is not edited in silence. The history shows it.'],
] as const;

const values = [
  ['bg-tint-sage', 'Two homes', 'The schedule, the expenses and the agreements sit together.'],
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
    'Not yet. Join the waitlist and we’ll email you when early access opens.',
  ],
  ['Does the other parent have to use it?', 'No. You can start on your own and invite them later.'],
  ['Who can see what I add?', 'Only the people you invite to a space.'],
  [
    'Is it only for separated parents?',
    'No. It’s for any family where a child spends time in more than one home.',
  ],
  [
    'How much will it cost?',
    'We haven’t set pricing yet. We’ll share it before anyone is asked to pay.',
  ],
  ['What happens to my records if I leave?', 'We’ll publish the retention rules before launch.'],
] as const;

/** A split page: photo beside the headline, steps in a row, questions always open. */
export function VariationOne() {
  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
            <a className="text-sm font-semibold tracking-[-0.02em]" href="#how">
              How it works
            </a>
            <a className="text-sm font-semibold tracking-[-0.02em]" href="#questions">
              Questions
            </a>
            <a className="text-sm font-semibold tracking-[-0.02em]" href="/sign-in">
              Sign in
            </a>
          </nav>
          <Pill className="h-11 px-5 text-sm" href={WAITLIST_HREF}>
            <span className="sm:hidden">Waitlist</span>
            <span className="hidden sm:inline">Join the waitlist</span>
          </Pill>
        </div>
      </header>
      <main id="main">
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <div className="min-w-0">
            <p className="display text-xl italic text-primary">Two homes. One childhood.</p>
            <h1 className="display mt-4 text-[2.75rem] leading-[0.95] text-balance sm:text-6xl lg:text-7xl">
              One record <span className="italic">for both homes</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed">
              Share the schedule. Log what you spent. Keep what you agreed.
            </p>
            <Pill className="mt-8" href={WAITLIST_HREF}>
              Join the waitlist
            </Pill>
            <p className="mt-4 max-w-sm text-sm leading-snug text-subtitle">
              Nookbud is in development. We’ll tell you when early access opens.
            </p>
          </div>
          <figure className="min-w-0">
            <img
              alt="A family standing together outdoors in warm light"
              className="aspect-[4/5] w-full rounded-[1.75rem] object-cover object-[center_30%] sm:aspect-[5/4] lg:aspect-[4/5]"
              src="/temp-landing/hero.jpg"
            />
            <figcaption className="mt-5 border-l-4 border-primary pl-4">
              <p className="display text-xl leading-snug">
                “Both homes see the same week. Nobody has to piece it together.”
              </p>
              <p className="mt-2 text-sm text-subtitle">A parent · example</p>
            </figcaption>
          </figure>
        </section>

        <section className="bg-surface py-16 lg:py-24" id="how">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="display max-w-[16ch] text-4xl leading-none text-balance sm:text-5xl">
              Take the tangle out of the week
            </h2>
            <p className="mt-4 max-w-xl text-lg text-subtitle">
              Nookbud holds the schedule, the expenses and what you agreed, for the people raising a
              child across homes.
            </p>
            <ol className="mt-10 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {steps.map(([n, title, text]) => (
                <li className="rounded-2xl bg-background p-5" key={n}>
                  <p className="display text-3xl text-primary">{n}</p>
                  <h3 className="mt-4 text-base font-semibold leading-snug">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-subtitle">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:py-24">
          <div>
            <h2 className="display text-4xl leading-none text-balance sm:text-5xl">
              Start with one child. No new group chat.
            </h2>
            <p className="mt-4 text-lg text-subtitle">
              No big setup. Join the list, and we’ll tell you when you can open the first space.
            </p>
          </div>
          <ol className="grid list-none gap-6 sm:grid-cols-3">
            {[
              ['1', 'Leave your email', 'We’ll write when early access opens.'],
              ['2', 'Open the first space', 'The child, the schedule, what you agreed.'],
              ['3', 'Invite the other home', 'When you are ready. They only see that space.'],
            ].map(([n, title, text]) => (
              <li key={n}>
                <p className="display text-5xl text-accent">{n}</p>
                <h3 className="mt-2 font-semibold">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-subtitle">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto grid max-w-6xl gap-8 px-6 pb-16 lg:grid-cols-[1.3fr_0.7fr] lg:pb-24">
          <blockquote className="rounded-[1.75rem] bg-foreground px-8 py-10 text-background sm:px-12 sm:py-14">
            <p className="display text-3xl leading-snug text-balance sm:text-4xl">
              “The handoff used to live in a thread. A shared week is calmer.”
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
          <div className="grid content-center gap-8">
            {[
              'I can see who paid for the boots without asking again.',
              'What we agreed is dated. I don’t have to remember the wording.',
            ].map((quote) => (
              <blockquote className="border-t border-border pt-6" key={quote}>
                <p className="display text-2xl leading-snug">“{quote}”</p>
                <p className="mt-3 text-sm text-subtitle">A parent · example</p>
              </blockquote>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16 lg:pb-24">
          <h2 className="display text-4xl leading-none sm:text-5xl">
            We keep the week in one place
          </h2>
          <ul className="mt-8 grid list-none gap-4 sm:grid-cols-2">
            {values.map(([tint, title, text]) => (
              <li className={`rounded-2xl p-6 sm:p-8 ${tint}`} key={title}>
                <h3 className="display text-3xl">{title}</h3>
                <p className="mt-2 max-w-md text-base leading-relaxed">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-border" id="questions">
          <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
            <h2 className="display text-4xl leading-none sm:text-5xl">Questions</h2>
            <dl className="mt-10 grid gap-x-12 gap-y-8 sm:grid-cols-2">
              {faqs.map(([q, a]) => (
                <div key={q}>
                  <dt className="font-semibold">{q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-subtitle">{a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl items-center gap-8 px-6 pb-16 lg:grid-cols-2 lg:pb-24">
          <div className="rounded-[1.75rem] bg-tint-sage-bold px-8 py-12 sm:px-12">
            <h2 className="display text-4xl leading-none text-balance sm:text-5xl">
              Two homes. <span className="italic">One childhood.</span>
            </h2>
            <p className="mt-4 max-w-sm text-lg">We’ll email you when early access opens.</p>
            <Pill className="mt-8" href={WAITLIST_HREF}>
              Join the waitlist
            </Pill>
          </div>
          <img
            alt="A family holding hands, seen in silhouette against a sunset"
            className="h-72 w-full rounded-[1.75rem] object-cover object-[center_40%] sm:h-96"
            src="/temp-landing/close.jpg"
          />
        </section>
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-subtitle">
              The safe corner where your child grows.
            </p>
          </div>
          <div className="grid gap-3 text-sm">
            <LayoutLinks current="/temp-landing1" />
            <p className="flex flex-wrap gap-x-4 gap-y-1 text-subtitle">
              <a href="/documentation">Documentation</a>
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
