import { container } from './config';

export function Manifesto() {
  return (
    <section className="bg-neutral-900 text-neutral-50">
      <div className={`${container} py-24 md:py-32`}>
        <p className="max-w-[17ch] text-balance font-serif text-[clamp(2.25rem,5.6vw,4.5rem)] leading-[1.05] tracking-[-0.015em] sm:max-w-[22ch]">
          It records what happened. It doesn&rsquo;t take sides.
        </p>
        <p className="mt-8 max-w-[34rem] text-[1.0625rem] leading-[1.65] text-neutral-300 md:text-xl md:leading-[1.6]">
          Nookbud isn&rsquo;t built for arguments. It&rsquo;s built so everyone starts from the same
          page, and so the child stays the centre of it.
        </p>
      </div>
    </section>
  );
}
