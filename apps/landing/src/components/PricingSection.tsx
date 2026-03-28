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
    <Section id="pricing" bg="surface">
      <FadeIn>
        <SectionHeading className="text-center">
          One plan. Everything included.
        </SectionHeading>
        <p className="mx-auto mt-4 max-w-lg text-center text-lg text-brand-gray">
          No tiers. No per-seat pricing. One parent subscribes — everyone else
          joins free.
        </p>
      </FadeIn>

      <div className="mt-16 flex flex-col items-center gap-16 md:flex-row md:items-start md:justify-center md:gap-20">
        {/* Left — price + CTA */}
        <FadeIn className="text-center">
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="font-serif font-semibold text-brand-sage">
              <span className="text-4xl md:text-5xl">&#8369;</span>
              <span className="text-7xl md:text-8xl">349</span>
            </span>
            <span className="text-xl text-brand-gray">/month</span>
          </div>
          <p className="mt-3 text-brand-gray">
            or &#8369;2,499/year{' '}
            <span className="rounded-full bg-brand-sage/10 px-3 py-1 text-sm font-medium text-brand-sage">
              save 2 months
            </span>
          </p>
          <div className="mt-10">
            <CtaButton size="large">Try Free</CtaButton>
            <p className="mt-4 text-sm text-brand-gray">
              14-day trial. No credit card.
            </p>
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
                <span className="text-lg text-brand-charcoal">{item}</span>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </Section>
  );
}
