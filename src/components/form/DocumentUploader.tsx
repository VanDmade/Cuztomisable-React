// src/components/form/DocumentUploader.tsx
import type { DocumentPickerAsset } from 'expo-document-picker';
import * as DocumentPicker from 'expo-document-picker';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { Theme } from '../../theme/theme';
import { makeFormStyles } from './styles';

export type DocumentFile = {
    name: string;
    uri: string;
    size?: number;
    mimeType?: string;
};

type DocumentUploaderProps = {
    theme?: Theme;
    label?: string;
    helperText?: string;
    error?: string;
    disabled?: boolean;
    value?: DocumentFile | DocumentFile[] | null;
    onChange: (value: DocumentFile | DocumentFile[] | null) => void;
    multiple?: boolean;
    allowedTypes?: string[];
};

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
    theme,
    label,
    helperText,
    error,
    disabled = false,
    value,
    onChange,
    multiple = false,
    allowedTypes,
}) => {
    const activeTheme = theme ?? useTheme();
    const formStyles = useMemo(() => makeFormStyles(activeTheme), [activeTheme]);

    const valueList = useMemo(() => {
        if (!value) {
            return [] as DocumentFile[];
        }
        return Array.isArray(value) ? value : [value];
    }, [value]);

    const handlePick = async () => {
        if (disabled) {
            return;
        }
        const result = await DocumentPicker.getDocumentAsync({
            type: allowedTypes?.length ? allowedTypes : '*/*',
            multiple,
            copyToCacheDirectory: true,
        });
        if (result.canceled) {
            return;
        }
        const assets = (result.assets ?? []) as DocumentPickerAsset[];
        const files = assets.map((asset) => ({
            name: asset.name ?? 'document',
            uri: asset.uri,
            size: asset.size,
            mimeType: asset.mimeType,
        }));
        if (multiple) {
            const combined = [...valueList, ...files].filter(
                (item, index, arr) => arr.findIndex((a) => a.uri === item.uri) === index
            );
            onChange(combined);
        } else {
            onChange(files[0] ?? null);
        }
    };

    const handleRemove = (uri: string) => {
        const next = valueList.filter((item) => item.uri !== uri);
        onChange(multiple ? next : (next[0] ?? null));
    };

    const formatSize = (size?: number) => {
        if (!size) {
            return '';
        }
        if (size < 1024) {
            return `${size} B`;
        }
        if (size < 1024 * 1024) {
            return `${Math.round(size / 1024)} KB`;
        }
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <View style={formStyles.wrapper}>
            {label ? (<Text style={formStyles.label}>{label}</Text>) : null}
            <Pressable
                onPress={handlePick}
                disabled={disabled}
                style={({ pressed }) => [
                    styles.pickButton,
                    formStyles.input,
                    disabled && formStyles.inputDisabled,
                    error && formStyles.errorBorder,
                    { opacity: pressed ? 0.85 : 1 },
                ]}
            >
                <Text style={{ color: activeTheme.color.text }}>
                    {multiple ? 'Select Documents' : 'Select Document'}
                </Text>
            </Pressable>
            {helperText ? (<Text style={formStyles.helper}>{helperText}</Text>) : null}
            {error ? (<Text style={formStyles.error}>{error}</Text>) : null}
            {valueList.length > 0 ? (
                <View style={styles.list}>
                    {valueList.map((item) => (
                        <View key={item.uri} style={styles.listRow}>
                            <View style={styles.listLeft}>
                                <Text style={{ color: activeTheme.color.text }}>{item.name}</Text>
                                {item.size ? (
                                    <Text style={[styles.listMeta, { color: activeTheme.color.muted }]}>
                                        {formatSize(item.size)}
                                    </Text>
                                ) : null}
                            </View>
                            <Pressable onPress={() => handleRemove(item.uri)}>
                                <Text style={{ color: activeTheme.color.link, fontWeight: '600' }}>Remove</Text>
                            </Pressable>
                        </View>
                    ))}
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    pickButton: {
        justifyContent: 'center',
    },
    list: {
        marginTop: 8,
    },
    listRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    listLeft: {
        flex: 1,
        marginRight: 12,
    },
    listMeta: {
        marginTop: 2,
        fontSize: 12,
    },
});
