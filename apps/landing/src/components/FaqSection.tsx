import { faqs } from '../data/faqs';
import { FadeIn, StaggerChildren, StaggerItem } from './ui/Animate';
import { FaqItem } from './ui/FaqItem';
import { Section } from './ui/Section';
import { SectionHeading } from './ui/SectionHeading';

export function FaqSection() {
  return (
    <Section bg="offwhite" compact>
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <FadeIn>
            <SectionHeading>Questions you might have.</SectionHeading>
          </FadeIn>
        </div>
        <StaggerChildren className="mt-12" stagger={0.1} delay={0.2}>
          {faqs.map((faq) => (
            <StaggerItem key={faq.question}>
              <FaqItem question={faq.question} answer={faq.answer} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </Section>
  );
}
