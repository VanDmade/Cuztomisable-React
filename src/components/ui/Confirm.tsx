import { useEffect, useRef } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import Button from './Button';
import { hasHost, hideControlled, showControlled, type ConfirmIntent } from './confirmDialog';

type ConfirmProps = {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;

    theme: any;

    title?: string;
    subtitle?: string;
    message?: string;

    confirmText?: string;
    cancelText?: string;

    confirmIntent?: ConfirmIntent;
};

// Shown by ConfirmHost (rendered by AppProvider) in the app's own window - see confirmDialog.ts for why it
// isn't a Modal. Falls back to a Modal in an app without AppProvider.
export function Confirm({
    visible,
    onClose,
    onConfirm,
    theme,
    title,
    subtitle,
    message,
    confirmText = 'Yes',
    cancelText = 'No',
    confirmIntent = 'danger',
}: ConfirmProps) {
    const id = useRef<number | null>(null);
    const useHost = hasHost();

    useEffect(() => {
        if (!useHost) {
            return;
        }
        if (visible) {
            id.current = showControlled(id.current, {
                title, subtitle, message, confirmText, cancelText, confirmIntent, onConfirm, onCancel: onClose,
            });
        } else if (id.current != null) {
            hideControlled(id.current);
            id.current = null;
        }
    }, [useHost, visible, title, subtitle, message, confirmText, cancelText, confirmIntent, onConfirm, onClose]);

    // Closes it if the screen goes away while it's open
    useEffect(() => () => {
        if (id.current != null) {
            hideControlled(id.current);
        }
    }, []);

    if (useHost) {
        return null;
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={[StyleSheet.absoluteFill, confirmStyles.overlay]}>
                <ConfirmCard
                    theme={theme}
                    title={title}
                    subtitle={subtitle}
                    message={message}
                    confirmText={confirmText}
                    cancelText={cancelText}
                    confirmIntent={confirmIntent}
                    onConfirm={onConfirm}
                    onCancel={onClose} />
            </View>
        </Modal>
    );
}

type ConfirmCardProps = {
    theme: any;
    title?: string;
    subtitle?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    confirmIntent?: ConfirmIntent;
    onConfirm: () => void;
    onCancel: () => void;
};

// The dialog itself - used by ConfirmHost and the Modal fallback
export function ConfirmCard({
    theme,
    title,
    subtitle,
    message,
    confirmText = 'Yes',
    cancelText = 'No',
    confirmIntent = 'danger',
    onConfirm,
    onCancel,
}: ConfirmCardProps) {
    return (
        <View style={[confirmStyles.modal, { backgroundColor: theme.color.surface }]}>

            {/* Title */}
            {title && (
                <Text style={[confirmStyles.title, { color: theme.color.text }]}>
                    {title}
                </Text>
            )}

            {/* Subtitle */}
            {subtitle && (
                <Text style={[confirmStyles.subtitle, { color: theme.color.muted }]}>
                    {subtitle}
                </Text>
            )}

            {/* Message */}
            {message && (
                <Text style={[confirmStyles.message, { color: theme.color.text }]}>
                    {message}
                </Text>
            )}

            {/* Actions */}
            <View style={confirmStyles.actions}>
                <Button
                    title={confirmText}
                    intent={confirmIntent}
                    fullWidth
                    onPress={onConfirm}
                />

                <Button
                    title={cancelText}
                    intent="secondary"
                    fullWidth
                    onPress={onCancel}
                />
            </View>
        </View>
    );
}

export const confirmStyles = StyleSheet.create({
    overlay: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        padding: 24,
    },
    modal: {
        borderRadius: 16,
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
    },
    actions: {
        marginTop: 8,
        gap: 12,
    },
});
