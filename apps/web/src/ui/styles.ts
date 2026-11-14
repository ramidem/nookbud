/** Shared class names for the app's screens, built on the tokens (see /design). */

export const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

const buttonBase = `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-[18px] text-sm font-medium leading-[1.3] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`;

export const button = {
  primary: `${buttonBase} bg-foreground text-background hover:bg-neutral-700`,
  secondary: `${buttonBase} border border-border-strong bg-surface text-foreground hover:bg-neutral-200`,
  // White on `error` is 3.8:1, too low for a label, so the danger button is outlined instead.
  danger: `${buttonBase} border-2 border-error bg-surface text-foreground hover:bg-neutral-200`,
  ghost: `${buttonBase} px-3 text-foreground hover:bg-neutral-200`,
};

export const input = `block min-h-11 w-full rounded-lg border border-border-strong bg-surface px-4 py-2.5 text-base text-foreground placeholder:text-placeholder focus:border-transparent focus:outline-2 focus:outline-primary aria-[invalid=true]:border-error`;

export const card = 'rounded-xl border border-border bg-surface p-4 sm:p-6 md:p-8';

export const link = `font-medium text-foreground underline decoration-primary decoration-2 underline-offset-[3px] ${focusRing}`;

export const heading =
  'break-words text-[1.5rem] font-semibold leading-[1.25] tracking-[-0.5px] text-foreground sm:text-[1.75rem]';

export const body = 'text-base leading-[1.55] text-subtitle';
