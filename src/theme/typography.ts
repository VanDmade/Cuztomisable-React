// src/theme/typography.ts
import { Color } from './colors';

const fontFamily = {
    regular: 'System',
    bold: 'System',
};

const sizes = {
    xxs: 10,
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    xxl: 36,
};

const weights = {
    light: '300',
    regular: '400',
    medium: '500',
    bold: '700',
};

export const getTypography = (colors: Color) => {
    return {
        fontFamily,
        sizes,
        weights,
        variants: {
            title: {
                fontSize: sizes.lg,
                fontWeight: weights.bold,
                color: colors.text,
            },
            subtitle: {
                fontSize: sizes.sm,
                color: colors.muted,
            },
            body: {
                fontSize: sizes.md,
                color: colors.text,
            },
            caption: {
                fontSize: sizes.xs,
                color: colors.muted,
            },
            muted: {
                fontSize: sizes.xs,
                color: colors.muted,
            },
            link: {
                fontSize: sizes.xs,
                color: colors.link,
                fontWeight: weights.medium,
            },
            error: {
                fontSize: sizes.xxs,
                color: colors.danger,
            },
            placeholder: {
                color: colors.muted,
                fontWeight: '400',
            },
        },
    } as const;
};

export type Typography = ReturnType<typeof getTypography>;