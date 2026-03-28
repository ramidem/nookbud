import Image from 'next/image';

export function Nav() {
  return (
    <nav className="w-full bg-brand-offwhite">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <a href="/" className="flex items-center gap-2.5">
          <Image
            src="/icon.png"
                  unoptimized
            alt="NookBud"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <span className="font-serif text-xl font-semibold text-brand-charcoal">
            NookBud
          </span>
        </a>
        <a
          href="#pricing"
          className="rounded-full bg-brand-sage px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-sage-light"
        >
          Try Free
        </a>
      </div>
    </nav>
  );
}
