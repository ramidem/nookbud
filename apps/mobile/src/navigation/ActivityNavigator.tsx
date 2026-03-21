import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { ActivityTopTabs } from './ActivityTopTabs';

import {
  AddAgreementScreen,
  AddCommunicationScreen,
  AddEntryPickerScreen,
  AddEventScreen,
  AddExpenseScreen,
  AddUploadScreen,
} from '@/screens/AddEntry';
import { EntryDetailScreen } from '@/screens/EntryDetail';

export type ActivityStackParamList = {
  ActivityTabs: undefined;
  EntryDetail: { entryId: string };
  AddEntryPicker: undefined;
  AddExpense: undefined;
  AddEvent: undefined;
  AddAgreement: undefined;
  AddCommunication: undefined;
  AddUpload: undefined;
};

const Stack = createNativeStackNavigator<ActivityStackParamList>();

export function ActivityNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen component={ActivityTopTabs} name="ActivityTabs" />
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
