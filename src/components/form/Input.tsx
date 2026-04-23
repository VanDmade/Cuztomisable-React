// src/components/form/Input.tsx
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { Theme } from '../../theme/theme';
import { makeFormStyles } from './styles';

type FormInputProps = {
    theme?: Theme;
    label?: string;
    error?: string;
    disabled?: boolean;
    hideDetails?: boolean;
    capitalOnly?: boolean;
    onChangeText?: (text: string) => void;
    onClearError?: () => void;
} & TextInputProps;

export const FormInput: React.FC<FormInputProps> = ({
    theme,
    label,
    error,
    disabled = false,
    hideDetails = false,
    capitalOnly = false,
    onChangeText,
    onClearError,
    style,
    ...inputProps
}) => {
    const activeTheme = theme ?? useTheme();
    const formStyles = useMemo(() => makeFormStyles(activeTheme), [activeTheme]);
    const fadeAnim = useRef(new Animated.Value(error ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: error ? 1 : 0,
            duration: 150,
            useNativeDriver: true,
        }).start();
    }, [error]);

    const handleChangeText = (text: string) => {
        onChangeText?.(text);
        if (error && onClearError) {
            onClearError();
        }
    };

    return (
        <View style={formStyles.wrapper}>
            {label && (
                <Text style={formStyles.label}>
                    {label}
                </Text>
            )}
            <TextInput
                {...inputProps}
                autoCapitalize = {capitalOnly ? "characters" : "none"}
                editable={!disabled}
                style={[
                    formStyles.input,
                    disabled && formStyles.inputDisabled,
                    error && formStyles.errorBorder,
                    style,
                ]}
                placeholderTextColor={activeTheme.color.muted}
                onChangeText={handleChangeText} />
            {!hideDetails && (
                <Animated.View style={[formStyles.errorContainer, { opacity: fadeAnim }]}>
                    <Text style={activeTheme.typography.variants.error}>{error || ' '}</Text>
                </Animated.View>
            )}
        </View>
    );
};
