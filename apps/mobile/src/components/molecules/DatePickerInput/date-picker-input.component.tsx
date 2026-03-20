import dayjs from 'dayjs';
import React, { useState } from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

import { DatePicker } from '@/components/atoms/DatePicker';
import { InputLayout } from '@/components/atoms/InputLayout';
import { Typography } from '@/components/atoms/Typography';
import { defaultInputContainerStyle, defaultInputTextStyle, tw } from '@/tailwind';

const FORMAT_MAP = {
  date: 'MMMM D, YYYY',
  datetime: 'MMMM D, YYYY h:mm A',
  time: 'h:mm A',
} as const;

type PickerMode = 'date' | 'time' | 'datetime';

type Props = {
  error?: string;
  isRequired?: boolean;
  label: string;
  maximumDate?: Date;
  minimumDate?: Date;
  mode: PickerMode;
  onChange: (date: Date) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  value: Date | undefined;
};

export function DatePickerInput(props: Props) {
  const {
    error,
    isRequired,
    label,
    maximumDate,
    minimumDate,
    mode,
    onChange,
    placeholder = 'Select',
    style,
    value,
  } = props;
  const [showPicker, setShowPicker] = useState(false);

  const containerStyle: StyleProp<ViewStyle> = [
    defaultInputContainerStyle,
    tw`dark:border-dark-divider dark:bg-dark-surface items-center`,
    error && tw`border-error`,
  ];

  return (
    <InputLayout error={error} isRequired={isRequired} label={label} style={style}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={containerStyle}
        onPress={() => setShowPicker(true)}
      >
        <Typography
          style={[
            defaultInputTextStyle,
            tw`dark:text-dark-foreground`,
            !value && tw`text-placeholder`,
          ]}
        >
          {value ? dayjs(value).format(FORMAT_MAP[mode]) : placeholder}
        </Typography>
      </TouchableOpacity>
      <DatePicker
        date={value || new Date()}
        isVisible={showPicker}
        maximumDate={maximumDate}
        minimumDate={minimumDate}
        mode={mode}
        onCancel={() => setShowPicker(false)}
        onConfirm={(selectedDate) => {
          setShowPicker(false);
          onChange(selectedDate);
        }}
      />
    </InputLayout>
  );
}
