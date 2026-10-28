import { input } from './styles';

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  hint?: string;
  error?: string;
};

/** A labelled text input. The hint and the error are read out with it. */
export function Field({ label, name, hint, error, id = name, ...rest }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="grid gap-1.5">
      <label className="text-sm font-medium text-foreground" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        aria-invalid={error ? true : undefined}
        className={input}
        id={id}
        name={name}
        {...rest}
      />
      {hint ? (
        <p className="text-sm text-subtitle" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm font-medium text-foreground" id={errorId}>
          <span aria-hidden="true" className="mr-1 text-error">
            ●
          </span>
          {error}
        </p>
      ) : null}
    </div>
  );
}

type CheckboxProps = {
  name: string;
  children: React.ReactNode;
  error?: string;
  defaultChecked?: boolean;
  required?: boolean;
};

/** A checkbox with its label beside it, with a 44px touch target. */
export function Checkbox({ name, children, error, defaultChecked, required }: CheckboxProps) {
  const errorId = error ? `${name}-error` : undefined;
  return (
    <div className="grid gap-1">
      <label className="flex min-h-11 cursor-pointer items-start gap-3 py-2 text-sm leading-[1.5] text-foreground">
        <input
          aria-describedby={errorId}
          aria-invalid={error ? true : undefined}
          className="mt-0.5 size-5 shrink-0 accent-[var(--primary)]"
          defaultChecked={defaultChecked}
          name={name}
          required={required}
          type="checkbox"
          value="yes"
        />
        <span>{children}</span>
      </label>
      {error ? (
        <p className="pl-8 text-sm font-medium text-foreground" id={errorId}>
          <span aria-hidden="true" className="mr-1 text-error">
            ●
          </span>
          {error}
        </p>
      ) : null}
    </div>
  );
}
