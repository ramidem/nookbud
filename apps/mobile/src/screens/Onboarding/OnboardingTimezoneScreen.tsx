import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { useTw } from '@/hooks/useTw';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingTimezone'>;

// Common timezones
const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (US)' },
  { value: 'America/Chicago', label: 'Central Time (US)' },
  { value: 'America/Denver', label: 'Mountain Time (US)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
  { value: 'America/Toronto', label: 'Toronto (Canada)' },
  { value: 'America/Vancouver', label: 'Vancouver (Canada)' },
  { value: 'Europe/London', label: 'London (UK)' },
  { value: 'Europe/Paris', label: 'Paris (France)' },
  { value: 'Europe/Berlin', label: 'Berlin (Germany)' },
  { value: 'Australia/Sydney', label: 'Sydney (Australia)' },
  { value: 'Australia/Melbourne', label: 'Melbourne (Australia)' },
  { value: 'Asia/Singapore', label: 'Singapore' },
  { value: 'Asia/Tokyo', label: 'Tokyo (Japan)' },
  { value: 'Asia/Manila', label: 'Manila (Philippines)' },
  { value: 'Asia/Kolkata', label: 'India Standard Time' },
  { value: 'UTC', label: 'UTC' },
];

function getDeviceTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

export function OnboardingTimezoneScreen({ navigation, route }: Props) {
  const tw = useTw();
  const { displayName } = route.params;
  
  const deviceTz = useMemo(() => getDeviceTimezone(), []);
  const [selected, setSelected] = useState(deviceTz);

  const handleContinue = () => {
    navigation.navigate('OnboardingCurrency', {
      displayName,
      timezone: selected,
    });
  };

  const handleSkip = () => {
    navigation.navigate('OnboardingCurrency', {
      displayName,
      timezone: deviceTz,
    });
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <View style={tw`px-6 pt-16`}>
        <Text style={tw`text-3xl font-bold text-gray-900 mb-2`}>
          Your timezone
        </Text>
        <Text style={tw`text-base text-gray-600 mb-4`}>
          This helps us show times correctly.
        </Text>
      </View>

      <FlatList
        data={TIMEZONES}
        keyExtractor={(item) => item.value}
        contentContainerStyle={tw`px-6 pb-4`}
        renderItem={({ item }) => (
          <Pressable
            style={tw`flex-row items-center py-4 border-b border-gray-100`}
            onPress={() => setSelected(item.value)}
          >
            <View
              style={tw`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${
                selected === item.value ? 'border-blue-600' : 'border-gray-300'
              }`}
            >
              {selected === item.value && (
                <View style={tw`w-3 h-3 rounded-full bg-blue-600`} />
              )}
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-base text-gray-900`}>{item.label}</Text>
              <Text style={tw`text-sm text-gray-500`}>{item.value}</Text>
            </View>
            {item.value === deviceTz && (
              <Text style={tw`text-sm text-blue-600`}>Device</Text>
            )}
          </Pressable>
        )}
      />

      <View style={tw`px-6 pb-8`}>
        <Pressable
          style={tw`bg-blue-600 rounded-xl py-4 mb-3`}
          onPress={handleContinue}
        >
          <Text style={tw`text-white text-center text-lg font-semibold`}>
            Continue
          </Text>
        </Pressable>
        <Pressable onPress={handleSkip}>
          <Text style={tw`text-blue-600 text-center text-base`}>
            Use device timezone
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
