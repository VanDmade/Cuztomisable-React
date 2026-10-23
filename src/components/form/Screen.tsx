// src/components/form/Screen.tsx
import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import {
    Keyboard,
    Pressable,
    ScrollView,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../providers/ThemeProvider';
import { KeyboardArea } from '../ui/KeyboardArea';

type FormScroll = {
    // Scrolls the form so this view sits near the top - e.g. the first field with an error
    scrollToView: (view: View | null, offset?: number) => void;
};

const FormScrollContext = createContext<FormScroll | null>(null);

/** The surrounding FormScreen's scroll controls, or null outside one. */
export function useFormScroll(): FormScroll | null {
    return useContext(FormScrollContext);
}

type Props = {
    children: (api: {}) => React.ReactNode;
    backgroundColor?: string;
    paddingTop?: number|string;
    paddingBottom?: number;
    centered?: boolean;
    scrollToTopTrigger?: number | string;
    // What scrolling does to an open keyboard - by default nothing: it stays open so you can scroll to see what you're
    // typing, and a tap on empty space closes it. 'on-drag' / 'interactive' close it when scrolling instead
    keyboardDismissMode?: 'none' | 'on-drag' | 'interactive';
    // Turn off to stop the page scrolling - e.g. while a ColorPicker inside is being dragged (see its onDragChange)
    scrollEnabled?: boolean;
};

export function FormScreen({
    children,
    backgroundColor,
    paddingTop = 60,
    paddingBottom = 0,
    centered = false,
    scrollToTopTrigger,
    keyboardDismissMode = 'none',
    scrollEnabled = true,
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

    // A tap on empty space closes the keyboard - but not a drag: a scroll can end as a "press" on the same spot, and
    // that mustn't close a keyboard that's being kept open while scrolling
    const dragged = useRef(false);
    const tapToDismiss = () => {
        if (!dragged.current) Keyboard.dismiss();
    };

    const scroll = useMemo<FormScroll>(() => ({
        scrollToView: (view, offset = 24) => {
            const scrollView: any = scrollRef.current;
            // Measured against the scrolling content, so it's right however far down the form already is
            const content = scrollView?.getInnerViewRef?.() ?? scrollView?.getInnerViewNode?.();
            if (!view || !content) return;
            view.measureLayout(
                content,
                (_x, y) => scrollView.scrollTo({ y: Math.max(0, y - offset), animated: true }),
                () => {},
            );
        },
    }), []);

    return (
        // Stays above the keyboard wherever the form sits on the screen (under a header, tabs...)
        <KeyboardArea style={{ backgroundColor: effectiveBackgroundColor }}>
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
                onScrollBeginDrag={() => { dragged.current = true; }}
                scrollEnabled={scrollEnabled}
                keyboardDismissMode={keyboardDismissMode}>
                <FormScrollContext.Provider value={scroll}>
                    {/* Tapping anywhere that isn't a field or button closes the keyboard (scrolling may not) */}
                    <Pressable
                        onPressIn={() => { dragged.current = false; }}
                        onPress={tapToDismiss}
                        accessible={false}
                        style={{ flexGrow: 1, justifyContent: centered ? 'center' : 'flex-start' }}>
                        {typeof children === 'function' ? children({}) : children}
                    </Pressable>
                </FormScrollContext.Provider>
            </ScrollView>
        </KeyboardArea>
    );
}
