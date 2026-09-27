// cuztomisable/defaultConfig.ts
// Application configuration and constants.
export type ThemeMode = 'light' | 'dark';

export const defaultConfig = {
    // Layout/spacing base value for theme
    base: 8,
    appName: 'Cuztomisable',
    version: 'v1.0.0',
    locale: 'en-US',
    defaultTheme: 'light' as ThemeMode,
    supportEmail: 'michaelvanderwerkerllc@gmail.com',
    privacyPolicyLastUpdated: '11/21/2025',
    baseUrl: 'https://api.example.com/api/',
    requestTimeoutMs: 15000,
    homeRoute: '/(tabs)/home',
    // Extra rows an app adds to Settings > App, each opening one of its own screens,
    settingsItems: [] as { title: string; subtitle?: string; href: string }[],
    followSystemTheme: true,
    passwordRequirements: {
        numbers: 1,
        symbols: 1,
        minimum: 6,
        maximum: null,
        lowercase: 1,
        uppercase: 1,
    },
    countries: [
        { label: 'United States & Canada', code: 'US', dialCode: 1 },
        { label: 'United Kingdom', code: 'GB', dialCode: 44 },
        { label: 'Australia', code: 'AU', dialCode: 61 },
    ],
    features: {
        enableAdvancedRoles: true,
        debugMode: __DEV__,
        barPhotoUpload: {
            enabled: false,
            maxPhotos: 10,
            imagesPerBatch: 3,
            maxBatchSizeMb: 15,
        },
    },
    onboarding: [
        {
            image: 'slide1',
            title: 'Welcome to Cuztomisable',
            subtitle: null,
            description: 'Build powerful apps with a streamlined foundation designed to help you launch faster than ever.',
        },
        {
            image: 'slide2',
            title: 'Idea to Product — Fast',
            subtitle: null,
            description: 'Turn concepts into real, working features in record time with tools built for rapid development.',
        },
        {
            image: 'slide3',
            title: 'Configure Everything',
            subtitle: 'Endless customization',
            description: 'A simple, flexible configuration files that gives you control over authentication, roles, UI flows, and more. No boilerplate required.',
        },
        {
            image: 'slide4',
            title: 'Build Your Product, Not the Plumbing',
            subtitle: null,
            description: 'Skip repetitive setup like auth, user management, and permissions — Cuztomisable handles it for you.',
        },
        {
            image: 'slide5',
            title: 'Seamless Experience for Your Users',
            subtitle: null,
            description: 'Every screen is designed to be responsive, intuitive, and lightning-fast — right out of the box.',
        },
    ],
    navigation: {
        items: [],
        enablePlusDropdown: false,
        plusActionRoute: '',
        plusActionRoutes: {},
        plusTitle: 'Quick Links',
        actions: [],
        dropdown: {
            key: '',
            title: 'Quick Links',
            options: [],
        },
    },
} as const;
