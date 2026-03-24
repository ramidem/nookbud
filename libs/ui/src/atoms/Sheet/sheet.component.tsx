'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;

const sheetVariants = cva(
  'fixed z-50 gap-4 bg-sheet p-6 shadow-xl transition dark:bg-dark-sheet',
  {
    defaultVariants: { side: 'right' },
    variants: {
      side: {
        bottom: 'inset-x-0 bottom-0 rounded-t-2xl border-t border-divider data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r border-divider sm:max-w-sm data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
        right: 'inset-y-0 right-0 h-full w-3/4 border-l border-divider sm:max-w-sm data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
        top: 'inset-x-0 top-0 rounded-b-2xl border-b border-divider data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
      },
    },
  },
);

type SheetContentProps = React.ComponentPropsWithoutRef<typeof Dialog.Content> &
  VariantProps<typeof sheetVariants>;

export function SheetContent({ children, className, side, ...props }: SheetContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay/60 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <Dialog.Content className={cn(sheetVariants({ side }), className)} {...props}>
        {children}
        <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/50">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-2', className)} {...props} />;
}

export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('font-serif-semibold text-lg text-foreground dark:text-dark-foreground', className)} {...props} />;
}

export function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-subtitle', className)} {...props} />;
}
