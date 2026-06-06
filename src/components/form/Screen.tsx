// src/components/form/Screen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
    Keyboard,
    KeyboardEvent,
    KeyboardEventName,
    Platform,
    ScrollView,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../providers/ThemeProvider';

type Props = {
    children: (api: {}) => React.ReactNode;
    backgroundColor?: string;
    paddingTop?: number|string;
    paddingBottom?: number;
    centered?: boolean;
    scrollToTopTrigger?: number | string;
};

const TOOLBAR_HEIGHT = 65;

export function FormScreen({
    children,
    backgroundColor,
    paddingTop = 60,
    paddingBottom = 0,
    centered = false,
    scrollToTopTrigger,
}: Props) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const scrollRef = useRef<ScrollView>(null);
    const [height, setHeight] = useState(0);
    const effectiveBackgroundColor = backgroundColor ?? theme.color.background;
    useEffect(() => {
        const onShow = (e: KeyboardEvent) => setHeight(Math.max(0, e.endCoordinates?.height || 0));
        const onHide = () => setHeight(0);

        const showEvent: KeyboardEventName = Platform.select({ ios: 'keyboardWillShow', android: 'keyboardDidShow' })!;
        const hideEvent: KeyboardEventName = Platform.select({ ios: 'keyboardWillHide', android: 'keyboardDidHide' })!;

        const s = Keyboard.addListener(showEvent, onShow);
        const h = Keyboard.addListener(hideEvent, onHide);
        return () => { s.remove(); h.remove(); };
    }, []);

    useEffect(() => {
        if (scrollToTopTrigger !== undefined) {
            scrollRef.current?.scrollTo({ y: 0, animated: false });
        }
    }, [scrollToTopTrigger]);

    const bottomPadding = (height > 0 ? height : 0) + insets.bottom + paddingBottom;

    return (
        <View style={{ flex: 1, backgroundColor: effectiveBackgroundColor }}>
            <ScrollView
                ref={scrollRef}
                style={{ flex: 1 }}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                    paddingBottom: bottomPadding,
                    paddingTop: typeof paddingTop === 'number' ? paddingTop : 0,
                    flexGrow: 1,
                    justifyContent: centered ? 'center' : 'flex-start',
                }}
                scrollIndicatorInsets={{ bottom: bottomPadding }}
                keyboardDismissMode="on-drag">
                {typeof children === 'function' ? children({}) : children}
            </ScrollView>
            <View
                pointerEvents="box-none"
                style={{position: 'absolute', left: 0, right: 0, bottom: insets.bottom}}>
            </View>
        </View>
    );
}
