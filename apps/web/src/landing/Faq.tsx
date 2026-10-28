import { body, container, h2 } from './config';

const faqs = [
  {
    question: 'Is Nookbud available yet?',
    answer:
      'Not yet. We’re building it now. Join the waitlist and we’ll email you when early access opens.',
  },
  {
    question: 'Does the other parent have to use it?',
    answer:
      'No. You can start on your own and invite them later. They only see what’s in a Space you share with them.',
  },
  {
    question: 'Who can see what I add?',
    answer:
      'Only the people you invite to a Space. We’re designing Nookbud so one family’s records are never visible to another.',
  },
  {
    question: 'Is it only for separated parents?',
    answer: 'No. It’s for any family where a child lives or spends time in more than one home.',
  },
  {
    question: 'How much will it cost?',
    answer: 'We haven’t set pricing yet. We’ll share it before anyone is asked to pay.',
  },
  {
    question: 'What happens to my records if I leave?',
    answer:
      'We’re still deciding the retention rules. Whatever they are, we’ll publish them before launch.',
  },
];

export function Faq() {
  return (
    <section
      className={`${container} grid scroll-mt-16 gap-8 pb-16 md:pb-24 lg:grid-cols-[1fr_1.6fr] lg:gap-16`}
      id="faq"
    >
      <h2 className={h2}>Questions you might have.</h2>
      <div className="border-t border-border">
        {faqs.map((faq) => (
          <details className="group border-b border-border" key={faq.question}>
            <summary className="flex cursor-pointer items-center justify-between gap-6 rounded-md py-6 text-lg font-semibold leading-[1.4] text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              {faq.question}
              <span
                aria-hidden="true"
                className="shrink-0 text-2xl font-normal leading-none text-subtitle transition-transform duration-200 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className={`${body} max-w-[36rem] pb-6`}>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
