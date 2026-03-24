'use client';

import * as AvatarPrimitive from '@radix-ui/react-avatar';

import { cn } from '../../utils/cn';

type Props = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
  alt?: string;
  fallback?: string;
  src?: string;
};

export function Avatar({ alt, className, fallback, src, ...props }: Props) {
  const initials = fallback ?? alt?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <AvatarPrimitive.Root
      className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    >
      <AvatarPrimitive.Image
        alt={alt}
        className="aspect-square h-full w-full"
        src={src}
      />
      <AvatarPrimitive.Fallback
        className="flex h-full w-full items-center justify-center rounded-full bg-neutral-200 text-sm font-medium text-foreground dark:bg-neutral-700 dark:text-dark-foreground"
      >
        {initials}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
