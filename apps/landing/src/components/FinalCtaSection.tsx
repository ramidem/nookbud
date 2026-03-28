import Image from 'next/image';
import { FadeIn } from './ui/Animate';
import { Section } from './ui/Section';

export function FinalCtaSection() {
  return (
    <Section bg="sage" compact>
      <div className="grid grid-cols-2 items-center gap-6 md:gap-16">
        {/* Illustration — always left */}
        <FadeIn direction="left" className="flex-1">
          <Image
            src="/illustrations/undraw_making-art_c05m.svg"
            alt="Family creating together"
            width={380}
            height={300}
            className="mx-auto w-full max-w-[140px] md:max-w-sm"
          />
        </FadeIn>

        {/* CTA content */}
        <div className="flex-1 text-left">
          <FadeIn>
            <Image
              src="/icon.png"
              alt="NookBud"
              width={56}
              height={56}
              className="rounded-2xl"
            />
          </FadeIn>
          <FadeIn delay={0.15}>
            <h2 className="mt-4 font-serif text-2xl text-white md:text-4xl">
              For the child you both love.
            </h2>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p className="mt-3 text-sm text-white/70 md:text-base">
              14-day trial. No credit card. Cancel anytime.
            </p>
          </FadeIn>
          <FadeIn delay={0.45}>
            <div className="mt-6 flex flex-col items-start gap-3">
              {/* App Store */}
              <a href="#" className="transition-opacity hover:opacity-80">
                <Image
                  src="/badge-app-store.svg"
                  alt="Download on the App Store"
                  width={140}
                  height={42}
                  className="h-[42px] w-auto"
                />
              </a>
              {/* Google Play */}
              <a href="#" className="transition-opacity hover:opacity-80">
                <Image
                  src="/badge-google-play.png"
                  alt="Get it on Google Play"
                  width={140}
                  height={42}
                  className="h-[42px] w-auto"
                />
              </a>
            </div>
          </FadeIn>
        </div>
      </div>
    </Section>
  );
}
