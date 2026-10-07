// Draws the dialog from confirmDialog.ts (from <Confirm visible> or confirmDialog()) over every screen, in
// the app's own window rather than a Modal - see confirmDialog.ts for why. Rendered once by AppProvider,
// after the app's screens.
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Animated, BackHandler, StyleSheet } from 'react-native';

import { useTheme } from '../../providers/ThemeProvider';
import { ConfirmCard, confirmStyles } from './Confirm';
import { answerConfirmDialog, getCurrent, registerHost, subscribe, type ConfirmOptions } from './confirmDialog';

const FADE_MS = 150;

export function ConfirmHost() {
    const theme = useTheme();
    const entry = useSyncExternalStore(subscribe, getCurrent);
    // The last dialog, kept on screen while it fades out
    const [shown, setShown] = useState<ConfirmOptions | null>(null);
    const opacity = useRef(new Animated.Value(0)).current;

    // Registered while rendering, so a Confirm on the first screen already knows there's a host
    const [unregister] = useState(() => registerHost());
    useEffect(() => unregister, []);

    useEffect(() => {
        if (entry) {
            setShown(entry.options);
            Animated.timing(opacity, { toValue: 1, duration: FADE_MS, useNativeDriver: true }).start();
        } else {
            Animated.timing(opacity, { toValue: 0, duration: FADE_MS, useNativeDriver: true })
                .start(({ finished }) => finished && setShown(null));
        }
    }, [entry]);

    // Android Back answers it like Cancel instead of leaving the screen underneath
    useEffect(() => {
        if (!entry) {
            return;
        }
        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            answerConfirmDialog(false);
            return true;
        });
        return () => subscription.remove();
    }, [entry]);

    if (!shown) {
        return null;
    }

    return (
        <Animated.View
            pointerEvents={entry ? 'auto' : 'none'}
            style={[StyleSheet.absoluteFill, confirmStyles.overlay, styles.onTop, { opacity }]}>
            <ConfirmCard
                theme={theme}
                title={shown.title}
                subtitle={shown.subtitle}
                message={shown.message}
                confirmText={shown.confirmText}
                cancelText={shown.cancelText}
                confirmIntent={shown.confirmIntent}
                onConfirm={() => answerConfirmDialog(true)}
                onCancel={() => answerConfirmDialog(false)} />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    onTop: {
        zIndex: 1000,
        elevation: 1000,
    },
});
