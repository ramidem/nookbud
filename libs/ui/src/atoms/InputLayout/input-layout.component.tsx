import React from 'react';

import type { InputLayoutContract } from '@coparent/design-tokens';

import { cn } from '../../utils/cn';

type Props = Omit<InputLayoutContract, 'children'> & {
  children?: React.ReactNode;
  className?: string;
};

export function InputLayout(props: Props) {
  const { children, className, error, isRequired, label, subtitle } = props;

  return (
    <div className={cn(className)}>
      {label && (
        <label className="mb-2 block text-sm text-neutral-600 dark:text-neutral-300">
          {label}
          {isRequired && <span className="text-error"> *</span>}
        </label>
      )}
      {children}
      {!!error && <p className="mt-1 text-xs text-error">{error}</p>}
      {!!subtitle && !error && (
        <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-400">{subtitle}</p>
      )}
    </div>
  );
}
