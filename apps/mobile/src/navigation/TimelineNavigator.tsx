import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TimelineScreen } from '@/screens/Timeline';
import { EntryDetailScreen } from '@/screens/EntryDetail';
import {
  AddEntryPickerScreen,
  AddExpenseScreen,
  AddEventScreen,
  AddAgreementScreen,
  AddCommunicationScreen,
  AddUploadScreen,
} from '@/screens/AddEntry';

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
      <Stack.Screen name="EntryDetail" component={EntryDetailScreen} />
      <Stack.Screen name="AddEntryPicker" component={AddEntryPickerScreen} />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
      <Stack.Screen name="AddEvent" component={AddEventScreen} />
      <Stack.Screen name="AddAgreement" component={AddAgreementScreen} />
      <Stack.Screen name="AddCommunication" component={AddCommunicationScreen} />
      <Stack.Screen name="AddUpload" component={AddUploadScreen} />
    </Stack.Navigator>
  );
}
