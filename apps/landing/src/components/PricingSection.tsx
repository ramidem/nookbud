import { FadeIn, StaggerChildren, StaggerItem } from './ui/Animate';
import { CtaButton } from './ui/CtaButton';
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
          No tiers. No per-seat pricing. One parent subscribes — everyone else
          joins free.
        </p>
      </FadeIn>

      {/* Price anchor */}
      <FadeIn delay={0.15}>
        <p className="mx-auto mt-6 max-w-sm text-center text-sm font-medium text-brand-gray">
          One hour with a family lawyer costs more than a year of Nookbud.
        </p>
      </FadeIn>

      {/* Try Free */}
      <FadeIn delay={0.2}>
        <div className="mt-8 text-center">
          <a href="#" className="text-sm font-medium text-brand-sage underline underline-offset-4 hover:opacity-70">
            Try free for 14 days →
          </a>
          <p className="mt-1 text-xs text-brand-gray">No credit card needed.</p>
        </div>
      </FadeIn>

      <div className="mt-8 flex flex-col items-center gap-10 md:flex-row md:items-start md:justify-center md:gap-10">
        {/* Left — price + CTA */}
        <FadeIn className="text-center">
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="font-serif font-semibold text-brand-sage">
              <span className="text-2xl md:text-3xl">$</span>
              <span className="text-5xl md:text-6xl">17.99</span>
            </span>
            <span className="text-xl text-brand-gray">/month</span>
          </div>
          <div className="mt-10">
            <CtaButton>Get Monthly</CtaButton>
          </div>
        </FadeIn>

        {/* Middle — yearly */}
        <FadeIn className="text-center" delay={0.1}>
          <div className="rounded-2xl border-2 border-brand-sage bg-white px-8 py-8">
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="font-serif font-semibold text-brand-sage">
                <span className="text-3xl md:text-4xl">$</span>
                <span className="text-6xl md:text-7xl">149.99</span>
              </span>
              <span className="text-xl text-brand-gray">/year</span>
            </div>
            <p className="mt-3 text-brand-gray">
              ~$12.50/month{' '}
              <span className="rounded-full bg-brand-sage/10 px-3 py-1 text-sm font-medium text-brand-sage">
                save $65
              </span>
            </p>
            <div className="mt-6">
              <CtaButton>Get Yearly</CtaButton>
              <p className="mt-3 text-sm text-brand-gray">Best value.</p>
            </div>
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
