import React from 'react';

import { cn } from '../../utils/cn';

type Props = React.HTMLAttributes<HTMLDivElement>;

export function Showcase({ className, ...props }: Props) {
  return <div className={cn('rounded-xl bg-surface p-6 dark:bg-dark-surface', className)} {...props} />;
}
