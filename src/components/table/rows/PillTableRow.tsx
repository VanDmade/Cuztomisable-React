import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Easing,
    Image,
    ImageStyle,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

import Swipeable from 'react-native-gesture-handler/Swipeable';

export type PillTableRowProps<T> = {
    item: T;
    index: number;
    theme: any;

    rowKey?: (row: T, index: number) => string | number;
    onRowPress?: (row: T) => void;

    renderLeftActions?: (
        progress: Animated.AnimatedInterpolation<number>,
        item: T
    ) => React.ReactNode;

    renderRightActions?: (
        progress: Animated.AnimatedInterpolation<number>,
        item: T
    ) => React.ReactNode;
    getImageSource?: (row: T) => string | undefined;
    getTitle?: (row: T) => string;
    getSubtitle?: (row: T) => string | undefined;
    getInfo?: (row: T) => React.ReactNode;
    pillStyle?: ViewStyle;
    imageStyle?: ImageStyle;
    titleStyle?: TextStyle;
    subtitleStyle?: TextStyle;
    leftActionsOffset?: number;
    rightActionsOffset?: number;
    flashColor?: string;
    flashTrigger?: number;
    closeTrigger?: number;
};

export function PillTableRow<T>({
    item,
    index,
    theme,
    rowKey,
    onRowPress,
    renderLeftActions,
    renderRightActions,
    getImageSource,
    getTitle,
    getSubtitle,
    getInfo,
    pillStyle,
    imageStyle,
    titleStyle,
    subtitleStyle,
    leftActionsOffset = 75,
    rightActionsOffset = 0,
    flashColor,
    flashTrigger,
    closeTrigger,
}: PillTableRowProps<T>) {
    const RowComponent = onRowPress ? TouchableOpacity : View;

    const imageSrc = getImageSource ? getImageSource(item) : undefined;
    const title = getTitle ? getTitle(item) : '';
    const subtitle = getSubtitle ? getSubtitle(item) : undefined;
    const isUriImage = typeof imageSrc === 'string';
    const [imageLoading, setImageLoading] = useState(isUriImage);

    const [isSwiping, setIsSwiping] = useState(false);
    const [anySwipeOpen, setAnySwipeOpen] = useState(false);
    const swipeRef = useRef<Swipeable>(null);
    const titleShift = useRef(new Animated.Value(0)).current;
    const imageOpacity = useRef(new Animated.Value(1)).current;

    const flashOpacity = useRef(new Animated.Value(0)).current;
    const [activeFlashColor, setActiveFlashColor] = useState('transparent');

    const enterY = useRef(new Animated.Value(-20)).current;
    const enterOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const delay = Math.min(index, 8) * 60;
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

    const runFlash = (color: string, intensity: number, inMs: number, outMs: number) => {
        setActiveFlashColor(color);
        flashOpacity.setValue(0);
        Animated.sequence([
            Animated.timing(flashOpacity, { toValue: intensity, duration: inMs, useNativeDriver: true }),
            Animated.timing(flashOpacity, { toValue: 0, duration: outMs, useNativeDriver: true }),
        ]).start();
    };

    const isMounted = useRef(false);
    useEffect(() => {
        if (!isMounted.current) { isMounted.current = true; return; }
        if (!flashTrigger || !flashColor) return;
        runFlash(flashColor, 1, 150, 750);
    }, [flashTrigger]);

    useEffect(() => {
        if (!closeTrigger) return;
        swipeRef.current?.close();
    }, [closeTrigger]);

    const springTitle = (toValue: number) =>
        Animated.spring(titleShift, {
            toValue,
            useNativeDriver: true,
            tension: 90,
            friction: 20,
        }).start();

    const borderRadius = anySwipeOpen ? 0 : 12;

    return (
        <Animated.View style={{ opacity: enterOpacity, transform: [{ translateY: enterY }] }}>
        <Swipeable
            ref={swipeRef}
            renderLeftActions={
                renderLeftActions
                    ? (progress) => renderLeftActions(progress, item)
                    : undefined
            }
            renderRightActions={
                renderRightActions
                    ? (progress) => renderRightActions(progress, item)
                    : undefined
            }
            overshootLeft={false}
            overshootRight={false}
            friction={1.5}
            leftThreshold={24}
            rightThreshold={24}
            enableTrackpadTwoFingerGesture
            activeOffsetX={[-10, 10]}
            failOffsetY={[-10, 10]}
            onSwipeableWillOpen={(direction) => {
                setAnySwipeOpen(true);
                const isLeft = direction === 'right';
                setIsSwiping(isLeft);
                if (isLeft) {
                    springTitle(leftActionsOffset);
                    Animated.timing(imageOpacity, { toValue: 0, duration: 120, useNativeDriver: true }).start();
                } else {
                    if (rightActionsOffset) springTitle(-rightActionsOffset);
                }
            }}
            onSwipeableWillClose={() => {
                setAnySwipeOpen(false);
                setIsSwiping(false);
                springTitle(0);
                Animated.timing(imageOpacity, { toValue: 1, duration: 120, useNativeDriver: true }).start();
            }}>
            <RowComponent
                delayPressIn={150}
                key={rowKey ? rowKey(item, index) : index}
                style={[
                    {
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: theme.color.surface,
                        borderTopRightRadius: borderRadius,
                        borderBottomRightRadius: borderRadius,
                        borderTopLeftRadius: borderRadius,
                        borderBottomLeftRadius: borderRadius,
                        borderWidth: 1,
                        borderColor: theme.color.border,
                        paddingVertical: 12,
                        paddingHorizontal: 18,
                        marginVertical: 6,
                        overflow: 'hidden',
                    },
                    pillStyle,
                ]}
                onPressIn={onRowPress ? () => runFlash(theme.color.primary, 0.65, 60, 220) : undefined}
                onPress={onRowPress ? () => onRowPress(item) : undefined}>

                <Animated.View
                    pointerEvents="none"
                    style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: activeFlashColor,
                        opacity: flashOpacity,
                    }} />

                {imageSrc && (
                    <Animated.View style={[pillImageStyles.container, { opacity: imageOpacity }]}>
                        {imageLoading && isUriImage && (
                            <View style={[StyleSheet.absoluteFillObject, pillImageStyles.placeholder, { backgroundColor: theme.color.border }]}>
                                <ActivityIndicator size="small" color={theme.color.muted} />
                            </View>
                        )}
                        <Image
                            source={isUriImage ? { uri: imageSrc } : imageSrc}
                            style={[
                                pillImageStyles.image,
                                imageLoading && isUriImage ? { opacity: 0 } : undefined,
                                imageStyle,
                            ]}
                            onLoadStart={() => { if (isUriImage) setImageLoading(true); }}
                            onLoadEnd={() => setImageLoading(false)}
                            onError={() => setImageLoading(false)} />
                    </Animated.View>
                )}
                <View style={{ flex: 1 }}>
                    <Animated.View style={{ transform: [{ translateX: titleShift }] }}>
                        {typeof title === 'string' ? (
                            <Text
                                style={[
                                    {
                                        fontSize: 18,
                                        fontWeight: '600',
                                        color: theme.color.text,
                                    },
                                    titleStyle,
                                ]}
                                numberOfLines={1}>
                                {title}
                            </Text>
                        ) : (
                            title
                        )}
                        {subtitle && (
                            <Text
                                style={[
                                    {
                                        fontSize: 14,
                                        color: theme.color.muted,
                                    },
                                    subtitleStyle,
                                ]}
                                numberOfLines={1}>
                                {subtitle}
                            </Text>
                        )}
                    </Animated.View>
                </View>
                {getInfo && !isSwiping && !anySwipeOpen && (
                    <View style={{ marginLeft: 16 }}>
                        {getInfo(item)}
                    </View>
                )}
            </RowComponent>
        </Swipeable>
        </Animated.View>
    );
}

const pillImageStyles = StyleSheet.create({
    container: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 16,
    },
    image: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    placeholder: {
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
