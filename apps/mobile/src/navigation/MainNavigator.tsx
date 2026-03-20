import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Text } from 'react-native';

import { SettingsNavigator } from './SettingsNavigator';
import { TimelineNavigator } from './TimelineNavigator';

import { useTw } from '@/hooks/useTw';
import { CalendarScreen } from '@/screens/Calendar';
import { ExportScreen } from '@/screens/Export';

export type MainTabParamList = {
  TimelineTab: undefined;
  CalendarTab: undefined;
  ExportTab: undefined;
  SettingsTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

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
        component={CalendarScreen}
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
