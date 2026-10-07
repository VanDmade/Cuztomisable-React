import React, { useMemo } from 'react';
import {
    ActivityIndicator,
    GestureResponderEvent,
    Pressable,
    PressableProps,
    StyleProp,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';

import { useTheme } from '../../providers/ThemeProvider';
import type { Color } from '../../theme/colors';

type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'text';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type ButtonIntent =
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'ternary'
    | 'danger'
    | 'success'
    | 'info'
    | 'warning';

export type ThemeColors = Color;

type ButtonColors = {
    background?: string;
    foreground?: string;
    border?: string;
    pressedBackground?: string;
    disabledBackground?: string;
    disabledForeground?: string;
};

export type ButtonProps = Omit<PressableProps, 'style' | 'children' | 'onPress'> & {
    title?: string;
    left?: React.ReactNode;
    right?: React.ReactNode;
    children?: React.ReactNode;
    variant?: ButtonVariant;
    intent?: ButtonIntent;
    themeColors?: ThemeColors;
    size?: ButtonSize;
    radius?: number;
    fullWidth?: boolean;
    disabled?: boolean;
    loading?: boolean;
    spinnerColor?: string;
    colors?: ButtonColors;
    paddingHorizontal?: number;
    paddingVertical?: number;
    gap?: number;
    align?: 'left' | 'center' | 'right';
    textStyle?: StyleProp<TextStyle>;
    textNumberOfLines?: number;
    textAllowFontScaling?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    buttonStyle?: StyleProp<ViewStyle>;
    shadow?: boolean;
    shadowStyle?: StyleProp<ViewStyle>;
    minWidth?: number;
    minHeight?: number;
    hitSlopPadding?: number;
    iconOnly?: boolean;
    onPress?: (event: GestureResponderEvent) => void;
};

const SIZE_PRESETS: Record<ButtonSize, { px: number; py: number; fontSize: number; minHeight: number }> = {
    xs: { px: 10, py: 6, fontSize: 12, minHeight: 32 },
    sm: { px: 12, py: 8, fontSize: 14, minHeight: 36 },
    md: { px: 14, py: 10, fontSize: 16, minHeight: 42 },
    lg: { px: 16, py: 12, fontSize: 18, minHeight: 48 },
    xl: { px: 18, py: 14, fontSize: 20, minHeight: 56 },
};

function isNumber(v: unknown): v is number {
    return typeof v === 'number' && Number.isFinite(v);
}

function resolveIntentColors(theme: ThemeColors, intent: ButtonIntent, variant: ButtonVariant) {
    const intentColor = theme[intent];
    const intentTextColor = theme.buttonText?.[intent] || theme.buttonTextColor;

    if (variant === 'solid') {
        return {
            background: intentColor,
            foreground: intentTextColor,
            border: intentColor,
            pressedBackground: 'rgba(0,0,0,0.10)',
            disabledBackground: theme.border,
            disabledForeground: theme.muted,
        };
    }

    if (variant === 'outline') {
        return {
            background: 'transparent',
            foreground: intentColor,
            border: intentColor,
            pressedBackground: 'rgba(0,0,0,0.06)',
            disabledBackground: 'transparent',
            disabledForeground: theme.muted,
        };
    }

    if (variant === 'text' || variant === 'ghost') {
        return {
            background: 'transparent',
            foreground: theme.buttonTextColorInverse,
            border: 'transparent',
            pressedBackground: 'rgba(0,0,0,0.04)',
            disabledBackground: 'transparent',
            disabledForeground: theme.muted,
        };
    }

    return {
        background: 'transparent',
        foreground: intentColor,
        border: 'transparent',
        pressedBackground: 'rgba(0,0,0,0.06)',
        disabledBackground: 'transparent',
        disabledForeground: theme.muted,
    };
}

export default function Button({
    title,
    left,
    right,
    children,
    variant = 'solid',
    intent = 'primary',
    themeColors,
    size = 'md',
    radius = 14,
    fullWidth = false,
    disabled = false,
    loading = false,
    spinnerColor,
    colors,
    paddingHorizontal,
    paddingVertical,
    gap,
    align = 'center',
    textStyle,
    textNumberOfLines = 1,
    textAllowFontScaling = true,
    containerStyle,
    buttonStyle,
    shadow = false,
    shadowStyle,
    minWidth,
    minHeight,
    hitSlopPadding = 8,
    iconOnly = false,
    onPress,
    ...pressableProps
}: ButtonProps) {
    const { color, typography, spacing } = useTheme();

    const theme = themeColors ?? color;
    const preset = SIZE_PRESETS[size];

    const computedGap = gap ?? spacing.sm;

    const computed = useMemo(() => {
        const base = resolveIntentColors(theme, intent, variant);

        const merged = {
            background: colors?.background ?? base.background,
            foreground: colors?.foreground ?? base.foreground,
            border: colors?.border ?? base.border,
            pressedBackground: colors?.pressedBackground ?? base.pressedBackground,
            disabledBackground: colors?.disabledBackground ?? base.disabledBackground,
            disabledForeground: colors?.disabledForeground ?? base.disabledForeground,
        };

        const isDisabled = disabled || loading;

        if (variant === 'solid') {
            return {
                backgroundColor: isDisabled ? merged.disabledBackground : merged.background,
                borderColor: 'transparent',
                borderWidth: 0,
                foregroundColor: isDisabled ? merged.disabledForeground : merged.foreground,
                pressedOverlay: merged.pressedBackground,
            };
        }

        return {
            backgroundColor: 'transparent',
            borderColor: merged.border,
            borderWidth: variant === 'outline' ? 1 : 0,
            foregroundColor: isDisabled ? merged.disabledForeground : merged.foreground,
            pressedOverlay: merged.pressedBackground,
        };
    }, [theme, intent, variant, colors, disabled, loading]);

    const effectiveOnPress = (e: GestureResponderEvent) => {
        if (disabled || loading) return;
        onPress?.(e);
    };

    const justifyContent: ViewStyle['justifyContent'] =
        align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';

    const hitSlop =
        hitSlopPadding > 0
            ? { top: hitSlopPadding, bottom: hitSlopPadding, left: hitSlopPadding, right: hitSlopPadding }
            : undefined;

    const wantFull = fullWidth;

    const resolvedMinHeight = isNumber(minHeight) ? minHeight : preset.minHeight;
    const resolvedMinWidth = iconOnly
        ? isNumber(minWidth)
            ? minWidth
            : resolvedMinHeight
        : isNumber(minWidth)
        ? minWidth
        : undefined;

    return (
        <View style={containerStyle}>
            <Pressable
                {...pressableProps}
                hitSlop={hitSlop}
                accessibilityRole="button"
                accessibilityState={{ disabled: disabled || loading }}
                onPress={effectiveOnPress}
                style={[
                    {
                        width: iconOnly ? resolvedMinWidth : wantFull ? '100%' : undefined,
                        minWidth: resolvedMinWidth,
                        minHeight: resolvedMinHeight,
                        borderRadius: radius,
                        backgroundColor: computed.backgroundColor,
                        borderColor: computed.borderColor,
                        borderWidth: computed.borderWidth,
                        overflow: 'hidden',
                    },
                    shadow
                        ? [
                              {
                                  elevation: 2,
                                  shadowOpacity: 0.15,
                                  shadowRadius: 6,
                                  shadowOffset: { width: 0, height: 2 },
                              },
                              shadowStyle,
                          ]
                        : null,
                    buttonStyle,
                ]}
            >
                {({ pressed }) => (
                    <>
                        {pressed && !(disabled || loading) && (
                            <View
                                pointerEvents="none"
                                style={{
                                    ...ABSOLUTE_FILL,
                                    backgroundColor: computed.pressedOverlay,
                                }}
                            />
                        )}

                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent,
                                paddingHorizontal: isNumber(paddingHorizontal)
                                    ? paddingHorizontal
                                    : iconOnly
                                    ? preset.py
                                    : variant === 'text'
                                    ? 0
                                    : preset.px,
                                paddingVertical: isNumber(paddingVertical)
                                    ? paddingVertical
                                    : iconOnly
                                    ? preset.py
                                    : variant === 'text'
                                    ? 8
                                    : preset.py,
                                width: wantFull && !iconOnly ? '100%' : undefined,
                                gap: computedGap,
                            }}
                        >
                            {left && <View style={{ alignItems: 'center' }}>{left}</View>}

                            {!iconOnly &&
                                (children ? (
                                    children
                                ) : title ? (
                                    <Text
                                        style={[
                                            {
                                                color: computed.foregroundColor,
                                                fontSize: preset.fontSize,
                                                fontWeight: typography.weights.medium,
                                                flexShrink: 1,
                                            },
                                            textStyle,
                                        ]}
                                        numberOfLines={textNumberOfLines}
                                        allowFontScaling={textAllowFontScaling}
                                    >
                                        {title}
                                    </Text>
                                ) : null)}

                            {right && <View style={{ alignItems: 'center' }}>{right}</View>}

                            {loading && (
                                <ActivityIndicator
                                    size="small"
                                    color={spinnerColor ?? computed.foregroundColor}
                                    style={{ marginLeft: 8 }}
                                />
                            )}
                        </View>
                    </>
                )}
            </Pressable>
        </View>
    );
}

const ABSOLUTE_FILL: ViewStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
};