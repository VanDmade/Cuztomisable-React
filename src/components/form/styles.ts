import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme/theme';

export const makeFormStyles = (theme: Theme) => {
    return StyleSheet.create({
        wrapper: {
            width: '100%',
            marginBottom: 8,
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 6,
            color: theme.color.text,
        },
        inlineLabel: {
            fontSize: 15,
            fontWeight: '500',
            color: theme.color.text,
        },
        helper: {
            marginTop: 2,
            fontSize: 12,
            color: theme.color.muted ?? '#777',
        },
        error: {
            marginTop: 4,
            fontSize: 12,
            color: theme.color.danger,
        },
        errorContainer: {
            minHeight: 18,
        },
        errorBorder: {
            borderColor: theme.color.danger,
        },
        input: {
            fontSize: theme.typography.sizes.xs,
            borderWidth: 1,
            borderColor: theme.color.border,
            borderRadius: 10,
            padding: 16,
            color: theme.color.text,
            backgroundColor: theme.color.surface,
        },
        inputDisabled: {
            backgroundColor: theme.color.border,
            color: theme.color.muted,
        },
        chip: {
            borderRadius: 16,
            paddingHorizontal: 10,
            paddingVertical: 6,
            marginRight: 8,
            marginVertical: 1.125,
        },
        chipText: {
            fontSize: 12,
            fontWeight: '600',
        },
        chipRemove: {
            marginLeft: 6,
            fontWeight: '700',
        },
    });
};