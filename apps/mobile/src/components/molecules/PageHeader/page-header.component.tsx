import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTw } from '@/hooks/useTw';
import { DefaultComponentProps } from '@/types';

type Props = DefaultComponentProps & {
  title: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  subtitle?: string;
};

export function PageHeader(props: Props) {
  const { leftAction, rightAction, style, subtitle, title } = props;
  const tw = useTw();
  const insets = useSafeAreaInsets();

  return (
    <View style={[tw`bg-surface px-4 pb-3`, { paddingTop: insets.top }, style]}>
      <View style={tw`flex-row items-center justify-between`}>
        <View style={tw`flex-1 flex-row items-center`}>
          {leftAction}
          <Text style={tw`text-foreground font-serif-bold text-2xl`}>{title}</Text>
        </View>
        {rightAction}
      </View>
      {subtitle && <Text style={tw`text-subtitle mt-1`}>{subtitle}</Text>}
    </View>
  );
}
