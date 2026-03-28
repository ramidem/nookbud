'use client';

import { useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import { testimonials } from '../data/testimonials';
import { FadeIn } from './ui/Animate';
import { Section } from './ui/Section';
import { SectionHeading } from './ui/SectionHeading';

function Stars() {
  return (
    <div className="flex gap-1 text-brand-amber">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>&#9733;</span>
      ))}
    </div>
  );
}

function TestimonialCard({ quote, name, context }: { quote: string; name: string; context: string }) {
  return (
    <div className="flex w-80 flex-shrink-0 flex-col rounded-2xl bg-white p-8 shadow-sm">
      <Stars />
      <p className="mt-4 flex-1 text-base italic leading-relaxed text-brand-charcoal">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="mt-6">
        <p className="text-sm font-semibold text-brand-charcoal">{name}</p>
        <p className="text-xs text-brand-gray">{context}</p>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Row 1: moves left as you scroll
  const x1 = useTransform(scrollYProgress, [0, 1], ['0%', '-20%']);
  // Row 2: moves right as you scroll
  const x2 = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  // Double up for seamless feel
  const row1 = [...testimonials.slice(0, 5), ...testimonials.slice(0, 5)];
  const row2 = [...testimonials.slice(4), ...testimonials.slice(4)];

  return (
    <Section bg="offwhite" className="overflow-hidden">
      <div className="text-center">
        <FadeIn>
          <SectionHeading>From parents like you.</SectionHeading>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p className="mx-auto mt-4 max-w-lg text-base text-brand-gray">
            Real families. Real situations. Real records that held up when it mattered.
          </p>
        </FadeIn>
      </div>

      {/* Break out of max-w-5xl container to full viewport width */}
      <div ref={ref} className="relative mt-16 space-y-6" style={{ left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw', width: '100vw' }}>
        {/* Row 1 — scrolls left */}
        <div className="overflow-hidden px-6">
          <motion.div style={{ x: x1 }} className="flex gap-6">
            {row1.map((t, i) => (
              <TestimonialCard key={i} quote={t.quote} name={t.name} context={t.context} />
            ))}
          </motion.div>
        </div>

        {/* Row 2 — scrolls right */}
        <div className="overflow-hidden px-6">
          <motion.div style={{ x: x2 }} className="flex gap-6">
            {row2.map((t, i) => (
              <TestimonialCard key={i} quote={t.quote} name={t.name} context={t.context} />
            ))}
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
