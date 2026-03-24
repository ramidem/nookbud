/**
 * Shared TypeScript interfaces for UI components.
 * Mobile and web implement these separately but against the same contract.
 *
 * Rules:
 * - Prop names must be identical across platforms
 * - Variant keys must be canonical (use `destructive`, not `danger`)
 * - Mobile may support additional native-only props (not listed here)
 * - Web may support additional HTML-specific props (not listed here)
 */

import type { ComponentSize, ButtonVariant } from './sizes';

export type { ComponentSize, ButtonVariant };

/** Shared Button props contract */
export interface ButtonContract {
  /** Visual variant. Default: 'primary' */
  variant?: ButtonVariant;
  /** Size scale. Default: 'sm' */
  size?: ComponentSize;
  /** Render loading spinner instead of content */
  isLoading?: boolean;
  /** Disable interaction */
  isDisabled?: boolean;
}

/** Shared Typography props contract */
export type TypographyVariant = 'body' | 'heading';

export interface TypographyContract {
  variant?: TypographyVariant;
  children?: unknown;
}

/** Shared InputLayout props contract */
export interface InputLayoutContract {
  label?: string;
  subtitle?: string;
  error?: string;
  isRequired?: boolean;
  children?: unknown;
}

/** Shared Field props contract */
export interface FieldContract extends InputLayoutContract {
  placeholder?: string;
  isDisabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}
