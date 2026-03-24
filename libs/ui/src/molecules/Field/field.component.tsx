import React from 'react';

import { InputLayout } from '../../atoms/InputLayout';
import { TextInput } from '../../atoms/TextInput';
import { cn } from '../../utils/cn';

type FieldBaseProps = {
  className?: string;
  error?: string;
  isRequired?: boolean;
  label?: string;
  subtitle?: string;
};

type FieldTextProps = FieldBaseProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'disabled'> & {
    isDisabled?: boolean;
  };

function FieldText(props: FieldTextProps) {
  const { className, error, isRequired, label, subtitle, ...inputProps } = props;

  return (
    <InputLayout
      className={className}
      error={error}
      isRequired={isRequired}
      label={label}
      subtitle={subtitle}
    >
      <TextInput error={error} {...inputProps} />
    </InputLayout>
  );
}

type FieldAreaProps = FieldBaseProps &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'disabled'> & {
    isDisabled?: boolean;
  };

function FieldArea(props: FieldAreaProps) {
  const { className, error, isDisabled = false, isRequired, label, subtitle, ...rest } = props;

  return (
    <InputLayout
      className={className}
      error={error}
      isRequired={isRequired}
      label={label}
      subtitle={subtitle}
    >
      <textarea
        disabled={isDisabled}
        className={cn(
          'min-h-[120px] w-full resize-y rounded-xl border border-neutral-300 bg-surface px-4 py-3 text-foreground',
          'placeholder:text-placeholder',
          'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
          'dark:border-neutral-700 dark:bg-dark-surface dark:text-dark-foreground',
          error && 'border-error focus:border-error focus:ring-error/30',
          isDisabled && 'cursor-not-allowed opacity-50',
        )}
        {...rest}
      />
    </InputLayout>
  );
}

export const Field = {
  Area: FieldArea,
  Text: FieldText,
};
