import { Button } from './Button';
import { WAITLIST_HREF, container, h2 } from './config';

export function Closing() {
  return (
    <section className={`${container} pb-16 md:pb-24`}>
      <div className="rounded-xl bg-neutral-200 px-6 py-12 text-center md:p-16">
        <h2 className={`${h2} mx-auto max-w-[18ch]`}>We’ll tell you when it opens.</h2>
        <div className="mt-8">
          <Button href={WAITLIST_HREF}>Join the waitlist</Button>
        </div>
      </div>
    </section>
  );
}
