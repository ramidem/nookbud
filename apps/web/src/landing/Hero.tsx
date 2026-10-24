import { Button } from './Button';
import { WeekCard } from './WeekCard';
import { WAITLIST_HREF, body, container } from './config';

export function Hero() {
  return (
    <section
      className={`${container} grid gap-12 pb-16 pt-8 md:pb-20 md:pt-14 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16`}
    >
      <div>
        <h1 className="font-serif text-[clamp(2.75rem,6.4vw,4.75rem)] leading-[1.02] tracking-[-0.015em] text-foreground">
          Everything in one place&nbsp;— for&nbsp;them.
        </h1>
        <p className={`${body} mt-6 max-w-[34rem] md:text-xl md:leading-[1.6]`}>
          Nookbud is a shared record for families raising a child across homes. The schedule, the
          expenses and what you agreed, in one place everyone can see.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Button href={WAITLIST_HREF}>Join the waitlist</Button>
          <a
            className="text-base text-foreground underline decoration-primary decoration-2 underline-offset-[6px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            href="#record"
          >
            See how it works
          </a>
        </div>
        <p className="mt-5 max-w-[30rem] text-sm text-subtitle">
          Nookbud is in development. Leave your email and we&rsquo;ll tell you when early access
          opens.
        </p>
      </div>
      <WeekCard />
    </section>
  );
}
