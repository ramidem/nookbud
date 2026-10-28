import { Button } from './Button';
import { WeekCard } from './WeekCard';
import { WAITLIST_HREF, container } from './config';

/** Scattered colored dots around the headline: decoration only. */
const dots = [
  { className: 'left-[6%] top-[14%] size-3 bg-home-a' },
  { className: 'left-[14%] top-[38%] size-2 bg-warning' },
  { className: 'left-[9%] top-[62%] size-4 rounded-[4px] bg-home-b' },
  { className: 'right-[8%] top-[18%] size-4 rounded-[4px] bg-secondary' },
  { className: 'right-[15%] top-[44%] size-2.5 bg-accent' },
  { className: 'right-[6%] top-[66%] size-3 bg-accent-soft' },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-neutral-900 text-neutral-50">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[34rem]">
        {dots.map((dot) => (
          <span
            className={`absolute hidden rounded-full md:block ${dot.className}`}
            key={dot.className}
          />
        ))}
      </div>
      <div className={`${container} relative pt-16 text-center md:pt-24 lg:pt-28`}>
        <h1 className="mx-auto max-w-[16ch] text-balance text-[clamp(2.25rem,7vw,5rem)] font-semibold leading-[1.05] tracking-[clamp(-2px,-0.025em,-1px)]">
          Everything in one place, for&nbsp;them.
        </h1>
        <p className="mx-auto mt-6 max-w-[36rem] text-lg leading-[1.5] text-neutral-300">
          Nookbud is a shared record for families raising a child across homes. The schedule, the
          expenses and what you agreed, in one place everyone can see.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button href={WAITLIST_HREF} variant="on-dark">
            Join the waitlist
          </Button>
          <Button href="#record" variant="secondary-on-dark">
            See how it works
          </Button>
        </div>
        <p className="mx-auto mt-5 max-w-[30rem] text-[0.8125rem] leading-[1.4] text-neutral-400">
          Nookbud is in development. Leave your email and we&rsquo;ll tell you when early access
          opens.
        </p>
      </div>
      {/* The mockup breaks out of the band: the band ends halfway down it. */}
      <div className={`${container} relative mt-14 md:mt-16`}>
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-background" />
        <div className="relative mx-auto max-w-[44rem]">
          <WeekCard />
        </div>
      </div>
    </section>
  );
}
