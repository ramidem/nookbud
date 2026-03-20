import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Text, View } from 'react-native';

import { SettingsNavigator } from './SettingsNavigator';
import { TimelineNavigator } from './TimelineNavigator';

import { useTw } from '@/hooks/useTw';
import { ExportScreen } from '@/screens/Export';

export type MainTabParamList = {
  TimelineTab: undefined;
  CalendarTab: undefined;
  ExportTab: undefined;
  SettingsTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder Calendar screen
function CalendarPlaceholder() {
  const tw = useTw();

  return (
    <View style={tw`flex-1 items-center justify-center bg-white`}>
      <Text style={tw`mb-4 text-6xl`}>📅</Text>
      <Text style={tw`text-xl font-medium text-gray-900`}>Calendar</Text>
      <Text style={tw`mt-2 text-gray-600`}>Coming in Phase 2</Text>
    </View>
  );
}

function TabIcon({ focused, icon }: { icon: string; focused: boolean }) {
  const tw = useTw();

  return <Text style={tw`text-2xl ${focused ? 'opacity-100' : 'opacity-50'}`}>{icon}</Text>;
}

export function MainNavigator() {
  const tw = useTw();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: tw`mt-1 text-xs`,
        tabBarStyle: tw`border-t border-gray-100 bg-white pt-2`,
      }}
    >
      <Tab.Screen
        component={TimelineNavigator}
        name="TimelineTab"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="📋" />,
          tabBarLabel: 'Timeline',
        }}
      />
      <Tab.Screen
        component={CalendarPlaceholder}
        name="CalendarTab"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="📅" />,
          tabBarLabel: 'Calendar',
        }}
      />
      <Tab.Screen
        component={ExportScreen}
        name="ExportTab"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="📤" />,
          tabBarLabel: 'Export',
        }}
      />
      <Tab.Screen
        component={SettingsNavigator}
        name="SettingsTab"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="⚙️" />,
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}
