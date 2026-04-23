import merge from 'lodash.merge';
import { StyleSheet } from 'react-native';
import { color, Color, ThemeMode } from './colors';
import { imageDefault } from './images';
import { getLayout, makeCircleUtils, makeSpacingUtils } from './spacing';
import { getTypography } from './typography';

export interface ThemeOverrides {
    color?: Partial<Record<ThemeMode, Partial<Color>>>;
    image?: Partial<typeof imageDefault>;
    layout?: {
        base?: number;
        radius?: Partial<ReturnType<typeof getLayout>['radius']>;
    };
    typography?: Partial<ReturnType<typeof getTypography>>;
}

export const createTheme = (
    mode: ThemeMode = 'light',
    overrides: ThemeOverrides = {}
) => {
    const mergedColor = merge({}, color, overrides.color);
    const colors = mergedColor[mode];
    const images = merge({}, imageDefault, overrides.image);

    const mergedLayout = getLayout({
        base: overrides.layout?.base,
        radius: overrides.layout?.radius,
    });

    const spacing = mergedLayout.spacing;
    const radius = mergedLayout.radius;

    const utils = {
        ...makeSpacingUtils(mergedLayout),
        ...makeCircleUtils(),
    };

    const typography = merge(
        {},
        getTypography(colors),
        overrides.typography
    );

    const styles = StyleSheet.create({
        widthFull: { width: '100%' },
        heightFull: { height: '100%' },
        flex: { flex: 1 },
        container: {
            width: '100%',
        },
        screen: {
            flex: 1,
        },
        button: {
            backgroundColor: colors.primary,
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: 'center',
        },
        disabledButton: {
            opacity: 0.6,
        },
        buttonText: {
            color: colors.background,
            // @ts-expect-error
            fontWeight: typography.weights.bold,
            fontSize: typography.sizes.sm,
        },
        image: {
            width: '80%',
            height: 260,
            marginBottom: 24,
            alignSelf: 'center',
        },
        backdrop: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
        },
        chevron: {
            marginLeft: 8,
            fontSize: 12,
            color: colors.text,
        },
        backdropHitbox: {
            ...StyleSheet.absoluteFillObject,
        },
        background: {
            backgroundColor: colors.background,
        },
        textCenter: { textAlign: 'center' },
        alignCenter: { alignItems: 'center' },
        alignSelfCenter: { alignSelf: 'center' },
        justifyCenter: { justifyContent: 'center' },
        textRight: { textAlign: 'right' },
        alignRight: { alignItems: 'flex-end' },
        alignSelfRight: { alignSelf: 'flex-end' },
        justifyRight: { justifyContent: 'flex-end' },
        textLeft: { textAlign: 'left' },
        alignLeft: { alignItems: 'flex-start' },
        alignSelfLeft: { alignSelf: 'flex-start' },
        justifyLeft: { justifyContent: 'flex-start' },
        positionAbsolute: { position: 'absolute' },
        positionRelative: { position: 'relative' },
        row: { flexDirection: 'row', alignItems: 'center' },
        rowSpaceBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
        rowSpaceEvenly: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' },
        rowFlexStart: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
        rowJustifyContentCenter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
        rowSelected: {
            backgroundColor: 'rgba(0,0,0,0.25)',
        },
        rowLeft: {
            flexShrink: 1,
        },
        rowLabel: {
            fontSize: 16,
            fontWeight: '500',
            color: colors.text,
        },
        rowDesc: {
            fontSize: 13,
            color: colors.muted,
            marginTop: 2,
        },
        rowRight: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginLeft: 12,
        },
        rowRightText: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
        },
        divider: {
            width: 1,
            alignSelf: 'stretch',
            marginHorizontal: 4,
            backgroundColor: colors.border,
        },
    });

    return {
        mode,
        color: colors,
        image: images,
        spacing,
        radius,
        typography,
        styles,
        utils,
    } as const;
};

export type Theme = ReturnType<typeof createTheme>;