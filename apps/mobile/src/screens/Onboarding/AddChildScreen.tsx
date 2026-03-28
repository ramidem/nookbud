import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { z } from 'zod';

import { DatePickerInput } from '@/components/molecules/DatePickerInput';
import { CHILD_ROLES, CHILD_ROLE_DISPLAY, type ChildRole } from '@/database/schema';
import { useTw } from '@/hooks/useTw';
import type { SetupStackParamList } from '@/navigation/SetupNavigator';
import { ChildService } from '@/services';
import { colors } from '@/tailwind';

type Props = NativeStackScreenProps<SetupStackParamList, 'AddChild'>;

const childInputSchema = z.object({
  dateOfBirth: z.date().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.custom<ChildRole>((val) => typeof val === 'string' && val.length > 0, {
    message: 'Role is required',
  }),
});

const addChildrenSchema = z.object({
  children: z.array(childInputSchema).min(1),
});

type AddChildrenFormData = z.infer<typeof addChildrenSchema>;

const ROLE_OPTIONS = CHILD_ROLES.map((r) => ({ label: CHILD_ROLE_DISPLAY[r], value: r }));

export function AddChildScreen({ navigation, route }: Props) {
  const tw = useTw();
  const { spaceId } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    formState: { isValid },
    handleSubmit,
  } = useForm<AddChildrenFormData>({
    defaultValues: {
      children: [{ dateOfBirth: undefined, name: '', role: undefined }],
    },
    mode: 'onChange',
    resolver: zodResolver(addChildrenSchema),
  });

  const { append, fields, remove } = useFieldArray({ control, name: 'children' });

  const onSubmit = async (data: AddChildrenFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      for (const child of data.children) {
        await ChildService.create({
          dateOfBirth: child.dateOfBirth ?? undefined,
          name: child.name.trim(),
          role: child.role as ChildRole,
          spaceId,
        });
      }

      navigation.navigate('InviteMembers', { spaceId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add children');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={tw`bg-surface flex-1`}>
      <ScrollView contentContainerStyle={tw`px-6 pb-8 pt-16`}>
        <Text style={tw`text-foreground font-serif-bold mb-2 text-3xl`}>Add your children</Text>
        <Text style={tw`text-subtitle mb-8 text-base`}>You can add more later in settings.</Text>

        {fields.map((field, index) => (
          <View key={field.id} style={tw`bg-background mb-6 rounded-xl p-4`}>
            <View style={tw`mb-4 flex-row items-center justify-between`}>
              <Text style={tw`text-subtitle text-sm font-medium`}>Child {index + 1}</Text>
              {fields.length > 1 && (
                <Pressable onPress={() => remove(index)}>
                  <Text style={tw`text-error text-sm`}>Remove</Text>
                </Pressable>
              )}
            </View>

            <Controller
              control={control}
              name={`children.${index}.name`}
              render={({ field: { onBlur, onChange, value } }) => (
                <TextInput
                  autoCapitalize="words"
                  placeholder="Child's name"
                  placeholderTextColor={colors.placeholder}
                  style={tw`border-divider bg-surface text-foreground mb-3 rounded-lg border px-4 py-3 text-base`}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name={`children.${index}.dateOfBirth`}
              render={({ field: { onChange, value } }) => (
                <DatePickerInput
                  label="Date of Birth"
                  maximumDate={new Date()}
                  mode="date"
                  placeholder="Select date of birth"
                  value={value}
                  onChange={onChange}
                />
              )}
            />

            {/* Role selector */}
            <Text style={tw`text-subtitle mb-2 mt-3 text-xs font-medium uppercase tracking-wide`}>
              Your relationship to this child
            </Text>
            <Controller
              control={control}
              name={`children.${index}.role`}
              render={({ field: { onChange, value } }) => (
                <View style={tw`flex-row flex-wrap gap-2`}>
                  {ROLE_OPTIONS.map((option) => {
                    const isSelected = value === option.value;

                    return (
                      <Pressable
                        key={option.value}
                        style={tw`rounded-full border px-3 py-1.5 ${
                          isSelected ? 'bg-primary border-primary' : 'border-divider bg-surface'
                        }`}
                        onPress={() => onChange(option.value)}
                      >
                        <Text
                          style={tw`text-sm font-medium ${isSelected ? 'text-white' : 'text-foreground'}`}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            />
          </View>
        ))}

        <Pressable
          style={tw`border-divider mb-8 rounded-xl border-2 border-dashed py-4`}
          onPress={() =>
            append({ dateOfBirth: undefined, name: '', role: undefined as unknown as ChildRole })
          }
        >
          <Text style={tw`text-primary text-center text-base font-medium`}>
            + Add another child
          </Text>
        </Pressable>

        {error && (
          <View style={tw`bg-error/15 mb-4 rounded-xl p-4`}>
            <Text style={tw`text-error`}>{error}</Text>
          </View>
        )}

        <Pressable
          disabled={!isValid || isLoading}
          style={tw`${isValid && !isLoading ? 'bg-primary' : 'bg-disabled'} flex-row justify-center rounded-xl py-4`}
          onPress={handleSubmit(onSubmit)}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={tw`text-center text-lg font-semibold text-white`}>Continue</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
