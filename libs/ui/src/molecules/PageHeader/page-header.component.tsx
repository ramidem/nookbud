import React from 'react';

import { cn } from '../../utils/cn';

type Props = {
  className?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  subtitle?: string;
  title: string;
};

export function PageHeader(props: Props) {
  const { className, leftAction, rightAction, subtitle, title } = props;

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center gap-3">
        {leftAction}
        <div>
          <h1 className="font-serif-bold text-2xl text-foreground dark:text-dark-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-subtitle">{subtitle}</p>
          )}
        </div>
      </div>
      {rightAction}
    </div>
  );
}
