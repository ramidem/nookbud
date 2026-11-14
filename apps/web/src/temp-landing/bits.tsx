import { WAITLIST_HREF } from '../landing/config';

export function Logo({ href = '/temp-landing2' }: { href?: string }) {
  return (
    <a className="inline-flex items-center gap-2.5 rounded-md" href={href}>
      <img
        alt=""
        className="size-8 rounded-md"
        height={32}
        src="/design/logos/nookbud-app-icon.png"
        width={32}
      />
      <span className="display text-[1.65rem] leading-none text-foreground">Nookbud</span>
    </a>
  );
}

export function Pill({
  href,
  children,
  className = '',
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      className={`inline-flex h-[3.8125rem] items-center justify-center rounded-full bg-primary px-8 text-base font-semibold leading-none tracking-[-0.02em] text-background hover:bg-primary-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
      href={href}
    >
      {children}
    </a>
  );
}

export { WAITLIST_HREF };
