import { z } from 'zod';

/** At least 12 characters and no composition rules (R7). Supabase enforces the same minimum. */
export const PASSWORD_MIN = 12;
export const PASSWORD_HINT = `At least ${PASSWORD_MIN} characters. A few words you will remember work well.`;

export const email = z
  .email({ error: 'Enter your email address, like name@example.com.' })
  .trim()
  .max(254);

export const newPassword = z
  .string()
  .min(PASSWORD_MIN, { error: `Use at least ${PASSWORD_MIN} characters.` })
  .max(128, { error: 'Use 128 characters or fewer.' });

/** A checkbox sends "yes" when ticked and nothing otherwise. */
export const ticked = (message: string) => z.literal('yes', { error: message });

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

/** The first message for each field, ready to show next to it. */
export function fieldErrors<K extends string>(error: z.ZodError): FieldErrors<K> {
  const out: Partial<Record<string, string>> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '');
    out[key] ??= issue.message;
  }
  return out as FieldErrors<K>;
}
