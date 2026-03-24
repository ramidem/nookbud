import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { buttonSizes } from '@coparent/design-tokens';

import { cn } from '../../utils/cn';

import type { ButtonContract } from '@coparent/design-tokens';

// Size classes derived from shared design-tokens — single source of truth
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50',
  {
    defaultVariants: {
      size: 'sm',
      variant: 'primary',
    },
    variants: {
      size: {
        lg: `${buttonSizes.lg.twClass} ${buttonSizes.lg.textSize}`,
        md: `${buttonSizes.md.twClass} ${buttonSizes.md.textSize}`,
        sm: `${buttonSizes.sm.twClass} ${buttonSizes.sm.textSize}`,
      },
      variant: {
        destructive: 'bg-error text-white hover:bg-error/90',
        ghost: 'bg-transparent text-primary hover:bg-primary/10',
        outlined: 'border-2 border-primary bg-transparent text-primary hover:bg-primary/10',
        primary: 'bg-primary text-white hover:bg-primary/90',
        secondary: 'bg-secondary text-foreground hover:bg-secondary/90',
      },
    },
  },
);

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> &
  ButtonContract;

export function Button(props: Props) {
  const {
    children,
    className,
    isDisabled = false,
    isLoading = false,
    size,
    variant,
    ...rest
  } = props;

  const disabled = isDisabled || isLoading;

  return (
    <button
      className={cn(buttonVariants({ size, variant }), className)}
      disabled={disabled}
      {...rest}
    >
      {isLoading ? (
        <svg
          className="h-5 w-5 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            fill="currentColor"
          />
        </svg>
      ) : (
        children
      )}
    </button>
  );
}

export { buttonVariants };
