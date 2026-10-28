import type { SharesWith } from '../data/types';

/** The answers to "Who shares responsibility for a child with you?" (R27). Never "co-parent". */
export const SHARES_WITH_LABELS: Record<SharesWith, string> = {
  partner: 'My partner',
  ex_partner: 'My ex-partner',
  grandparent: 'A grandparent',
  guardian: 'A guardian',
  other_family: 'Another family member',
  sole_caregiver: 'I’m the sole caregiver right now',
};

/** Currencies a person can pick. The ones Nookbud's families use most come first. */
export const CURRENCIES = [
  'PHP',
  'USD',
  'SGD',
  'AUD',
  'CAD',
  'GBP',
  'EUR',
  'NZD',
  'HKD',
  'JPY',
  'KRW',
  'AED',
  'SAR',
  'QAR',
  'KWD',
  'MYR',
  'IDR',
  'THB',
  'VND',
  'INR',
  'CHF',
  'SEK',
  'NOK',
  'DKK',
];

/** Every IANA time zone the runtime knows. */
export function timeZones(): string[] {
  try {
    return Intl.supportedValuesOf('timeZone');
  } catch {
    return ['UTC'];
  }
}

export const isTimeZone = (zone: string) => zone === 'UTC' || timeZones().includes(zone);
