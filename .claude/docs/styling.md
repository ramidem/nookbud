# Typography & Styling

## Typography

The app uses a **dual-font system**: **EB Garamond** (serif) for headings and **Inter** (sans) for everything else.

### Font Families

| Tailwind Class        | Font               | Usage                           |
| --------------------- | ------------------- | ------------------------------- |
| `font-sans`           | Inter Regular       | Default body text               |
| `font-medium`         | Inter Medium        | Labels, button text             |
| `font-semibold`       | Inter SemiBold      | Emphasized body, button text    |
| `font-bold`           | Inter Bold          | Bold body text, data values     |
| `font-serif`          | EB Garamond Regular | Heading base                    |
| `font-serif-medium`   | EB Garamond Medium  | Nav bar titles (ScreenHeader)   |
| `font-serif-semibold` | EB Garamond SemiBold | Nav bar titles, content titles |
| `font-serif-bold`     | EB Garamond Bold    | Page titles, section headers    |

### Heading Hierarchy

| Element                  | Style                                    | Example                        |
| ------------------------ | ---------------------------------------- | ------------------------------ |
| Page title (onboarding)  | `font-serif-bold text-3xl`               | "What's your name?"            |
| Tab/section header       | `font-serif-bold text-2xl`               | "Settings", "Timeline"         |
| Nav bar title            | `font-serif-semibold text-lg`            | "Add Expense", "Filters"       |
| ScreenHeader title       | `font-serif-medium text-xl` (via component) | Reusable header component   |
| Content title            | `font-serif-semibold text-xl`            | Entry detail content headings  |

### What Stays as Inter (Sans)

- Body text, descriptions, subtitles
- Labels (`text-sm font-medium`)
- Button text (`font-semibold text-white`)
- Badges, chips, tags
- Input text and placeholders
- List item titles (EntryCard, calendar events)
- Numeric data displays (amounts, counts)
- Captions, timestamps

```typescript
// Correct — serif for headings
<Text style={tw`font-serif-bold text-2xl text-foreground`}>Settings</Text>
<Text style={tw`font-serif-semibold text-lg text-foreground`}>Add Event</Text>

// Correct — sans for body, labels, buttons
<Text style={tw`text-subtitle text-sm font-medium`}>Amount</Text>
<Text style={tw`text-foreground text-base`}>Body text here</Text>
<Text style={tw`text-center text-lg font-semibold text-white`}>Continue</Text>

// Wrong — sans for headings
<Text style={tw`text-2xl font-bold text-foreground`}>Settings</Text>

// Wrong — serif for body or buttons
<Text style={tw`font-serif text-base`}>Body text</Text>
<Text style={tw`font-serif-semibold text-white`}>Submit</Text>
```

### Typography Component

Use the `Typography` component from `@/components` for body text. It defaults to `font-sans` (Inter) with `variant="body"`, and `font-serif` (EB Garamond) with `variant="heading"`.

```typescript
import { Typography } from '@/components';

<Typography>Body text in Inter</Typography>
<Typography variant="heading" style={tw`font-serif-bold text-2xl`}>Heading in Garamond</Typography>
```

---

## Styling

- Use `twrnc` (Tailwind React Native): `tw`bg-primary-500 px-4 py-2``
- Access theme colors via `colors` export from `@/tailwind`
- Platform-specific styles handled in tailwind config
- **All form inputs must use shared input styles** from `@/tailwind`:
  - `defaultInputContainerStyle` — base container style (`rounded-xl border border-[#3a4556] bg-[#2a3544] px-4 py-3.5 flex-row`). Use for `TextInput`, date pickers, dropdowns, and any custom input trigger.
  - `defaultInputTextStyle` — base text style (`flex-1 font-normal text-[#f8f9fa]`). Use for input values.
  - Never hardcode input border/padding/radius — always use these shared styles for consistency.
- **Bottom sheets and modals** must use `bg-sheet` as their background color
- **Never hardcode hex color values** — always check `tailwind.config.js` for existing color tokens first. Use semantic color names instead of raw hex codes. If no token exists for a color you need, add it to `tailwind.config.js` with a reusable, context-based name before using it.
- **Never use Tailwind's default color palette** (`gray-*`, `blue-*`, `red-*`, `green-*`, `purple-*`, `slate-*`, etc.) — always use the project's semantic tokens or `neutral-*` scale instead. The default palette is a cold, generic look that clashes with the warm brand palette.

### Semantic Color Tokens (defined in `tailwind.config.js`)

#### Brand Colors

| Token           | Hex       | Usage                                     |
| --------------- | --------- | ----------------------------------------- |
| `primary`       | `#6F8F7B` | Sage Green — trust / structure            |
| `accent`        | `#C97C5D` | Muted Terracotta — human / highlight      |
| `accent-soft`   | `#D8A7A0` | Dusty Rose — empathy / subtle UI          |
| `secondary`     | `#C8BFB6` | Warm Taupe — support / UI depth           |

#### Semantic Colors (Light Mode)

