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
    <Section id="pricing" bg="surface" compact className="py-24 md:py-32">
      <FadeIn>
        <SectionHeading className="text-center">
          One plan. Everything included.
        </SectionHeading>
        <p className="mx-auto mt-4 max-w-lg text-center text-lg text-brand-gray md:text-xl">
          One subscription covers your whole family. No tiers, no per-seat fees.
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

      {/* Price cards */}
      <div className="mt-8 grid grid-cols-2 items-center justify-center gap-0">
        {/* Left — monthly */}
        <FadeIn className="text-center">
          <div className="px-4 py-8 md:px-10 md:py-20">
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="font-serif font-semibold text-brand-sage">
                <span className="text-lg md:text-3xl">$</span>
                <span className="text-3xl md:text-5xl">17.99</span>
              </span>
              <span className="text-sm text-brand-gray md:text-xl">/month</span>
            </div>
            <div className="mt-10">
              <CtaButton variant="outline">Get Monthly</CtaButton>
            </div>
          </div>
        </FadeIn>

        {/* Right — yearly */}
        <FadeIn className="text-center" delay={0.1}>
          <div className="relative rounded-2xl bg-white px-4 py-8 md:px-10 md:py-20">
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full border-2 border-red-500 bg-white px-5 py-1.5 text-sm font-semibold text-red-500">
              Best value
            </span>
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="font-serif font-semibold text-brand-sage">
                <span className="text-3xl md:text-4xl">$</span>
                <span className="text-5xl md:text-6xl md:text-7xl">149.99</span>
              </span>
              <span className="text-sm text-brand-gray md:text-xl">/year</span>
            </div>
            <p className="mt-3 text-brand-gray">
              ~$12.50/month{' '}
              <span className="rounded-full bg-brand-sage/10 px-3 py-1 text-sm font-medium text-brand-sage">
                save $65
              </span>
            </p>
            <div className="mt-6">
              <CtaButton>Get Yearly</CtaButton>

            </div>
          </div>
        </FadeIn>
      </div>

      {/* Features list below */}
      <div className="mt-12 flex justify-center">
        <StaggerChildren className="space-y-3" stagger={0.06} delay={0.2}>
          {included.map((item) => (
            <StaggerItem key={item}>
              <div className="flex items-center gap-3">
                <svg className="h-4 w-4 shrink-0 text-brand-sage" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span className="text-base text-brand-charcoal">{item}</span>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </Section>
  );
}
