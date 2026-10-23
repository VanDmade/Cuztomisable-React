// src/components/form/SaveBar.tsx
// A form's Save button, pinned to the bottom of the screen below the scrolling fields - always in reach, no
// scrolling to the end to find it. Cancelling is the top nav's back arrow. `before` / `after` put another button (e.g.
// an add button) to the left / right of Save.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../providers/ThemeProvider';
import Button from '../ui/Button';

type Props = {
    onSave: () => void;
    title?: string;
    disabled?: boolean;
    before?: React.ReactNode;
    after?: React.ReactNode;
};

export function FormSaveBar({ onSave, title = 'Save', disabled, before, after }: Props) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    return (
        <View style={[styles.bar, {
            backgroundColor: theme.color.background,
            borderTopColor: theme.color.border,
            // Clears the home indicator on phones that have one
            paddingBottom: 12 + insets.bottom,
        }]}>
            {before}
            <View style={styles.save}>
                <Button title={title} intent="primary" fullWidth onPress={onSave} disabled={disabled} />
            </View>
            {after}
        </View>
    );
}

const styles = StyleSheet.create({
    bar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
    save: { flex: 1 },
});
