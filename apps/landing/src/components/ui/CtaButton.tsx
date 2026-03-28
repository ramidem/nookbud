type CtaButtonProps = {
  children: React.ReactNode;
  href?: string;
  className?: string;
  variant?: 'primary' | 'outline';
  size?: 'default' | 'large';
};

export function CtaButton({
  children,
  href = '#pricing',
  className = '',
  variant = 'primary',
  size = 'default',
}: CtaButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200';
  const sizeClass =
    size === 'large' ? 'px-10 py-4 text-lg' : 'px-8 py-3 text-base';
  const variantClass =
    variant === 'primary'
      ? 'bg-brand-sage text-white hover:bg-brand-sage-light shadow-md hover:shadow-lg'
      : 'border-2 border-brand-sage text-brand-sage hover:bg-brand-sage hover:text-white';

  return (
    <a
      href={href}
      className={`${base} ${sizeClass} ${variantClass} ${className}`}
    >
      {children}
    </a>
  );
}
