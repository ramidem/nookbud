import { Button } from './Button';
import { WAITLIST_HREF, container, h2 } from './config';

export function Closing() {
  return (
    <section className="bg-neutral-200">
      <div className={`${container} py-20 md:py-28`}>
        <h2 className={`${h2} max-w-[18ch]`}>We’ll tell you when it opens.</h2>
        <div className="mt-8">
          <Button href={WAITLIST_HREF}>Join the waitlist</Button>
        </div>
      </div>
    </section>
  );
}
