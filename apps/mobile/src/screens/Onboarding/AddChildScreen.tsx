import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { DatePickerInput } from '@/components/molecules/DatePickerInput';
import { CHILD_ROLES, CHILD_ROLE_DISPLAY, type ChildRole } from '@/database/schema';
import { useTw } from '@/hooks/useTw';
import type { SetupStackParamList } from '@/navigation/SetupNavigator';
import { ChildService } from '@/services';
import { colors } from '@/tailwind';

type Props = NativeStackScreenProps<SetupStackParamList, 'AddChild'>;

type ChildInput = {
  dateOfBirth: Date | undefined;
  id: string;
  name: string;
  role: ChildRole | undefined;
};

const ROLE_OPTIONS = CHILD_ROLES.map((r) => ({ label: CHILD_ROLE_DISPLAY[r], value: r }));

export function AddChildScreen({ navigation, route }: Props) {
  const tw = useTw();
  const { spaceId } = route.params;
  const [childList, setChildList] = useState<ChildInput[]>([
    { dateOfBirth: undefined, id: '1', name: '', role: undefined },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addChild = () => {
    setChildList([
      ...childList,
      { dateOfBirth: undefined, id: String(Date.now()), name: '', role: undefined },
    ]);
  };

  const updateChild = (id: string, patch: Partial<ChildInput>) => {
    setChildList(childList.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const removeChild = (id: string) => {
    if (childList.length > 1) {
      setChildList(childList.filter((c) => c.id !== id));
    }
  };

  const validChildren = childList.filter((c) => c.name.trim().length >= 2 && c.role);
  const canContinue = validChildren.length > 0;

  const handleContinue = async () => {
    if (!canContinue) return;

    setIsLoading(true);
    setError(null);

    try {
      for (const child of validChildren) {
        await ChildService.create({
          dateOfBirth: child.dateOfBirth ?? undefined,
          name: child.name.trim(),
          role: child.role,
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={tw`bg-surface flex-1`}
    >
      <ScrollView contentContainerStyle={tw`px-6 pb-8 pt-16`}>
        <Text style={tw`text-foreground font-serif-bold mb-2 text-3xl`}>Add your children</Text>
        <Text style={tw`text-subtitle mb-8 text-base`}>You can add more later in settings.</Text>

        {childList.map((child, index) => (
          <View key={child.id} style={tw`bg-background mb-6 rounded-xl p-4`}>
            <View style={tw`mb-4 flex-row items-center justify-between`}>
              <Text style={tw`text-subtitle text-sm font-medium`}>Child {index + 1}</Text>
              {childList.length > 1 && (
                <Pressable onPress={() => removeChild(child.id)}>
                  <Text style={tw`text-error text-sm`}>Remove</Text>
                </Pressable>
              )}
            </View>

            <TextInput
              autoCapitalize="words"
              placeholder="Child's name"
              placeholderTextColor={colors.placeholder}
              style={tw`border-divider bg-surface text-foreground mb-3 rounded-lg border px-4 py-3 text-base`}
              value={child.name}
              onChangeText={(value) => updateChild(child.id, { name: value })}
            />

            <DatePickerInput
              label="Date of Birth"
              maximumDate={new Date()}
              mode="date"
              placeholder="Select date of birth"
              value={child.dateOfBirth}
              onChange={(value) => updateChild(child.id, { dateOfBirth: value })}
            />

            {/* Role selector */}
            <Text style={tw`text-subtitle mb-2 mt-3 text-xs font-medium uppercase tracking-wide`}>
              Your relationship to this child
            </Text>
            <View style={tw`flex-row flex-wrap gap-2`}>
              {ROLE_OPTIONS.map((option) => {
                const isSelected = child.role === option.value;

                return (
                  <Pressable
                    key={option.value}
                    style={tw`rounded-full border px-3 py-1.5 ${
                      isSelected ? 'bg-primary border-primary' : 'border-divider bg-surface'
                    }`}
                    onPress={() => updateChild(child.id, { role: option.value })}
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
          </View>
        ))}

        <Pressable
          style={tw`border-divider mb-8 rounded-xl border-2 border-dashed py-4`}
          onPress={addChild}
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
          disabled={!canContinue || isLoading}
          style={tw`${canContinue && !isLoading ? 'bg-primary' : 'bg-disabled'} flex-row justify-center rounded-xl py-4`}
          onPress={handleContinue}
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
