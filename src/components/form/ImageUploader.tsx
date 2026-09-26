// src/components/form/ImageUploader.tsx
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useMemo, useRef } from 'react';
import {
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useTheme } from '../../providers/ThemeProvider';

type ImageItem = {
    id: number;
    uri: string;
};

type Props = {
    value?: string | string[] | ImageItem[] | null;
    onChange: (val: any) => void;

    multiple?: boolean;
    maxSelections?: number;

    thumbnailImage?: number | null;
    onThumbnailChange?: (id: number) => void;

    defaultImageSource?: any;
    size?: number;
    bordered?: boolean;
};

export const ImageUploader: React.FC<Props> = ({
    value,
    onChange,
    multiple = false,
    maxSelections = 4,
    thumbnailImage,
    onThumbnailChange,
    defaultImageSource,
    size = 120,
    bordered = false,
}) => {
    const theme = useTheme();
    const scrollRef = useRef<ScrollView>(null);

    const isObjectMode = useMemo(() => {
        return Array.isArray(value) && value.length > 0 && typeof value[0] === 'object';
    }, [value]);

    const list: ImageItem[] = useMemo(() => {
        if (!value) return [];

        if (isObjectMode) return value as ImageItem[];

        if (Array.isArray(value)) {
            return value.map((uri, i) => ({
                id: i,
                uri,
            }));
        }

        return [{ id: 0, uri: value }];
    }, [value]);

    const askPermission = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission required');
            return false;
        }
        return true;
    };

    const handlePick = useCallback(async () => {
        const ok = await askPermission();
        if (!ok) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: multiple,
            selectionLimit: maxSelections,
            // The native crop/rotate editor only supports picking one image at a
            // time, so it's only available when this uploader is in single mode.
            allowsEditing: !multiple,
            aspect: [1, 1],
        });

        if (!result.canceled) {
            const assets = result.assets.map((a) => ({
                id: Date.now() + Math.random(),
                uri: a.uri,
            }));

            if (multiple) {
                let next = [...list, ...assets];

                if (maxSelections) {
                    next = next.slice(0, maxSelections);
                }

                onChange(isObjectMode ? next : next.map((i) => i.uri));
            } else {
                // Single mode's `value` contract is a plain string uri (see `list`
                // above) - passing the picked {id, uri} object here instead nests
                // it inside source={{ uri: <object> }} on render, which crashes
                // RCTImageView on Android ("error while updating property source").
                onChange(assets[0]?.uri ?? null);
            }
        }
    }, [multiple, list, onChange, maxSelections, isObjectMode]);

    const handleRemove = (id: number) => {
        const next = list.filter((i) => i.id !== id);

        if (multiple) {
            onChange(isObjectMode ? next : next.map((i) => i.uri));
        } else {
            onChange(null);
        }

        if (thumbnailImage === id) {
            onThumbnailChange?.(next[0]?.id ?? 0);
        }
    };

    const canAddMore = !maxSelections || list.length < maxSelections;

    if (!multiple) {
        const uri = list[0]?.uri;

        return (
            <View style={styles.singleWrapper}>
                <View style={styles.singleContainer}>
                    <Pressable onPress={handlePick}>
                        <Image
                            source={
                                uri
                                    ? { uri }
                                    : defaultImageSource
                            }
                            style={[
                                styles.singleImage,
                                { width: size, height: size, borderRadius: size / 2 },
                                bordered && { borderWidth: 2, borderColor: theme.color.secondary },
                            ]} />
                    </Pressable>
                    {uri && (
                        <Pressable
                            onPress={() => handleRemove(0)}
                            style={styles.remove}>
                            <MaterialIcons name="close" size={14} color="white" />
                        </Pressable>
                    )}
                </View>
            </View>
        );
    }
    return (
        <View>
            <View style={styles.row}>
                <Pressable onPress={() => scrollRef.current?.scrollTo({ x: 0 })}>
                    <Text>{'‹'}</Text>
                </Pressable>
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.list}>
                    {list.map((item) => {
                        const isThumb = thumbnailImage === item.id;
                        return (
                            <Pressable
                                key={item.id}
                                onPress={() => onThumbnailChange?.(item.id)}
                                style={[
                                    styles.imageContainer,
                                    isThumb && { borderColor: theme.color.primary, borderWidth: 2 },
                                ]}>
                                <Image
                                    source={{ uri: item.uri }}
                                    style={styles.image} />
                                <Pressable
                                    onPress={() => handleRemove(item.id)}
                                    style={styles.remove}>
                                    <MaterialIcons name="close" size={14} color="white" />
                                </Pressable>
                            </Pressable>
                        );
                    })}
                    {canAddMore && (
                        <Pressable
                            onPress={handlePick}
                            style={[styles.add, { backgroundColor: theme.color.primary }]}>
                            <MaterialIcons
                                name="add"
                                size={28}
                                color={theme.color.buttonText.primary}
                            />
                        </Pressable>
                    )}
                </ScrollView>
                <Pressable onPress={() => scrollRef.current?.scrollToEnd()}>
                    <Text>{'›'}</Text>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    singleContainer: {
        position: 'relative',
    },
    singleWrapper: {
        alignItems: 'flex-start',
    },
    singleImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    list: {
        flexDirection: 'row',
        paddingVertical: 10,
    },
    imageContainer: {
        marginRight: 10,
        borderWidth: 2,
        borderRadius: 10,
    },
    image: {
        width: 90,
        height: 90,
        borderRadius: 8,
    },
    remove: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 22,
        height: 22,
        borderRadius: 11, // 👈 makes it circular
        backgroundColor: 'rgba(0,0,0,0.65)', // 👈 black with opacity
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        right: 4,
        alignItems: 'center',
    },
    badgeText: {
        fontSize: 10,
        color: 'white',
    },
    add: {
        width: 92,
        height: 92,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
});