import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

const alertVariants = cva(
  'relative w-full rounded-xl border p-4 text-sm',
  {
    defaultVariants: { variant: 'default' },
    variants: {
      variant: {
        default: 'border-divider bg-surface text-foreground dark:border-dark-divider dark:bg-dark-surface dark:text-dark-foreground',
        destructive: 'border-error/50 bg-error/10 text-error',
        success: 'border-success/50 bg-success/10 text-success',
        warning: 'border-warning/50 bg-warning/10 text-foreground',
      },
    },
  },
);

type AlertProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>;

export function Alert({ className, variant, ...props }: AlertProps) {
  return <div className={cn(alertVariants({ variant }), className)} role="alert" {...props} />;
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn('mb-1 font-semibold leading-none', className)} {...props} />;
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <div className={cn('text-sm opacity-90', className)} {...props} />;
}

export { alertVariants };
