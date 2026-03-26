import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { CreateSpaceSettingsScreen, SpaceDetailScreen } from '@/screens/Settings';
import { SpacesScreen } from '@/screens/Spaces';
import { NewTaskScreen, TaskDetailScreen, TasksScreen } from '@/screens/Tasks';

export type SpacesStackParamList = {
  Spaces: undefined;
  SpaceDetail: { spaceId: string };
  CreateSpace: undefined;
  Tasks: undefined;
  NewTask: undefined;
  TaskDetail: { taskId: string };
};

const Stack = createNativeStackNavigator<SpacesStackParamList>();

export function SpacesNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen component={SpacesScreen} name="Spaces" />
      <Stack.Screen component={SpaceDetailScreen} name="SpaceDetail" />
      <Stack.Screen component={CreateSpaceSettingsScreen} name="CreateSpace" />
      <Stack.Screen component={TasksScreen} name="Tasks" />
      <Stack.Screen component={NewTaskScreen} name="NewTask" />
      <Stack.Screen component={TaskDetailScreen} name="TaskDetail" />
    </Stack.Navigator>
  );
}
