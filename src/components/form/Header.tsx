// src/components/form/Header.tsx
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';

type Props = {
    theme: ReturnType<typeof import('../../theme/theme').createTheme>;
    title: string;
    subtitle?: string;
    logoSource?: ImageSourcePropType;
    containerStyle?: ViewStyle | ViewStyle[];
    rightContent?: () => React.ReactNode;
};

export const FormHeader: React.FC<Props> = ({
    theme,
    title,
    subtitle,
    logoSource,
    containerStyle,
    rightContent,
}) => {
    const activeTheme = theme ?? useTheme();
    return (
        <View style={[styles.headerRow, activeTheme.utils.mbsm, containerStyle]}>
            {logoSource && (
                <Image
                    source={logoSource}
                    style={styles.logo}
                    resizeMode="contain" />
            )}
            <View style={[styles.headerTextWrapper, { flex: 1 }]}>
                <Text style={activeTheme.typography.variants.title}>{title}</Text>
                {subtitle ? (
                    <Text style={activeTheme.typography.variants.subtitle}>{subtitle}</Text>
                ) : null}
            </View>
            {rightContent ? rightContent() : null}
        </View>
    );
};

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 48,
        height: 48,
        marginRight: 12,
    },
    headerTextWrapper: {
        flexShrink: 1,
    },
});
