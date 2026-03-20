import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TimelineScreen } from '@/screens/Timeline';

export type TimelineStackParamList = {
  Timeline: undefined;
  EntryDetail: { entryId: string };
  AddEntryPicker: undefined;
  AddExpense: undefined;
  AddEvent: undefined;
  AddAgreement: undefined;
  AddCommunication: undefined;
  AddUpload: undefined;
};

const Stack = createNativeStackNavigator<TimelineStackParamList>();

export function TimelineNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Timeline" component={TimelineScreen} />
      {/* Other screens will be added in subsequent stories */}
    </Stack.Navigator>
  );
}
