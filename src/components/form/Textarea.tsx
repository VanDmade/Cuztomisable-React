// src/components/form/Textarea.tsx
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { Theme } from '../../theme/theme';
import { makeFormStyles } from './styles';

type FormTextareaProps = {
    theme?: Theme;
    label?: string;
    error?: string;
    disabled?: boolean;
    onChangeText?: (text: string) => void;
    onClearError?: () => void;
    minHeight?: number;
} & TextInputProps;

export const FormTextarea: React.FC<FormTextareaProps> = ({
    theme,
    label,
    error,
    disabled = false,
    onChangeText,
    onClearError,
    minHeight = 120,
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
            {label && (<Text style={formStyles.label}>{label}</Text>)}
            <TextInput
                {...inputProps}
                multiline
                textAlignVertical="top"
                editable={!disabled}
                style={[
                    formStyles.inputGrowing,
                    { minHeight },
                    disabled && formStyles.inputDisabled,
                    error && formStyles.errorBorder,
                    style,
                ]}
                placeholderTextColor={activeTheme.color.muted ?? '#AAA'}
                onChangeText={handleChangeText}
            />
            <Animated.View style={[formStyles.errorContainer, { opacity: fadeAnim }]}>
                <Text style={activeTheme.typography.variants.error}>{error || ' '}</Text>
            </Animated.View>
        </View>
    );
};
