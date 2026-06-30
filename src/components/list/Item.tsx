// src/components/list/Item.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FormToggle } from '../../components/form/Toggle';
import { useTheme } from '../../providers/ThemeProvider';

type Props = {
    title: string;
    subtitle?: string;
    onPress?: () => void;
    toggle?: boolean;
    onToggle?: (v: boolean) => void;
    danger?: boolean;
    endItem?: boolean;
    busy?: boolean;
};

export const ListItem: React.FC<Props> = ({
    title,
    subtitle,
    onPress,
    toggle = undefined,
    onToggle = undefined,
    danger = false,
    endItem = false,
    busy = false,
}) => {
const theme = useTheme();
const isToggleItem = toggle !== undefined && onToggle !== undefined;

return (
    <TouchableOpacity
        disabled={isToggleItem || !onPress}
        onPress={isToggleItem ? undefined : onPress}
        activeOpacity={0.7}
        style={[
            styles.row,
            theme.utils.pxmd,
            subtitle ? theme.utils.pysm : theme.utils.pymd,
            !endItem && {
                borderBottomWidth: 1,
                borderBottomColor: theme.color.border,
            },
        ]}>
        <View style={styles.leftSide}>
            <Text
                style={[
                    styles.title,
                    danger && { color: theme.color.danger, fontWeight: '600' },
                    { color: theme.color.text },
                ]}>{title}</Text>
            {subtitle ? (
            <Text
                style={[
                    styles.subtitle,
                    { color: theme.color.primary },
                ]}>
                {subtitle}
            </Text>
        ) : null}
        </View>
        {/* Removed invalid FormToggle without label prop */}
            {isToggleItem && (<FormToggle label="" value={toggle} disabled={busy} onValueChange={onToggle} />)}
    </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    row: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    leftSide: {
        flex: 1,
    },
    title: {
        fontSize: 16,
    },
    subtitle: {
        fontSize: 12,
        marginTop: 2,
    },
});
