import { body, container, h2, h3 } from './config';

const items = [
  {
    tint: 'bg-tint-sage',
    title: 'Schedule',
    text: 'A shared calendar for school runs, handoffs and appointments. Both homes see the same week.',
  },
  {
    tint: 'bg-tint-terracotta',
    title: 'Expenses',
    text: 'Log what was spent, attach the receipt and note who paid. Split it the way you agreed.',
  },
  {
    tint: 'bg-tint-rose',
    title: 'Agreements',
    text: 'Write down what you decided, with the date. Everyone can see what changed and when.',
  },
  {
    tint: 'bg-tint-taupe',
    title: 'Documents',
    text: 'Keep medical notes, school forms and letters together, so nobody hunts through message threads.',
  },
];

export function Records() {
  return (
    <section className={`${container} scroll-mt-16 pb-16 pt-16 md:pb-24 md:pt-24`} id="record">
      <div className="mx-auto max-w-[40rem] text-center">
        <h2 className={h2}>One record for both homes.</h2>
        <p className={`${body} mt-4 text-lg leading-[1.5]`}>
          Entries aren&rsquo;t edited silently. If something changes, the history shows it.
        </p>
      </div>
      <ul className="m-0 mt-12 grid list-none gap-4 p-0 sm:grid-cols-2 md:gap-6">
        {items.map((item) => (
          <li className={`rounded-xl p-6 text-foreground md:p-8 ${item.tint}`} key={item.title}>
            <h3 className={`${h3}`}>{item.title}</h3>
            <p className="mt-2 max-w-[32rem] text-base leading-[1.55]">{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
