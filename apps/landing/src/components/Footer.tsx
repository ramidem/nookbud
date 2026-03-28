import Image from 'next/image';

export function Footer() {
  return (
    <footer className="border-t border-brand-border bg-white px-6 py-20 md:py-24">
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
              <span className="font-serif text-xl font-semibold text-brand-charcoal">
                NookBud
              </span>
            </a>
            <p className="mt-5 text-sm leading-relaxed text-brand-gray">
              The shared care records platform for every family structure. Two
              homes. One childhood.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16 md:gap-20 lg:gap-28">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-brand-charcoal">
                Product
              </h4>
              <ul className="mt-5 space-y-3 text-sm">
                <li>
                  <a
                    href="#features"
                    className="text-brand-gray transition-colors hover:text-brand-sage"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-brand-gray transition-colors hover:text-brand-sage"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#why-nookbud"
                    className="text-brand-gray transition-colors hover:text-brand-sage"
                  >
                    Why NookBud
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-brand-charcoal">
                Legal
              </h4>
              <ul className="mt-5 space-y-3 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-brand-gray transition-colors hover:text-brand-sage"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-brand-gray transition-colors hover:text-brand-sage"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-brand-charcoal">
                Contact
              </h4>
              <ul className="mt-5 space-y-3 text-sm">
                <li>
                  <a
                    href="mailto:hello@nookbud.com"
                    className="text-brand-gray transition-colors hover:text-brand-sage"
                  >
                    hello@nookbud.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 border-t border-brand-border pt-8 text-center text-sm text-brand-gray">
          &copy; {new Date().getFullYear()} NookBud. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
