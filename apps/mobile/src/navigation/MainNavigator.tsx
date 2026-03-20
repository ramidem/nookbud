import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { useTw } from '@/hooks/useTw';
import { TimelineNavigator } from './TimelineNavigator';
import { SettingsNavigator } from './SettingsNavigator';
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
    <View style={tw`flex-1 bg-white items-center justify-center`}>
      <Text style={tw`text-6xl mb-4`}>📅</Text>
      <Text style={tw`text-xl font-medium text-gray-900`}>Calendar</Text>
      <Text style={tw`text-gray-600 mt-2`}>Coming in Phase 2</Text>
    </View>
  );
}

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  const tw = useTw();
  return (
    <Text style={tw`text-2xl ${focused ? 'opacity-100' : 'opacity-50'}`}>
      {icon}
    </Text>
  );
}

export function MainNavigator() {
  const tw = useTw();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: tw`bg-white border-t border-gray-100 pt-2`,
        tabBarLabelStyle: tw`text-xs mt-1`,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tab.Screen
        name="TimelineTab"
        component={TimelineNavigator}
        options={{
          tabBarLabel: 'Timeline',
          tabBarIcon: ({ focused }) => <TabIcon icon="📋" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="CalendarTab"
        component={CalendarPlaceholder}
        options={{
          tabBarLabel: 'Calendar',
          tabBarIcon: ({ focused }) => <TabIcon icon="📅" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ExportTab"
        component={ExportScreen}
        options={{
          tabBarLabel: 'Export',
          tabBarIcon: ({ focused }) => <TabIcon icon="📤" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsNavigator}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon icon="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
