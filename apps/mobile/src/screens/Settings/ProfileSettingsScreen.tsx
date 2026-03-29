import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';

import { Alert } from '@/components';
import { useTw } from '@/hooks/useTw';
import type { SettingsStackParamList } from '@/navigation/SettingsNavigator';
import { UserService } from '@/services';
import { colors } from '@/tailwind';
import type { User } from '@/types';

type Props = NativeStackScreenProps<SettingsStackParamList, 'ProfileSettings'>;

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'PHP', 'INR', 'SGD'];

export function ProfileSettingsScreen({ navigation }: Props) {
  const tw = useTw();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [, setUser] = useState<User | null>(null);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [timezone, setTimezone] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setIsLoading(true);
    try {
      const u = await UserService.getCurrentUser();
      if (u) {
        setUser(u);
        setDisplayName(u.displayName ?? `${u.firstName} ${u.lastName}`.trim());
        setTimezone(u.timezone);
        setDefaultCurrency(u.defaultCurrency);
      }
    } catch {
      // Silent fail — user load is non-critical
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.error({
        message: 'Name is required',
        title: 'Validation Error',
      });

      return;
    }

    setIsSaving(true);
    try {
      await UserService.updateUser({
        defaultCurrency,
        // TODO: Firebase — map displayName to firstName/lastName
        firstName: displayName.trim(),
        timezone,
      });
      navigation.goBack();
    } catch (err) {
      Alert.error({
        message: err instanceof Error ? err.message : 'Failed to save',
        title: 'Save Failed',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={tw`bg-surface flex-1 items-center justify-center`}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={tw`bg-surface flex-1`}>
      {/* Header */}
      <View
        style={tw`border-background flex-row items-center justify-between border-b px-4 pb-4 pt-14`}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={tw`text-primary text-base`}>Cancel</Text>
        </Pressable>
        <Text style={tw`text-foreground font-serif-semibold text-lg`}>Edit Profile</Text>
        <Pressable disabled={isSaving} onPress={handleSave}>
          {isSaving ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text style={tw`text-primary text-base font-semibold`}>Save</Text>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={tw`p-4`}>
        {/* Name */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Display Name</Text>
          <TextInput
            placeholder="Your name"
            placeholderTextColor={colors.placeholder}
            style={tw`border-divider text-foreground rounded-xl border px-4 py-3`}
            value={displayName}
            onChangeText={setDisplayName}
          />
        </View>

        {/* Timezone */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Timezone</Text>
          <TextInput
            editable={false}
            style={tw`border-divider bg-background text-foreground rounded-xl border px-4 py-3`}
            value={timezone}
          />
          <Text style={tw`text-subtitle mt-1 text-sm`}>
            Timezone cannot be changed from settings yet
          </Text>
        </View>

        {/* Currency */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Default Currency</Text>
          <View style={tw`flex-row flex-wrap gap-2`}>
            {CURRENCIES.map((curr) => (
              <Pressable
                key={curr}
                style={tw`rounded-lg px-4 py-2 ${
                  defaultCurrency === curr ? 'bg-primary' : 'bg-neutral-200'
                }`}
                onPress={() => setDefaultCurrency(curr)}
              >
                <Text
                  style={tw`font-medium ${
                    defaultCurrency === curr ? 'text-white' : 'text-foreground'
                  }`}
                >
                  {curr}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
