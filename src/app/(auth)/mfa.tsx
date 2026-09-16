// src/app/(auth)/mfa.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Button, FormCheckbox, FormHeader, FormInput, FormScreen, LinkText } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { useMessage } from '../../contexts/MessageContext';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { useCountdown } from '../../hooks/useCountdown';
import { useConfig } from '../../providers/ConfigProvider';
import { useTheme } from '../../providers/ThemeProvider';

type Channel = 'email' | 'sms';

export default function MfaScreen() {
    const theme = useTheme();
    const config = useConfig();
    const router = useRouter();
    const { verifyMfaToken, sendMfaCode, finalizeMfa } = useAuth();
    const { busy, errors, runAction, setErrors } = useAsyncAction();
    const { showMessage } = useMessage();
    const { isDone, reset } = useCountdown(30);
    const { token } = useLocalSearchParams<{ token: string }>();
    const [channel, setChannel] = useState<Channel>('email');
    const [code, setCode] = useState('');
    const [email, setEmail] = useState<string | null>(null);
    const [phone, setPhone] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        if (!token) return;

        let mounted = true;

        const run = async () => {
            try {
                const data = await verifyMfaToken(token);

                if (!mounted) return;

                if (data.email == null || data.phone == null) {
                    setSent(true);
                    showMessage(
                        `The code was sent to ${data.phone ?? data.email}.`,
                        'success'
                    );
                }

                setEmail(data.email);
                setPhone(data.phone);
            } catch (err: any) {
                if (!mounted) return;
                showMessage(err?.message ?? 'Invalid or expired token', 'danger');
            }
        };

        run();

        return () => {
            mounted = false;
        };
    }, [token]); // ✅ ONLY token

    const onSubmit = async () => {
        return runAction(async () => {
            const data = await finalizeMfa(token, code);
            showMessage(data.message, 'success');
            router.replace(config.homeRoute);
        });
    };
    const onSend = async () => {
        return runAction(async () => {
            setSent(true);
            const data = await sendMfaCode(token, channel);
            showMessage(data.message, 'success');
            reset();
        });
    };

    return (
        <FormScreen centered>
            {() => (
                <View style={[theme.styles.container, theme.styles.background, theme.utils.pxmd]}>
                    <FormHeader
                        theme={theme}
                        title="Two-Step Verification"
                        subtitle="Where should the code to be sent."
                        logoSource={theme.image.logo}
                    />
                    {!sent ? (
                        <>
                            <View style={[theme.utils.mtlg, theme.utils.widthFull]}>
                                {email && (
                                    <FormCheckbox
                                        label={email}
                                        value={channel === 'email'}
                                        onValueChange={() => setChannel('email')}
                                        disabled={busy}
                                        fullWidthPressable />
                                )}
                                {phone && (
                                    <FormCheckbox
                                        label={phone}
                                        value={channel === 'sms'}
                                        onValueChange={() => setChannel('sms')}
                                        disabled={busy}
                                        fullWidthPressable />
                                )}
                            </View>
                            <Button
                                title="Send Code"
                                onPress={onSend}
                                disabled={busy}
                                containerStyle={theme.utils.mtmd} />
                        </>
                    ) : (
                        <>
                            <View style={[theme.utils.mtlg, theme.utils.widthFull]}>
                                <FormInput
                                    theme={theme}
                                    placeholder="Code"
                                    autoCapitalize="none"
                                    value={code}
                                    onChangeText={setCode}
                                    disabled={busy}
                                    capitalOnly
                                    onClearError={() => setErrors(prev => ({ ...prev, code: undefined }))}
                                    error={errors?.code} />
                            </View>
                            <Button
                                title="Verify"
                                onPress={onSubmit}
                                disabled={busy || code.trim().length < 4}
                                containerStyle={theme.utils.mtmd} />
                            {isDone && (
                                <LinkText onPress={onSend} style={theme.utils.mtmd} muted disabled={busy}>
                                    Still haven&#39;t received the code?{' '}
                                    <Text
                                        style={[
                                            theme.typography.variants.link,
                                            busy && theme.typography.variants.muted,
                                        ]}>Resend</Text>
                                </LinkText>
                            )}
                        </>
                    )}
                </View>
            )}
        </FormScreen>
    );
}
