# Performance & Animations

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

- `**LegendList`** (`@legendapp/list`) — default choice for all lists
- `**FlashList**` (`@shopify/flash-list`) — alternative when `LegendList` doesn't fit the use case
- `**FlatList**` — last resort only

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

Use `**react-native-reanimated**` for all animations and `**react-native-gesture-handler**` for gesture interactions. Never use React Native's built-in `Animated` API or `PanResponder`.

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

Use `**@shopify/react-native-skia**` for graphics like blur effects, gradients, custom shapes, and canvas drawing. Skia provides GPU-accelerated 2D rendering.

```typescript
import { Canvas, LinearGradient, RoundedRect, Blur } from '@shopify/react-native-skia';
```

- Use Skia for: gradients, blur, shadows, custom shapes, image filters, path animations
- **NO `react-native-linear-gradient`** — use Skia's `LinearGradient` instead
- **NO `@react-native-community/blur`** — use Skia's `Blur` image filter instead

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
