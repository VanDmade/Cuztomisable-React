// src/app/(auth)/register.tsx
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button, FormHeader, FormInput, FormScreen, LinkText, Phone } from '../../components';
import { PasswordRequirements } from '../../components/ui/PasswordRequirements';
import { useAuth } from '../../contexts/AuthContext';
import { useMessage } from '../../contexts/MessageContext';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { useTheme } from '../../providers/ThemeProvider';

export default function RegisterScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState({countryCode: '1', number: ''});
    const handlePhoneChange = (val: { countryCode: string; number: string }) => setPhone(val);
    const [password, setPassword] = useState('');
    const { busy, errors, runAction, setErrors } = useAsyncAction();
    const { showMessage } = useMessage();

    const goToLogin = () => router.push('/(auth)/login');

    const onSubmit = async () => {
        return runAction(async () => {
            const data = await register(name.trim(), email.trim(), phone?.number?.trim(), password);
            showMessage(data.message, 'success');
            router.push('/(auth)/login');
        });
    };

    return (
        <FormScreen centered>
            {() => (
                <View style={[theme.styles.container, theme.styles.background, theme.utils.pxmd]}>
                    <FormHeader
                        theme={theme}
                        title="Sign Up"
                        subtitle="Your journey starts here"
                        logoSource={theme.image.logo} />
                    <View style={[theme.utils.mtlg, theme.utils.widthFull]}>
                        <FormInput
                            theme={theme}
                            placeholder="Name"
                            autoCapitalize="none"
                            value={name}
                            onChangeText={setName}
                            disabled={busy}
                            onClearError={() => setErrors(prev => ({ ...prev, name: undefined }))}
                            error={errors?.name} />
                        <FormInput
                            theme={theme}
                            placeholder="Email"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                            disabled={busy}
                            onClearError={() => setErrors(prev => ({ ...prev, email: undefined }))}
                            error={errors?.email} />
                        <Phone
                            value={phone}
                            onChange={handlePhoneChange}
                            error={errors?.phone}
                            onClearError={() => setErrors(prev => ({ ...prev, phone: undefined }))}
                            disabled={busy} />
                        <FormInput
                            theme={theme}
                            placeholder="Password"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            disabled={busy}
                            onClearError={() => setErrors(prev => ({ ...prev, password: undefined }))}
                            error={errors?.password} />
                        <PasswordRequirements password={password} />
                    </View>
                    <Button
                        title="Register"
                        onPress={onSubmit}
                        disabled={busy}
                        containerStyle={theme.utils.mtmd} />
                    <LinkText onPress={goToLogin} style={theme.utils.mtmd} muted disabled={busy}>
                        Already have an account?{' '}
                        <Text
                            style={[
                                theme.typography.variants.link,
                                busy && theme.typography.variants.muted,
                            ]}>Login</Text>
                    </LinkText>
                </View>
            )}
        </FormScreen>
    );
}
