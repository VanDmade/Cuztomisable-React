// src/components/form/ErrorAnchor.tsx
// Marks a spot in a FormScreen that "jump to the first error" can scroll to: provide ErrorFocusContext with the
// anchor id to show (and bump request to ask again), and the ErrorAnchor with that id scrolls itself into view.
import React, { createContext, ReactNode, useContext, useEffect, useRef } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useFormScroll } from './Screen';

// The anchor to bring into view, and a counter that changes on every request (so the same spot can be asked for twice)
export const ErrorFocusContext = createContext<{ anchor: string | null; request: number }>({ anchor: null, request: 0 });

type Props = {
    id: string;
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
    key?: any;
};

export function ErrorAnchor({ id, children, style }: Props) {
    const { anchor, request } = useContext(ErrorFocusContext);
    const scroll = useFormScroll();
    const ref = useRef<View>(null);

    useEffect(() => {
        if (!request || anchor !== id) return;
        // A tab that's just been switched to is still laying out - give it a moment before measuring
        const timer = setTimeout(() => scroll?.scrollToView(ref.current), 250);
        return () => clearTimeout(timer);
    }, [request]);

    return <View ref={ref} collapsable={false} style={style}>{children}</View>;
}
