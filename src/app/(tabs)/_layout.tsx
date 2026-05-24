// src/app/(tabs)/_layout.tsx
import { Stack } from 'expo-router';
import { View } from 'react-native';

import { useTheme } from '../../providers/ThemeProvider';

export default function TabLayout() {
    const theme = useTheme();

    return (
        <View style={[theme.styles.flex, theme.styles.background]}>
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
    );
}
