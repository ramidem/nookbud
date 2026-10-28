import { focusRing } from './config';

type ButtonProps = {
  children: React.ReactNode;
  href: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'on-dark' | 'secondary-on-dark';
};

const variants = {
  primary: 'bg-foreground text-background hover:bg-neutral-700',
  secondary: 'border border-border-strong bg-transparent text-foreground hover:bg-neutral-200',
  'on-dark': 'bg-neutral-50 text-neutral-900 hover:bg-neutral-200',
  'secondary-on-dark': 'border border-neutral-500 bg-transparent text-neutral-50 hover:bg-white/10',
};

/** A rectangular button (8px corners, never a pill). */
export function Button({ children, href, className = '', variant = 'primary' }: ButtonProps) {
  return (
    <a
      className={`inline-flex min-h-11 items-center justify-center rounded-lg px-[18px] text-sm font-medium leading-[1.3] transition-colors duration-150 ${focusRing} ${variants[variant]} ${className}`}
      href={href}
    >
      {children}
    </a>
  );
}
