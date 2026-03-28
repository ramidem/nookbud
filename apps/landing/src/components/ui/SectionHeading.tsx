type SectionHeadingProps = {
  children: React.ReactNode;
  className?: string;
  light?: boolean;
};

export function SectionHeading({
  children,
  className = '',
  light = false,
}: SectionHeadingProps) {
  return (
    <h2
      className={`font-serif text-3xl leading-tight md:text-6xl ${
        light ? 'text-white' : 'text-brand-charcoal'
      } ${className}`}
    >
      {children}
    </h2>
  );
}
