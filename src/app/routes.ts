// cuztomisable/app/routes.ts
// Export all main routes for easy integration and override

export { default as AuthLayout } from './(auth)/_layout';
export { default as OnboardingLayout } from './(onboarding)/index';
export { default as Questionnaire } from './(questionnaire)/index';
export { default as SettingsLayout } from './(settings)/_layout';
export { default as TabsLayout } from './(tabs)/_layout';

// Example: export individual screens for override
export { default as AuthForgot } from './(auth)/forgot';
export { default as AuthLogin } from './(auth)/login';
export { default as AuthMfa } from './(auth)/mfa';
export { default as AuthRegister } from './(auth)/register';
export { default as AuthReset } from './(auth)/reset';
export { default as SettingsAbout } from './(settings)/about';
export { default as SettingsAppearance } from './(settings)/appearance';
export { default as SettingsPassword } from './(settings)/password';
export { default as SettingsPrivacy } from './(settings)/privacy';
export { default as SettingsProfile } from './(settings)/profile';
export { default as TabsHome } from './(tabs)/home';

// Add more exports as needed for custom screens
