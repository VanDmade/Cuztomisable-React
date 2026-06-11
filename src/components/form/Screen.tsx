// src/components/form/Screen.tsx
import React, { useEffect, useRef } from 'react';
import {
    KeyboardAvoidingView,
    ScrollView,
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
    const effectiveBackgroundColor = backgroundColor ?? theme.color.background;

    useEffect(() => {
        if (scrollToTopTrigger !== undefined) {
            scrollRef.current?.scrollTo({ y: 0, animated: false });
        }
    }, [scrollToTopTrigger]);

    const bottomPadding = insets.bottom + paddingBottom;

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: effectiveBackgroundColor }}
            behavior="padding">
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
        </KeyboardAvoidingView>
    );
}
