'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { personas } from '../data/personas';
import { FadeIn } from './ui/Animate';
import { Section } from './ui/Section';
import { SectionHeading } from './ui/SectionHeading';

export function PersonasSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const prev = () => {
    setDirection(-1);
    setCurrent((c) => (c === 0 ? personas.length - 1 : c - 1));
  };
  const next = () => {
    setDirection(1);
    setCurrent((c) => (c === personas.length - 1 ? 0 : c + 1));
  };

  return (
    <Section bg="white">
      <div className="text-center">
        <FadeIn>
          <SectionHeading>
            For every family that shares a child.
          </SectionHeading>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p className="mx-auto mt-4 max-w-xl text-xl text-brand-charcoal/70">
            NookBud works for separated parents, overseas workers, grandparent
            guardians, blended families, and open adoption arrangements.
          </p>
        </FadeIn>
      </div>

      <FadeIn delay={0.3}>
        <div className="relative mx-auto mt-16 w-full max-w-3xl">
          {/* Card stack */}
          <div className="relative mb-8 h-[400px] w-full">
            {/* Background stacked cards */}
            {[3, 2, 1].map((offset) => (
              <div
                key={offset}
                className="absolute rounded-3xl border border-brand-border bg-brand-offwhite"
                style={{
                  bottom: `-${offset * 10}px`,
                  left: `${offset * 12}px`,
                  right: `${offset * 12}px`,
                  height: '100%',
                  zIndex: 10 - offset,
                  opacity: 1,
                }}
              />
            ))}

            {/* Active card */}
            <AnimatePresence mode="popLayout">
              <motion.div
                key={current}
                className="absolute inset-0 z-20 flex flex-col rounded-3xl border border-brand-border bg-brand-offwhite p-10 shadow-sm md:p-14"
                initial={{ opacity: 0, y: direction * 80 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: direction * -80 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {personas[current].outcome && (
                  <p className="mb-4 text-lg font-semibold text-brand-sage">
                    ✓ {personas[current].outcome}
                  </p>
                )}
                <p className="flex-1 font-serif text-2xl italic leading-relaxed text-brand-charcoal md:text-3xl">
                  &ldquo;{personas[current].quote}&rdquo;
                </p>
                <div className="mt-8 border-t border-brand-border pt-6">
                  <p className="text-xl font-semibold text-brand-charcoal">
                    {personas[current].name}
                  </p>
                  <p className="text-lg text-brand-gray">
                    {personas[current].context}
                  </p>
                  <span className="mt-3 inline-block rounded-full bg-brand-surface px-4 py-1.5 text-sm font-medium text-brand-sage">
                    {personas[current].feature}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Arrows — right side, stacked vertically */}
          <div className="absolute -right-16 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-2">
            <button
              onClick={prev}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-border bg-white text-brand-charcoal shadow-sm transition-all hover:bg-brand-sage hover:text-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m18 15-6-6-6 6" />
              </svg>
            </button>
            <span className="text-sm text-brand-gray">{current + 1}/{personas.length}</span>
            <button
              onClick={next}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-border bg-white text-brand-charcoal shadow-sm transition-all hover:bg-brand-sage hover:text-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>
        </div>
      </FadeIn>
    </Section>
  );
}
