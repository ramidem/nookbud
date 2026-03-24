'use client';

import * as LabelPrimitive from '@radix-ui/react-label';

import { cn } from '../../utils/cn';

type Props = React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>;

export function Label({ className, ...props }: Props) {
  return (
    <LabelPrimitive.Root
      className={cn(
        'text-sm font-medium text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-50 dark:text-dark-foreground',
        className,
      )}
      {...props}
    />
  );
}
