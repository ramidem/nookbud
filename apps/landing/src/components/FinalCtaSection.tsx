import Image from 'next/image';
import { FadeIn } from './ui/Animate';
import { CtaButton } from './ui/CtaButton';
import { Section } from './ui/Section';

export function FinalCtaSection() {
  return (
    <Section bg="sage" className="text-center">
      <div className="flex flex-col items-center gap-10 md:flex-row md:gap-16">
        {/* Illustration */}
        <FadeIn direction="left" className="flex-1">
          <Image
            src="/illustrations/undraw_making-art_c05m.svg"
            alt="Family creating together"
            width={380}
            height={300}
            className="mx-auto w-full max-w-[200px] md:max-w-sm"
          />
        </FadeIn>

        {/* CTA content */}
        <div className="flex-1">
          <FadeIn>
            <Image
              src="/icon.png"
              alt="NookBud"
              width={64}
              height={64}
              className="mx-auto rounded-2xl md:mx-0"
            />
          </FadeIn>
          <FadeIn delay={0.15}>
            <h2 className="mt-6 font-serif text-3xl text-white md:text-6xl md:text-left">
              For the child you both love.
            </h2>
          </FadeIn>
          <FadeIn delay={0.45}>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row md:justify-start">
              <CtaButton
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-brand-sage"
              >
                Download for iOS
              </CtaButton>
              <CtaButton
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-brand-sage"
              >
                Download for Android
              </CtaButton>
            </div>
            <p className="mt-4 text-base text-white/60 md:text-left">
              14-day trial. No credit card. Cancel anytime.
            </p>
          </FadeIn>
        </div>
      </div>
    </Section>
  );
}
