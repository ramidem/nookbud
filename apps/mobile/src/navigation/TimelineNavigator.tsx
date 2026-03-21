import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import {
  AddEntryPickerScreen,
  AddExpenseScreen,
  AddEventScreen,
  AddAgreementScreen,
  AddCommunicationScreen,
  AddUploadScreen,
} from '@/screens/AddEntry';
import { EntryDetailScreen } from '@/screens/EntryDetail';
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
      <Stack.Screen component={TimelineScreen} name="Timeline" />
      <Stack.Screen component={EntryDetailScreen} name="EntryDetail" />
      <Stack.Screen component={AddEntryPickerScreen} name="AddEntryPicker" />
      <Stack.Screen component={AddExpenseScreen} name="AddExpense" />
      <Stack.Screen component={AddEventScreen} name="AddEvent" />
      <Stack.Screen component={AddAgreementScreen} name="AddAgreement" />
      <Stack.Screen component={AddCommunicationScreen} name="AddCommunication" />
      <Stack.Screen component={AddUploadScreen} name="AddUpload" />
    </Stack.Navigator>
  );
}
