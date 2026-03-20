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
import { useTw } from '@/hooks/useTw';
import { RelationshipService, ChildService } from '@/services';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'AddChild'>;

type ChildInput = {
  id: string;
  name: string;
  dateOfBirth: string; // YYYY-MM-DD format
};

export function AddChildScreen({ navigation }: Props) {
  const tw = useTw();
  const [children, setChildren] = useState<ChildInput[]>([
    { id: '1', name: '', dateOfBirth: '' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addChild = () => {
    setChildren([
      ...children,
      { id: String(Date.now()), name: '', dateOfBirth: '' },
    ]);
  };

  const updateChild = (id: string, field: 'name' | 'dateOfBirth', value: string) => {
    setChildren(
      children.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
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
          relationshipId: relationship.id,
          name: child.name.trim(),
          dateOfBirth: child.dateOfBirth
            ? new Date(child.dateOfBirth)
            : undefined,
        });
      }

      // Navigate to invite partner
      navigation.navigate('InvitePartner', {
        relationshipId: relationship.id,
        inviteToken: relationship.inviteToken ?? '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add children');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={tw`flex-1 bg-white`}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={tw`px-6 pt-16 pb-8`}>
        <Text style={tw`text-3xl font-bold text-gray-900 mb-2`}>
          Add your children
        </Text>
        <Text style={tw`text-base text-gray-600 mb-8`}>
          You can add more later in settings.
        </Text>

        {children.map((child, index) => (
          <View key={child.id} style={tw`mb-6 bg-gray-50 rounded-xl p-4`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text style={tw`text-sm font-medium text-gray-600`}>
                Child {index + 1}
              </Text>
              {children.length > 1 && (
                <Pressable onPress={() => removeChild(child.id)}>
                  <Text style={tw`text-red-500 text-sm`}>Remove</Text>
                </Pressable>
              )}
            </View>

            <TextInput
              style={tw`border border-gray-300 rounded-lg px-4 py-3 text-base bg-white mb-3`}
              placeholder="Child's name"
              placeholderTextColor="#9CA3AF"
              value={child.name}
              onChangeText={(value) => updateChild(child.id, 'name', value)}
              autoCapitalize="words"
            />

            <TextInput
              style={tw`border border-gray-300 rounded-lg px-4 py-3 text-base bg-white`}
              placeholder="Date of birth (YYYY-MM-DD)"
              placeholderTextColor="#9CA3AF"
              value={child.dateOfBirth}
              onChangeText={(value) => updateChild(child.id, 'dateOfBirth', value)}
              keyboardType="numbers-and-punctuation"
            />
          </View>
        ))}

        <Pressable
          style={tw`border-2 border-dashed border-gray-300 rounded-xl py-4 mb-8`}
          onPress={addChild}
        >
          <Text style={tw`text-blue-600 text-center text-base font-medium`}>
            + Add another child
          </Text>
        </Pressable>

        {error && (
          <View style={tw`bg-red-50 rounded-xl p-4 mb-4`}>
            <Text style={tw`text-red-600`}>{error}</Text>
          </View>
        )}

        <Pressable
          style={tw`${canContinue && !isLoading ? 'bg-blue-600' : 'bg-gray-300'} rounded-xl py-4 flex-row justify-center`}
          onPress={handleContinue}
          disabled={!canContinue || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={tw`text-white text-center text-lg font-semibold`}>
              Continue
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
