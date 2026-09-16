// src/app/(tabs)/home.tsx
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Button, FormHeader, FormScreen } from '../../components';
import { useConfig } from '../../providers/ConfigProvider';
import { useTheme } from '../../providers/ThemeProvider';
import { imageDefault as themeImages } from '../../theme/images';

export default function HomeScreen({ logoSource }: { logoSource?: any }) {
    const theme = useTheme();
    const config = useConfig();
    const router = useRouter();
    const baseText = { color: theme.color.text };

    return (
        <FormScreen paddingTop={20}>
            {() => (
                <View style={[theme.styles.container, theme.styles.background, theme.utils.pxmd]}>
                    <FormHeader
                        theme={theme}
                        title={`Welcome to ${config.appName}`}
                        subtitle="You're signed in."
                        logoSource={logoSource || themeImages.logo} />
                    <View style={[theme.utils.mtlg, theme.utils.widthFull]}>
                        <Text style={baseText}>Replace this screen with your app's real home tab - override
                        `/(tabs)/home` in your own `app/` directory to swap it out. Until then, everything the
                        package ships out of the box - profile, password, appearance - lives in Settings.</Text>
                    </View>
                    <Button
                        title="Go to Settings"
                        onPress={() => router.push('/(settings)')}
                        containerStyle={theme.utils.mtmd} />
                </View>
            )}
        </FormScreen>
    );
}
