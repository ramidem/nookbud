import Image from 'next/image';
import { FadeIn, StaggerChildren, StaggerItem } from './ui/Animate';
import { Section } from './ui/Section';
import { SectionHeading } from './ui/SectionHeading';

const features = [
  {
    title: 'Shared Schedule',
    description:
      'One calendar, two homes. Log pickups, drop-offs, and appointments — both parents see the same truth.',
    illustration: '/illustrations/undraw_digital-calendar_180l.svg',
  },
  {
    title: 'Clear Communication',
    description:
      'Every message timestamped and preserved. No more "I never said that" — the record speaks for itself.',
    illustration: '/illustrations/undraw_email_b5yu.svg',
  },
  {
    title: 'Expense Tracking',
    description:
      'Log expenses, split costs, attach receipts. Every transaction is hashed and verifiable.',
    illustration: '/illustrations/undraw_pay-with-credit-card_77g6.svg',
  },
  {
    title: 'Document Storage',
    description:
      'Medical records, school forms, legal agreements — stored with SHA-256 verification so nothing can be silently altered.',
    illustration: '/illustrations/undraw_security-on_3ykb.svg',
  },
];

export function FeaturesSection() {
  return (
    <Section id="features" bg="surface">
      <div className="text-center">
        <FadeIn>
          <SectionHeading>
            Everything you need. Nothing you don&apos;t.
          </SectionHeading>
        </FadeIn>
      </div>
      <StaggerChildren className="mt-16 grid gap-8 sm:grid-cols-2" stagger={0.12} delay={0.2}>
        {features.map((feature) => (
          <StaggerItem key={feature.title}>
            <div className="flex h-full flex-col rounded-2xl bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <Image
                src={feature.illustration}
                alt={feature.title}
                width={240}
                height={180}
                className="mx-auto mb-6 h-40 w-auto"
              />
              <h3 className="font-serif text-xl text-brand-charcoal">
                {feature.title}
              </h3>
              <p className="mt-3 leading-relaxed text-brand-gray">
                {feature.description}
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerChildren>
    </Section>
  );
}
