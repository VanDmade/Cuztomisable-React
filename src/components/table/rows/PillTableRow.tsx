import React, { useRef, useState } from 'react';
import {
    Animated,
    Image,
    ImageStyle,
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
}: PillTableRowProps<T>) {
    const RowComponent = onRowPress ? TouchableOpacity : View;

    const imageSrc = getImageSource ? getImageSource(item) : undefined;
    const title = getTitle ? getTitle(item) : '';
    const subtitle = getSubtitle ? getSubtitle(item) : undefined;

    const [isSwiping, setIsSwiping] = useState(false);
    const [anySwipeOpen, setAnySwipeOpen] = useState(false);
    const swipeRef = useRef<Swipeable>(null);
    const titleShift = useRef(new Animated.Value(0)).current;

    const springTitle = (toValue: number) =>
        Animated.spring(titleShift, {
            toValue,
            useNativeDriver: true,
            tension: 120,
            friction: 10,
        }).start();

    return (
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
                const isDelete = direction === 'right';
                setIsSwiping(isDelete);
                if (isDelete) springTitle(75);
            }}
            onSwipeableWillClose={() => { setAnySwipeOpen(false); setIsSwiping(false); springTitle(0); }}>
            <RowComponent
                delayPressIn={150}
                key={rowKey ? rowKey(item, index) : index}
                style={[
                    {
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: theme.color.surface,
                        borderTopRightRadius: anySwipeOpen ? 0 : 12,
                        borderBottomRightRadius: anySwipeOpen ? 0 : 12,
                        borderTopLeftRadius: anySwipeOpen ? 0 : 12,
                        borderBottomLeftRadius: anySwipeOpen ? 0 : 12,
                        borderWidth: 1,
                        borderColor: theme.color.border,
                        paddingVertical: 12,
                        paddingHorizontal: 18,
                        marginVertical: 6,
                    },
                    pillStyle,
                ]}
                onPress={onRowPress ? () => onRowPress(item) : undefined}>
                {imageSrc && (
                    <Image
                        source={
                            typeof imageSrc === 'string'
                                ? { uri: imageSrc }
                                : imageSrc
                        }
                        style={[
                            {
                                width: 48,
                                height: 48,
                                borderRadius: 24,
                                marginRight: 16,
                            },
                            imageStyle,
                        ]}/>
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
    );
}
