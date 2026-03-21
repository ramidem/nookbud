/**
 * Field — self-contained form field components.
 *
 * Each variant wraps InputLayout + the corresponding input atom into one
 * reusable, medium-sized component. Usage:
 *
 *   <Field.Text label="Name" value={name} onChangeText={setName} />
 *   <Field.Area label="Notes" value={notes} onChangeText={setNotes} />
 *   <Field.Select label="Role" options={...} selectedId={role} onSelect={setRole} />
 *   <Field.Date label="Date of Birth" mode="date" value={dob} onChange={setDob} />
 */

import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { InputLayout } from '@/components/atoms/InputLayout';
import { SelectDropdown } from '@/components/atoms/SelectDropdown';
import {
  TextInput,
  TextInputArea,
  type TextInputAreaProps,
  type TextInputProps,
} from '@/components/atoms/TextInput';
import { DatePickerInput } from '@/components/molecules/DatePickerInput';

// ─── Shared base ──────────────────────────────────────────────────────────────

type FieldBase = {
  error?: string;
  isRequired?: boolean;
  label: string;
  style?: StyleProp<ViewStyle>;
  subtitle?: string;
};

// ─── Field.Text ───────────────────────────────────────────────────────────────

type TextFieldProps = FieldBase &
  Omit<TextInputProps, 'style'> & {
    inputStyle?: StyleProp<ViewStyle>;
  };

function TextField(props: TextFieldProps) {
  const { error, inputStyle, isRequired, label, style, subtitle, ...inputProps } = props;

  return (
    <InputLayout
      error={error}
      isRequired={isRequired}
      label={label}
      style={style}
      subtitle={subtitle}
    >
      <TextInput style={inputStyle} {...inputProps} />
    </InputLayout>
  );
}

// ─── Field.Area ───────────────────────────────────────────────────────────────

type AreaFieldProps = FieldBase &
  Omit<TextInputAreaProps, 'style'> & {
    inputStyle?: StyleProp<ViewStyle>;
  };

function AreaField(props: AreaFieldProps) {
  const { error, inputStyle, isRequired, label, style, subtitle, ...inputProps } = props;

  return (
    <InputLayout
      error={error}
      isRequired={isRequired}
      label={label}
      style={style}
      subtitle={subtitle}
    >
      <TextInputArea style={inputStyle} {...inputProps} />
    </InputLayout>
  );
}

// ─── Field.Select ─────────────────────────────────────────────────────────────

type SelectOption = {
  id: string;
  label: string;
};

type SelectFieldProps = FieldBase & {
  onSelect: (id: string) => void;
  options: SelectOption[];
  placeholder?: string;
  selectedId?: string;
};

function SelectField(props: SelectFieldProps) {
  const { error, isRequired, label, onSelect, options, placeholder, selectedId, style, subtitle } =
    props;

  return (
    <InputLayout
      error={error}
      isRequired={isRequired}
      label={label}
      style={style}
      subtitle={subtitle}
    >
      <SelectDropdown
        options={options}
        placeholder={placeholder}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </InputLayout>
  );
}

// ─── Field.Date ───────────────────────────────────────────────────────────────

type DateFieldProps = Omit<FieldBase, 'subtitle'> & {
  maximumDate?: Date;
  minimumDate?: Date;
  mode: 'date' | 'time' | 'datetime';
  onChange: (date: Date) => void;
  placeholder?: string;
  value: Date | undefined;
};

function DateField(props: DateFieldProps) {
  const {
    error,
    isRequired,
    label,
    maximumDate,
    minimumDate,
    mode,
    onChange,
    placeholder,
    style,
    value,
  } = props;

  // DatePickerInput already wraps InputLayout internally — pass props through directly
  return (
    <DatePickerInput
      error={error}
      isRequired={isRequired}
      label={label}
      maximumDate={maximumDate}
      minimumDate={minimumDate}
      mode={mode}
      placeholder={placeholder}
      style={style}
      value={value}
      onChange={onChange}
    />
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const Field = {
  Area: AreaField,
  Date: DateField,
  Select: SelectField,
  Text: TextField,
};
