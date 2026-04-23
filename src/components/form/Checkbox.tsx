// src/components/form/Checkbox.tsx
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import {
    GestureResponderEvent,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useTheme } from '../../providers/ThemeProvider';
import { makeFormStyles } from './styles';


type FormCheckboxProps = {
    label: string;
    value: boolean;
    onValueChange: (next: boolean) => void;
    helperText?: string;
    error?: string | string[];
    disabled?: boolean;
    /** Optional: make the whole row pressable (default true) */
    fullWidthPressable?: boolean;
};

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
    label,
    value,
    onValueChange,
    helperText,
    error,
    disabled = false,
    fullWidthPressable = true,
}) => {
    const theme = useTheme();
    const formStyles = React.useMemo(() => makeFormStyles(theme), [theme]);

    const hasError = !!(error && (Array.isArray(error) ? error.length : true));
    const errorText = Array.isArray(error) ? error.join('\n') : error;

    const handlePress = (e: GestureResponderEvent) => {
    if (disabled) return;
    onValueChange(!value);
    };

    const Wrapper = fullWidthPressable ? Pressable : View;

    return (
        <View style={styles.container}>
            <Wrapper
                onPress={fullWidthPressable ? handlePress : undefined}
                style={({ pressed }) => [
                    styles.row,
                    {
                        opacity: disabled ? 0.5 : pressed && !disabled ? 0.85 : 1,
                    },
                ]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: value, disabled }}>
                <Pressable
                    onPress={handlePress}
                    hitSlop={8}
                    disabled={disabled}
                    style={({ pressed }) => [
                        styles.box,
                        {
                             borderColor: hasError ? theme.color.danger : theme.color.border ?? '#CCC',
                            backgroundColor: value ? theme.color.primary : theme.color.background,
                            opacity: pressed && !disabled ? 0.9 : 1,
                        },
                    ]}>
                    {value && (
                        <MaterialIcons
                            name="check"
                            size={16}
                            color={theme.color.buttonText.primary ?? '#fff'}
                        />
                    )}
                </Pressable>
                <View style={styles.textContainer}>
                    <Text
                        style={[
                            formStyles.inlineLabel,
                        ]}>
                        {label}
                    </Text>
                    {helperText ? (
                        <Text
                            style={[
                                formStyles.helper,
                            ]}>
                            {helperText}
                        </Text>
                    ) : null}
                </View>
            </Wrapper>
            {hasError && errorText ? (
                <Text style={[formStyles.error]}>
                    {errorText}
                </Text>
            ) : null}
        </View>
    );
};

const BOX_SIZE = 22;

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    box: {
        width: BOX_SIZE,
        height: BOX_SIZE,
        borderRadius: 4,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerDot: {
        width: BOX_SIZE - 8,
        height: BOX_SIZE - 8,
        borderRadius: 3,
        backgroundColor: 'white',
    },
    textContainer: {
        marginLeft: 10,
        flex: 1,
    },
    label: {},
    helper: {},
    error: {},
});
