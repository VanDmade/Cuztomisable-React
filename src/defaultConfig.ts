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
    baseUrl: 'http://192.168.10.147:8000/api/',
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
        items: [
            { key: 'drinks', route: '/(tabs)/drinks', icon: 'beer-outline', position: 'left' },
            { key: 'shopping', route: '/(tabs)/shopping', icon: 'format-list-checkbox', position: 'left' },
            { key: 'bars', route: '/(tabs)/bars', icon: 'file-cabinet', position: 'right' },
            { key: 'more', route: '/(tabs)/drinks', icon: 'dots-horizontal', position: 'right' },
        ],
        enablePlusDropdown: false,
        plusActionRoute: '/(tabs)/drinks/form',
        plusActionRoutes: {
            drinks: '/(tabs)/drinks/form',
            bars: '/(tabs)/bars/form',
            shopping: '/(tabs)/shopping/form',
            ingredients: '/(tabs)/ingredients/form',
            glasses: '/(tabs)/glasses/form',
            equipment: '/(tabs)/equipment/form',
        },
        plusTitle: 'Quick Links',
        actions: [],
        dropdown: {
            key: 'more',
            title: 'Quick Links',
            options: [
                { label: 'Ingredients', value: '/(tabs)/ingredients' },
                { label: 'Glasses', value: '/(tabs)/glasses' },
                { label: 'Equipment', value: '/(tabs)/equipment' },
            ],
        },
    },
} as const;
