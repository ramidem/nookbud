import { body, container, h2, h3 } from './config';

const groups = [
  {
    title: 'Separated parents',
    text: 'Hand over the week without a group chat to untangle.',
  },
  {
    title: 'Grandparents raising grandchildren',
    text: 'Keep school and medical details where the next carer can find them.',
  },
  {
    title: 'Blended families',
    text: 'Run more than one arrangement, each in its own Space.',
  },
  {
    title: 'Parents working far away',
    text: 'Stay part of the routine from another time zone.',
  },
  {
    title: 'Open adoption',
    text: 'Keep everyone informed, kindly and clearly.',
  },
];

export function Audience() {
  return (
    <section className={`${container} py-16 md:py-24`}>
      <h2 className={`${h2} max-w-[20ch]`}>For any home a child lives in.</h2>
      <ul className="m-0 mt-10 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <li className="rounded-xl bg-surface p-6" key={group.title}>
            <h3 className={h3}>{group.title}</h3>
            <p className={`${body} mt-2`}>{group.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
