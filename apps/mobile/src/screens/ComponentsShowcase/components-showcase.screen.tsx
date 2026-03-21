import React, { useState } from 'react';
import { Image, ScrollView, View } from 'react-native';

import {
  Alert,
  BottomSheet,
  Button,
  DateModalInput,
  DateTextInput,
  Divider,
  InputLayout,
  Modal,
  OutlinedButton,
  ScreenContainer,
  ScreenHeader,
  SelectDropdown,
  Skeleton,
  TextInput,
  TextInputArea,
  Toast,
  Typography,
  useBottomSheet,
  useModal,
} from '@/components';
import { requestPushNotification, useToggleDarkMode } from '@/hooks';
import { tw } from '@/tailwind';

const DROPDOWN_OPTIONS = [
  { id: '1', label: 'React Native' },
  { id: '2', label: 'Flutter' },
  { id: '3', label: 'SwiftUI' },
  { id: '4', label: 'Jetpack Compose' },
];

function SectionTitle({ title }: { title: string }) {
  return (
    <Typography style={tw`font-serif-semibold mb-2 mt-6 text-lg`} variant="heading">
      {title}
    </Typography>
  );
}

function SizeLabel({ label }: { label: string }) {
  return (
    <Typography style={tw`text-subtitle mb-1 text-xs uppercase tracking-wide`}>{label}</Typography>
  );
}

