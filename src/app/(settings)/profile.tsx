// src/app/(settings)/profile.tsx
import { useState } from 'react';
import { View } from 'react-native';

import { Button, FormInput, FormScreen, ImageUploader, Phone } from '../../components';
import { Dropdown } from '../../components/form/Dropdown';
import { useAuth } from '../../contexts/AuthContext';
import { useMessage } from '../../contexts/MessageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { useTheme } from '../../providers/ThemeProvider';
import type { ImageChange } from '../../services/user.service';
import { imageDefault as themeImages } from '../../theme/images';
import { buildTimeZoneOptions } from '../../utils/timezones/options';

export default function ProfileScreen({ defaultImageSource }: { defaultImageSource?: any }) {
    const theme = useTheme();
    const { busy, errors, runAction, setErrors } = useAsyncAction();
    const { showMessage } = useMessage();
    const { saveProfile } = useSettings();
    const { user, refreshUser } = useAuth();

    const [name, setName] = useState(user?.name ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [phone, setPhone] = useState(user?.phone ?? { countryCode: 1, number: '' });
    const [image, setImage] = useState<string | null>(user?.image ?? null);
    const [imageChange, setImageChange] = useState<ImageChange>('none');

    const defaultTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const [timezone, setTimezone] = useState(defaultTimezone);

    function handleImageChange(uri: string | string[] | null) {
        if (Array.isArray(uri)) {
            setImage(uri[0] ?? null);
            setImageChange(uri.length === 0 ? 'clear' : 'new');
        } else {
            setImage(uri);
            setImageChange(uri === null ? 'clear' : 'new');
        }
    }

    const onSubmit = async () => {
        return runAction(async () => {
            const data = await saveProfile({
                name,
                email,
                countryCode: String(phone.countryCode),
                phone: phone.number,
                timezone,
                image,
                imageChange,
            });
            await refreshUser();
            // Outputs the message
            showMessage(data.message, 'success');
            // Resets the image change status
            setImageChange('none');
        });
    };
    const timezoneOptions = buildTimeZoneOptions();
    return (
        <FormScreen paddingTop={20}>
            {() => (
                <View style={[theme.styles.container, theme.styles.background, theme.utils.pxmd]}>
                    <View style={[theme.styles.alignSelfCenter, theme.utils.mblg]}>
                        <ImageUploader
                            theme={theme}
                            value={image}
                            onChange={handleImageChange}
                            size={128}
                            defaultImageSource={defaultImageSource ?? themeImages.profile}
                        />
                    </View>
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
                        onChange={setPhone}
                        error={errors?.phone}
                        onClearError={() => setErrors(prev => ({ ...prev, phone: undefined }))}
                        disabled={busy} />
                    <Dropdown
                        theme={theme}
                        fieldStyle={theme.styles.rowSpaceBetween}
                        modalTitle="Select Timezone"
                        value={timezone}
                        options={timezoneOptions}
                        onSelect={setTimezone}
                        disabled={busy}
                        bordered />
                    <Button
                        title="Update"
                        onPress={onSubmit}
                        disabled={busy}
                        containerStyle={theme.utils.mtmd} />
                </View>
            )}
        </FormScreen>
    );
}
