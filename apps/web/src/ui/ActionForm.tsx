'use client';

import { useActionState } from 'react';
import { Notice } from './Notice';

type State = { message?: string; done?: boolean; errors?: Record<string, string | undefined> };

/**
 * A small form around one server action that returns a state: it shows the message the action
 * sends back. For one-button actions such as "Make owner".
 */
export function ActionForm({
  action,
  children,
  className = '',
}: {
  action: (state: State, form: FormData) => Promise<State>;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState<State, FormData>(action, {});
  return (
    <form action={formAction} className={className}>
      {children}
      {state.message ? (
        <div className="mt-2 basis-full">
          <Notice>{state.message}</Notice>
        </div>
      ) : null}
    </form>
  );
}
