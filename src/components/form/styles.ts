import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme/theme';

// Every single-line field - inputs, selects, pickers - is this tall, so fields side by side always line up. Fields that
// hold more (multi-selects as their chips wrap, textareas) start here and grow.
export const FIELD_HEIGHT = 49;

export const makeFormStyles = (theme: Theme) => {
    const inputBase = {
        fontSize: theme.typography.sizes.sm,
        borderWidth: 1,
        borderColor: theme.color.border,
        borderRadius: 10,
        paddingHorizontal: 16,
        color: theme.color.text,
        backgroundColor: theme.color.surface,
    };
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
        // A toggle's / checkbox's label - the same as a field's label, so a form reads as one set
        inlineLabel: {
            fontSize: 14,
            fontWeight: '600',
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
        // A single-line field: always FIELD_HEIGHT, text centred
        input: {
            ...inputBase,
            height: FIELD_HEIGHT,
            paddingVertical: 0,
            textAlignVertical: 'center',
        },
        // A field that grows with what's in it (textarea, multi-select) - never shorter than a single-line one
        inputGrowing: {
            ...inputBase,
            minHeight: FIELD_HEIGHT,
            paddingVertical: 14,
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