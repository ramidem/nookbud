import { testimonials } from '../data/testimonials';
import { FadeIn, StaggerChildren, StaggerItem } from './ui/Animate';
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

export function TestimonialsSection() {
  return (
    <Section bg="offwhite">
      <div className="text-center">
        <FadeIn>
          <SectionHeading>From parents like you.</SectionHeading>
        </FadeIn>
      </div>
      <StaggerChildren className="mt-16 grid gap-6 md:grid-cols-3" stagger={0.12} delay={0.2}>
        {testimonials.map((t, i) => (
          <StaggerItem key={i}>
            <div className="flex h-full flex-col rounded-2xl bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <Stars />
              <p className="mt-4 flex-1 text-base italic leading-relaxed text-brand-charcoal md:text-lg">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="mt-6 text-base font-medium text-brand-gray">
                — {t.name}
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerChildren>
    </Section>
  );
}
