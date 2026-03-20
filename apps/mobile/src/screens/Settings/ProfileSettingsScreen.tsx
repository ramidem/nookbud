import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';

import type { User } from '@/database/schema';
import { useTw } from '@/hooks/useTw';
import type { SettingsStackParamList } from '@/navigation/SettingsNavigator';
import { UserService } from '@/services';

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
        setDisplayName(u.displayName);
        setTimezone(u.timezone);
        setDefaultCurrency(u.defaultCurrency);
      }
    } catch (err) {
      console.error('Failed to load user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Name is required');

      return;
    }

    setIsSaving(true);
    try {
      await UserService.updateUser({
        defaultCurrency,
        displayName: displayName.trim(),
        timezone,
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-white`}>
        <ActivityIndicator color="#2563EB" size="large" />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-white`}>
      {/* Header */}
      <View
        style={tw`flex-row items-center justify-between border-b border-gray-100 px-4 pb-4 pt-14`}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={tw`text-base text-blue-600`}>Cancel</Text>
        </Pressable>
        <Text style={tw`text-lg font-semibold text-gray-900`}>Edit Profile</Text>
        <Pressable disabled={isSaving} onPress={handleSave}>
          {isSaving ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text style={tw`text-base font-semibold text-blue-600`}>Save</Text>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={tw`p-4`}>
        {/* Name */}
        <View style={tw`mb-6`}>
          <Text style={tw`mb-2 text-sm font-medium text-gray-600`}>Display Name</Text>
          <TextInput
            placeholder="Your name"
            style={tw`rounded-xl border border-gray-300 px-4 py-3`}
            value={displayName}
            onChangeText={setDisplayName}
          />
        </View>

        {/* Timezone */}
        <View style={tw`mb-6`}>
          <Text style={tw`mb-2 text-sm font-medium text-gray-600`}>Timezone</Text>
          <TextInput
            editable={false}
            style={tw`rounded-xl border border-gray-300 bg-gray-50 px-4 py-3`}
            value={timezone}
          />
          <Text style={tw`mt-1 text-sm text-gray-500`}>
            Timezone cannot be changed from settings yet
          </Text>
        </View>

        {/* Currency */}
        <View style={tw`mb-6`}>
          <Text style={tw`mb-2 text-sm font-medium text-gray-600`}>Default Currency</Text>
          <View style={tw`flex-row flex-wrap gap-2`}>
            {CURRENCIES.map((curr) => (
              <Pressable
                key={curr}
                style={tw`rounded-lg px-4 py-2 ${
                  defaultCurrency === curr ? 'bg-blue-600' : 'bg-gray-100'
                }`}
                onPress={() => setDefaultCurrency(curr)}
              >
                <Text
                  style={tw`font-medium ${
                    defaultCurrency === curr ? 'text-white' : 'text-gray-700'
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
