import { FadeIn, StaggerChildren, StaggerItem } from './ui/Animate';
import { Section } from './ui/Section';
import { SectionHeading } from './ui/SectionHeading';

const included = [
  'All features — no tiers, no upsells',
  'Unlimited co-parent invites (they join free)',
  'Tamper-proof, verifiable records',
  'Court-ready PDF & ZIP export',
  'Unlimited Spaces for multiple arrangements',
  'Cancel anytime — no lock-in',
];

export function PricingSection() {
  return (
    <Section id="pricing" bg="surface" compact>
      <FadeIn>
        <SectionHeading className="text-center">
          One plan. Everything included.
        </SectionHeading>
        <p className="mx-auto mt-4 max-w-lg text-center text-lg text-brand-gray md:text-xl">
          No tiers. No per-seat pricing. One parent subscribes — everyone else joins free.
        </p>
      </FadeIn>

      <FadeIn delay={0.15}>
        <p className="mx-auto mt-4 max-w-sm text-center text-sm font-medium text-brand-gray">
          One hour with a family lawyer costs more than a year of Nookbud.
        </p>
      </FadeIn>

      <div className="mt-12 flex flex-col items-center gap-12 md:flex-row md:items-start md:justify-center md:gap-20">

        {/* Left — pricing options */}
        <FadeIn className="w-full max-w-xs">
          {/* Monthly */}
          <div className="rounded-2xl border border-brand-border bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-gray">Monthly</p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-serif text-5xl font-semibold text-brand-charcoal">$17.99</span>
              <span className="text-brand-gray">/mo</span>
            </div>
            <a
              href="#"
              className="mt-4 block w-full rounded-full border-2 border-brand-sage py-3 text-center text-sm font-semibold text-brand-sage transition-all hover:bg-brand-sage hover:text-white"
            >
              Get Monthly
            </a>
          </div>

          {/* Yearly — highlighted */}
          <div className="mt-4 rounded-2xl border-2 border-brand-sage bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-sage">Yearly</p>
              <span className="rounded-full bg-brand-sage/10 px-3 py-1 text-xs font-semibold text-brand-sage">Save $65</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-serif text-5xl font-semibold text-brand-charcoal">$149.99</span>
              <span className="text-brand-gray">/yr</span>
            </div>
            <p className="mt-1 text-sm text-brand-gray">~$12.50/month</p>
            <a
              href="#"
              className="mt-4 block w-full rounded-full bg-brand-sage py-3 text-center text-sm font-semibold text-white transition-all hover:bg-brand-sage-light"
            >
              Get Yearly
            </a>
          </div>

          {/* Try Free */}
          <div className="mt-4 text-center">
            <a
              href="#"
              className="text-sm font-medium text-brand-sage underline underline-offset-4 hover:opacity-70"
            >
              Try free for 14 days →
            </a>
            <p className="mt-1 text-xs text-brand-gray">No credit card needed.</p>
          </div>
        </FadeIn>

        {/* Right — features list */}
        <StaggerChildren className="space-y-4" stagger={0.06} delay={0.2}>
          {included.map((item) => (
            <StaggerItem key={item}>
              <div className="flex items-start gap-3">
                <svg className="mt-1 h-4 w-4 shrink-0 text-brand-sage" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span className="text-lg text-brand-charcoal md:text-xl">{item}</span>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>

      </div>
    </Section>
  );
}
