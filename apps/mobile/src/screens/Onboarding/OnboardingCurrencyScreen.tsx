import { LegendList } from '@legendapp/list';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';

import { useTw } from '@/hooks/useTw';
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
      defaultCurrency: selected,
      displayName,
      timezone,
    });
  };

  return (
    <View style={tw`bg-surface flex-1`}>
      <View style={tw`px-6 pt-16`}>
        <Text style={tw`text-foreground font-serif-bold mb-2 text-3xl`}>Default currency</Text>
        <Text style={tw`text-subtitle mb-4 text-base`}>
          Used for tracking expenses. You can use other currencies per expense.
        </Text>
      </View>

      <LegendList
        contentContainerStyle={tw`px-6 pb-4`}
        data={CURRENCIES}
        estimatedItemSize={72}
        keyExtractor={(item) => item.code}
        maintainVisibleContentPosition={false}
        renderItem={({ item }) => (
          <Pressable
            style={tw`border-divider flex-row items-center border-b py-4`}
            onPress={() => setSelected(item.code)}
          >
            <View
              style={tw`mr-4 h-6 w-6 items-center justify-center rounded-full border-2 ${
                selected === item.code ? 'border-primary' : 'border-divider'
              }`}
            >
              {selected === item.code && <View style={tw`bg-primary h-3 w-3 rounded-full`} />}
            </View>
            <Text style={tw`text-foreground w-12 text-lg font-medium`}>{item.symbol}</Text>
            <View style={tw`flex-1`}>
              <Text style={tw`text-foreground text-base`}>{item.name}</Text>
              <Text style={tw`text-subtitle text-sm`}>{item.code}</Text>
            </View>
          </Pressable>
        )}
      />

      <View style={tw`px-6 pb-8`}>
        <Pressable style={tw`bg-primary rounded-xl py-4`} onPress={handleContinue}>
          <Text style={tw`text-center text-lg font-semibold text-white`}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}
