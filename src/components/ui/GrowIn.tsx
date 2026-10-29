// src/components/ui/GrowIn.tsx
// Opens its content from nothing - growing to its full height while it fades in - so a banner or notice that turns
// up pushes the page down smoothly instead of popping in. Runs when it first shows; unmount and remount to replay.
import React, { useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

type GrowInProps = {
    children: React.ReactNode;
    duration?: number;
};

export function GrowIn({ children, duration = 280 }: GrowInProps) {
    const height = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const opened = useRef(false);

    // Measures the content at its full height, then opens to it (later size changes just follow along)
    const grow = (measured: number) => {
        if (opened.current) {
            height.setValue(measured);
            return;
        }
        opened.current = true;
        Animated.parallel([
            Animated.timing(height, { toValue: measured, duration, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
            Animated.timing(opacity, { toValue: 1, duration, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
        ]).start();
    };

    return (
        <Animated.View style={{ height, opacity, overflow: 'hidden' }}>
            {/* Laid out at its full height (not squeezed by the growing box) so it can be measured */}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0 }} onLayout={(e) => grow(e.nativeEvent.layout.height)}>
                {children}
            </View>
        </Animated.View>
    );
}
