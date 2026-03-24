import React from 'react';

import { cn } from '../../utils/cn';

type Props = {
  as?: React.ElementType;
  children?: React.ReactNode;
  className?: string;
};

export function PageContainer(props: Props) {
  const { as: Component = 'main', children, className } = props;

  return (
    <Component
      className={cn(
        'mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8',
        'bg-background dark:bg-dark-background',
        className,
      )}
    >
      {children}
    </Component>
  );
}
