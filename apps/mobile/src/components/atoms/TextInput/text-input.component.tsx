import React, { useState } from 'react';
import {
  Pressable,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleProp,
  TextStyle,
  View,
} from 'react-native';

import { DefaultNameInputProps } from './constants';

import { CrossIcon } from '@/icons';
import { useLocalStorageStore } from '@/stores';
import {
  colors,
  defaultInputContainerStyle,
  defaultInputTextStyle,
  disabledInputStyle,
  focusedInputStyle,
  tw,
} from '@/tailwind';
import { DefaultComponentProps } from '@/types/component.type';

export type TextInputProps = DefaultComponentProps &
  RNTextInputProps & {
    textInputRef?: React.RefObject<RNTextInput>;
    textStyle?: StyleProp<TextStyle>;
    showClearButton?: boolean;
    onClearButtonPress?: () => void;
  };

export function TextInput(props: TextInputProps) {
  const {
    isDisabled = false,
    multiline = false,
    onChangeText,
    onClearButtonPress,
    placeholder,
    showClearButton = true,
    style,
    textInputRef,
    textStyle,
    value,
    ...extraProps
  } = props;
  const colorScheme = useLocalStorageStore((s) => s.colorScheme);
  const [isClearButtonVisible, setIsClearButtonVisible] = useState<boolean>(false);
  const [isFocused, setFocused] = useState<boolean>(false);

  function handleOnChangeText(text: string) {
    onChangeText?.(text);

    if (showClearButton) {
      setIsClearButtonVisible(text.length > 0);
    }
  }

  function handleOnClearPress() {
    handleOnChangeText?.('');
    onClearButtonPress?.();
  }

  function handleOnFocus() {
    setFocused(true);

    const shouldShowClearButton = showClearButton && value?.length;
    if (shouldShowClearButton) {
      setIsClearButtonVisible(true);
    }
  }

  function handleOnBlur() {
    setFocused(false);

    const shouldShowClearButton = showClearButton && value?.length;
    if (shouldShowClearButton) {
      setIsClearButtonVisible(false);
    }
  }

  return (
    <View
      style={[
        defaultInputContainerStyle,
        tw`dark:border-dark-divider dark:bg-dark-surface`,
        focusedInputStyle(isFocused),
        disabledInputStyle(isDisabled),
        style,
      ]}
    >
      <RNTextInput
        {...DefaultNameInputProps}
        ref={textInputRef}
        cursorColor={colors.neutral[500]}
        editable={!isDisabled}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor={colorScheme === 'dark' ? colors.placeholder : colors.neutral[400]}
        selectionColor={colors.neutral[500]}
        style={[defaultInputTextStyle, tw`dark:text-dark-foreground`, textStyle]}
        value={value}
        onBlur={handleOnBlur}
        onChangeText={handleOnChangeText}
        onFocus={handleOnFocus}
        {...extraProps}
      />
      {isClearButtonVisible && (
        <Pressable
          hitSlop={30}
          style={tw`items-center justify-center`}
          testID="clear-button"
          onPress={handleOnClearPress}
        >
          <CrossIcon style={tw`dark:text-subtitle text-neutral-400`} />
        </Pressable>
      )}
    </View>
  );
}
