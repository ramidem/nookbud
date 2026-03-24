import React from 'react';

import { cn } from '../../utils/cn';

type Props = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'disabled'> & {
  error?: string;
  isDisabled?: boolean;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, Props>(function Textarea(props, ref) {
  const { className, error, isDisabled = false, ...rest } = props;

  return (
    <textarea
      ref={ref}
      disabled={isDisabled}
      className={cn(
        'min-h-[120px] w-full resize-y rounded-xl border border-neutral-300 bg-surface px-4 py-3 text-foreground',
        'placeholder:text-placeholder',
        'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
        'dark:border-neutral-700 dark:bg-dark-surface dark:text-dark-foreground',
        error && 'border-error focus:border-error focus:ring-error/30',
        isDisabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      {...rest}
    />
  );
});
