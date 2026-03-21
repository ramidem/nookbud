# Component & UI Conventions

## Component Architecture (Atomic Design)

```
components/
  atoms/           # Button, Typography, TextInput, Divider, TagButton, DatePicker, Modal
  molecules/       # ScreenContainer, ScreenHeader, BackButton, StepHeader, StickyFooter
  organisms/       # Complex feature components
```

- **Screen and tab components** (e.g., tabs, pager view) go in the screen's folder as `.tab.tsx` files (e.g., `ProfileSetupScreen/basic-identity.tab.tsx`)
- **Reusable components** go in `src/components/atoms|molecules|organisms/` with proper barrel exports
- **NO inline component definitions in screen files** — extract to separate files within the screen folder (as `.tab.tsx` for screen-specific tabs/steps) or into `src/components/`
- **NO inline hook definitions in screen/component files** — place in `src/hooks/` with proper naming (`useXxx.hook.ts`) or co-locate within the component folder

### Screen Folder Structure

Screen folders (`src/screens/ScreenName/`) should **ONLY** contain:

| File Type     | Pattern                  | Example                  |
| ------------- | ------------------------ | ------------------------ |
| Main screen   | `screen-name.screen.tsx` | `home.screen.tsx`        |
| Tabs/Steps    | `kebab-case.tab.tsx`     | `basic-identity.tab.tsx` |
| Barrel export | `index.ts`               | `index.ts`               |

**NOT allowed in screen folders:**

- **NO `.component.tsx` files** — move to `src/components/atoms|molecules|organisms/`
- **NO `.hook.ts` files** — move to `src/hooks/`

If a screen needs a component (e.g., a header), either:

1. Make it a reusable molecule in `src/components/molecules/`

### Component File Pattern

```
ComponentName/
  component-name.component.tsx   # Component implementation
  index.ts                       # Barrel export: export * from './component-name.component'
```

### Component Implementation Pattern

```typescript
type Props = DefaultComponentProps & {
  title?: string;
  isLoading?: boolean;
};

export function ComponentName(props: Props) {
  const { isLoading = false, title = 'Default', ...rest } = props;

  return (/* JSX */);
}
```

---

## Screen Props Convention

**Every screen component MUST accept its navigation props** using the typed screen props from the route config. Never use the `useNavigation()` hook inside screens — always destructure `navigation` (and `route` if needed) from props.

- **Public screens**: `PublicScreenProps<Screens.XXX>`
- **Private screens**: `PrivateScreenProps<Screens.XXX>`

```typescript
import { PrivateScreenProps, Screens } from '@/routes';

// Screen that uses navigation
export function SettingsScreen(props: PrivateScreenProps<Screens.SETTINGS>) {
  const { navigation } = props;

  navigation.navigate(Screens.SAFETY_PRIVACY);
}

// Screen that doesn't use navigation yet — prefix with underscore
export function EditProfileScreen(_props: PrivateScreenProps<Screens.EDIT_PROFILE>) {
  return (/* JSX */);
}
```

- **NO `useNavigation()` hook in screens** — always use `props.navigation`
- `useNavigation()` is acceptable inside **reusable components** (atoms/molecules/organisms) that are not screens
- Every screen registered in a navigator **must** have a corresponding entry in the stack params type (`PrivateStackParams`, `PublicStackParams`, etc.)

---

## ScreenContainer Convention

**Every screen component MUST use `ScreenContainer` as its root wrapper.** It lives at `@/components` (molecules/ScreenContainer).

```typescript
import { ScreenContainer } from '@/components';

// Basic screen (default: scroll enabled via KeyboardAwareScrollView)
export function MyScreen(props: Props) {
  return (
    <ScreenContainer>
      {/* content */}
    </ScreenContainer>
  );
}

// Screen with custom safe area edges (e.g., exclude bottom for sticky footer)
<ScreenContainer excludedEdges={['bottom']}>

// Screen with overlay backgrounds (e.g., RadialGradientBackground)
<ScreenContainer excludedEdges={['top', 'bottom']}>
  <RadialGradientBackground variant="welcome" />
```

**Prefer keeping scroll enabled** (the default). The `contentContainerStyle` uses `flexGrow: 1`, so `flex-1 justify-center` works for centering content within the scroll view. Only use `hasScroll={false}` when scroll genuinely breaks the layout (e.g., nested scrollable lists).

Key props: `hasScroll`, `excludedEdges`, `useSafeAreaView`, `containerStyle`, `style`.

---

## Pressable / Touchable

- **Always use `Pressable` or `TouchableOpacity`** for tap interactions — never use `onPress` on `Typography` or `onTouchEnd`/`onTouchStart` on `View`
- `Typography` is for displaying text only; wrap it in `Pressable` or `TouchableOpacity` when it needs to be tappable
- `View` is for layout only; wrap it in `Pressable` or `TouchableOpacity` when it needs to respond to touch

```typescript
// Correct — Pressable wraps tappable text
<Pressable onPress={handleResend}>
  <Typography style={tw`text-primary-400 text-sm font-medium`}>Resend code</Typography>
</Pressable>

// Wrong — onPress directly on Typography
<Typography onPress={handleResend}>Resend code</Typography>
```

---

## Modals

- **Always use the custom `Modal` component** from `@/components` (`atoms/Modal/modal.component.tsx`) — never use `react-native-modal` or React Native's built-in `Modal` directly
- The custom `Modal` handles platform differences internally: `react-native-modal` on iOS, React Native's built-in `Modal` on Android
- Key props: `isVisible`, `onBackdropPress`, `onBackButtonPress`, `containerStyle`, `style`
- `**pointerEvents="box-none"` on full-screen `View` wrappers**: When using `<View style={tw`flex-1`}>` inside a Modal, add `pointerEvents="box-none"` so that taps on empty areas propagate through to the Modal's backdrop and trigger `onBackdropPress`. Without this, the `View` intercepts all touches and the backdrop dismiss stops working.

