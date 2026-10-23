// src/components/ui/KeyboardArea.tsx
// An area that shrinks to stay above the keyboard, wherever it sits on the screen. React Native's
// KeyboardAvoidingView works out how much the keyboard covers as if it started at the top of the screen - under a
// header (and tabs) it starts lower and leaves too little room. This measures where it really is and allows for it.
import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, StyleProp, View, ViewStyle } from 'react-native';

type KeyboardAreaProps = {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
};

export function KeyboardArea({ children, style }: KeyboardAreaProps) {
    const frameRef = useRef<View>(null);
    const [topOffset, setTopOffset] = useState(0);
    const measureTop = () => frameRef.current?.measureInWindow((_x, y) => setTopOffset(Math.max(0, y)));

    return (
        <View ref={frameRef} style={{ flex: 1 }} onLayout={measureTop} collapsable={false}>
            <KeyboardAvoidingView style={[{ flex: 1 }, style]} behavior="padding" keyboardVerticalOffset={topOffset}>
                {children}
            </KeyboardAvoidingView>
        </View>
    );
}
