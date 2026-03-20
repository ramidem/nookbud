import React from 'react';
import { View } from 'react-native';

import { tw } from '@/tailwind';
import { DefaultComponentProps } from '@/types';

type Props = DefaultComponentProps & {};

export function Divider(props: Props) {
  const { style } = props;

  return <View style={[tw`dark:bg-dark-divider bg-divider h-[1px] w-full`, style]}></View>;
}
