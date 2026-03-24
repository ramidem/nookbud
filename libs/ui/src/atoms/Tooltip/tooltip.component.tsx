'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '../../utils/cn';

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

type TooltipContentProps = React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>;

export function TooltipContent({ className, sideOffset = 4, ...props }: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        className={cn(
          'z-50 overflow-hidden rounded-lg bg-foreground px-3 py-1.5 text-xs text-white',
          'animate-in fade-in-0 zoom-in-95',
          'dark:bg-dark-foreground dark:text-foreground',
          className,
        )}
        sideOffset={sideOffset}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}
