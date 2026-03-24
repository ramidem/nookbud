/**
 * Shared size scale for components across mobile (React Native) and web (Tailwind CSS).
 * Both platforms import from here to stay in sync.
 *
 * Usage:
 *   - Web: use `buttonSizes[size].twClass` in cva or className
 *   - Mobile: use `buttonSizes[size].twClass` with twrnc, or pixel values directly
 */

export type ComponentSize = 'sm' | 'md' | 'lg';

/**
 * Button size scale.
 * Values are expressed as Tailwind utility strings so both twrnc and Tailwind CSS can use them.
 * Pixel values are also exported for platforms that need explicit numbers.
 */
export const buttonSizes = {
  lg: {
    minHeight: 56,
    paddingHorizontal: 32, // px-8
    paddingVertical: 16, // py-4
    textSize: 'text-base',
    twClass: 'px-8 py-4 min-h-[56px]',
  },
  md: {
    minHeight: 48,
    paddingHorizontal: 24, // px-6
    paddingVertical: 12, // py-3
    textSize: 'text-sm',
    twClass: 'px-6 py-3 min-h-[48px]',
  },
  sm: {
    minHeight: 36,
    paddingHorizontal: 16, // px-4
    paddingVertical: 8, // py-2
    textSize: 'text-xs',
    twClass: 'px-4 py-2 min-h-[36px]',
  },
} as const satisfies Record<ComponentSize, { minHeight: number; paddingHorizontal: number; paddingVertical: number; textSize: string; twClass: string }>;

/**
 * Shared button variants (canonical names).
 * Mobile may alias `destructive` → `danger` for backwards compat.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'ghost' | 'destructive';

/**
 * Input size scale (height tokens for TextInput / InputLayout).
 */
export const inputSizes = {
  lg: { minHeight: 64, textSize: 'text-base' },
  md: { minHeight: 56, textSize: 'text-sm' },
  sm: { minHeight: 44, textSize: 'text-sm' },
} as const satisfies Record<ComponentSize, { minHeight: number; textSize: string }>;

/** Default input height (md) — matches TEXT_INPUT_MIN_HEIGHT on mobile */
export const INPUT_MIN_HEIGHT = inputSizes.md.minHeight; // 56
