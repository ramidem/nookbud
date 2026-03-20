import React, { JSX } from 'react';
import { Text as RNText, TextProps } from 'react-native';

import { tw } from '@/tailwind';

type Props = TextProps & {
  numberOfLines?: number;
  variant?: 'body' | 'heading';
};

export function Typography(props: Props): JSX.Element {
  const { numberOfLines = 0, style, variant = 'body', ...extraProps } = props;

  const shouldTruncateTextProps: TextProps =
    numberOfLines > 0 ? { ellipsizeMode: 'tail', numberOfLines } : {};

  const baseStyle =
    variant === 'heading'
      ? tw`dark:text-dark-foreground text-foreground font-serif text-base font-normal`
      : tw`dark:text-dark-foreground text-foreground font-sans text-base font-normal`;

  return <RNText {...shouldTruncateTextProps} style={[baseStyle, style]} {...extraProps} />;
}
