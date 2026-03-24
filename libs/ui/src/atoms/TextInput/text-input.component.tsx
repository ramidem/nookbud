import React from 'react';

import { cn } from '../../utils/cn';

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'disabled'> & {
  error?: string;
  isDisabled?: boolean;
};

export const TextInput = React.forwardRef<HTMLInputElement, Props>(function TextInput(props, ref) {
  const { className, error, isDisabled = false, ...rest } = props;

  return (
    <input
      ref={ref}
      disabled={isDisabled}
      className={cn(
        'min-h-[56px] w-full rounded-xl border border-neutral-300 bg-surface px-4 text-foreground',
        'placeholder:text-placeholder',
        'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
        'dark:border-neutral-700 dark:bg-dark-surface dark:text-dark-foreground',
        'dark:focus:border-primary dark:focus:ring-primary/30',
        error && 'border-error focus:border-error focus:ring-error/30',
        isDisabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      {...rest}
    />
  );
});
