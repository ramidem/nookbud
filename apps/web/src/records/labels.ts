import type { EntryType } from '../data/records-types';

export const TYPE_LABELS: Record<EntryType, string> = {
  note: 'Note',
  agreement: 'Agreement',
  expense: 'Expense',
  event: 'Event',
};

/** Pastel tints from the brand colors, one per type, always shown with the word. */
export const TYPE_TINTS: Record<EntryType, string> = {
  note: 'bg-neutral-200',
  agreement: 'bg-tint-sage',
  expense: 'bg-tint-terracotta',
  event: 'bg-tint-rose',
};

export const FORMER_MEMBER = 'Former member';

/** Someone's name in a space; anyone no longer in it is a former member (D7). */
export function nameOf(names: Map<string, string | null>, id: string | null): string {
  if (!id || !names.has(id)) return FORMER_MEMBER;
  return names.get(id) || 'Unnamed member';
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
