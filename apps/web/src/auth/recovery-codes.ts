import { createHash, randomInt } from 'node:crypto';

// No 0/O or 1/I/L, so a code read off paper is not mistyped.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** Ten one-time codes like `K4M9-X7QP`, shown once when two-step sign-in is turned on (R21). */
export function newRecoveryCodes(count = 10): string[] {
  return Array.from({ length: count }, () => {
    const chars = Array.from({ length: 8 }, () => ALPHABET[randomInt(ALPHABET.length)]);
    return `${chars.slice(0, 4).join('')}-${chars.slice(4).join('')}`;
  });
}

/** Codes are stored only as hashes. Spaces, dashes and case do not matter when typing one in. */
export function hashRecoveryCode(code: string): string {
  const normal = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return createHash('sha256').update(normal).digest('hex');
}