| Token           | Hex       | Usage                                     |
| --------------- | --------- | ----------------------------------------- |
| `background`    | `#F7F3EE` | Warm off-white app background             |
| `foreground`    | `#2F2F2F` | Primary text color                        |
| `surface`       | `#ffffff` | Cards, panels, inputs                     |
| `divider`       | `#C8BFB6` | Borders and dividers                      |
| `subtitle`      | `#6E6A66` | Secondary/subtitle text                   |
| `placeholder`   | `#B0A99F` | Input placeholder text                    |
| `muted`         | `#C8BFB6` | Muted/tertiary text                       |
| `disabled`      | `#C8BFB6` | Disabled state                            |
| `overlay`       | `#2F2F2F` | Modal/toast backdrop                      |
| `sheet`         | `#ffffff` | Bottom sheet background                   |
| `underlay`      | `#F7F3EE` | Pressable underlay                        |

#### Feedback Colors

| Token           | Hex       | Usage                                     |
| --------------- | --------- | ----------------------------------------- |
| `error`         | `#B76E6E` | Dispute / error states                    |
| `success`       | `#7FAF8E` | Acknowledged / completed                  |
| `warning`       | `#D9B86C` | Pending states                            |


#### Neutral Scale (for subtle backgrounds, tinted containers)

| Token           | Hex       | Usage                                     |
| --------------- | --------- | ----------------------------------------- |
| `neutral-50`    | `#FAF8F5` | Lightest warm neutral                     |
| `neutral-100`   | `#F7F3EE` | Same as `background`                      |
| `neutral-200`   | `#E8E2DA` | Icon circle backgrounds, muted containers |
| `neutral-300`   | `#D4CCC3` | Subtle borders, input borders             |
| `neutral-400`   | `#C8BFB6` | Same as `divider` / `secondary`           |
| `neutral-500`   | `#8A8279` | Mid-tone text / icons                     |
| `neutral-600`   | `#6E6A66` | Same as `subtitle`                        |
| `neutral-700`   | `#524E4A` | Dark text, headings                       |
| `neutral-800`   | `#3D3632` | Dark mode surfaces                        |
| `neutral-900`   | `#2A2522` | Dark mode backgrounds                     |
| `neutral-950`   | `#1A1614` | Darkest neutral                           |

#### Default Palette → Design Token Mapping

When migrating from Tailwind's default palette, use this mapping:

| Default Palette       | Design Token Replacement       |
| --------------------- | ------------------------------ |
| `bg-white`            | `bg-surface`                   |
| `bg-gray-50`          | `bg-background`                |
| `bg-gray-100`         | `bg-neutral-200`               |
| `border-gray-100/200` | `border-divider`               |
| `border-gray-300`     | `border-divider`               |
| `text-gray-900`       | `text-foreground`              |
| `text-gray-700`       | `text-foreground`              |
| `text-gray-600`       | `text-subtitle`                |
| `text-gray-500`       | `text-subtitle`                |
| `text-gray-400`       | `text-placeholder`             |
| `text-blue-600`       | `text-primary`                 |
| `bg-blue-600`         | `bg-primary`                   |
| `bg-blue-100`         | `bg-neutral-200`               |
| `text-green-600`      | `text-success`                 |
| `bg-green-100`        | `bg-neutral-200`               |
| `text-red-600`        | `text-error`                   |
| `#2563EB` (blue hex)  | `colors.primary` (imperative)  |

```typescript
// Correct — use semantic tokens
tw`text-foreground bg-surface border-divider`;
tw`text-subtitle`;
tw`bg-primary text-accent`;
tw`text-error`;
tw`bg-neutral-200`; // icon circle backgrounds, muted containers

// Wrong — Tailwind default palette
tw`text-gray-900 bg-white border-gray-100`;
tw`text-gray-500`;
tw`bg-blue-600 text-blue-600`;

// Wrong — hardcoded hex
tw`border-[#C8BFB6] bg-[#ffffff] text-[#2F2F2F]`;
```

### Coloring SVG Icons

Use `style={tw`text-`}` to color SVG icons — the `currentColor` in SVGs resolves from the `color` style property set by Tailwind's `text-*` utilities. **Do NOT use the `color` prop with `colors['...']`**.

```typescript
// Correct — use style with tw
<MyIcon style={tw`text-primary-400`} height={20} width={20} />
<ArrowLeftIcon style={tw`text-foreground`} height={20} width={20} />

// Wrong — using color prop
<MyIcon color={colors['primary-400']} height={20} width={20} />
```

---

## Dark Mode

Use the `useToggleDarkMode` hook from `@/hooks` to read or toggle the color scheme. It syncs both `twrnc` and the Zustand store.

```typescript
import { useToggleDarkMode } from '@/hooks';

const { colorScheme, toggleColorScheme, setColorScheme } = useToggleDarkMode();
const isDark = colorScheme === 'dark';
```

- **Never** read `colorScheme` directly from the Zustand store when you also need to toggle — always use this hook so `twrnc` stays in sync
- Use Tailwind's `dark:` prefix for conditional styles: `tw`bg-white dark:bg-background``
- **Light mode first**: Always write the light mode style as the base, then add the `dark:` variant. The default color scheme is `light`. Think in terms of light mode colors first (e.g., `text-foreground dark:text-dark-foreground`, `bg-surface dark:bg-dark-surface`)

---

## Icons

- **Source**: Download SVGs from [Lucide](https://lucide.dev) and place in `src/icons/`
- **Format**: SVGs must use `currentColor` for stroke/fill so they can be colored via Tailwind's `text-`* utilities
- **Registration**: Import in `src/icons/index.ts` and add to the barrel export
- **Usage**: Color with `style={tw`text-`}`, never use the `color` prop
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
