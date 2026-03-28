import { personas } from '../data/personas';
import { FadeIn, StaggerChildren, StaggerItem } from './ui/Animate';
import { Section } from './ui/Section';
import { SectionHeading } from './ui/SectionHeading';

export function PersonasSection() {
  return (
    <Section bg="white">
      <div className="text-center">
        <FadeIn>
          <SectionHeading>
            For every family that shares a child.
          </SectionHeading>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p className="mx-auto mt-4 max-w-xl text-base text-brand-gray md:text-lg">
            NookBud works for separated parents, overseas workers, grandparent
            guardians, blended families, and open adoption arrangements.
          </p>
        </FadeIn>
      </div>
      <StaggerChildren
        className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        stagger={0.1}
        delay={0.2}
      >
        {personas.map((persona) => (
          <StaggerItem key={persona.name}>
            <div className="flex h-full flex-col rounded-2xl border border-brand-border bg-brand-offwhite p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              {persona.outcome && (
                <p className="mb-4 text-sm font-semibold text-brand-sage">
                  ✓ {persona.outcome}
                </p>
              )}
              <p className="flex-1 font-serif text-base italic leading-relaxed text-brand-charcoal md:text-lg">
                &ldquo;{persona.quote}&rdquo;
              </p>
              <div className="mt-6 border-t border-brand-border pt-4">
                <p className="font-semibold text-brand-charcoal">
                  {persona.name}
                </p>
                <p className="text-sm text-brand-gray">{persona.context}</p>
                <span className="mt-2 inline-block rounded-full bg-brand-surface px-3 py-1 text-xs font-medium text-brand-sage">
                  {persona.feature}
                </span>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerChildren>
    </Section>
  );
}
