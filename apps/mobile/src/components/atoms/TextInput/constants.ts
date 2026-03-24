// Import from shared design-tokens — keeps mobile and web input heights in sync
import { INPUT_MIN_HEIGHT } from '@coparent/design-tokens';
import { TextInputProps } from 'react-native';

/** @deprecated Use INPUT_MIN_HEIGHT from @coparent/design-tokens */
export const TEXT_INPUT_MIN_HEIGHT = INPUT_MIN_HEIGHT;

export const TEXT_INPUT_LINE_HEIGHT = 21;

export const DefaultPhonePadInputProps: TextInputProps = {
  autoCapitalize: 'none',
  autoCorrect: true,
  keyboardAppearance: 'dark',
  keyboardType: 'phone-pad',
  numberOfLines: 1,
};

export const DefaultNumberPadInputProps: TextInputProps = {
  autoCapitalize: 'none',
  autoCorrect: true,
  keyboardAppearance: 'dark',
  keyboardType: 'number-pad',
  numberOfLines: 1,
};

export const DefaultNumericInputProps: TextInputProps = {
  autoCapitalize: 'none',
  autoCorrect: true,
  keyboardAppearance: 'dark',
  keyboardType: 'numeric',
  numberOfLines: 1,
};

export const DefaultNameInputProps: TextInputProps = {
  autoCapitalize: 'words',
  autoCorrect: true,
  keyboardAppearance: 'dark',
  keyboardType: 'default',
  numberOfLines: 1,
};

export const DefaultEmailInputProps: TextInputProps = {
  autoCapitalize: 'none',
  autoCorrect: true,
  keyboardAppearance: 'dark',
  keyboardType: 'email-address',
  numberOfLines: 1,
};

export const DefaultTextAreaInputProps: TextInputProps = {
  autoCapitalize: 'sentences',
  autoCorrect: true,
  keyboardAppearance: 'dark',
  keyboardType: 'default',
  numberOfLines: 3,
};
