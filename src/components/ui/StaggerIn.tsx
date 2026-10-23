// src/components/ui/StaggerIn.tsx
// A list row's entrance: it drops in from slightly above and fades in, each row a beat after the one before
// (index), so a list cascades in rather than appearing all at once. Runs once, when the row first shows.
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';

// Rows past this many start together, so a long list doesn't take ages to finish coming in
const MAX_STAGGERED = 8;
const STEP_MS = 60;

type StaggerInProps = {
    // The row's place in the list; pass 0 for a row added later so it comes in straight away
    index: number;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
};

export function StaggerIn({ index, children, style }: StaggerInProps) {
    const enterY = useRef(new Animated.Value(-20)).current;
    const enterOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const delay = Math.min(index, MAX_STAGGERED) * STEP_MS;
        Animated.parallel([
            Animated.timing(enterY, {
                toValue: 0,
                duration: 320,
                delay,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(enterOpacity, {
                toValue: 1,
                duration: 280,
                delay,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View style={[{ opacity: enterOpacity, transform: [{ translateY: enterY }] }, style]}>
            {children}
        </Animated.View>
    );
}
