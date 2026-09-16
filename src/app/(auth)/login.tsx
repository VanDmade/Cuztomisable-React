// src/app/(auth)/login.tsx
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button, FormHeader, FormInput, FormScreen, LinkText } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { useMessage } from '../../contexts/MessageContext';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { useOnboarding } from '../../hooks/useOnboarding';
import { useConfig } from '../../providers/ConfigProvider';
import { useTheme } from '../../providers/ThemeProvider';

export default function LoginScreen() {
    const theme = useTheme();
    const config = useConfig();
    const router = useRouter();
    const { login } = useAuth();
    const { showMessage } = useMessage();
    const { resetOnboarding } = useOnboarding();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { busy, errors, runAction, setErrors } = useAsyncAction();

    const goToForgotPassword = () => router.push('/(auth)/forgot');
    const goToRegister = () => router.push('/(auth)/register');
    const handleReset = async () => {
        await resetOnboarding();
        router.replace('/(onboarding)');
    };

    const onSubmit = async () => {
        return runAction(async () => {
            const data = await login(username.trim(), password);
            showMessage(data.message, 'success');
            if (data?.requiresMfa) {
                router.push({
                    pathname: '/(auth)/mfa',
                    params: { token: data.token },
                });
            } else {
                router.push({ pathname: config.homeRoute });
            }
        });
    };

    return (
        <FormScreen centered>
            {() => (
                <View style={[theme.styles.container, theme.styles.background, theme.utils.pxmd]}>
                    <FormHeader
                        theme={theme}
                        title="Login"
                        subtitle={`Welcome to ${config.appName ?? 'Cuztomisable'}!`}
                        logoSource={theme.image.logo} />
                    <View style={[theme.utils.mtlg, theme.utils.widthFull]}>
                        <FormInput
                            theme={theme}
                            placeholder="Email"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            autoComplete="off"
                            value={username}
                            onChangeText={setUsername}
                            disabled={busy}
                            onClearError={() => setErrors(prev => ({ ...prev, username: undefined }))}
                            error={errors?.username} />
                        <FormInput
                            theme={theme}
                            placeholder="Password"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            disabled={busy}
                            onClearError={() => setErrors(prev => ({ ...prev, password: undefined }))}
                            error={errors?.password} />
                    </View>
                    <Button
                        title="Login"
                        onPress={onSubmit}
                        disabled={busy}
                        containerStyle={theme.utils.mtmd} />
                    <LinkText onPress={goToForgotPassword} style={theme.utils.mtmd} disabled={busy}>
                        Forgot password?
                    </LinkText>
                    <LinkText onPress={goToRegister} style={theme.utils.mtsm} muted disabled={busy}>
                        Don't have an account?{' '}
                        <Text
                            style={[
                                theme.typography.variants.link,
                                busy && theme.typography.variants.muted,
                            ]}>Register</Text>
                    </LinkText>
                </View>
            )}
        </FormScreen>
    );
}
