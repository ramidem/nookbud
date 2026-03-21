import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';

import { useTw } from '@/hooks/useTw';
import type { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingTimezone'>;

// Common timezones
const TIMEZONES = [
  { label: 'Eastern Time (US)', value: 'America/New_York' },
  { label: 'Central Time (US)', value: 'America/Chicago' },
  { label: 'Mountain Time (US)', value: 'America/Denver' },
  { label: 'Pacific Time (US)', value: 'America/Los_Angeles' },
  { label: 'Toronto (Canada)', value: 'America/Toronto' },
  { label: 'Vancouver (Canada)', value: 'America/Vancouver' },
  { label: 'London (UK)', value: 'Europe/London' },
  { label: 'Paris (France)', value: 'Europe/Paris' },
  { label: 'Berlin (Germany)', value: 'Europe/Berlin' },
  { label: 'Sydney (Australia)', value: 'Australia/Sydney' },
  { label: 'Melbourne (Australia)', value: 'Australia/Melbourne' },
  { label: 'Singapore', value: 'Asia/Singapore' },
  { label: 'Tokyo (Japan)', value: 'Asia/Tokyo' },
  { label: 'Manila (Philippines)', value: 'Asia/Manila' },
  { label: 'India Standard Time', value: 'Asia/Kolkata' },
  { label: 'UTC', value: 'UTC' },
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
    <View style={tw`bg-surface flex-1`}>
      <View style={tw`px-6 pt-16`}>
        <Text style={tw`text-foreground font-serif-bold mb-2 text-3xl`}>Your timezone</Text>
        <Text style={tw`text-subtitle mb-4 text-base`}>This helps us show times correctly.</Text>
      </View>

      <FlatList
        contentContainerStyle={tw`px-6 pb-4`}
        data={TIMEZONES}
        keyExtractor={(item) => item.value}
        renderItem={({ item }) => (
          <Pressable
            style={tw`border-divider flex-row items-center border-b py-4`}
            onPress={() => setSelected(item.value)}
          >
            <View
              style={tw`mr-4 h-6 w-6 items-center justify-center rounded-full border-2 ${
                selected === item.value ? 'border-primary' : 'border-divider'
              }`}
            >
              {selected === item.value && <View style={tw`bg-primary h-3 w-3 rounded-full`} />}
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-foreground text-base`}>{item.label}</Text>
              <Text style={tw`text-subtitle text-sm`}>{item.value}</Text>
            </View>
            {item.value === deviceTz && <Text style={tw`text-primary text-sm`}>Device</Text>}
          </Pressable>
        )}
      />

      <View style={tw`px-6 pb-8`}>
        <Pressable style={tw`bg-primary mb-3 rounded-xl py-4`} onPress={handleContinue}>
          <Text style={tw`text-center text-lg font-semibold text-white`}>Continue</Text>
        </Pressable>
        <Pressable onPress={handleSkip}>
          <Text style={tw`text-primary text-center text-base`}>Use device timezone</Text>
        </Pressable>
      </View>
    </View>
  );
}
