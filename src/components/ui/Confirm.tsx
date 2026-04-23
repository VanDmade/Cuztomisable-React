import { Modal, StyleSheet, Text, View } from 'react-native';
import Button from './Button';

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

    confirmIntent?: 'primary' | 'danger' | 'success';
};

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
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={[styles.modal, { backgroundColor: theme.color.surface }]}>
                    
                    {/* Title */}
                    {title && (
                        <Text style={[styles.title, { color: theme.color.text }]}>
                            {title}
                        </Text>
                    )}

                    {/* Subtitle */}
                    {subtitle && (
                        <Text style={[styles.subtitle, { color: theme.color.muted }]}>
                            {subtitle}
                        </Text>
                    )}

                    {/* Message */}
                    {message && (
                        <Text style={[styles.message, { color: theme.color.text }]}>
                            {message}
                        </Text>
                    )}

                    {/* Actions */}
                    <View style={styles.actions}>
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
                            onPress={onClose}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
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