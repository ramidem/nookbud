# Coparent

Nx monorepo for a React Native mobile app (iOS, Android, Web).

> **Source of truth** for all React Native mobile app conventions.

## Tech Stack

- **Runtime**: Node v22.22.0 (see `.nvmrc`)
- **Package Manager**: Yarn
- **Build System**: Nx v21
- **Framework**: React Native 0.83 + React 19
- **Language**: TypeScript 5.8 (strict)
- **Styling**: Tailwind CSS via `twrnc`
- **State**: Jotai, Zustand, React Query
- **Navigation**: React Navigation (native-stack, bottom-tabs, material-top-tabs)
- **Storage**: MMKV
- **Forms**: React Hook Form + Zod
- **Deployment**: Fastlane (iOS)

### Pinned Versions

**WARNING**: Versions are pinned. Do NOT upgrade packages without coordinating with the mobile team.

| Package                           | Version |
| --------------------------------- | ------- |
| react-native                      | 0.83.4  |
| @react-navigation/\*              | 7.x     |
| @tanstack/react-query             | 5.67.3  |
| zustand                           | 5.0.5   |
| jotai                             | 2.16.1  |
| react-hook-form                   | 7.56.4  |
| @hookform/resolvers               | 5.0.1   |
| twrnc                             | 4.16.0  |
| react-native-reanimated           | 4.2.1   |
| react-native-mmkv                 | 4.2.0   |
| react-native-keyboard-controller  | latest  |
| @legendapp/list                   | latest  |
| react-native-video                | 6.19.1  |
| react-native-fs                   | 2.20.0  |
| react-native-blob-util            | 0.24.7  |
| react-native-image-picker         | 8.2.1   |
| react-native-image-crop-picker    | 0.51.1  |
| react-native-document-picker      | 9.3.1   |
| react-native-share                | 12.2.6  |
| @react-native-clipboard/clipboard | 1.16.3  |
| @react-native-community/netinfo   | 12.0.1  |
| react-native-inappbrowser-reborn  | 3.7.1   |
| react-native-contacts             | 8.0.10  |
| react-native-pdf                  | 7.0.3   |

---

## Common Commands

```sh
yarn ios                  # Run iOS app
yarn android              # Run Android app
yarn serve:mobile         # Start Metro bundler
yarn lint:mobile          # Lint mobile app
yarn lint:all             # Lint all projects
yarn pod-install          # Install CocoaPods deps
yarn check-env:mobile     # Verify env vars
yarn clean                # Clean generated outputs
```

## Dev Workflow

React Native has two parts that need to run together: the **native app** (on a simulator/device) and **Metro** (the JS bundler/dev server). Metro alone does not launch a simulator.

### Starting the app

| Command | What it does |
|---------|--------------|
| `yarn ios` | Builds the native iOS app, launches the Simulator, and starts Metro. Interactive — prompts you to pick a scheme and simulator/device. |
| `yarn android` | Builds the native Android app, launches on an emulator/device, and starts Metro. Interactive — prompts you to pick a build variant and device. |
| `yarn serve:mobile` | Starts Metro only. Use this to restart the JS bundler without rebuilding native code (e.g., if you closed the terminal but the simulator still has the app installed). |

### Typical flow

1. Run **`yarn ios`** (or `yarn android`). The interactive picker will ask you to select a scheme/variant and a device.
2. The native app builds, installs on the simulator/device, and launches. Metro starts automatically.
3. Edit your TypeScript/JSX files — **hot reload** updates the app instantly.
4. If Metro crashes or you close its terminal, run **`yarn serve:mobile`** to restart it without a full native rebuild.
5. You only need to re-run `yarn ios`/`yarn android` when you change native code (add a new RN package with native modules, modify `Info.plist`, change `build.gradle`, etc.).

### When to rebuild native

- After `yarn add` of a package with native code (e.g., `react-native-maps`)
- After running `yarn pod-install` (iOS)
- After modifying files in `ios/` or `android/` directories
- After changing environment variables that are baked into the native build

### Common gotchas

