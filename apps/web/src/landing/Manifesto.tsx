import { container } from './config';

export function Manifesto() {
  return (
    <section className={container}>
      <div className="rounded-xl bg-tint-sage-bold px-6 py-12 text-foreground md:px-16 md:py-16">
        <p className="max-w-[20ch] text-balance text-[clamp(2rem,4.6vw,3.5rem)] font-semibold leading-[1.1] tracking-[-1px]">
          It records what happened. It doesn&rsquo;t take sides.
        </p>
        <p className="mt-6 max-w-[36rem] text-lg leading-[1.5]">
          Nookbud isn&rsquo;t built for arguments. It&rsquo;s built so everyone starts from the same
          page, and so the child stays the centre of it.
        </p>
      </div>
    </section>
  );
}
