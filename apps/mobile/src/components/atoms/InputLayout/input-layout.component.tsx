import React from 'react';
import { StyleProp, TextStyle, View } from 'react-native';

import { Typography } from '@/components/atoms/Typography';
import { tw } from '@/tailwind';
import { DefaultComponentProps } from '@/types';

type Props = DefaultComponentProps & {
  children?: React.ReactNode;
  isRequired?: boolean;
  label?: string;
  subtitle?: string;
  textStyle?: StyleProp<TextStyle>;
};

export function InputLayout(props: Props) {
  const { children, error, isRequired, label, style, subtitle, textStyle } = props;

  return (
    <View style={[style]}>
      {label && (
        <Typography style={[tw`mb-2 text-neutral-600 dark:text-neutral-300`, textStyle]}>
          {label}
          {isRequired && <Typography style={tw`text-error`}>{isRequired && '*'}</Typography>}
        </Typography>
      )}
      {children}
      {!!error && (
        <View style={tw`mt-1 items-start`}>
          <Typography style={tw`text-error text-right text-xs`}>{error}</Typography>
        </View>
      )}
      {!!subtitle && !error && (
        <View style={tw`mt-1 items-start`}>
          <Typography style={tw`text-right text-xs text-neutral-400 dark:text-neutral-400`}>
            {subtitle}
          </Typography>
        </View>
      )}
    </View>
  );
}
