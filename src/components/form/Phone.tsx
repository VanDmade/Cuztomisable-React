// src/components/form/Phone.tsx

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Text, TextInput, TextInputProps, View } from 'react-native';

import { useConfig } from '../../providers/ConfigProvider';
import { useTheme } from '../../providers/ThemeProvider';

import { countryOptions } from '../../utils/countryOptions';
import type { DropdownOption } from './Dropdown';
import { Dropdown } from './Dropdown';
import { makeFormStyles } from './styles';

export type PhoneValue = {
    countryCode: string;
    number: string;
};

type PhoneProps = {
    label?: string;
    error?: string;
    disabled?: boolean;
    value?: PhoneValue;
    onChange?: (val: PhoneValue) => void;
    onClearError?: () => void;
    showCountryCode?: boolean;
    countryOptions?: DropdownOption<string | number>[];
} & Omit<
    TextInputProps,
    'value' | 'onChangeText' | 'editable' | 'keyboardType' | 'placeholder' | 'onChange'
>;

export const Phone: React.FC<PhoneProps> = ({
    label,
    error,
    disabled = false,
    value,
    onChange,
    onClearError,
    showCountryCode = true,
    countryOptions: countryOptionsProp,
    style,
    ...textInputProps
}) => {
    const theme = useTheme();
    const { color, styles, utils, typography } = theme;
    const config = useConfig();

    const formStyles = useMemo(
        () => makeFormStyles(theme),
        [theme]
    );

    const options = useMemo(() => {
        return (
            countryOptionsProp ??
            countryOptions([...config.countries])
        );
    }, [countryOptionsProp, config.countries]);

    const defaultCountryCode = String(options[0]?.value ?? '1');

    const [internal, setInternal] = useState<PhoneValue>({
        countryCode:
            value?.countryCode && value?.countryCode !== ''
                ? value.countryCode
                : defaultCountryCode,
        number: value?.number ?? '',
    });

    const fadeAnim = useRef(new Animated.Value(error ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: error ? 1 : 0,
            duration: 150,
            useNativeDriver: true,
        }).start();
    }, [error]);

    useEffect(() => {
        if (value) {
            setInternal(value);
        }
    }, [value?.countryCode, value?.number]);

    const propagate = (next: PhoneValue) => {
        setInternal(next);
        onChange?.(next);

        if (error && onClearError) {
            onClearError();
        }
    };

    const handleCountryChange = (cc: string | number) => {
        propagate({
            ...internal,
            countryCode: String(cc),
        });
    };

    const handleNumberChange = (text: string) => {
        propagate({
            ...internal,
            number: text.replace(/[^\d]/g, ''),
        });
    };

    return (
        <View style={formStyles.wrapper}>
            {label && <Text style={formStyles.label}>{label}</Text>}
            <View
                style={[
                    styles.row,
                    formStyles.input,
                    utils.pynone,
                    { alignItems: 'center' },
                    disabled && formStyles.inputDisabled,
                    error && formStyles.errorBorder,
                    style,
                ]}>
                {showCountryCode && options.length > 1 && (
                    <>
                        <Dropdown
                            fieldStyle={styles.rowSpaceBetween}
                            wrapperStyle={{ marginBottom: 0, width: 82 }}
                            modalTitle="Select Country"
                            placeholder="+1"
                            value={internal.countryCode}
                            options={options}
                            onSelect={handleCountryChange}
                            disabled={disabled} />

                        <View
                            style={[
                                styles.divider,
                                { backgroundColor: color.border },
                            ]} />
                    </>
                )}
                <TextInput
                    style={[
                        styles.flex,
                        utils.pymd,
                        showCountryCode &&
                            options.length > 1 &&
                            utils.plmd,
                        utils.prmd,
                        {
                            fontSize: typography.sizes.sm,
                            color: color.text,
                            textAlignVertical: 'center',
                        },
                    ]}
                    keyboardType="phone-pad"
                    editable={!disabled}
                    placeholder="Phone Number"
                    placeholderTextColor={color.muted}
                    value={internal.number}
                    onChangeText={handleNumberChange}
                    {...textInputProps} />
            </View>
            <Animated.View style={[formStyles.errorContainer, { opacity: fadeAnim }]}>
                <Text style={typography.variants.error}>
                    {error || ' '}
                </Text>
            </Animated.View>
        </View>
    );
};