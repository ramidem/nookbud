'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { CtaButton } from './ui/CtaButton';

export function HeroSection() {
  return (
    <section className="overflow-hidden px-6 pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-12 md:flex-row md:gap-16">
        {/* Text */}
        <div className="flex-1 text-center md:text-left">
          <motion.h1
            className="font-serif text-3xl leading-[1.1] text-brand-charcoal md:text-7xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            Everything in one place — for them.
          </motion.h1>
          <motion.p
            className="mt-6 max-w-xl text-base leading-relaxed text-brand-gray md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            A safe place for shared care. Stay organized, communicate clearly,
            and keep the focus on your child.
          </motion.p>
          <motion.div
            className="mt-10 flex flex-col items-center gap-3 md:items-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <CtaButton size="large">Try free for 14 days</CtaButton>
            <span className="text-sm text-brand-gray">No credit card needed</span>
          </motion.div>
        </div>

        {/* Illustration */}
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Image
            src="/illustrations/undraw_tree-swing_5010.svg"
            alt="Family together"
            width={500}
            height={400}
            className="mx-auto w-full max-w-[240px] md:max-w-lg"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
}
