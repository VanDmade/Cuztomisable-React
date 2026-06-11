import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';

import { useTheme } from '../../providers/ThemeProvider';

export const Loading: React.FC<{
    text?: string;
    fadeOut?: boolean;
    loadingImageSource?: any;
    fullScreen?: boolean;
}> = ({
    text,
    fadeOut = false,
    loadingImageSource,
    fullScreen = false,
}) => {
    const { color, styles, utils, typography } = useTheme();

    const rotateAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const spin = Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 4800,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        spin.start();
        return () => spin.stop();
    }, [rotateAnim]);

    useEffect(() => {
        if (fadeOut) {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: true,
            }).start();
        } else {
            fadeAnim.setValue(1);
        }
    }, [fadeOut, fadeAnim]);

    const spinInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Animated.View
            style={[
                styles.container,
                styles.rowJustifyContentCenter,
                {
                    backgroundColor: color.background,
                    flex: 1,
                    opacity: fadeAnim,
                },
                fullScreen && localStyles.loadingOverlay,
            ]}>
            <Animated.Image
                source={loadingImageSource}
                style={[
                    localStyles.cog,
                    utils.mbsm,
                    {
                        tintColor: color.secondary,
                        transform: [{ rotate: spinInterpolate }],
                    },
                ]}
                resizeMode="contain" />
            {text && (
                <Text style={[styles.textCenter, typography.variants.body]}>
                    {text}
                </Text>
            )}
        </Animated.View>
    );
};

const localStyles = StyleSheet.create({
    cog: {
        width: 176,
        height: 176,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFill,
        zIndex: 999,
        elevation: 999,
    },
});