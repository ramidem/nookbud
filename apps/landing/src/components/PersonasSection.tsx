'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { personas } from '../data/personas';
import { FadeIn } from './ui/Animate';
import { Section } from './ui/Section';
import { SectionHeading } from './ui/SectionHeading';

export function PersonasSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const prev = () => {
    setDirection(-1);
    setCurrent((c) => (c === 0 ? personas.length - 1 : c - 1));
  };
  const next = () => {
    setDirection(1);
    setCurrent((c) => (c === personas.length - 1 ? 0 : c + 1));
  };

  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c === personas.length - 1 ? 0 : c + 1));
    }, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [paused]);

  return (
    <Section bg="white" compact>
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
        <div
          className="relative mx-auto mt-16 w-full max-w-3xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Card stack */}
          <div className="relative mb-8 h-[480px] w-full">
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
                }}
              />
            ))}

            {/* Active card */}
            <AnimatePresence mode="popLayout">
              <motion.div
                key={current}
                className="absolute inset-0 z-20 flex flex-col rounded-3xl border border-brand-border bg-brand-offwhite p-6 shadow-sm md:p-10"
                initial={{ opacity: 0, y: direction * 80 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: direction * -80 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {personas[current].outcome && (
                  <p className="mb-3 text-sm font-semibold text-brand-sage md:text-lg">
                    ✓ {personas[current].outcome}
                  </p>
                )}
                <p className="font-serif text-lg italic leading-relaxed text-brand-charcoal md:text-2xl">
                  &ldquo;{personas[current].quote}&rdquo;
                </p>
                <div className="mt-6 border-t border-brand-border pt-4">
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="text-base font-semibold text-brand-charcoal">
                        {personas[current].name}
                      </p>
                      <p className="text-sm text-brand-gray">
                        {personas[current].context}
                      </p>
                      <span className="mt-2 inline-block rounded-full bg-brand-surface px-3 py-1 text-xs font-medium text-brand-sage">
                        {personas[current].feature}
                      </span>
                    </div>
                    {/* Arrows below name — centered */}
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={next}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-border bg-white text-brand-charcoal shadow-sm transition-all hover:bg-brand-sage hover:text-white"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m18 15-6-6-6 6" />
                        </svg>
                      </button>
                      <span className="text-sm text-brand-gray">{current + 1}/{personas.length}</span>
                      <button
                        onClick={prev}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-border bg-white text-brand-charcoal shadow-sm transition-all hover:bg-brand-sage hover:text-white"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </FadeIn>
    </Section>
  );
}
