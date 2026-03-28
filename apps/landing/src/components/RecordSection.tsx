import Image from 'next/image';
import { FadeIn } from './ui/Animate';
import { Section } from './ui/Section';
import { SectionHeading } from './ui/SectionHeading';

export function RecordSection() {
  return (
    <Section bg="surface">
      <div className="flex flex-col items-center gap-12 md:flex-row md:gap-16">
        {/* Text */}
        <div className="flex-1 text-center md:text-left">
          <FadeIn>
            <SectionHeading>Everything recorded. Nothing forgotten.</SectionHeading>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="mt-6 text-lg leading-relaxed text-brand-gray">
              Every entry is timestamped and preserved. Edits create new versions —
              the original is never lost. When it matters, the record is already
              there.
            </p>
          </FadeIn>
        </div>

        {/* Illustration */}
        <FadeIn direction="right" className="flex-1">
          <Image
            src="/illustrations/undraw_private-files_m2bw.svg"
            alt="Secure private files"
            width={420}
            height={340}
            className="mx-auto w-full max-w-[200px] md:max-w-md"
          />
        </FadeIn>
      </div>
    </Section>
  );
}
