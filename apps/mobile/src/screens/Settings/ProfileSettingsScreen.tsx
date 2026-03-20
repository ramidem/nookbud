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
import { useTw } from '@/hooks/useTw';
import { UserService } from '@/services';
import type { User } from '@/database/schema';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '@/navigation/SettingsNavigator';

type Props = NativeStackScreenProps<SettingsStackParamList, 'ProfileSettings'>;

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'PHP', 'INR', 'SGD'];

export function ProfileSettingsScreen({ navigation }: Props) {
  const tw = useTw();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);

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
        displayName: displayName.trim(),
        timezone,
        defaultCurrency,
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
      <View style={tw`flex-1 bg-white items-center justify-center`}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-white`}>
      {/* Header */}
      <View style={tw`flex-row items-center justify-between px-4 pt-14 pb-4 border-b border-gray-100`}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={tw`text-blue-600 text-base`}>Cancel</Text>
        </Pressable>
        <Text style={tw`text-lg font-semibold text-gray-900`}>Edit Profile</Text>
        <Pressable onPress={handleSave} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text style={tw`text-blue-600 text-base font-semibold`}>Save</Text>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={tw`p-4`}>
        {/* Name */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-sm font-medium text-gray-600 mb-2`}>Display Name</Text>
          <TextInput
            style={tw`border border-gray-300 rounded-xl px-4 py-3`}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name"
          />
        </View>

        {/* Timezone */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-sm font-medium text-gray-600 mb-2`}>Timezone</Text>
          <TextInput
            style={tw`border border-gray-300 rounded-xl px-4 py-3 bg-gray-50`}
            value={timezone}
            editable={false}
          />
          <Text style={tw`text-sm text-gray-500 mt-1`}>
            Timezone cannot be changed from settings yet
          </Text>
        </View>

        {/* Currency */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-sm font-medium text-gray-600 mb-2`}>Default Currency</Text>
          <View style={tw`flex-row flex-wrap gap-2`}>
            {CURRENCIES.map((curr) => (
              <Pressable
                key={curr}
                style={tw`px-4 py-2 rounded-lg ${
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
