import { type BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type SvgProps } from 'react-native-svg';

import { ActivityNavigator } from './ActivityNavigator';
import { CommunicationNavigator } from './CommunicationNavigator';
import { SettingsNavigator } from './SettingsNavigator';
import { SpacesNavigator } from './SpacesNavigator';

import { useTw } from '@/hooks/useTw';
import { ClipboardListIcon, GearIcon, LayersIcon, MessageCircleIcon, PlusIcon } from '@/icons';

export type MainTabParamList = {
  SpacesTab: undefined;
  ActivityTab: undefined;
  CommunicationTab: undefined;
  SettingsTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICON_SIZE = 24;
const FAB_SIZE = 56;
const FAB_ICON_SIZE = 28;
const DOT_SIZE = 4;
const FAB_OVERLAP = 20;
const TAB_BAR_MARGIN = 16;
const TAB_BAR_PADDING = 12;
const SHADOW_OFFSET = 4;
const SHADOW_OPACITY = 0.1;
const SHADOW_RADIUS = 12;
const ANDROID_ELEVATION = 8;

const TAB_ICONS: Record<string, React.FC<SvgProps>> = {
  ActivityTab: ClipboardListIcon,
  CommunicationTab: MessageCircleIcon,
  SettingsTab: GearIcon,
  SpacesTab: LayersIcon,
};

const FAB_ROTATION_DURATION = 200;
const FAB_ROTATION_ANGLE = 45;

function FloatingTabBar({ descriptors, navigation, state }: BottomTabBarProps) {
  const tw = useTw();
  const insets = useSafeAreaInsets();
  const fabRotation = useSharedValue(0);

  // Check if the Activity stack is currently on an Add* screen
  const activityRoute = state.routes.find((r) => r.name === 'ActivityTab');
  const nestedState = activityRoute?.state;
  const currentNestedRoute = nestedState?.routes[nestedState.index ?? 0];
  const isOnAddScreen = currentNestedRoute?.name?.startsWith('Add') ?? false;

  useEffect(() => {
    fabRotation.value = withTiming(isOnAddScreen ? FAB_ROTATION_ANGLE : 0, {
      duration: FAB_ROTATION_DURATION,
    });
  }, [isOnAddScreen, fabRotation]);

  const fabIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${fabRotation.value}deg` }],
  }));

  const handleFabPress = () => {
    if (isOnAddScreen) {
      navigation.navigate('ActivityTab', { screen: 'ActivityTabs' });
    } else {
      navigation.navigate('ActivityTab', { screen: 'AddEntryPicker' });
    }
  };

  const tabBarBottom = insets.bottom > 0 ? insets.bottom : TAB_BAR_MARGIN;
  const leftTabs = state.routes.slice(0, 2);
  const rightTabs = state.routes.slice(2);

  const renderTab = (route: (typeof state.routes)[number], index: number) => {
    const { options } = descriptors[route.key];
    const isFocused = state.index === state.routes.indexOf(route);
    const Icon = TAB_ICONS[route.name];

    const onPress = () => {
      const event = navigation.emit({
        canPreventDefault: true,
        target: route.key,
        type: 'tabPress',
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <Pressable
        key={route.key}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        accessibilityRole="tab"
        accessibilityState={isFocused ? { selected: true } : {}}
        style={tw`flex-1 items-center py-1`}
        onPress={onPress}
      >
        {Icon && (
          <Icon
            height={TAB_ICON_SIZE}
            style={tw`${isFocused ? 'text-primary' : 'text-subtitle'}`}
            width={TAB_ICON_SIZE}
          />
        )}
        <View
          style={tw`mt-1.5 h-[${DOT_SIZE}px] w-[${DOT_SIZE}px] rounded-full ${isFocused ? 'bg-primary' : 'bg-transparent'}`}
        />
      </Pressable>
    );
  };

  return (
    <View
      pointerEvents="box-none"
      style={[tw`absolute bottom-0 left-0 right-0 items-center`, { marginBottom: tabBarBottom }]}
    >
      {/* FAB */}
      <Pressable
        style={[
          tw`bg-primary absolute z-10 items-center justify-center rounded-full`,
          {
            elevation: ANDROID_ELEVATION,
            height: FAB_SIZE,
            shadowColor: '#000',
            shadowOffset: { height: 3, width: 0 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            top: -FAB_OVERLAP,
            width: FAB_SIZE,
          },
        ]}
        onPress={handleFabPress}
      >
        <Animated.View style={fabIconStyle}>
          <PlusIcon height={FAB_ICON_SIZE} style={tw`text-white`} width={FAB_ICON_SIZE} />
        </Animated.View>
      </Pressable>

      {/* Floating tab bar */}
      <View
        style={[
          tw`bg-surface flex-row items-center self-stretch rounded-b-3xl rounded-t-2xl`,
          {
            elevation: ANDROID_ELEVATION,
            marginHorizontal: TAB_BAR_MARGIN,
            paddingVertical: TAB_BAR_PADDING,
            shadowColor: '#000',
            shadowOffset: { height: SHADOW_OFFSET, width: 0 },
            shadowOpacity: SHADOW_OPACITY,
            shadowRadius: SHADOW_RADIUS,
          },
        ]}
      >
        {/* Left tabs */}
        {leftTabs.map(renderTab)}

        {/* Center spacer for FAB */}
        <View style={{ width: FAB_SIZE }} />

        {/* Right tabs */}
        {rightTabs.map(renderTab)}
      </View>
    </View>
  );
}

export function MainNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="ActivityTab"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tab.Screen component={SpacesNavigator} name="SpacesTab" />
      <Tab.Screen component={ActivityNavigator} name="ActivityTab" />
      <Tab.Screen component={CommunicationNavigator} name="CommunicationTab" />
      <Tab.Screen component={SettingsNavigator} name="SettingsTab" />
    </Tab.Navigator>
  );
}
