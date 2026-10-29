// src/components/form/Tabs.tsx
// A form's sections as underline tabs: plain labels on the page background with a line that slides under the open
// one, and a red count when a section has errors. Put it straight under a TopNav with `borderless`, so the header
// and tabs read as one block with a single divider beneath.
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';

export type FormTab<K extends string = string> = { key: K; label: string };

type FormTabsProps<K extends string = string> = {
    tabs: FormTab<K>[];
    tab: K;
    onPress: (tab: K) => void;
    // How many errors each tab has - shown as a badge
    errorCounts?: Partial<Record<K, number>>;
};

const INDICATOR_HEIGHT = 3;

export function FormTabs<K extends string = string>({ tabs, tab, onPress, errorCounts }: FormTabsProps<K>) {
    const theme = useTheme();
    const [width, setWidth] = useState(0);
    const index = Math.max(0, tabs.findIndex((item) => item.key === tab));
    const tabWidth = tabs.length ? width / tabs.length : 0;

    // The underline slides to the open tab
    const position = useRef(new Animated.Value(0)).current;
    const placed = useRef(false);
    useEffect(() => {
        if (!tabWidth) {
            return;
        }
        const toValue = index * tabWidth;
        if (!placed.current) {
            // First layout: start under the open tab rather than sliding in from the left
            position.setValue(toValue);
            placed.current = true;
            return;
        }
        Animated.timing(position, { toValue, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    }, [index, tabWidth]);

    return (
        <View
            style={[styles.bar, { backgroundColor: theme.color.background, borderBottomColor: theme.color.border }]}
            onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
            {tabs.map(({ key, label }) => {
                const active = key === tab;
                const count = errorCounts?.[key] ?? 0;
                return (
                    <Pressable
                        key={key}
                        onPress={() => onPress(key)}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: active }}
                        accessibilityLabel={count ? `${label}, ${count} ${count === 1 ? 'error' : 'errors'}` : label}
                        style={({ pressed }) => [styles.tab, pressed && { opacity: 0.6 }]}>
                        <Text
                            numberOfLines={1}
                            style={[styles.text, { color: active ? theme.color.primary : theme.color.muted }, active && styles.activeText]}>
                            {label}
                        </Text>
                        {count > 0 && (
                            <View style={[styles.badge, { backgroundColor: theme.color.danger }]}>
                                <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
                            </View>
                        )}
                    </Pressable>
                );
            })}
            {tabWidth > 0 && (
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.indicator,
                        { width: tabWidth, backgroundColor: theme.color.primary, transform: [{ translateX: position }] },
                    ]} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    tab: {
        flex: 1,
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: 6,
    },
    text: {
        fontSize: 14,
        fontWeight: '500',
    },
    activeText: {
        fontWeight: '700',
    },
    indicator: {
        position: 'absolute',
        left: 0,
        bottom: -1,
        height: INDICATOR_HEIGHT,
        borderTopLeftRadius: INDICATOR_HEIGHT,
        borderTopRightRadius: INDICATOR_HEIGHT,
    },
    badge: {
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        paddingHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },
});
