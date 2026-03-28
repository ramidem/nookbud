import Image from 'next/image';
import { FadeIn } from './ui/Animate';
import { SectionHeading } from './ui/SectionHeading';

export function RecordSection() {
  return (
    <section className="relative overflow-hidden bg-brand-surface py-20 px-6 md:py-28">
      {/* Background illustration — bottom right, full width */}
      <div className="pointer-events-none absolute bottom-0 right-0 h-3/4 w-full -scale-x-100 opacity-[0.2]">
        <Image
          src="/illustrations/undraw_collecting_3zyb.svg"
          alt=""
          width={800}
          height={600}
          className="h-full w-full object-contain object-left-bottom"
        />
      </div>

      <div className="relative mx-auto w-full max-w-5xl">
        <div className="text-left">
          <FadeIn>
            <SectionHeading>
              Everything recorded.<br />Nothing forgotten.
            </SectionHeading>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-brand-charcoal/70 md:text-2xl">
              Every entry is timestamped. Nothing can be changed silently.
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
