import React, { useState } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { useTw } from '@/hooks/useTw';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingCurrency'>;

// Common currencies
const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
];

export function OnboardingCurrencyScreen({ navigation, route }: Props) {
  const tw = useTw();
  const { displayName, timezone } = route.params;
  const [selected, setSelected] = useState('USD');

  const handleContinue = () => {
    navigation.navigate('OnboardingComplete', {
      displayName,
      timezone,
      defaultCurrency: selected,
    });
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <View style={tw`px-6 pt-16`}>
        <Text style={tw`text-3xl font-bold text-gray-900 mb-2`}>
          Default currency
        </Text>
        <Text style={tw`text-base text-gray-600 mb-4`}>
          Used for tracking expenses. You can use other currencies per expense.
        </Text>
      </View>

      <FlatList
        data={CURRENCIES}
        keyExtractor={(item) => item.code}
        contentContainerStyle={tw`px-6 pb-4`}
        renderItem={({ item }) => (
          <Pressable
            style={tw`flex-row items-center py-4 border-b border-gray-100`}
            onPress={() => setSelected(item.code)}
          >
            <View
              style={tw`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${
                selected === item.code ? 'border-blue-600' : 'border-gray-300'
              }`}
            >
              {selected === item.code && (
                <View style={tw`w-3 h-3 rounded-full bg-blue-600`} />
              )}
            </View>
            <Text style={tw`w-12 text-lg font-medium text-gray-900`}>
              {item.symbol}
            </Text>
            <View style={tw`flex-1`}>
              <Text style={tw`text-base text-gray-900`}>{item.name}</Text>
              <Text style={tw`text-sm text-gray-500`}>{item.code}</Text>
            </View>
          </Pressable>
        )}
      />

      <View style={tw`px-6 pb-8`}>
        <Pressable
          style={tw`bg-blue-600 rounded-xl py-4`}
          onPress={handleContinue}
        >
          <Text style={tw`text-white text-center text-lg font-semibold`}>
            Continue
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
