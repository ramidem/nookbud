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
import type { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';
import { RelationshipService, ChildService } from '@/services';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'AddChild'>;

type ChildInput = {
  id: string;
  name: string;
  dateOfBirth: Date | undefined;
};

export function AddChildScreen({ navigation }: Props) {
  const tw = useTw();
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
      // Create relationship first
      const relationship = await RelationshipService.create();

      // Add each valid child
      for (const child of validChildren) {
        await ChildService.create({
          dateOfBirth: child.dateOfBirth ?? undefined,
          name: child.name.trim(),
          relationshipId: relationship.id,
        });
      }

      // Navigate to invite partner
      navigation.navigate('InvitePartner', {
        inviteToken: relationship.inviteToken ?? '',
        relationshipId: relationship.id,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add children');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={tw`flex-1 bg-white`}
    >
      <ScrollView contentContainerStyle={tw`px-6 pb-8 pt-16`}>
        <Text style={tw`mb-2 text-3xl font-bold text-gray-900`}>Add your children</Text>
        <Text style={tw`mb-8 text-base text-gray-600`}>You can add more later in settings.</Text>

        {children.map((child, index) => (
          <View key={child.id} style={tw`mb-6 rounded-xl bg-gray-50 p-4`}>
            <View style={tw`mb-4 flex-row items-center justify-between`}>
              <Text style={tw`text-sm font-medium text-gray-600`}>Child {index + 1}</Text>
              {children.length > 1 && (
                <Pressable onPress={() => removeChild(child.id)}>
                  <Text style={tw`text-sm text-red-500`}>Remove</Text>
                </Pressable>
              )}
            </View>

            <TextInput
              autoCapitalize="words"
              placeholder="Child's name"
              placeholderTextColor="#9CA3AF"
              style={tw`mb-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-base`}
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
          style={tw`mb-8 rounded-xl border-2 border-dashed border-gray-300 py-4`}
          onPress={addChild}
        >
          <Text style={tw`text-center text-base font-medium text-blue-600`}>
            + Add another child
          </Text>
        </Pressable>

        {error && (
          <View style={tw`mb-4 rounded-xl bg-red-50 p-4`}>
            <Text style={tw`text-red-600`}>{error}</Text>
          </View>
        )}

        <Pressable
          disabled={!canContinue || isLoading}
          style={tw`${canContinue && !isLoading ? 'bg-blue-600' : 'bg-gray-300'} flex-row justify-center rounded-xl py-4`}
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
