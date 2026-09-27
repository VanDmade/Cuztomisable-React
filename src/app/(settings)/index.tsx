// src/app/(settings)/index.tsx
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FormScreen, ListItem, ListTitle } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { useMessage } from '../../contexts/MessageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { useConfig } from '../../providers/ConfigProvider';
import { useTheme } from '../../providers/ThemeProvider';
import { imageDefault as themeImages } from '../../theme/images';

export default function SettingsScreen({ profileImageSource }: { profileImageSource?: any }) {
    const theme = useTheme();
    const config = useConfig();
    const router = useRouter();
    const { busy, runAction } = useAsyncAction();
    const { showMessage } = useMessage();
    const { user, refreshUser, logout } = useAuth();
    const { updateTwoFactor } = useSettings();
    const [twoFactor, setTwoFactor] = useState<boolean>(user?.mfa ?? false);

    useEffect(() => {
        (async () => {
            await refreshUser();
        })();
    }, []); 
    useEffect(() => {
        setTwoFactor(user?.multi_factor_authentication ?? false);
    }, [user]);

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    const handleTwoFactor = async (value: boolean) => {
        return runAction(async () => {
            setTwoFactor(value);
            return updateTwoFactor(value).then((data) => {
                if (value !== data.enabled) {
                    setTwoFactor(data.enabled);
                }
                showMessage(data.message, 'success');
                return refreshUser();
            });
        }, 2500).catch((err) => {
            setTwoFactor(!value);
        });
    };

    const joinDate = '12/25/2025';

    return (
        <FormScreen paddingTop="{0}">
            {() => (
                <ScrollView contentContainerStyle={theme.utils.pbsm}>
                    <View style={[styles.headerRow, theme.utils.pmd]}>
                        <Image
                            source={user?.image ? {uri: user.image} : (profileImageSource || themeImages.profile)}
                            style={[styles.image, {borderColor: theme.color.primary}]}
                            resizeMode="contain" />
                        <View style={[styles.headerTextWrapper]}>
                            <Text style={[styles.name, { color: theme.color.text }]}>Michael VanDerwerker</Text>
                            <Text style={[styles.description, { color: theme.color.text }]}>Join Date: {joinDate}</Text>
                        </View>
                    </View>
                    <ListTitle title="My Account"></ListTitle>
                    <ListItem title="Edit Profile" onPress={() => router.push('/(settings)/profile')} />
                    <ListItem title="Change Password" onPress={() => router.push('/(settings)/password')} />
                    <ListItem
                        title="Two Factor Authentication"
                        subtitle={twoFactor ? 'Enabled' : 'Disabled'}
                        toggle={twoFactor}
                        onToggle={handleTwoFactor}
                        busy={busy} />

                    <ListTitle title="App"></ListTitle>
                    {(config.settingsItems ?? []).map((item: { title: string; subtitle?: string; href: string }) => (
                        <ListItem key={item.href} title={item.title} subtitle={item.subtitle} onPress={() => router.push(item.href as any)} />
                    ))}
                    <ListItem title="Appearance" subtitle={theme.mode.charAt(0).toUpperCase() + theme.mode.slice(1)} onPress={() => router.push('/(settings)/appearance')} />
                    <ListItem title="Rate this App" />
                    <ListItem title="Privacy Policy" subtitle={`Last Updated: ${config.privacyPolicyLastUpdated}`} onPress={() => router.push('/(settings)/privacy')} />
                    <ListItem title={`About ${config.appName}`} onPress={() => router.push('/(settings)/about')} />
                    <ListItem title={`Version: ${config.version ?? '1.0.0'}`} />

                    <ListTitle title="Account Actions"></ListTitle>
                    <ListItem title="Logout" onPress={handleLogout} danger />
                </ScrollView>
            )}
        </FormScreen>
    );
}

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    image: {
        width: 86,
        height: 86,
        marginRight: 12,
        borderWidth: 2,
        borderRadius: 50,
    },
    headerTextWrapper: {
        flexShrink: 1,
    },
    name: {
        fontSize: 18,
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
    },
});
