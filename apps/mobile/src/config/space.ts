import { colors } from '@/tailwind';

/** Color swatches available when creating/editing a Space. */
export const SPACE_COLOR_OPTIONS = [
  colors.primary,
  colors.accent,
  colors['accent-soft'],
  '#7B9EC4', // soft blue — not in brand palette, space-picker only
  '#9B8EC4', // soft purple — not in brand palette, space-picker only
  '#C4A97B', // warm gold — not in brand palette, space-picker only
];

export const DEFAULT_SPACE_COLOR = colors.primary;
