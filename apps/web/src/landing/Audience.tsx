import { body, container, h2 } from './config';

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
    <section className={`${container} py-20 md:py-28`}>
      <ul className="m-0 grid list-none gap-x-14 gap-y-12 p-0 sm:grid-cols-2 lg:grid-cols-3">
        <li className="sm:col-span-2 lg:col-span-1">
          <h2 className={h2}>For any home a child lives in.</h2>
        </li>
        {groups.map((group) => (
          <li className="lg:pt-3" key={group.title}>
            <h3 className="font-serif text-[1.625rem] leading-tight text-foreground">
              {group.title}
            </h3>
            <p className={`${body} mt-2 max-w-[22rem]`}>{group.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
