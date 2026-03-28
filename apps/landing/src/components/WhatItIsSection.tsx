import Image from 'next/image';
import { FadeIn } from './ui/Animate';
import { SectionHeading } from './ui/SectionHeading';

export function WhatItIsSection() {
  return (
    <section className="relative overflow-hidden bg-white py-20 px-6 md:py-28">
      {/* Background illustration — bottom right, full width */}
      <div className="pointer-events-none absolute bottom-0 right-0 h-3/4 w-full opacity-[0.2]">
        <Image
          src="/illustrations/undraw_fatherhood_eldm.svg"
          alt=""
          width={800}
          height={600}
          className="h-full w-full object-contain object-right-bottom"
        />
      </div>

      <div className="relative mx-auto w-full max-w-5xl">
        <div className="text-left">
          <FadeIn>
            <SectionHeading className="!text-6xl">
              Built around your child,<br />not the conflict.
            </SectionHeading>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="mt-6 max-w-lg text-2xl leading-relaxed text-brand-charcoal/70">
              Schedules. Messages. Expenses. Milestones. Everything in one shared
              space — timestamped, verified, and always accessible to both parents.
            </p>
            <p className="mt-4 text-base font-medium text-brand-sage">
              Co-parenting, organized.
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
