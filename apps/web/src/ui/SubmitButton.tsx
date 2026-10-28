'use client';

import { useFormStatus } from 'react-dom';
import { button } from './styles';

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingLabel: string;
  variant?: keyof typeof button;
  className?: string;
};

/** A form's submit button. While the form is sending it says so and cannot be pressed twice. */
export function SubmitButton({
  children,
  pendingLabel,
  variant = 'primary',
  className = '',
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button
      aria-disabled={pending}
      className={`${button[variant]} ${className}`}
      disabled={pending}
      type="submit"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
