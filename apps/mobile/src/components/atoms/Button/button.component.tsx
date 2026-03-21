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

export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonVariant = 'primary' | 'outlined' | 'ghost' | 'danger';

type Props = DefaultComponentProps &
  TouchableOpacityProps & {
    activityIndicatorColor?: string;
    buttonStyle?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
    isLoading?: boolean;
    size?: ButtonSize;
    textStyle?: StyleProp<TextStyle>;
    title?: string;
    variant?: ButtonVariant;
  };

const ACTIVE_OPACITY = 0.5;

const SIZE_STYLES: Record<ButtonSize, { button: string; text: string }> = {
  lg: { button: 'px-8 py-4 min-h-[56px]', text: 'text-base' },
  md: { button: 'px-6 py-3 min-h-[48px]', text: 'text-sm' },
  sm: { button: 'px-4 py-2 min-h-[36px]', text: 'text-xs' },
};

const VARIANT_STYLES: Record<ButtonVariant, { button: string; text: string; indicator: string }> = {
  danger: { button: 'bg-error', indicator: colors.white, text: 'text-white' },
  ghost: { button: 'bg-transparent', indicator: colors.primary, text: 'text-primary' },
  outlined: {
    button: 'border-primary border-2 bg-transparent',
    indicator: colors.primary,
    text: 'text-primary',
  },
  primary: { button: 'bg-primary', indicator: colors.white, text: 'text-white' },
};

export function Button(props: Props) {
  const {
    activeOpacity = ACTIVE_OPACITY,
    activityIndicatorColor,
    buttonStyle,
    children,
    isDisabled = false,
    isLoading = false,
    size = 'md',
    style,
    textStyle,
    title = 'Button',
    variant = 'primary',
    ...rest
  } = props;

  const disabled = isDisabled || isLoading;
  const sizeStyle = SIZE_STYLES[size];
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
