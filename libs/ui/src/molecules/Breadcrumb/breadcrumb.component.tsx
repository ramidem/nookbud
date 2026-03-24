import React from 'react';

import { cn } from '../../utils/cn';

export function Breadcrumb({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <nav aria-label="breadcrumb" className={cn(className)} {...props} />;
}

export function BreadcrumbList({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) {
  return (
    <ol
      className={cn('flex flex-wrap items-center gap-1.5 text-sm text-subtitle', className)}
      {...props}
    />
  );
}

export function BreadcrumbItem({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  return <li className={cn('inline-flex items-center gap-1.5', className)} {...props} />;
}

export function BreadcrumbLink({
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn('transition-colors hover:text-foreground dark:hover:text-dark-foreground', className)}
      {...props}
    />
  );
}

export function BreadcrumbPage({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-current="page"
      className={cn('font-medium text-foreground dark:text-dark-foreground', className)}
      role="link"
      {...props}
    />
  );
}

export function BreadcrumbSeparator({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  return (
    <li aria-hidden="true" className={cn('text-neutral-400', className)} role="presentation" {...props}>
      {props.children ?? (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </li>
  );
}
