// src/components/ui/ModalTitle.tsx
// A modal's title (on the left) with a close (X) button in the top-right corner - the modal's way out, so its own
// actions can be a single full-width button.
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';

type Props = {
    title: string;
    onClose: () => void;
    closeDisabled?: boolean;
};

export function ModalTitle({ title, onClose, closeDisabled }: Props) {
    const theme = useTheme();
    return (
        <View style={styles.row}>
            <Text style={[styles.title, { color: theme.color.text }]}>{title}</Text>
            <TouchableOpacity
                onPress={onClose}
                disabled={closeDisabled}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Close"
                style={[styles.side, styles.close, closeDisabled && { opacity: 0.4 }]}>
                <MaterialIcons name="close" size={22} color={theme.color.muted} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'flex-start' },
    side: { width: 28 },
    close: { alignItems: 'flex-end', paddingTop: 1 },
    title: { flex: 1, fontSize: 18, fontWeight: '600', textAlign: 'left', marginRight: 12 },
});
