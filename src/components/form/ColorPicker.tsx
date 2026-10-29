// src/components/form/ColorPicker.tsx
// Pick any color: drag on the square for how strong / bright it is, and along the bar for the hue.
// Optional preset swatches sit above for one-tap picks.
import React, { useEffect, useId, useRef, useState } from 'react';
import { GestureResponderEvent, LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '../../providers/ThemeProvider';
import { Theme } from '../../theme/theme';

type Hsv = { h: number; s: number; v: number };

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));

export function hsvToHex({ h, s, v }: Hsv): string {
    const f = (n: number) => {
        const k = (n + h / 60) % 6;
        return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
    };
    const hex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
    return `#${hex(f(5))}${hex(f(3))}${hex(f(1))}`.toUpperCase();
}

export function hexToHsv(value: string): Hsv | null {
    const match = value.trim().match(/^#?([0-9a-f]{6}|[0-9a-f]{3})$/i);
    if (!match) {
        return null;
    }
    const raw = match[1].length === 3 ? match[1].split('').map((c) => c + c).join('') : match[1];
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(raw.slice(i, i + 2), 16) / 255);
    const max = Math.max(r, g, b);
    const delta = max - Math.min(r, g, b);
    let h = 0;
    if (delta) {
        if (max === r) {
            h = 60 * (((g - b) / delta) % 6);
        }
        else if (max === g) h = 60 * ((b - r) / delta + 2);
        else h = 60 * ((r - g) / delta + 4);
    }
    return { h: (h + 360) % 360, s: max ? delta / max : 0, v: max };
}

type ColorPickerProps = {
    theme?: Theme;
    value: string;
    onChange: (hex: string) => void;
    // One-tap colors shown above the picker
    presets?: string[];
    // Told when a drag starts (true) and ends (false) - turn off scrolling around the picker meanwhile, since a
    // native scroll view can't be stopped from inside it
    onDragChange?: (dragging: boolean) => void;
};

const SQUARE_HEIGHT = 160;
const HUE_HEIGHT = 24;
const THUMB = 22;
const HUES = ['#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FF0000'];

