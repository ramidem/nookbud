import Image from 'next/image';
import { FadeIn } from './ui/Animate';
import { Section } from './ui/Section';
import { SectionHeading } from './ui/SectionHeading';

export function WhatItIsSection() {
  return (
    <Section bg="white">
      <div className="flex flex-col items-center gap-12 md:flex-row-reverse md:gap-16">
        {/* Text */}
        <div className="flex-1 text-center md:text-left">
          <FadeIn>
            <SectionHeading>
              Built around your child, not the conflict.
            </SectionHeading>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="mt-6 text-lg leading-relaxed text-brand-gray">
              Schedules. Messages. Expenses. Milestones. Everything in one shared
              space — timestamped, verified, and always accessible to both parents.
            </p>
            <p className="mt-4 text-sm font-medium text-brand-primary">
              Co-parenting, organized.
            </p>
          </FadeIn>
        </div>

        {/* Illustration */}
        <FadeIn direction="left" className="flex-1">
          <Image
            src="/illustrations/undraw_football-with-dad_w7m1.svg"
            alt="Parent and child playing"
            width={420}
            height={340}
            className="mx-auto w-full max-w-[200px] md:max-w-md"
          />
        </FadeIn>
      </div>
    </Section>
  );
}