- **`nx run mobile` or `nx start mobile`** only starts Metro — no simulator. Use `yarn ios` or `yarn android` instead.
- **iOS Simulator not appearing?** Make sure you have Xcode and simulators installed (`xcode-select --install`, then open Xcode > Settings > Platforms to download simulators).
- **Android emulator not listed?** Create one in Android Studio > Device Manager first, or connect a physical device with USB debugging enabled.
- **Metro port conflict?** Metro runs on port 8081 by default. Kill any existing process on that port: `lsof -ti:8081 | xargs kill -9`.

---

## Project Structure

```
apps/mobile/src/
  app/            # App root, query client
  components/     # Atoms / Molecules / Organisms
  screens/        # Screen components
  routes/         # Navigation (public/private)
  stores/         # Zustand slices, Jotai atoms, MMKV
  hooks/          # Custom hooks
  utils/          # Axios, logging, routing helpers
  icons/          # SVG icons
  assets/         # Fonts (Inter), images
  tailwind/       # Tailwind config exports
  config/         # App configuration
  types/          # Shared TypeScript types
  dimens/         # Layout dimensions
```

---

## Conventions

- **Path alias**: `@/` maps to `./src`
- **Linting**: ESLint (Airbnb TS base) + Prettier (single quotes, trailing commas, 100 char width)
- **Max constraints**: line length 125 (ESLint), print width 100 (Prettier), nesting depth 3, function params 3
- **Git hooks** (Husky): pre-commit runs `lint:all`, pre-push blocks pushes to main/staging/development

### File Naming

- Components: `component-name.component.tsx`
- Hooks: `useHookName.hook.tsx` or `useHookName.hook.ts`
- Utils: `utility-name.util.ts`
- Stores: `store-name.store.ts` or `.slice.ts`
- Screens: `screen-name.screen.tsx`
- Types: `entity.type.ts`
- Services: `service-name.service.ts`
- Tabs/Steps: `kebab-case.tab.tsx`
- Barrel exports: `index.ts`

---

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

## State Management

- **Zustand** for global client state (persistent via MMKV)
- **Jotai** for derived/computed atoms
- **React Query** (`@tanstack/react-query`) for server state
- Use Zod schemas for API response validation

### Zustand Imperative Access

Use `useStore.getState()` to read or write store values **outside of React's render cycle** — inside callbacks, event handlers, or utility functions where you don't want to trigger a re-render:

```typescript
// Read a value imperatively (no re-render subscription)
const value = useLocalStorageStore.getState().hasRequestedNotificationPermission;

// Call a setter imperatively
const setter = useLocalStorageStore.getState().setHasRequestedNotificationPermission;
setter(true);
```

- Use this pattern inside functions, event handlers, and effects where subscribing to the store is unnecessary
- **Do NOT use `getState()` in render** — use the hook form `useStore((s) => s.field)` when the component needs to re-render on changes
- **Always use selectors with Zustand hooks** — never return the whole store object. Select only the fields you need to avoid unnecessary re-renders:

```typescript
// Correct — component only re-renders when `name` changes
const name = useUserStore((s) => s.name);

// Wrong — component re-renders on ANY store change
const { name } = useUserStore();
```

---

## React Query Hooks Convention

- **Never use `useQuery()` or `useMutation()` directly in components or screens** — always create a dedicated hook
- **Queries** go in `src/hooks/queries/` — one file per query (e.g., `useGetUserProfile.hook.ts`)
- **Mutations** go in `src/hooks/mutations/` — one file per mutation (e.g., `useRequestOtp.hook.ts`)
- **Query keys** must be defined as constants in the hook file — never use inline strings
- **Be intentional with `staleTime` and `gcTime`** — set them per query based on how frequently the data changes, don't rely on global defaults

```typescript
// src/hooks/queries/useGetSomething.hook.ts
import { useQuery } from '@tanstack/react-query';

const QUERY_KEY = ['something'] as const;
const FIVE_MINUTES = 5 * 60 * 1000;

export function useGetSomething() {
  return useQuery({
    gcTime: FIVE_MINUTES,
    queryFn: fetchSomething,
    queryKey: QUERY_KEY,
    staleTime: FIVE_MINUTES,
  });
}
```

