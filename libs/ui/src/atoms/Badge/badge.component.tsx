import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    defaultVariants: { variant: 'default' },
    variants: {
      variant: {
        default: 'bg-primary text-white',
        destructive: 'bg-error text-white',
        outline: 'border border-divider text-foreground dark:border-dark-divider dark:text-dark-foreground',
        secondary: 'bg-neutral-200 text-foreground dark:bg-neutral-800 dark:text-dark-foreground',
        success: 'bg-success text-white',
        warning: 'bg-warning text-foreground',
      },
    },
  },
);

type Props = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: Props) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