export function ComponentsShowcaseScreen() {
  const [textSm, setTextSm] = useState('');
  const [textMd, setTextMd] = useState('');
  const [textLg, setTextLg] = useState('');
  const [textArea, setTextArea] = useState('');
  const [dateModalValue, setDateModalValue] = useState<Date | undefined>();
  const [dateTextValue, setDateTextValue] = useState<Date | undefined>();
  const [selectedDropdown, setSelectedDropdown] = useState<string | undefined>();
  const { hideModal, isVisible: isModalVisible, showModal } = useModal();
  const { closeSheet, expandSheet, sheetRef } = useBottomSheet();
  const { colorScheme, toggleColorScheme } = useToggleDarkMode();
  const isDark = colorScheme === 'dark';

  return (
    <ScreenContainer>
      <ScreenHeader hasBackButton title="Components Showcase" />
      <ScrollView contentContainerStyle={tw`px-4 pb-8`} showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <View style={tw`mt-4 items-center`}>
          <Image source={require('@/assets/images/logo.png')} style={{ height: 80, width: 80 }} />
        </View>

        {/* Theme */}
        <SectionTitle title="Theme" />
        <View style={tw`gap-3`}>
          <Button
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            onPress={toggleColorScheme}
          />
          <Button title="Request Push Notifications" onPress={() => requestPushNotification()} />
        </View>

        <Divider style={tw`mt-4`} />

        {/* Typography */}
        <SectionTitle title="Typography" />
        <View style={tw`gap-2`}>
          <Typography style={tw`font-serif-bold text-2xl`} variant="heading">
            Heading — 2xl Bold
          </Typography>
          <Typography style={tw`font-serif-semibold text-xl`} variant="heading">
            Heading — xl Semibold
          </Typography>
          <Typography style={tw`font-serif-semibold text-lg`} variant="heading">
            Heading — lg Semibold
          </Typography>
          <Typography style={tw`text-base font-bold`}>Body — base Bold</Typography>
          <Typography style={tw`text-base`}>Body — base Regular</Typography>
          <Typography style={tw`text-sm`}>Body — sm Regular</Typography>
          <Typography style={tw`text-subtitle text-sm`}>Caption — sm Subtitle</Typography>
          <Typography style={tw`text-primary text-sm font-medium`}>Label — sm Primary</Typography>
        </View>

        <Divider style={tw`mt-4`} />

        {/* Buttons — Sizes */}
        <SectionTitle title="Buttons" />

        <SizeLabel label="Sizes" />
        <View style={tw`flex-row flex-wrap items-center gap-3`}>
          <Button size="sm" title="Small" onPress={() => {}} />
          <Button size="md" title="Medium" onPress={() => {}} />
          <Button size="lg" title="Large" onPress={() => {}} />
        </View>

        <SizeLabel label="Outlined — Sizes" />
        <View style={tw`mt-2 flex-row flex-wrap items-center gap-3`}>
          <OutlinedButton size="sm" title="Small" onPress={() => {}} />
          <OutlinedButton size="md" title="Medium" onPress={() => {}} />
          <OutlinedButton size="lg" title="Large" onPress={() => {}} />
        </View>

        <SizeLabel label="States" />
        <View style={tw`mt-2 gap-3`}>
          <Button title="Default (md)" onPress={() => {}} />
          <Button isLoading title="Loading" onPress={() => {}} />
          <Button isDisabled title="Disabled" onPress={() => {}} />
          <OutlinedButton title="Outlined Default" onPress={() => {}} />
          <OutlinedButton isDisabled title="Outlined Disabled" onPress={() => {}} />
        </View>

        <Divider style={tw`mt-4`} />

        {/* Text Input — Sizes */}
        <SectionTitle title="Text Input" />
        <View style={tw`gap-4`}>
          <View>
            <SizeLabel label="Single line" />
            <InputLayout label="Small (sm — not supported, same as md)">
              <TextInput placeholder="Small input" value={textSm} onChangeText={setTextSm} />
            </InputLayout>
          </View>
          <View>
            <InputLayout isRequired label="Medium (default)">
              <TextInput placeholder="Enter value" value={textMd} onChangeText={setTextMd} />
            </InputLayout>
          </View>
          <View>
            <InputLayout label="With error">
              <TextInput placeholder="Something wrong" value={textLg} onChangeText={setTextLg} />
            </InputLayout>
          </View>
          <View>
            <SizeLabel label="Multi-line (TextInputArea)" />
            <InputLayout label="Notes">
              <TextInputArea
                placeholder="Write something longer..."
                value={textArea}
                onChangeText={setTextArea}
              />
            </InputLayout>
          </View>
        </View>

        <Divider style={tw`mt-4`} />

        {/* Select Dropdown */}
        <SectionTitle title="Select Dropdown" />
        <InputLayout label="Framework">
          <SelectDropdown
            options={DROPDOWN_OPTIONS}
            placeholder="Choose a framework"
            selectedId={selectedDropdown}
            onSelect={setSelectedDropdown}
          />
        </InputLayout>

        <Divider style={tw`mt-4`} />

        {/* Date Inputs */}
        <SectionTitle title="Date Inputs" />
        <View style={tw`gap-4`}>
          <InputLayout label="Date Modal Input">
            <DateModalInput
              maximumDate={new Date()}
              placeholder="Pick a date"
              value={dateModalValue}
              onChange={setDateModalValue}
            />
          </InputLayout>
          <InputLayout label="Date Text Input">
            <DateTextInput value={dateTextValue} onChange={setDateTextValue} />
          </InputLayout>
        </View>

        <Divider style={tw`mt-4`} />

        {/* Skeleton */}
        <SectionTitle title="Skeleton" />
        <View style={tw`gap-2`}>
          <Skeleton isLoading>
            <View style={tw`h-5 w-3/4 rounded`} />
          </Skeleton>
          <Skeleton isLoading>
            <View style={tw`h-5 w-1/2 rounded`} />
          </Skeleton>
          <Skeleton isLoading>
            <View style={tw`h-14 w-full rounded-xl`} />
          </Skeleton>
        </View>

        <Divider style={tw`mt-4`} />

        {/* Alert */}
        <SectionTitle title="Alerts" />
        <View style={tw`gap-3`}>
          <Button
            title="Error Alert"
            onPress={() =>
              Alert.error({
                message: 'Something went wrong. Please try again.',
                title: 'Request Failed',
              })
            }
          />
          <Button
            title="Success Alert"
            onPress={() =>
              Alert.success({
                title: 'Profile Updated',
              })
            }
          />
          <Button
            title="Warning Alert"
            onPress={() =>
              Alert.warning({
                actions: [
                  { label: 'Cancel', variant: 'cancel' },
                  { label: 'Delete', onPress: () => {} },
                ],
                message: 'This action cannot be undone.',
                title: 'Delete Account',
              })
            }
          />
        </View>

        <Divider style={tw`mt-4`} />

        {/* Toast */}
        <SectionTitle title="Toasts" />
        <View style={tw`gap-3`}>
          <Button size="sm" title="✅ Success" onPress={() => Toast.success('Profile saved')} />
          <Button size="sm" title="❌ Error" onPress={() => Toast.error('Something went wrong')} />
          <Button size="sm" title="ℹ️ Info" onPress={() => Toast.info('New version available')} />
          <Button
            size="sm"
            title="⚠️ Warning"
            onPress={() => Toast.warning('Check your connection')}
          />
        </View>

        <Divider style={tw`mt-4`} />

        {/* Modal */}
        <SectionTitle title="Modal" />
        <Button title="Open Modal" onPress={showModal} />
        <Modal isVisible={isModalVisible} onBackButtonPress={hideModal} onBackdropPress={hideModal}>
          <View pointerEvents="box-none" style={tw`flex-1 items-center justify-center`}>
            <View style={tw`dark:bg-dark-sheet mx-8 w-[85%] rounded-3xl bg-white p-6`}>
              <Typography style={tw`font-serif-semibold text-lg`} variant="heading">
                Modal Title
              </Typography>
              <Typography style={tw`dark:text-subtitle text-subtitle mt-2 text-sm`}>
                This is a custom modal with any content you want.
              </Typography>
              <Button style={tw`mt-4`} title="Close" onPress={hideModal} />
            </View>
          </View>
        </Modal>

        <Divider style={tw`mt-4`} />

        {/* Bottom Sheet */}
        <SectionTitle title="Bottom Sheet" />
        <Button title="Open Bottom Sheet" onPress={expandSheet} />
        <BottomSheet
          backgroundStyle={tw`dark:bg-dark-sheet bg-white`}
          sheetRef={sheetRef}
          snapPoints={['40%']}
        >
          <View style={tw`p-6`}>
            <Typography style={tw`font-serif-semibold text-lg`} variant="heading">
              Bottom Sheet
            </Typography>
            <Typography style={tw`dark:text-subtitle text-subtitle mt-2 text-sm`}>
              Swipe down or tap the backdrop to dismiss.
            </Typography>
            <Button style={tw`mt-4`} title="Close" onPress={closeSheet} />
          </View>
        </BottomSheet>
      </ScrollView>
    </ScreenContainer>
  );
}
