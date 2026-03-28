import Image from 'next/image';
import { FadeIn, StaggerChildren, StaggerItem } from './ui/Animate';
import { Section } from './ui/Section';
import { SectionHeading } from './ui/SectionHeading';

const differentiators = [
  {
    title: 'Built for every family',
    description:
      'Not just divorce. Blended families, grandparent guardians, open adoption, long-distance parents — any arrangement where a child is shared.',
    illustration: '/illustrations/undraw_hiking_9zta.svg',
  },
  {
    title: 'Multiple Spaces',
    description:
      'One app for all your care arrangements. Each Space is its own care circle. Competitors lock you into one.',
    illustration: '/illustrations/undraw_share-link_y9oh.svg',
  },
  {
    title: 'Court-ready in one tap',
    description:
      'Export a complete evidence bundle — PDF timeline, attachments, and verification manifest.',
    illustration: '/illustrations/undraw_report_k55w.svg',
  },
  {
    title: 'One parent pays. Everyone joins.',
    description:
      'Invite your co-parent, a grandparent, a guardian — they join for free. No per-seat pricing.',
    illustration: '/illustrations/undraw_travelers_kud9.svg',
  },
];

export function DifferentiatorsSection() {
  return (
    <Section id="why-nookbud" bg="offwhite" compact className="[&>div]:max-w-none">
      <div className="text-center">
        <FadeIn>
          <SectionHeading>Why NookBud is different</SectionHeading>
        </FadeIn>

      </div>

      <StaggerChildren
        className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-32 md:gap-y-16"
        stagger={0.1}
        delay={0.2}
      >
        {differentiators.map((item) => (
          <StaggerItem key={item.title}>
            <div className="flex items-start gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center">
                <Image
                  src={item.illustration}
                  alt={item.title}
                  width={80}
                  height={80}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-2xl text-brand-charcoal md:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-2 text-lg leading-relaxed text-brand-charcoal/70">
                  {item.description}
                </p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerChildren>
    </Section>
  );
}
