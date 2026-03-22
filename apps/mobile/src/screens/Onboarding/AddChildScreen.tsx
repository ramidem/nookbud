import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import { DatePickerInput } from '@/components/molecules/DatePickerInput';
import { useTw } from '@/hooks/useTw';
import type { SetupStackParamList } from '@/navigation/SetupNavigator';
import { ChildService } from '@/services';
import { colors } from '@/tailwind';

type Props = NativeStackScreenProps<SetupStackParamList, 'AddChild'>;

type ChildInput = {
  id: string;
  name: string;
  dateOfBirth: Date | undefined;
};

export function AddChildScreen({ navigation, route }: Props) {
  const tw = useTw();
  const { spaceId } = route.params;
  const [children, setChildren] = useState<ChildInput[]>([
    { dateOfBirth: undefined, id: '1', name: '' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addChild = () => {
    setChildren([...children, { dateOfBirth: undefined, id: String(Date.now()), name: '' }]);
  };

  const updateChildName = (id: string, value: string) => {
    setChildren(children.map((c) => (c.id === id ? { ...c, name: value } : c)));
  };

  const updateChildDob = (id: string, value: Date) => {
    setChildren(children.map((c) => (c.id === id ? { ...c, dateOfBirth: value } : c)));
  };

  const removeChild = (id: string) => {
    if (children.length > 1) {
      setChildren(children.filter((c) => c.id !== id));
    }
  };

  const validChildren = children.filter((c) => c.name.trim().length >= 2);
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

        {children.map((child, index) => (
          <View key={child.id} style={tw`bg-background mb-6 rounded-xl p-4`}>
            <View style={tw`mb-4 flex-row items-center justify-between`}>
              <Text style={tw`text-subtitle text-sm font-medium`}>Child {index + 1}</Text>
              {children.length > 1 && (
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
              onChangeText={(value) => updateChildName(child.id, value)}
            />

            <DatePickerInput
              label="Date of Birth"
              maximumDate={new Date()}
              mode="date"
              placeholder="Select date of birth"
              value={child.dateOfBirth}
              onChange={(value) => updateChildDob(child.id, value)}
            />
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
