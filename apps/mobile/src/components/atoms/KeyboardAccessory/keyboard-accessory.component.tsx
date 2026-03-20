import React from 'react';
import { InputAccessoryView, Keyboard, View } from 'react-native';

import { Button } from '@/components/atoms/Button';
import { KeyboardHideIcon } from '@/icons';
import { tw } from '@/tailwind';
import { DefaultComponentProps } from '@/types/component.type';

type Props = DefaultComponentProps & {
  nativeID: string;
};

export function KeyboardAccessory(props: Props) {
  const { nativeID } = props;

  return (
    <InputAccessoryView nativeID={nativeID}>
      <View style={tw`dark:bg-kbd-surface flex-row items-center justify-end bg-neutral-100 px-2`}>
        <Button
          buttonStyle={tw`dark:bg-kbd-button my-2 rounded-lg bg-neutral-200`}
          onPress={() => Keyboard.dismiss()}
        >
          <KeyboardHideIcon style={tw`text-neutral-600 dark:text-white`} />
        </Button>
      </View>
    </InputAccessoryView>
  );
}
