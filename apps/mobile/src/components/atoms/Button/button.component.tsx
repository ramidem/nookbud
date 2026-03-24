import { buttonSizes, type ButtonContract } from '@coparent/design-tokens';
import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';

import { Typography } from '@/components/atoms/Typography';
import { colors, disabledInputStyle, tw } from '@/tailwind';
import { DefaultComponentProps } from '@/types';

export type ButtonSize = ButtonContract['size'];
export type ButtonVariant =
  | 'danger'
  | 'destructive'
  | 'ghost'
  | 'outlined'
  | 'primary'
  | 'secondary';

type Props = DefaultComponentProps &
  TouchableOpacityProps &
  ButtonContract & {
    activityIndicatorColor?: string;
    buttonStyle?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
    textStyle?: StyleProp<TextStyle>;
    title?: string;
    /** @deprecated Use variant="destructive" instead */
    variant?: ButtonVariant;
  };

const ACTIVE_OPACITY = 0.5;

// SIZE_STYLES derived from shared design-tokens — single source of truth
const SIZE_STYLES: Record<NonNullable<ButtonSize>, { button: string; text: string }> = {
  lg: { button: buttonSizes.lg.twClass, text: buttonSizes.lg.textSize },
  md: { button: buttonSizes.md.twClass, text: buttonSizes.md.textSize },
  sm: { button: buttonSizes.sm.twClass, text: buttonSizes.sm.textSize },
};

const TEXT_WHITE = 'text-white';
const TEXT_PRIMARY = 'text-primary';
const BG_TRANSPARENT = 'bg-transparent';
const BG_ERROR = 'bg-error';

const DESTRUCTIVE_STYLE = { button: BG_ERROR, indicator: colors.white, text: TEXT_WHITE };

const VARIANT_STYLES: Record<ButtonVariant, { button: string; indicator: string; text: string }> = {
  // Backwards-compat alias
  danger: DESTRUCTIVE_STYLE,
  // Canonical names
  destructive: DESTRUCTIVE_STYLE,
  ghost: { button: BG_TRANSPARENT, indicator: colors.primary, text: TEXT_PRIMARY },
  outlined: {
    button: `border-primary border-2 ${BG_TRANSPARENT}`,
    indicator: colors.primary,
    text: TEXT_PRIMARY,
  },
  primary: { button: 'bg-primary', indicator: colors.white, text: TEXT_WHITE },
  secondary: { button: 'bg-secondary', indicator: colors.foreground, text: 'text-foreground' },
};

export function Button(props: Props) {
  const {
    activeOpacity = ACTIVE_OPACITY,
    activityIndicatorColor,
    buttonStyle,
    children,
    isDisabled = false,
    isLoading = false,
    size = 'sm',
    style,
    textStyle,
    title = 'Button',
    variant = 'primary',
    ...rest
  } = props;

  const disabled = isDisabled || isLoading;
  const currentSize: NonNullable<ButtonSize> = size ?? 'sm';
  const sizeStyle = SIZE_STYLES[currentSize];
  const variantStyle = VARIANT_STYLES[variant];
  const indicatorColor = activityIndicatorColor ?? variantStyle.indicator;

  const display = children ?? (
    <Typography style={[tw`font-medium ${variantStyle.text} ${sizeStyle.text}`, textStyle]}>
      {title}
    </Typography>
  );

  return (
    <TouchableOpacity activeOpacity={activeOpacity} disabled={disabled} style={[style]} {...rest}>
      <View
        style={[
          tw`items-center justify-center rounded-full ${variantStyle.button} ${sizeStyle.button}`,
          buttonStyle,
          disabledInputStyle(disabled),
        ]}
      >
        {isLoading ? <ActivityIndicator color={indicatorColor} /> : display}
      </View>
    </TouchableOpacity>
  );
}

/** @deprecated Use <Button variant="outlined" /> instead */
export function OutlinedButton(props: Props) {
  return <Button {...props} variant="outlined" />;
}
