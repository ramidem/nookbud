import type { z } from 'zod';

/**
 * Validate environment values against a schema.
 * The error names the variables that are wrong and why, and never repeats a value, so a secret
 * cannot end up in a log or an error page through a typo.
 */
export function parseEnv<T extends z.ZodType>(
  schema: T,
  raw: Record<string, string | undefined>,
): z.infer<T> {
  const result = schema.safeParse(raw);
  if (result.success) return result.data;

  const problems = result.error.issues.map((issue) => {
    const name = issue.path.join('.') || '(environment)';
    return raw[name] === undefined ? `${name} is missing` : `${name} is invalid (${issue.message})`;
  });
  throw new Error(`Invalid environment: ${problems.join('; ')}. See docs/secrets.md.`);
}
