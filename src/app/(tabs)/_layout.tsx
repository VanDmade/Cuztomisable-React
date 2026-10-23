// src/app/(tabs)/_layout.tsx
import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';

import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../providers/ThemeProvider';

export default function TabLayout() {
    const theme = useTheme();
    const { signedIn, user } = useAuth();

    // Questions waiting on the questionnaire come first - however the user got here (launch, login, a deep link)
    if (signedIn && user?.questionnaireCompleted === false) {
        return <Redirect href="/(questionnaire)" />;
    }

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
