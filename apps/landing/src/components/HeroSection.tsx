'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { CtaButton } from './ui/CtaButton';

export function HeroSection() {
  return (
    <section className="relative flex flex-1 items-center overflow-hidden px-6">
      {/* Background illustration — bottom right, full width */}
      <div className="pointer-events-none absolute bottom-0 right-0 h-3/4 w-full -scale-x-100 opacity-[0.2]">
        <Image
          src="/illustrations/undraw_tree-swing_5010.svg"
          alt=""
          width={800}
          height={600}
          className="h-full w-full object-contain object-left-bottom"
          priority
        />
      </div>

      <div className="relative mx-auto w-full max-w-5xl">
        <div className="text-left">
          <motion.p
            className="mb-6 inline-block rounded-2xl rounded-bl-sm bg-white px-5 py-3 text-xl font-medium text-brand-gray shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            Tired of lost messages, missed pickups, and &ldquo;that&rsquo;s not what you said&rdquo;?
          </motion.p>
          <motion.h1
            className="font-serif text-6xl leading-[1.1] text-brand-charcoal"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            Everything in one place — for them.
          </motion.h1>
          <motion.p
            className="mt-6 max-w-lg text-2xl leading-relaxed text-brand-charcoal/70"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            A safe place for shared care. Stay organized, communicate clearly,
            and keep the focus on your child.
          </motion.p>
          <motion.div
            className="mt-10 flex flex-col items-start gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <CtaButton size="large">View Pricing</CtaButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
