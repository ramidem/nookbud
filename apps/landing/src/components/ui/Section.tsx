type SectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  bg?: 'offwhite' | 'white' | 'surface' | 'sage';
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
}: SectionProps) {
  return (
    <section id={id} className={`${bgMap[bg]} py-20 px-6 md:py-28 ${className}`}>
      <div className="mx-auto max-w-5xl">{children}</div>
    </section>
  );
}
