type ButtonProps = {
  children: React.ReactNode;
  href: string;
  className?: string;
};

export function Button({ children, href, className = '' }: ButtonProps) {
  return (
    <a
      className={`inline-flex min-h-12 items-center justify-center rounded-full bg-foreground px-7 text-base font-medium text-background transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${className}`}
      href={href}
    >
      {children}
    </a>
  );
}
