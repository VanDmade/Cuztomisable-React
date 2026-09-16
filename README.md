# @vandmade/cuztomisable

A React Native / Expo framework for mobile apps. Provides plug-and-play authentication, onboarding, settings screens, theming, form components, and data utilities so you can focus on your product instead of plumbing.

---

## Table of Contents

- [Installation](#installation)
  - [Peer dependencies](#peer-dependencies)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Theme Customization](#theme-customization)
- [Providers](#providers)
- [Components](#components)
  - [Form](#form-components)
  - [UI](#ui-components)
  - [List](#list-components)
  - [Table](#table-components)
  - [Navigation](#navigation-components)
  - [Onboarding](#onboarding-components)
- [Hooks](#hooks)
- [Services](#services)
- [Screens & Routes](#screens--routes)
- [Image Setup](#image-setup)
- [License](#license)

---

## Installation

This is a source package (no build step - Metro resolves the TypeScript directly), consumed either as a local workspace dependency or, more commonly, straight from GitHub into a standalone Expo app. Because there's no build step, every subpath import below the root (anything other than plain `@vandmade/cuztomisable`) needs a literal `src/` in the path, e.g. `@vandmade/cuztomisable/src/components/form` - the package has no `exports` map, so it's exact-file resolution, not the clean paths you'd get from a published, built package.

```sh
npx create-expo-app@latest MyApp
cd MyApp
npm install github:VanDmade/Cuztomisable-React
```

That's it for the install step. `npm install` (via `postinstall`) automatically:

1. Installs every native module this package needs (Expo Router, Secure Store, Async Storage, gesture handler, reanimated, etc.) via `peerDependencies` - npm 7+ installs those automatically, no separate `expo install` pass required for a fresh app (see [Peer dependencies](#peer-dependencies) if you ever see one missing)
2. Copies the package's default assets into your project's `assets/` (skips any file that already exists)
3. Generates `app/_layout.tsx` at your project root wired up with `AppProvider` → `ThemeWrapper` → `MessageProvider` → `AuthProvider` → `Stack` (skipped if you already have one)
4. Mirrors every screen the package ships (`(auth)`, `(onboarding)`, `(settings)`, `(tabs)`, the root `index.tsx` redirect) into your `app/` directory as one-line re-export files, so `expo-router` picks them up immediately (skipped per-file if you already have that route - override any screen just by not deleting your own version)

After that, you only need to:

```json
// package.json
"main": "expo-router/entry"
```

```json
// app.json → "expo"
"scheme": "myapp"
```

and fill in the generated `app/_layout.tsx`'s `AppProvider config={{}}` with your real config (see [Configuration](#configuration)) - it ships with an empty object on purpose so the app still boots before you've customized anything.

If the generated files ever get out of sync with a newer version of this package (new screens, a changed layout), delete the files you want regenerated and reinstall - `postinstall` won't overwrite anything that already exists.

### Peer dependencies

Everything below is declared in `peerDependencies` and gets installed automatically by `npm install` (npm ≥7). If you're on an older npm, or `npx expo install --fix` ever reports a mismatched version against your Expo SDK, install these explicitly:

```sh
npx expo install expo-router expo-secure-store expo-splash-screen expo-document-picker \
  expo-image-picker @expo/vector-icons @react-native-async-storage/async-storage \
  react-native-gesture-handler react-native-safe-area-context react-native-reanimated \
  react-native-draggable-flatlist
npm install axios lodash.merge
```

---

## Quick Start

Once installed, `app/_layout.tsx` already exists (generated for you) - just replace its empty config:

```tsx
// app/_layout.tsx
import { AppProvider, AuthProvider, Message, MessageProvider, ThemeWrapper } from '@vandmade/cuztomisable';
import { Stack } from 'expo-router';

const config = {
  appName: 'My App',
  baseUrl: 'https://api.myapp.com/api/',
  supportEmail: 'hello@myapp.com',
};

export default function RootLayout() {
  return (
    <AppProvider config={config}>
      <ThemeWrapper>
        <MessageProvider>
          <AuthProvider>
            <Message />
            <Stack screenOptions={{ headerShown: false }} />
          </AuthProvider>
        </MessageProvider>
      </ThemeWrapper>
    </AppProvider>
  );
}
```

Prefer `createConfig` over a plain object if you only want to override a few keys - it deep-merges onto the package defaults (see [Configuration](#configuration)).

`AppProvider` itself only wraps theme, config, and safe area - `AuthProvider`/`MessageProvider` are separate on purpose (so screens that don't need auth aren't forced to pay for it), which is why the generated layout wires them up explicitly rather than `AppProvider` doing it internally.

---

## Configuration

Use `createConfig` to deep-merge your overrides on top of the package defaults:

```ts
import { createConfig } from '@vandmade/cuztomisable';

const config = createConfig({
  appName: 'My App',
  version: 'v2.0.0',
  locale: 'en-US',
  defaultTheme: 'dark',          // 'light' | 'dark'
  followSystemTheme: true,
  supportEmail: 'help@myapp.com',
  privacyPolicyLastUpdated: '01/01/2026',
  baseUrl: 'https://api.myapp.com/api/',
  requestTimeoutMs: 15000,   // default - fails fast instead of hanging on a bad baseUrl
  homeRoute: '/(tabs)/home', // default - where login/MFA/boot land and where the header's home button goes

  passwordRequirements: {
    minimum: 8,
    numbers: 1,
    symbols: 1,
    lowercase: 1,
    uppercase: 1,
  },

  countries: [
    { label: 'United States & Canada', code: 'US', dialCode: 1 },
    { label: 'United Kingdom', code: 'GB', dialCode: 44 },
  ],

  features: {
    enableAdvancedRoles: false,
  },

  navigation: {
    items: [
      { key: 'home', label: 'Home', icon: 'home', route: '/(tabs)/home' },
    ],
  },

  onboarding: [
    { image: 'slide1', title: 'Welcome', description: 'Get started fast.' },
  ],
});
```

Only supply the keys you want to change — everything else falls back to the defaults.

---

## Theme Customization

Use `createTheme` to override colors, typography, spacing, or images for either `'light'` or `'dark'` mode:

```ts
import { createTheme } from '@vandmade/cuztomisable';

const theme = createTheme('light', {
  color: {
    light: {
      primary: '#6C47FF',
      secondary: '#FF6B6B',
    },
  },
  typography: {
    fontFamily: {
      regular: 'Inter_400Regular',
      bold: 'Inter_700Bold',
    },
  },
  layout: {
    base: 8,
    radius: { md: 12 },
  },
  image: {
    logo: require('./assets/images/logo.png'),
  },
});
```

Pass the resulting theme into `ThemeWrapper` or access it anywhere with `useTheme()`.

---

## Providers

| Export | Description |
|---|---|
| `AppProvider` | Root provider — wraps theme, config, and safe area. Does **not** include auth/message state (see below) |
| `AuthProvider` / `useAuth()` | Signed-in state, login/register/MFA/logout — required by every `(auth)`, `(onboarding)`, and `(tabs)` screen the package ships |
| `MessageProvider` / `useMessage()` | Toast/banner state, paired with the `<Message />` component rendered once near the root — required by `(auth)/login.tsx` and others |
| `ConfigProvider` / `useConfig()` | Exposes the config passed to `AppProvider` anywhere in the tree |
| `ThemeWrapper` | Standalone theme provider when you don't need the full `AppProvider` |
| `useTheme()` | Hook — returns the active `Theme` object from the nearest provider |

`AuthProvider` and `MessageProvider` are separate from `AppProvider` so screens that don't need them aren't forced to pay for them — the generated `app/_layout.tsx` (see [Installation](#installation)) already wires all of this up for you.

```tsx
import { useTheme } from '@vandmade/cuztomisable';

function MyComponent() {
  const theme = useTheme();
  return <View style={{ backgroundColor: theme.color.background }} />;
}
```

---

## Components

### Form Components

Import from `@vandmade/cuztomisable/src/components/form`:

| Component | Description |
|---|---|
| `FormScreen` | Scrollable screen wrapper with safe area, keyboard avoidance, and optional top padding |
| `FormHeader` | Section header with title, subtitle, and optional right-side content slot |
| `FormInput` | Single-line text input with label, error state, and animated error message |
| `FormTextarea` | Multi-line text input |
| `Dropdown` | Bottom-sheet picker for a list of options; supports `wrapperStyle` and `fieldStyle` overrides |
| `FormAutocomplete` | Searchable dropdown with typeahead filtering |
| `Phone` | Phone number input with country-code selector |
| `FormCheckbox` | Checkbox with label |
| `FormToggle` | On/off toggle switch |
| `FormRadio` | Radio button group |
| `FormMultiSelect` | Multi-select pill chooser |
| `FormMultiEntry` | Add/remove a list of free-text entries |
| `FormTags` | Tag input field |
| `ImageUploader` | Image picker with preview |
| `DocumentUploader` | File/document picker |

```tsx
import { FormScreen, FormInput, Dropdown } from '@vandmade/cuztomisable/src/components/form';

<FormScreen paddingTop={20}>
  {() => (
    <>
      <FormInput label="Name" value={name} onChangeText={setName} />
      <Dropdown
        label="Category"
        options={[{ label: 'Beer', value: 'beer' }]}
        value={category}
        onSelect={setCategory}
      />
    </>
  )}
</FormScreen>
```

**`FormScreen` props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `paddingTop` | `number` | `0` | Top padding applied inside the scroll container |
| `children` | `() => ReactNode` | — | Render prop (required) |

> Always pass `paddingTop` as a **number**, not a string.

**`Dropdown` props:**

| Prop | Type | Description |
|---|---|---|
| `value` | `T` | Currently selected value |
| `options` | `DropdownOption<T>[]` | Array of `{ label, value, description?, rightText?, selectedText?, divider? }` |
| `onSelect` | `(val: T) => void` | Called when an option is chosen |
| `placeholder` | `string` | Text shown when no value is selected |
| `label` | `string` | Field label rendered above the trigger |
| `bordered` | `boolean` | Renders the trigger with a visible border (matches `FormInput` style) |
| `disabled` | `boolean` | Prevents opening the modal |
| `fieldStyle` | `ViewStyle` | Style applied to the trigger button |
| `wrapperStyle` | `ViewStyle` | Style applied to the outer wrapper (use to zero `marginBottom` when centering inline) |
| `modalTitle` | `string` | Title shown in the bottom-sheet header |

---

### UI Components

Import from `@vandmade/cuztomisable/src/components/ui` or the root `@vandmade/cuztomisable`:

| Component | Description |
|---|---|
| `Button` | Themed button with `intent`, `size`, `iconOnly`, `left`/`right` icon slots |
| `Message` | Inline alert/banner with `type` (`success`, `error`, `warning`, `info`) and `visible` flag |
| `Loading` | Full-screen or inline loading spinner |
| `LinkText` | Styled pressable text link |
| `PasswordRequirements` | Visual checklist for password strength rules |
| `KeyboardSpacer` | Invisible spacer that grows to fill keyboard height |

```tsx
import Button, { Message } from '@vandmade/cuztomisable';

<Message type="error" visible={!!error} text={error} />
<Button intent="primary" onPress={handleSave}>Save</Button>
```

---

### List Components

| Component | Description |
|---|---|
| `ListItem` | Settings-style row with label, value, toggle, and chevron slots |
| `ListTitle` | Section header label for a group of `ListItem` rows |

---

### Table Components

| Component | Description |
|---|---|
| `DataTable` | Paginated, sortable data table with filter support |
| `DataTableRow` | Default row renderer for `DataTable` |
| `PillTableRow` | Row variant with pill/badge value display |

```tsx
import { DataTable } from '@vandmade/cuztomisable';

const columns: DataTableColumn[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'status', label: 'Status' },
];

<DataTable
  columns={columns}
  data={rows}
  onRowPress={(row) => router.push(`/detail/${row.id}`)}
/>
```

> `DataTable` uses `scrollEnabled={false}` internally — it relies on a parent `ScrollView` (such as `FormScreen`) to handle vertical scrolling.

---

### Navigation Components

| Component | Description |
|---|---|
| `BottomNav` | Tab bar footer with configurable nav items and optional plus-action dropdown |
| `TopNav` | Screen header with back button, title, and right-action slot |

---

### Onboarding Components

| Component | Description |
|---|---|
| `OnboardingSlide` | Full-screen slide with image, title, subtitle, and description |

---

## Hooks

| Hook | Description |
|---|---|
| `useTheme()` | Returns the active `Theme` object |
| `useAsyncAction()` | Wraps an async function with loading/error state |
| `useBusy()` | Simple boolean busy/loading flag with setter |
| `useCountdown(seconds)` | Countdown timer that ticks down from a given value |
| `useFirstLaunch()` | Returns `true` on the first app launch (persisted via AsyncStorage) |
| `useNavigationHistory()` | Tracks the navigation stack for custom back-button behaviour |
| `useOnboarding()` | Manages onboarding completion state |

```ts
import { useAsyncAction } from '@vandmade/cuztomisable';

const { run, loading, error } = useAsyncAction(async () => {
  await saveData();
});
```

---

## Services

All services are pre-wired to the `baseUrl` from your config and handle auth token injection automatically via the API interceptor.

| Service | Description |
|---|---|
| `AuthService` | Login, register, logout, MFA, password reset |
| `PasswordService` | Change password, validate requirements |
| `UserService` | Fetch and update the current user profile |
| `StorageService` | Typed wrapper around `AsyncStorage` |

---

## Screens & Routes

Pre-built screens are exported from `@vandmade/cuztomisable/src/app/routes` and can be used directly or overridden by rendering your own component on the same route. `npm install` already generated a re-export file per route into your own `app/` directory (see [Installation](#installation)) — editing those, not the ones in `node_modules`, is how you override a screen.

| Export | Route |
|---|---|
| `AuthLogin` | `/(auth)/login` |
| `AuthRegister` | `/(auth)/register` |
| `AuthForgot` | `/(auth)/forgot` |
| `AuthReset` | `/(auth)/reset` |
| `AuthMfa` | `/(auth)/mfa` |
| `SettingsAppearance` | `/(settings)/appearance` |
| `SettingsPassword` | `/(settings)/password` |
| `SettingsPrivacy` | `/(settings)/privacy` |
| `SettingsAbout` | `/(settings)/about` |
| `SettingsProfile` | `/(settings)/profile` |
| `TabsHome` | `/(tabs)/home` |
| `AuthLayout` | `/(auth)/_layout` |
| `OnboardingLayout` | `/(onboarding)/index` |
| `SettingsLayout` | `/(settings)/_layout` |
| `TabsLayout` | `/(tabs)/_layout` |

---

## Image Setup

Metro requires all image `require()` calls to use static string paths. The package centralizes image imports in `packages/cuztomisable/src/theme/images.ts`. To override images in your app, create a `theme/images.ts` at your project root:

```ts
// theme/images.ts  (project root, NOT inside app/)
import { images as baseImages } from '../packages/cuztomisable/src/theme/images';

export const images = {
  ...baseImages,
  logo: require('./assets/images/logo.png'),
};
```

Keep this file at the project root — not inside `app/` — so relative imports resolve correctly. Never use dynamic `require` paths; Metro resolves image references at build time.

---

## License

MIT
