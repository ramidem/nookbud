/** What a page receives: Next.js passes the query string as a promise. */
export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** One query value as a string, ignoring repeats. */
export const param = (value: string | string[] | undefined) =>
  typeof value === 'string' ? value : Array.isArray(value) ? value[0] : undefined;
