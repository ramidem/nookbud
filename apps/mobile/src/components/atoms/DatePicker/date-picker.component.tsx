import React from 'react';
import { TouchableHighlight } from 'react-native';
import DateTimePickerModal, {
  ReactNativeModalDateTimePickerProps,
} from 'react-native-modal-datetime-picker';

import { Typography } from '@/components/atoms/Typography';
import { useLocalStorageStore } from '@/stores';
import { colors, tw } from '@/tailwind';

type Props = Omit<ReactNativeModalDateTimePickerProps, 'onCancel' | 'onConfirm'> & {
  onCancel: () => void;
  onConfirm: (date: Date) => void;
};

export function DatePicker(props: Props) {
  const { onCancel, onConfirm, ...rest } = props;
  const colorScheme = useLocalStorageStore((s) => s.colorScheme);
  const isDark = colorScheme === 'dark';

  return (
    <DateTimePickerModal
      backdropStyleIOS={tw`bg-black/40`}
      buttonTextColorIOS={colors.neutral[950]}
      customCancelButtonIOS={({ onPress }) => (
        <TouchableHighlight
          style={tw`dark:bg-dark-surface mt-2 items-center rounded-2xl bg-white py-4`}
          underlayColor={isDark ? colors['dark-background'] : colors.neutral[100]}
          onPress={onPress}
        >
          <Typography style={tw`dark:text-subtitle text-subtitle text-base font-semibold`}>
            Cancel
          </Typography>
        </TouchableHighlight>
      )}
      isDarkModeEnabled={isDark}
      modalStyleIOS={tw`rounded-2xl pb-4`}
      pickerContainerStyleIOS={tw`dark:bg-dark-sheet items-center justify-center bg-white`}
      onCancel={onCancel}
      onConfirm={onConfirm}
      {...rest}
    />
  );
}
