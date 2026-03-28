import Image from 'next/image';
import { FadeIn, StaggerChildren, StaggerItem } from './ui/Animate';
import { Section } from './ui/Section';
import { SectionHeading } from './ui/SectionHeading';

const differentiators = [
  {
    title: 'Built for every family',
    description:
      'Not just divorce. OFW families, grandparent guardians, blended families, open adoption — NookBud works for any arrangement where a child is shared between caregivers.',
    illustration: '/illustrations/undraw_hiking_9zta.svg',
  },
  {
    title: 'Multiple Spaces',
    description:
      "One app for all your care arrangements. Each Space is a care circle — create as many as you need. Competitors lock you into one arrangement.",
    illustration: '/illustrations/undraw_share-link_y9oh.svg',
  },
  {
    title: 'Tamper-proof records',
    description:
      'Every entry is versioned and every file is SHA-256 hashed. Nothing can be silently edited or deleted. The record speaks for itself.',
    illustration: '/illustrations/undraw_security-on_3ykb.svg',
  },
  {
    title: 'Court-ready in one tap',
    description:
      'Export a complete evidence bundle — PDF timeline, file attachments, hash verification manifest. Organized for lawyers, courts, and institutions.',
    illustration: '/illustrations/undraw_report_k55w.svg',
  },
  {
    title: 'One parent pays. Everyone joins.',
    description:
      'Invite your co-parent, a grandparent, a guardian — they join for free. No per-seat pricing. ~$6/month covers everything.',
    illustration: '/illustrations/undraw_travelers_kud9.svg',
  },
];

export function DifferentiatorsSection() {
  return (
    <Section id="why-nookbud" bg="offwhite">
      <div className="text-center">
        <FadeIn>
          <SectionHeading>Why NookBud is different</SectionHeading>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p className="mx-auto mt-4 max-w-xl text-base text-brand-gray md:text-lg">
            Every co-parenting app assumes two parents, one child, one
            arrangement. Families are more complex than that.
          </p>
        </FadeIn>
      </div>

      <div className="mt-16 space-y-20">
        {differentiators.map((item, i) => (
          <div
            key={item.title}
            className={`flex flex-col items-center gap-10 md:gap-16 ${
              i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
            }`}
          >
            <FadeIn direction={i % 2 === 0 ? 'left' : 'right'} className="flex-1">
              <Image
                src={item.illustration}
                alt={item.title}
                width={380}
                height={280}
                className="mx-auto w-full max-w-[200px] md:max-w-sm"
              />
            </FadeIn>
            <FadeIn direction={i % 2 === 0 ? 'right' : 'left'} delay={0.15} className="flex-1">
              <h3 className="font-serif text-xl text-brand-charcoal md:text-3xl">
                {item.title}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-brand-gray md:text-lg">
                {item.description}
              </p>
            </FadeIn>
          </div>
        ))}
      </div>
    </Section>
  );
}