export const ColorPicker: React.FC<ColorPickerProps> = ({ theme, value, onChange, presets, onDragChange }) => {
    const contextTheme = useTheme();
    const activeTheme = theme ?? contextTheme;
    // Gradient ids are page-wide on web, so each picker gets its own
    const id = useId().replace(/[^a-zA-Z0-9]/g, '');

    const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value) ?? { h: 0, s: 1, v: 1 });
    // The latest color, for drag handlers that fire faster than re-renders
    const hsvRef = useRef(hsv);
    hsvRef.current = hsv;
    const [width, setWidth] = useState(0);

    // Follows a color set from outside (a preset, or a reset) without losing the hue on greys
    useEffect(() => {
        if (value.toUpperCase() !== hsvToHex(hsv)) {
            const next = hexToHsv(value);
            if (next) setHsv(next.s === 0 ? { ...next, h: hsv.h } : next);
        }
    }, [value]);

    const update = (next: Hsv) => {
        hsvRef.current = next;
        setHsv(next);
        onChange(hsvToHex(next));
    };

    // A thumb's centre runs right to each edge, so half the circle sits outside the picker there - leave about
    // THUMB / 2 of room around it (a scroll view's own padding, say) so nothing cuts it off
    const onSquare = (x: number, y: number) => {
        update({ ...hsvRef.current, s: clamp(x / width), v: 1 - clamp(y / SQUARE_HEIGHT) });
    };

    const onHue = (x: number) => {
        update({ ...hsvRef.current, h: clamp(x / width) * 359.9 });
    };

    // Where the finger went down, in the area and on the screen. locationX/Y are only right while the finger is over
    // the area (off it they're measured against whatever is under the finger, so the color jumps) - so a drag follows
    // how far the finger has moved on screen from there instead, and holds at the edge once it's past it.
    const start = useRef({ x: 0, y: 0, pageX: 0, pageY: 0 });
    const drag = (handler: (x: number, y: number) => void) => ({
        // Claims the drag from the scroll view around it, so dragging moves the color, not the page
        onStartShouldSetResponder: () => true,
        onMoveShouldSetResponder: () => true,
        onResponderTerminationRequest: () => false,
        onResponderGrant: (e: GestureResponderEvent) => {
            const { locationX, locationY, pageX, pageY } = e.nativeEvent;
            start.current = { x: locationX, y: locationY, pageX, pageY };
            onDragChange?.(true);
            if (width) {
                handler(locationX, locationY);
            }
        },
        onResponderRelease: () => onDragChange?.(false),
        onResponderTerminate: () => onDragChange?.(false),
        onResponderMove: (e: GestureResponderEvent) => {
            const { pageX, pageY } = e.nativeEvent;
            if (width) {
                handler(start.current.x + pageX - start.current.pageX, start.current.y + pageY - start.current.pageY);
            }
        },
    });

    const hueColor = hsvToHex({ h: hsv.h, s: 1, v: 1 });
    return (
        <View>
            {presets?.length ? (
                <View style={styles.presets}>
                    {presets.map((color) => (
                        <Pressable
                            key={color}
                            onPress={() => onChange(color.toUpperCase())}
                            accessibilityLabel={`Color ${color}`}
                            style={[
                                styles.preset,
                                { backgroundColor: color, borderColor: activeTheme.color.border },
                                value.toUpperCase() === color.toUpperCase() && { borderColor: activeTheme.color.primary, borderWidth: 3 },
                            ]} />
                    ))}
                </View>
            ) : null}
            <View
                style={styles.square}
                onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
                {...drag(onSquare)}>
                {/* The hue, faded to white to the left and to black downwards - rounded here rather than clipped, so
                    the thumb shows whole at the edges */}
                <Svg width="100%" height={SQUARE_HEIGHT} pointerEvents="none">
                    <Defs>
                        <LinearGradient id={`${id}white`} x1="0" y1="0" x2="1" y2="0">
                            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
                            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
                        </LinearGradient>
                        <LinearGradient id={`${id}black`} x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor="#000000" stopOpacity="0" />
                            <Stop offset="1" stopColor="#000000" stopOpacity="1" />
                        </LinearGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" rx={10} fill={hueColor} />
                    <Rect x="0" y="0" width="100%" height="100%" rx={10} fill={`url(#${id}white)`} />
                    <Rect x="0" y="0" width="100%" height="100%" rx={10} fill={`url(#${id}black)`} />
                </Svg>
                <View
                    pointerEvents="none"
                    style={[styles.thumb, {
                        left: hsv.s * width - THUMB / 2,
                        top: (1 - hsv.v) * SQUARE_HEIGHT - THUMB / 2,
                        backgroundColor: value,
                    }]} />
            </View>
            <View style={styles.hue} {...drag(onHue)}>
                <Svg width="100%" height={HUE_HEIGHT} pointerEvents="none">
                    <Defs>
                        <LinearGradient id={`${id}hue`} x1="0" y1="0" x2="1" y2="0">
                            {HUES.map((color, i) => (
                                <Stop key={i} offset={String(i / (HUES.length - 1))} stopColor={color} />
                            ))}
                        </LinearGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" rx={HUE_HEIGHT / 2} fill={`url(#${id}hue)`} />
                </Svg>
                <View
                    pointerEvents="none"
                    style={[styles.thumb, { left: (hsv.h / 360) * width - THUMB / 2, top: (HUE_HEIGHT - THUMB) / 2, backgroundColor: hueColor }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    presets: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 14,
    },
    preset: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 2,
    },
    square: {
        height: SQUARE_HEIGHT,
    },
    hue: {
        height: HUE_HEIGHT,
        marginTop: 14,
        justifyContent: 'center',
    },
    thumb: {
        position: 'absolute',
        width: THUMB,
        height: THUMB,
        borderRadius: THUMB / 2,
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
        elevation: 3,
    },
});
