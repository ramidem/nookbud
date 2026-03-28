import Image from 'next/image';

export function Footer() {
  return (
    <footer className="relative z-10 border-t-2 border-white/10 px-6 py-20 md:py-24" style={{ backgroundColor: '#2C2C2C' }}>
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-16 md:flex-row md:justify-between">
          {/* Brand */}
          <div className="max-w-xs">
            <a href="/" className="flex items-center gap-2.5">
              <Image
                src="/icon.png"
                alt="NookBud"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-serif text-xl font-semibold text-white">
                NookBud
              </span>
            </a>
            <p className="mt-5 text-sm leading-relaxed text-white/60">
              The shared care records platform for every family structure. Two
              homes. One childhood.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16 md:gap-20 lg:gap-28">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-white">
                Product
              </h4>
              <ul className="mt-5 space-y-3 text-sm">
                <li>
                  <a
                    href="#features"
                    className="text-white/60 transition-colors hover:text-brand-sage"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-white/60 transition-colors hover:text-brand-sage"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#why-nookbud"
                    className="text-white/60 transition-colors hover:text-brand-sage"
                  >
                    Why NookBud
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-white">
                Legal
              </h4>
              <ul className="mt-5 space-y-3 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-white/60 transition-colors hover:text-brand-sage"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/60 transition-colors hover:text-brand-sage"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-white">
                Contact
              </h4>
              <ul className="mt-5 space-y-3 text-sm">
                <li>
                  <a
                    href="mailto:hello@nookbud.com"
                    className="text-white/60 transition-colors hover:text-brand-sage"
                  >
                    hello@nookbud.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 border-t border-white/10 pt-8 text-center text-sm text-white/60">
          &copy; {new Date().getFullYear()} NookBud. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
