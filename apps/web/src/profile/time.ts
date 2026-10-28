/**
 * Dates and times in a person's own time zone (R24, R56). Records store UTC; screens show and
 * accept local wall-clock times in the viewer's zone. Nothing here assumes a zone.
 */

/** The offset of `zone` from UTC at `at`, in minutes (Manila is +480). */
export function zoneOffsetMinutes(zone: string, at: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(at);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second'),
  );
  return Math.round((asUtc - at.getTime()) / 60000);
}

/** A local `YYYY-MM-DDTHH:mm` in `zone`, as a UTC ISO string. */
export function localToUtc(local: string, zone: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
  if (!m) throw new Error('Expected YYYY-MM-DDTHH:mm');
  const guess = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  // Two passes settle the offset across a daylight-saving change.
  let utc = guess - zoneOffsetMinutes(zone, new Date(guess)) * 60000;
  utc = guess - zoneOffsetMinutes(zone, new Date(utc)) * 60000;
  return new Date(utc).toISOString();
}

/** A UTC time as `YYYY-MM-DDTHH:mm` in `zone`, for a `datetime-local` input. */
export function utcToLocal(iso: string, zone: string): string {
  const at = new Date(iso);
  const shifted = new Date(at.getTime() + zoneOffsetMinutes(zone, at) * 60000);
  return shifted.toISOString().slice(0, 16);
}

/** The calendar date (`YYYY-MM-DD`) of a UTC time in `zone`. */
export function dateInZone(iso: string | Date, zone: string): string {
  const at = typeof iso === 'string' ? new Date(iso) : iso;
  return utcToLocal(at.toISOString(), zone).slice(0, 10);
}

/** Today in `zone`. */
export const todayIn = (zone: string) => dateInZone(new Date(), zone);

/** Whole days from `a` to `b`, both `YYYY-MM-DD`. */
export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
}

/** `YYYY-MM-DD` plus `n` days. */
export function addDays(date: string, n: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
}

/** A time for people, in `zone`: "Wed 4 Nov, 3:30 pm". */
export function formatTime(
  iso: string,
  zone: string,
  options: Intl.DateTimeFormatOptions = {},
): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: zone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    ...options,
  }).format(new Date(iso));
}

/** A date for people: "Wed 4 Nov 2026". `date` is `YYYY-MM-DD`, with no time zone. */
export function formatDate(date: string, options: Intl.DateTimeFormatOptions = {}): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(new Date(`${date}T00:00:00Z`));
}

/** The zone to use for a person: their profile's, else UTC, said plainly on screen. */
export const zoneOf = (profileZone: string | null | undefined) => profileZone || 'UTC';
