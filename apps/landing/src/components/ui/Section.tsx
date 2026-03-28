type SectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  bg?: 'offwhite' | 'white' | 'surface' | 'sage';
  compact?: boolean;
};

const bgMap = {
  offwhite: 'bg-brand-offwhite',
  white: 'bg-white',
  surface: 'bg-brand-surface',
  sage: 'bg-brand-sage',
};

export function Section({
  children,
  className = '',
  id,
  bg = 'offwhite',
  compact = false,
}: SectionProps) {
  const sizeClass = compact
    ? 'py-16 px-6 md:py-20'
    : 'flex min-h-screen items-center py-20 px-6 md:py-28';

  return (
    <section id={id} className={`${bgMap[bg]} ${sizeClass} ${className}`}>
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </section>
  );
}
