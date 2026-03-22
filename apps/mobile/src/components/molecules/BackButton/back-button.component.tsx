import { useBackHandler } from '@react-native-community/hooks';
import { ParamListBase } from '@react-navigation/native';
import React from 'react';
import {
  GestureResponderEvent,
  PressableProps,
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { useNavigation } from '@/hooks';
import { ArrowLeftIcon } from '@/icons';
import { tw } from '@/tailwind';
import { DefaultComponentProps } from '@/types';

type Props = DefaultComponentProps &
  PressableProps & {
    fallbackRoute?: string;
    onPress?: (event?: GestureResponderEvent) => void;
    style?: StyleProp<ViewStyle>;
  };

const ACTIVE_OPACITY = 0.5;

export function BackButton(props: Props) {
  const { fallbackRoute, onPress, style } = props;
  const navigation = useNavigation<ParamListBase>();

  useBackHandler(() => {
    handleOnPress();

    return true;
  });

  const handleOnPress = (event?: GestureResponderEvent) => {
    if (onPress) {
      onPress(event);
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else if (fallbackRoute) {
      navigation.navigate(fallbackRoute);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={ACTIVE_OPACITY}
      style={[tw`h-[48px] w-[48px]`, style]}
      onPress={handleOnPress}
    >
      <View style={[tw`flex-1 items-center justify-center rounded-full`, style]}>
        <ArrowLeftIcon style={tw`dark:text-dark-foreground text-foreground`} />
      </View>
    </TouchableOpacity>
  );
}
