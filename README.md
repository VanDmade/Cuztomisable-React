# @vandmade/cuztomisable

A React Native / Expo framework for mobile apps. Provides plug-and-play authentication, onboarding, settings screens, theming, form components, and data utilities so you can focus on your product instead of plumbing.

---

## Table of Contents

- [Installation](#installation)
- [Metro Configuration](#metro-configuration)
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

This package is consumed as a local workspace dependency. Add it to your app's `package.json`:

```json
{
  "dependencies": {
    "@vandmade/cuztomisable": "*"
  }
}
```

The package lives at `packages/cuztomisable/` inside the monorepo root. No build step is required — Metro resolves TypeScript source directly.

---

## Metro Configuration

Configure Metro to resolve the package alias and watch the local source:

```js
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  '@vandmade/cuztomisable': path.resolve(__dirname, 'packages/cuztomisable/src'),
};

config.watchFolders = [
  path.resolve(__dirname, 'packages/cuztomisable/src'),
];

module.exports = config;
```

After changing package source files, restart Metro with cache cleared:

```sh
npx expo start --clear
```

---

## Quick Start

```tsx
import { AppProvider } from '@vandmade/cuztomisable';
import { createConfig } from '@vandmade/cuztomisable';

const config = createConfig({
  appName: 'My App',
  baseUrl: 'https://api.myapp.com/api/',
  supportEmail: 'hello@myapp.com',
});

export default function App() {
  return (
    <AppProvider config={config}>
      {/* your navigation / screens */}
    </AppProvider>
  );
}
```

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
| `AppProvider` | Root provider — wraps theme, config, auth context, and safe area |
| `ThemeWrapper` | Standalone theme provider when you don't need the full `AppProvider` |
| `useTheme()` | Hook — returns the active `Theme` object from the nearest provider |

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

Import from `@vandmade/cuztomisable/components/form`:

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
import { FormScreen, FormInput, Dropdown } from '@vandmade/cuztomisable/components/form';

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

Import from `@vandmade/cuztomisable/components/ui` or the root `@vandmade/cuztomisable`:

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

Pre-built screens are exported from `@vandmade/cuztomisable/app/routes` and can be used directly or overridden by rendering your own component on the same route.

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