```typescript
import { Modal, useModal } from '@/components';

const { hideModal, isVisible, showModal } = useModal();

<Modal isVisible={isVisible} onBackButtonPress={hideModal} onBackdropPress={hideModal}>
  <View pointerEvents="box-none" style={tw`flex-1 justify-center`}>
    {/* modal content */}
  </View>
</Modal>
```

---

## Bottom Sheets

- **Always use the custom `BottomSheet` component** from `@/components` (`atoms/BottomSheet/bottom-sheet.component.tsx`) — never use `BottomSheetModal` from `@gorhom/bottom-sheet` directly
- The custom `BottomSheet` provides a consistent backdrop, styling, keyboard behavior, and dismiss handling
- Use the `useBottomSheet` hook for managing sheet state (`expandSheet`, `closeSheet`, `sheetRef`)
- Use `bg-sheet` as the background style for all bottom sheets and modals
- Key props: `sheetRef`, `snapPoints`, `backgroundStyle`, `enableDynamicSizing`, `enablePanDownToClose`, `contentContainerStyle`

```typescript
import { BottomSheet, useBottomSheet } from '@/components/atoms/BottomSheet';

const { closeSheet, expandSheet, sheetRef } = useBottomSheet();

<BottomSheet
  backgroundStyle={tw`bg-sheet`}
  sheetRef={sheetRef}
  snapPoints={['50%']}
>
  {/* sheet content */}
</BottomSheet>
```

- **NO `BottomSheetModal` from `@gorhom/bottom-sheet` directly** — always use the custom `BottomSheet` atom
- For text inputs inside bottom sheets, use `BottomSheetTextInput` from `@/components/atoms/TextInput`
- For flat lists inside bottom sheets, use `BottomSheetFlatList` from `@gorhom/bottom-sheet` (this is acceptable since it's a specialized scrollable component)

---

## Alerts

- **Always use the custom `Alert` service** from `@/components` — never use React Native's built-in `Alert.alert()`
- Imperative API via a static class: `Alert.error(...)`, `Alert.success(...)`, `Alert.warning(...)`, `Alert.info(...)`
- Renders a branded modal dialog with variant-based icon and color
- Supports custom action buttons; defaults to a single "Ok" button
- Use descriptive, multi-word titles (e.g., "Verification Failed") — never single-word titles like "Error"

```typescript
import { Alert } from '@/components';

Alert.error({
  message: 'Invalid or expired code. Please try again.',
  title: 'Verification Failed',
});

Alert.success({ title: 'Profile Updated' });

Alert.warning({
  actions: [
    { label: 'Cancel', variant: 'cancel' },
    { label: 'Delete', onPress: handleDelete },
  ],
  message: 'This action cannot be undone.',
  title: 'Delete Account',
});
```

- **NO `Alert` from `react-native`** — always use the custom `Alert` from `@/components`

---

## Toasts

- **Use the `Toast` service** from `@/components` for lightweight, auto-dismissing notifications
- Imperative API: `Toast.success(message)`, `Toast.error(message)`, `Toast.warning(message)`, `Toast.info(message)`
- Auto-dismisses after 3 seconds (configurable via `duration` option)
- Tap to dismiss early, queue-based — shows one toast at a time

```typescript
import { Toast } from '@/components';

Toast.success('Profile saved');
Toast.error('Something went wrong');
Toast.success('Copied to clipboard', { duration: 2000 });
```

- Use **Alert** for errors that need user acknowledgment (with an action button)
- Use **Toast** for brief, informational feedback that doesn't require interaction

---

## Text Inputs

- `**TextInput` does NOT have a `label` prop** — always wrap it with `InputLayout` from `@/components` to add a label
- `InputLayout` handles label, required indicator, error, and subtitle rendering

```typescript
import { InputLayout, TextInput } from '@/components';

<InputLayout label="Email">
  <TextInput placeholder="you@example.com" value={email} onChangeText={setEmail} />
</InputLayout>
```

---

## Keyboard Handling

- **Use `react-native-keyboard-controller`** for keyboard avoidance in screens with custom layouts (e.g., chat screens with input at the bottom)
- `KeyboardProvider` is configured at the app root
- Import `KeyboardAvoidingView` from `react-native-keyboard-controller` — **NOT** from `react-native`

```typescript
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

<KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={0} style={tw`flex-1`}>
  {/* content + input */}
</KeyboardAvoidingView>
```

- For forms/scroll views, prefer `KeyboardAwareScrollView` from `@/components/atoms` (used by `ScreenContainer` by default)
- Use `react-native-keyboard-controller`'s `KeyboardAvoidingView` when you need manual control (e.g., chat screens with `hasScroll={false}`)

---

## Forms

- Always use `react-hook-form` for form state management — never use raw `useState` for form fields
- Always define a Zod schema for form validation and use `@hookform/resolvers/zod` to connect it
- Infer the form type from the schema: `type FormData = z.infer<typeof schema>`
- Use `useForm<FormData>()` with `zodResolver(schema)` for validation
- Use `Controller` from `react-hook-form` to wrap custom inputs (e.g., `TextInput`)
- For screens/tabs with form inputs that require keyboard interaction, always use `KeyboardAwareScrollView` from `@/components/atoms` instead of plain `ScrollView` — it handles keyboard avoidance automatically
