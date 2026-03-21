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

type Props = DefaultComponentProps &
  TouchableOpacityProps & {
    activityIndicatorColor?: string;
    buttonStyle?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
    isLoading?: boolean;
    size?: ButtonSize;
    textStyle?: StyleProp<TextStyle>;
    title?: string;
  };

const ACTIVE_OPACITY = 0.5;

const SIZE_STYLES: Record<ButtonSize, { button: string; text: string }> = {
  lg: { button: 'px-8 py-4 min-h-[56px]', text: 'text-base' },
  md: { button: 'px-6 py-3 min-h-[48px]', text: 'text-sm' },
  sm: { button: 'px-4 py-2 min-h-[36px]', text: 'text-xs' },
};

export function Button(props: Props) {
  const {
    activeOpacity = ACTIVE_OPACITY,
    activityIndicatorColor = colors.white,
    buttonStyle,
    children,
    isDisabled = false,
    isLoading = false,
    size = 'md',
    style,
    textStyle,
    title = 'Button',
    ...rest
  } = props;
  const disabled = isDisabled || isLoading;
  const sizeStyle = SIZE_STYLES[size];
  const display = children ?? (
    <Typography style={[tw`font-medium text-white ${sizeStyle.text}`, textStyle]}>
      {title}
    </Typography>
  );

  return (
    <TouchableOpacity activeOpacity={activeOpacity} disabled={disabled} style={[style]} {...rest}>
      <View
        style={[
          tw`bg-primary items-center justify-center rounded-full ${sizeStyle.button}`,
          buttonStyle,
          disabledInputStyle(disabled),
        ]}
      >
        {isLoading ? <ActivityIndicator color={activityIndicatorColor} /> : display}
      </View>
    </TouchableOpacity>
  );
}

export function OutlinedButton(props: Props) {
  const { ...rest } = props;

  return (
    <Button
      {...rest}
      buttonStyle={tw`border-primary border-2 bg-transparent`}
      textStyle={tw`text-primary`}
    />
  );
}
