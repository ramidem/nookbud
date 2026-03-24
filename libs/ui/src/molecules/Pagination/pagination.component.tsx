import React from 'react';

import { cn } from '../../utils/cn';
import { buttonVariants } from '../../atoms/Button/button.component';

export function Pagination({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <nav aria-label="pagination" className={cn('mx-auto flex w-full justify-center', className)} role="navigation" {...props} />;
}

export function PaginationContent({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn('flex flex-row items-center gap-1', className)} {...props} />;
}

export function PaginationItem({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  return <li className={cn(className)} {...props} />;
}

type PaginationLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  isActive?: boolean;
};

export function PaginationLink({ className, isActive, ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        buttonVariants({ variant: isActive ? 'primary' : 'ghost', size: 'sm' }),
        'h-9 w-9 p-0',
        className,
      )}
      {...props}
    />
  );
}

export function PaginationPrevious({ className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <PaginationLink aria-label="Go to previous page" className={cn('w-auto gap-1 px-2.5', className)} {...props}>
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>Previous</span>
    </PaginationLink>
  );
}

export function PaginationNext({ className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <PaginationLink aria-label="Go to next page" className={cn('w-auto gap-1 px-2.5', className)} {...props}>
      <span>Next</span>
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </PaginationLink>
  );
}

export function PaginationEllipsis({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span aria-hidden className={cn('flex h-9 w-9 items-center justify-center text-subtitle', className)} {...props}>
      ...
    </span>
  );
}
