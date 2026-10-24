import { body, container, h2 } from './config';

const items = [
  {
    title: 'Schedule',
    text: 'A shared calendar for school runs, handoffs and appointments. Both homes see the same week.',
  },
  {
    title: 'Expenses',
    text: 'Log what was spent, attach the receipt and note who paid. Split it the way you agreed.',
  },
  {
    title: 'Agreements',
    text: 'Write down what you decided, with the date. Everyone can see what changed and when.',
  },
  {
    title: 'Documents',
    text: 'Keep medical notes, school forms and letters together, so nobody hunts through message threads.',
  },
];

export function Records() {
  return (
    <section
      className={`${container} grid scroll-mt-4 gap-10 py-20 md:py-28 lg:grid-cols-[1fr_1.15fr] lg:gap-20`}
      id="record"
    >
      <div className="lg:sticky lg:top-10 lg:self-start">
        <h2 className={h2}>One record for both homes.</h2>
        <p className={`${body} mt-5 max-w-[28rem]`}>
          Entries aren&rsquo;t edited silently. If something changes, the history shows it.
        </p>
      </div>
      <ul className="m-0 list-none p-0">
        {items.map((item) => (
          <li className="border-t border-neutral-300 py-7 first:pt-7 md:py-8" key={item.title}>
            <h3 className="font-serif text-[1.625rem] leading-tight text-foreground">
              {item.title}
            </h3>
            <p className={`${body} mt-2 max-w-[32rem]`}>{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
