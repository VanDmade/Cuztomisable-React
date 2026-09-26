// src/app/(settings)/_layout.tsx
import { Stack } from 'expo-router';
import { View } from 'react-native';

import { Header } from '../../components/navigation/Header';
import { SettingsProvider } from '../../contexts/SettingsContext';
import { useTheme } from '../../providers/ThemeProvider';

export default function SettingsLayout() {
    const theme = useTheme();

    return (
        <SettingsProvider>
            <View style={[theme.styles.flex, theme.styles.background]}>
                <Header
                    title="Settings"
                    back
                    logoRight
                />
                <View style={theme.styles.flex}>
                    <Stack
                        key={theme.mode}
                        screenOptions={{
                            headerShown: false,
                            animation: 'fade',
                            animationDuration: 250,
                            contentStyle: { backgroundColor: theme.color.background },
                        }}/>
                </View>
            </View>
        </SettingsProvider>
    );
}
