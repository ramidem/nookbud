import { FadeIn, StaggerChildren, StaggerItem } from './ui/Animate';
import { Section } from './ui/Section';
import { SectionHeading } from './ui/SectionHeading';

const features = [
  {
    title: "No more 'I didn't know about that'",
    description:
      'One shared calendar. Log pickups, drop-offs, and appointments — both parents see the same truth.',
  },
  {
    title: 'The record speaks for itself',
    description:
      'Every message timestamped and preserved. No more disputed conversations — the record is already there.',
  },
  {
    title: 'No more disputed costs',
    description:
      'Log expenses, split costs, attach receipts. Every transaction is hashed and verifiable.',
  },
  {
    title: 'Every document, always accessible',
    description:
      'Medical records, school forms, legal agreements — stored securely so nothing can be silently altered.',
  },
];

function CircleCheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-sage">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function FeaturesSection() {
  return (
    <Section id="features" bg="surface" compact className="[&>div]:max-w-none">
      <div className="text-center">
        <FadeIn>
          <SectionHeading>
            Everything you need.<br />Nothing you don&apos;t.
          </SectionHeading>
        </FadeIn>
      </div>
      <StaggerChildren
        className="mx-auto mt-16 max-w-3xl overflow-hidden rounded-2xl"
        stagger={0.12}
        delay={0.2}
      >
        {features.map((feature, i) => (
          <StaggerItem key={feature.title}>
            <div className={`flex items-start gap-5 bg-white p-8 ${
              i < features.length - 1 ? 'border-b border-brand-surface' : ''
            }`}>
              <div className="mt-1 shrink-0">
                <CircleCheckIcon />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-lg text-brand-sage md:text-2xl">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-charcoal/70 md:text-lg">
                  {feature.description}
                </p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerChildren>
    </Section>
  );
}