```typescript
// src/hooks/mutations/useDoSomething.hook.ts
import { useMutation } from '@tanstack/react-query';

export function useDoSomething() {
  return useMutation({
    mutationFn: doSomething,
  });
}
```

```typescript
// Usage in a screen — import the hook, never useQuery/useMutation directly
import { useGetSomething } from '@/hooks/queries/useGetSomething.hook';
import { useDoSomething } from '@/hooks/mutations/useDoSomething.hook';
```

---

## Icons

- **Source**: Download SVGs from [Lucide](https://lucide.dev) and place in `src/icons/`
- **Format**: SVGs must use `currentColor` for stroke/fill so they can be colored via Tailwind's `text-*` utilities
- **Registration**: Import in `src/icons/index.ts` and add to the barrel export
- **Usage**: Color with `style={tw`text-<color>`}`, never use the `color` prop
- **When implementing features that need icons**: Always check `src/icons/index.ts` for existing icons first. If no suitable icon exists, download the SVG from [Lucide](https://lucide.dev), place it in `src/icons/`, and register it in `src/icons/index.ts`. Never use icon libraries like `react-native-vector-icons` or inline SVG components — always use the project's SVG import pattern.

```typescript
import { SunIcon } from '@/icons';

<SunIcon height={20} style={tw`text-subtitle`} width={20} />
```

---

## Images

- **All images** (remote and local): Use React Native's built-in `Image` from `react-native`
- **NO `react-native-turbo-image`** — it causes performance issues on Android

**Always wrap remote `Image` in a parent `<View>`:**

- Parent View gets: width, height, border-radius, border, `overflow-hidden`
- Image gets: `h-full w-full`, `resizeMethod="resize"`, `resizeMode="cover"`, `cache: 'force-cache'` — no sizing, border-radius, or border on Image itself

```typescript
import { Image } from 'react-native';

// Remote image (network URL) — always wrapped in a View
<View style={tw`h-16 w-16 overflow-hidden rounded-full border-2 border-divider`}>
  <Image
    resizeMethod="resize"
    resizeMode="cover"
    source={{ cache: 'force-cache', uri: 'https://example.com/photo.jpg' }}
    style={tw`h-full w-full`}
  />
</View>

// Local image (bundled asset)
<Image source={require('@/assets/logo.png')} style={{ width: 100, height: 100 }} />
```

- **Always use `resizeMethod="resize"`** on remote images for better Android performance
- **Always use `cache: 'force-cache'`** on remote images — uses cache if available, fetches from network otherwise
- **NO `TurboImage`** or `react-native-turbo-image` — use React Native's `Image` for everything

---

## Lists

- **Use `LegendList`** from `@legendapp/list` instead of React Native's `FlatList` — it provides better performance with recycling and optimized rendering
- Drop-in replacement for `FlatList` with the same API

```typescript
import { LegendList } from '@legendapp/list';

<LegendList
  data={items}
  maintainVisibleContentPosition={false}
  estimatedItemSize={80}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <ItemRow item={item} />}
/>
```

- **NO `FlatList` from `react-native`** — always use `LegendList`
- **NO `SectionList` from `react-native`** — use `LegendList` with section support

---

## Performance Optimization

### Virtualized Lists over `.map()`

**Never use `.map()` to render lists of dynamic or unbounded data.** Use a virtualized list component instead — they recycle off-screen views, reduce memory usage, and keep scroll performance smooth.

- **`LegendList`** (`@legendapp/list`) — default choice for all lists
- **`FlashList`** (`@shopify/flash-list`) — alternative when `LegendList` doesn't fit the use case
- **`FlatList`** — last resort only

`.map()` is acceptable **only** for small, fixed-length collections (e.g., 3-5 static menu items, a handful of action buttons). If the list could grow or comes from an API, always virtualize.

```typescript
// Wrong — renders all items at once, no recycling
{items.map((item) => (
  <ItemRow key={item.id} item={item} />
))}

// Correct — virtualizes off-screen items
<LegendList
  data={items}
  estimatedItemSize={80}
  maintainVisibleContentPosition={false}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <ItemRow item={item} />}
/>
```

### Tabbed Content with PagerView

When a screen has tabs or swipable sections, **use `react-native-pager-view`** instead of conditionally rendering tab content with state. PagerView provides native swipe gestures, lazy rendering of off-screen pages, and smoother transitions.

- Combine with `@react-navigation/material-top-tabs` for a tab bar + swipe UX
- Place tab components in the screen folder as `.tab.tsx` files (e.g., `profile.tab.tsx`)

```typescript
import PagerView from 'react-native-pager-view';

<PagerView initialPage={0} style={tw`flex-1`}>
  <View key="1"><FirstTab /></View>
  <View key="2"><SecondTab /></View>
</PagerView>
```

### Animations and Gestures

Use **`react-native-reanimated`** for all animations and **`react-native-gesture-handler`** for gesture interactions. Never use React Native's built-in `Animated` API or `PanResponder`.

- Reanimated runs animations on the UI thread — no JS thread bottleneck
- Use `useSharedValue`, `useAnimatedStyle`, `withTiming`, `withSpring` for declarative animations
- Use Gesture Handler's `Gesture.Pan()`, `Gesture.Tap()`, etc. for composable gesture recognition

```typescript
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
```

- **NO `Animated` from `react-native`** — always use `react-native-reanimated`
- **NO `PanResponder`** — always use `react-native-gesture-handler`

### Graphics, Blur, and Gradients

Use **`@shopify/react-native-skia`** for graphics like blur effects, gradients, custom shapes, and canvas drawing. Skia provides GPU-accelerated 2D rendering.

```typescript
import { Canvas, LinearGradient, RoundedRect, Blur } from '@shopify/react-native-skia';
```

- Use Skia for: gradients, blur, shadows, custom shapes, image filters, path animations
- **NO `react-native-linear-gradient`** — use Skia's `LinearGradient` instead
- **NO `@react-native-community/blur`** — use Skia's `Blur` image filter instead

---

## Dark Mode

Use the `useToggleDarkMode` hook from `@/hooks` to read or toggle the color scheme. It syncs both `twrnc` and the Zustand store.

```typescript
import { useToggleDarkMode } from '@/hooks';

const { colorScheme, toggleColorScheme, setColorScheme } = useToggleDarkMode();
const isDark = colorScheme === 'dark';
```

- **Never** read `colorScheme` directly from the Zustand store when you also need to toggle — always use this hook so `twrnc` stays in sync
- Use Tailwind's `dark:` prefix for conditional styles: `` tw`bg-white dark:bg-background` ``
- **Light mode first**: Always write the light mode style as the base, then add the `dark:` variant. The default color scheme is `light`. Think in terms of light mode colors first (e.g., `text-gray-900 dark:text-foreground`, `bg-white dark:bg-surface`)

---

## Styling

- Use `twrnc` (Tailwind React Native): `` tw`bg-primary-500 px-4 py-2` ``
- Access theme colors via `colors` export from `@/tailwind`
- Platform-specific styles handled in tailwind config
- **All form inputs must use shared input styles** from `@/tailwind`:
  - `defaultInputContainerStyle` — base container style (`rounded-xl border border-[#3a4556] bg-[#2a3544] px-4 py-3.5 flex-row`). Use for `TextInput`, date pickers, dropdowns, and any custom input trigger.
  - `defaultInputTextStyle` — base text style (`flex-1 font-normal text-[#f8f9fa]`). Use for input values.
  - Never hardcode input border/padding/radius — always use these shared styles for consistency.
- **Bottom sheets and modals** must use `bg-sheet` as their background color
- **Never hardcode hex color values** — always check `tailwind.config.js` for existing color tokens first. Use semantic color names instead of raw hex codes. If no token exists for a color you need, add it to `tailwind.config.js` with a reusable, context-based name before using it.

### Semantic Color Tokens (defined in `tailwind.config.js`)

| Token           | Hex       | Usage                                     |
| --------------- | --------- | ----------------------------------------- |
| `foreground`    | `#f8f9fa` | Primary text color                        |
| `subtitle`      | `#8b92a0` | Secondary/subtitle text                   |
| `placeholder`   | `#8b92a0` | Input placeholder text                    |
| `muted`         | `#e1e4e8` | Muted/tertiary text                       |
| `disabled`      | `#6b7280` | Disabled state text                       |
| `surface`       | `#2a3544` | Elevated surfaces (cards, inputs, modals) |
| `divider`       | `#3a4556` | Borders and dividers                      |
| `sheet`         | `#1a2332` | Bottom sheet / dark background            |
| `overlay`       | `#1e2d3d` | Modal / toast backgrounds                 |
| `background`    | `#0f1419` | Darkest app background                    |
| `underlay`      | `#131a26` | Dark underlays                            |
| `error`         | `#ef4444` | Error states                              |
| `success`       | `#22c55e` | Success states                            |
| `primary-400`   | `#3ba1f5` | Primary accent (blue)                     |
| `secondary-950` | `#1a2332` | Darkest secondary                         |

```typescript
// Correct — use semantic tokens
tw`text-foreground bg-surface border-divider`;
tw`text-subtitle`;
tw`bg-overlay`;
tw`text-error`;

// Wrong — hardcoded hex
tw`border-[#3a4556] bg-[#2a3544] text-[#f8f9fa]`;
```

### Coloring SVG Icons

Use `style={tw`text-<color>`}` to color SVG icons — the `currentColor` in SVGs resolves from the `color` style property set by Tailwind's `text-*` utilities. **Do NOT use the `color` prop with `colors['...']`**.

```typescript
// Correct — use style with tw
<MyIcon style={tw`text-primary-400`} height={20} width={20} />
<ArrowLeftIcon style={tw`text-foreground`} height={20} width={20} />

// Wrong — using color prop
<MyIcon color={colors['primary-400']} height={20} width={20} />
```

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
- **`pointerEvents="box-none"` on full-screen `View` wrappers**: When using `<View style={tw`flex-1`}>` inside a Modal, add `pointerEvents="box-none"` so that taps on empty areas propagate through to the Modal's backdrop and trigger `onBackdropPress`. Without this, the `View` intercepts all touches and the backdrop dismiss stops working.

```typescript
import { Modal, useModal } from '@/components';

// Using the useModal hook
const { hideModal, isVisible, showModal } = useModal();

<Modal isVisible={isVisible} onBackButtonPress={hideModal} onBackdropPress={hideModal}>
  {/* box-none lets backdrop taps pass through */}
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

// Error alert with descriptive title
Alert.error({
  message: 'Invalid or expired code. Please try again.',
  title: 'Verification Failed',
});

// Success alert
Alert.success({ title: 'Profile Updated' });

// With custom actions
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
- Renders at the bottom of the screen with slide-in/out animation
- Auto-dismisses after 3 seconds (configurable via `duration` option)
- Tap to dismiss early
- Queue-based — shows one toast at a time

```typescript
import { Toast } from '@/components';

// Simple usage — just pass a message string
Toast.success('Profile saved');
Toast.error('Something went wrong');
Toast.warning('Check your connection');
Toast.info('New version available');

// Custom duration (ms)
Toast.success('Copied to clipboard', { duration: 2000 });
```

- Use **Alert** for errors that need user acknowledgment (with an action button)
- Use **Toast** for brief, informational feedback that doesn't require interaction

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

## Text Inputs

- **`TextInput` does NOT have a `label` prop** — always wrap it with `InputLayout` from `@/components` to add a label
- `InputLayout` handles label, required indicator, error, and subtitle rendering

```typescript
import { InputLayout, TextInput } from '@/components';

<InputLayout label="Email">
  <TextInput placeholder="you@example.com" value={email} onChangeText={setEmail} />
</InputLayout>
```

---

## Forms

- Always use `react-hook-form` for form state management — never use raw `useState` for form fields
- Always define a Zod schema for form validation and use `@hookform/resolvers/zod` to connect it
- Infer the form type from the schema: `type FormData = z.infer<typeof schema>`
- Use `useForm<FormData>()` with `zodResolver(schema)` for validation
- Use `Controller` from `react-hook-form` to wrap custom inputs (e.g., `TextInput`)
- For screens/tabs with form inputs that require keyboard interaction, always use `KeyboardAwareScrollView` from `@/components/atoms` instead of plain `ScrollView` — it handles keyboard avoidance automatically

---

## Reanimated & Gesture Handler Best Practices

**Versions**: `react-native-reanimated` 4.3.0-rc.0, `react-native-gesture-handler` 2.29.1

### Worklet Rules

- **Every function used inside a gesture callback or `useAnimatedStyle` must be a worklet.** Either inline it or add the `'worklet';` directive as the first statement.
- **Never access React state, props, or refs inside worklets** — worklets run on the UI thread where JS closures are serialized snapshots. Use `useSharedValue()` to bridge data between JS and UI threads.
- **Use `runOnJS()` to call JS-side functions from worklets** — any state setter, navigation call, or callback that touches React must be wrapped.
- **Never call `runOnJS()` outside a worklet** — it's only needed on the UI thread. Calling it from JS is a no-op at best, a crash at worst.

```typescript
// Correct — worklet updates shared values, runOnJS for JS callbacks
const pan = Gesture.Pan()
  .onUpdate((event) => {
    'worklet';
    translateX.value = event.translationX;
  })
  .onEnd(() => {
    'worklet';
    runOnJS(onDismiss)();
  });

// Wrong — accessing setState inside worklet
const pan = Gesture.Pan().onEnd(() => {
  'worklet';
  setVisible(false); // CRASH: setVisible is not available on UI thread
});
```

### Gesture API (Reanimated 3+/4)

- **Use `Gesture.*` API** (`Gesture.Pan()`, `Gesture.Tap()`, `Gesture.Pinch()`) with `GestureDetector` — never use the legacy `useAnimatedGestureHandler` or `PanGestureHandler`/`TapGestureHandler` components (deprecated).
- **Compose gestures** with `Gesture.Simultaneous()`, `Gesture.Exclusive()`, or `Gesture.Race()` — do not nest multiple `GestureDetector` components.
- **Use `.manualActivation(true)` + `stateManager.activate()/fail()`** when a gesture should only activate conditionally (e.g., pan only when zoomed in).

```typescript
// Correct — composed gestures
const composed = Gesture.Simultaneous(pinchGesture, panGesture);
<GestureDetector gesture={composed}>
  <Animated.View />
</GestureDetector>

// Wrong — nested detectors (causes conflicts)
<GestureDetector gesture={pinchGesture}>
  <GestureDetector gesture={panGesture}>
    <Animated.View />
  </GestureDetector>
</GestureDetector>
```

### Shared Values & Animated Styles

- **Use `useSharedValue()` for all animation state** — never use `useState` for values that drive animations (causes re-renders + frame drops).
- **Use `useAnimatedStyle()` for dynamic styles** — it runs on the UI thread and avoids bridge overhead.
- **Use `withTiming()` for predictable transitions, `withSpring()` for natural/physical motion** — prefer spring for gestures (snap-back, swipe) and timing for UI state changes (fade, slide).
- **Always specify `Extrapolation.CLAMP`** in `interpolate()` when the output should not exceed bounds (e.g., opacity 0-1, scale limits).

```typescript
// Correct — clamped interpolation for opacity
const backdropStyle = useAnimatedStyle(() => ({
  opacity: interpolate(translateY.value, [0, 300], [1, 0], Extrapolation.CLAMP),
}));

// Risky — unclamped interpolation can produce negative opacity or values > 1
const backdropStyle = useAnimatedStyle(() => ({
  opacity: interpolate(translateY.value, [0, 300], [1, 0]),
}));
```

### Layout Animations (entering/exiting)

- **Use layout animation presets** (`FadeIn`, `FadeInDown`, `SlideInUp`, etc.) on `Animated.View` for mount/unmount transitions — these are declarative and UI-thread safe.
- **Chain `.duration()` and `.delay()`** for sequencing — do not use `setTimeout` to stagger animations.
- **Wrap conditionally rendered content in `Animated.View`** to get exit animations — React Native's `View` does not support `exiting`.

```typescript
// Correct — staggered entrance with delay chaining
<Animated.View entering={FadeInDown.duration(400).delay(0)}>
  <Title />
</Animated.View>
<Animated.View entering={FadeInDown.duration(400).delay(100)}>
  <Subtitle />
</Animated.View>

// Wrong — setTimeout for staggering (janky, JS-thread bound)
useEffect(() => {
  setTimeout(() => setShowTitle(true), 0);
  setTimeout(() => setShowSubtitle(true), 100);
}, []);
```

### Scroll Handlers

- **Use `useAnimatedScrollHandler()`** for scroll-driven animations (parallax, collapsing headers) — never use `onScroll` with `Animated.event` (deprecated v1 API).
- **Pair with `Animated.ScrollView`** from `react-native-reanimated`, not from `react-native`.

### Common Pitfalls to Avoid

| Pitfall                                | Why it breaks                                                | Fix                                         |
| -------------------------------------- | ------------------------------------------------------------ | ------------------------------------------- |
| `useState` for animation values        | Causes re-renders on every frame                             | Use `useSharedValue`                        |
| Accessing `.value` in render           | Reading shared values in render doesn't subscribe to changes | Use `useAnimatedStyle` or `useDerivedValue` |
| Calling navigation/setState in worklet | JS functions don't exist on UI thread                        | Wrap with `runOnJS()`                       |
| `useAnimatedGestureHandler`            | Deprecated in Reanimated 3, removed in 4                     | Use `Gesture.*` API                         |
| `PanGestureHandler` component          | Legacy API, less composable                                  | Use `Gesture.Pan()` + `GestureDetector`     |
| Nesting `GestureDetector`              | Gesture conflicts and dropped touches                        | Use `Gesture.Simultaneous/Exclusive/Race`   |
| `Animated.event` for scroll            | Deprecated v1 API                                            | Use `useAnimatedScrollHandler`              |
| Missing `'worklet'` directive          | Function runs on JS thread causing frame drops               | Add `'worklet';` as first statement         |
| `interpolate` without `CLAMP`          | Values can exceed intended range                             | Add `Extrapolation.CLAMP`                   |

### Android-Specific

- **Wrap modal content with `GestureHandlerRootView`** on Android when using gestures inside modals — Android requires a root view per gesture tree. Use `Platform.OS === 'android'` to conditionally wrap.
- **Reanimated feature flags** are set in `package.json` under `reactNativeReanimated`:
  - `DISABLE_COMMIT_PAUSING_MECHANISM: true`
  - `USE_COMMIT_HOOK_ONLY_FOR_REACT_COMMITS: true`
  - `ANDROID_SYNCHRONOUSLY_UPDATE_UI_PROPS: true`

### Babel Plugin

- The worklet transform is handled by `react-native-worklets/plugin` in `babel.config.json` — do NOT add `react-native-reanimated/plugin` separately (they conflict).

---

## Build Verification

**Do NOT run `./build.sh` for mobile-only changes** — it runs typecheck, lint, build, and tests across all projects which is slow and unnecessary.

Instead, run only the ESLint check for mobile:

```bash
npx nx run mobile:lint
```

This covers both ESLint rules and Prettier formatting.

**When creating new components or screens**, review the code for hardcoded hex color values (e.g., `#f8f9fa`, `#2a3544`). Replace them with semantic color tokens from `tailwind.config.js` (e.g., `text-foreground`, `bg-surface`). See the [Semantic Color Tokens](#semantic-color-tokens-defined-in-tailwindconfigjs) table for available tokens. If no token exists, add one to `tailwind.config.js` before using it.
