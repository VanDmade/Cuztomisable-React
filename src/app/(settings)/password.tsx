// src/app/(settings)/password.tsx
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, FormHeader, FormInput, FormScreen, PasswordRequirements } from '../../components';
import { useMessage } from '../../contexts/MessageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { useTheme } from '../../providers/ThemeProvider';

export default function PasswordScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { busy, errors, runAction, setErrors } = useAsyncAction();
    const { changePassword } = useSettings();
    const { showMessage } = useMessage();
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const onSubmit = async () => {
        return runAction(async () => {
            const data = await changePassword(password, newPassword);
            // Outputs the message
            showMessage(data.message, 'success');
            // Resets the form and then redirects them
            setPassword('');
            setNewPassword('');
            router.push({pathname: '/(settings)'});
        });
    };

    return (
        <FormScreen paddingTop={20}>
            {() => (
                <View style={[theme.styles.container, theme.styles.background, theme.utils.pxmd]}>
                    <FormHeader
                        theme={theme}
                        title="Change Password"
                        subtitle="Strengthen your account with a new password." />
                    <View style={[theme.utils.mtlg, theme.utils.widthFull]}>
                        <FormInput
                            theme={theme}
                            placeholder="Current Password"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            disabled={busy}
                            onClearError={() => setErrors(prev => ({ ...prev, current: undefined }))}
                            error={errors?.current} />
                        <FormInput
                            theme={theme}
                            placeholder="New Password"
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                            disabled={busy}
                            onClearError={() => setErrors(prev => ({ ...prev, new: undefined }))}
                            error={errors?.new} />
                        <PasswordRequirements password={newPassword} />
                    </View>
                    <Button
                        title="Reset"
                        onPress={onSubmit}
                        disabled={busy}
                        containerStyle={theme.utils.mtmd} />
                </View>
            )}
        </FormScreen>
    );
}
