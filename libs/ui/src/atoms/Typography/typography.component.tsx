import React from 'react';

import { cn } from '../../utils/cn';

type TypographyVariant = 'body' | 'heading';

type Props<T extends React.ElementType = 'p'> = {
  as?: T;
  children?: React.ReactNode;
  className?: string;
  variant?: TypographyVariant;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>;

const variantStyles: Record<TypographyVariant, string> = {
  body: 'font-sans text-base text-foreground dark:text-dark-foreground',
  heading: 'font-serif text-base text-foreground dark:text-dark-foreground',
};

const defaultElements: Record<TypographyVariant, React.ElementType> = {
  body: 'p',
  heading: 'h2',
};

export function Typography<T extends React.ElementType = 'p'>(props: Props<T>) {
  const { as, children, className, variant = 'body', ...rest } = props;

  const Component = as ?? defaultElements[variant];

  return (
    <Component className={cn(variantStyles[variant], className)} {...rest}>
      {children}
    </Component>
  );
}
