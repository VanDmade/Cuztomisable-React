// src/components/form/Tags.tsx
// Tags for a record: pick any of the existing tags from a list (each with its color), and make a new one with
// "+ Create tag" - a name, any color from the color picker and a preview. The picked tags show as chips in their colors.
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../providers/ThemeProvider';
import { Theme } from '../../theme/theme';
import { getContrastTextColor } from '../../utils/colors';
import Button from '../ui/Button';
import { ModalTitle } from '../ui/ModalTitle';
import { ColorPicker, hsvToHex } from './ColorPicker';
import { FormInput } from './Input';
import { FormMultiSelect } from './MultiSelect';
import { makeFormStyles } from './styles';

export type TagItem = {
    // An existing tag's id, or "NEW-{n}" for one made here (save it along with its name and color)
    id: string;
    name: string;
    color?: string;
};

// A new tag starts on a random, clearly colored hue - each one different until it's picked
const randomColor = () => hsvToHex({ h: Math.random() * 360, s: 0.7, v: 0.9 });

type FormTagsProps = {
    theme?: Theme;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    // The picked tags - kept whole (not just ids) so new ones keep their name and color until the record is saved
    value: TagItem[];
    onChange: (tags: TagItem[]) => void;
    // The existing tags to pick from
    options: TagItem[];
    error?: string;
    // Show "+ Create tag" (on by default)
    allowCreate?: boolean;
    modalTitle?: string;
};

export const FormTags: React.FC<FormTagsProps> = ({
    theme,
    label = 'Tags',
    placeholder = 'Select tags...',
    disabled = false,
    value,
    onChange,
    options,
    error,
    allowCreate = true,
    modalTitle = 'Select Tags',
}) => {
    const contextTheme = useTheme();
    const activeTheme = theme ?? contextTheme;
    const formStyles = useMemo(() => makeFormStyles(activeTheme), [activeTheme]);

    const insets = useSafeAreaInsets();
    const [createVisible, setCreateVisible] = useState(false);
    // The sheet doesn't scroll while the color is being dragged
    const [pickingColor, setPickingColor] = useState(false);
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState(randomColor);

    // Every tag that can show: the existing ones, plus new ones made here that aren't saved yet
    const allTags = useMemo(
        () => [...options, ...value.filter((tag) => !options.some((option) => option.id === tag.id))],
        [options, value],
    );

    const openCreate = () => {
        setNewName('');
        setNewColor(randomColor());
        setCreateVisible(true);
    };

    const createTag = () => {
        const name = newName.trim();
        if (!name) {
            return;
        }
        // A name that's already a tag picks that tag instead of making a second one
        const existing = allTags.find((tag) => tag.name.trim().toLowerCase() === name.toLowerCase());
        const tag = existing ?? { id: `NEW-${Date.now()}`, name, color: newColor };
        if (!value.some((picked) => picked.id === tag.id)) {
            onChange([...value, tag]);
        }
        setCreateVisible(false);
    };

    return (
        <View>
            <FormMultiSelect
                theme={activeTheme}
                label={label}
                value={value.map((tag) => tag.id)}
                onChange={(ids: string[]) => onChange(ids
                    .map((id) => allTags.find((tag) => tag.id === id))
                    .filter((tag): tag is TagItem => !!tag))}
                options={allTags.map((tag) => ({ label: tag.name, value: tag.id, color: tag.color }))}
                placeholder={placeholder}
                modalTitle={modalTitle}
                disabled={disabled}
                bordered
                fieldStyle={error ? formStyles.errorBorder : undefined}
                renderChip={(option) => {
                    const background = option.color || activeTheme.color.primary;
                    return (
                        <View key={String(option.value)} style={[formStyles.chip, { backgroundColor: background }]}>
                            <Text style={[formStyles.chipText, { color: getContrastTextColor(background) }]}>{option.label}</Text>
                        </View>
                    );
                }} />
            {error ? <Text style={[formStyles.error, styles.error]}>{error}</Text> : null}
            {allowCreate && !disabled ? (
                <TouchableOpacity onPress={openCreate} style={styles.createButton}>
                    <Text style={{ color: activeTheme.color.link, fontSize: 14 }}>+ Create tag</Text>
                </TouchableOpacity>
            ) : null}
            {/* Drawn under the status and navigation bars, so the sheet reaches the very bottom of the screen */}
            <Modal
                visible={createVisible}
                transparent
                animationType="slide"
                statusBarTranslucent
                navigationBarTranslucent
                onRequestClose={() => setCreateVisible(false)}>
                <View style={styles.overlay}>
                    {/* Tapping the dimmed area above the sheet closes it */}
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={() => setCreateVisible(false)}
                        accessibilityRole="button"
                        accessibilityLabel="Close" />
                    <View style={[styles.sheet, { backgroundColor: activeTheme.color.surface, paddingBottom: 24 + insets.bottom }]}>
                        <View style={[styles.sheetTitle, styles.sheetSides]}>
                            <ModalTitle title="Create Tag" onClose={() => setCreateVisible(false)} />
                        </View>
                        <ScrollView
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={!pickingColor}
                            // The side padding is inside the scroll area, so the color picker's thumb has room at the
                            // edges instead of being cut off
                            contentContainerStyle={styles.sheetSides}>
                            <FormInput
                                label="Name"
                                value={newName}
                                onChangeText={setNewName}
                                placeholder="e.g. Citrus" />
                            <Text style={[formStyles.label, { marginTop: 12, marginBottom: 10 }]}>Color</Text>
                            <ColorPicker theme={activeTheme} value={newColor} onChange={setNewColor} onDragChange={setPickingColor} />
                            <View style={styles.previewRow}>
                                <Text style={{ color: activeTheme.color.muted, fontSize: 13 }}>Preview:</Text>
                                <View style={[formStyles.chip, { backgroundColor: newColor }]}>
                                    <Text style={[formStyles.chipText, { color: getContrastTextColor(newColor) }]}>
                                        {newName || 'Tag name'}
                                    </Text>
                                </View>
                            </View>
                            <View style={{ marginTop: 16 }}>
                                <Button
                                    title="Add Tag"
                                    intent="primary"
                                    fullWidth
                                    disabled={!newName.trim()}
                                    onPress={createTag} />
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    error: {
        marginTop: -8,
        marginBottom: 8,
    },
    createButton: {
        alignSelf: 'flex-start',
        paddingVertical: 8,
        paddingHorizontal: 2,
        marginTop: 4,
        marginBottom: 8,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    sheet: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 24,
        maxHeight: '85%',
    },
    sheetSides: {
        paddingHorizontal: 24,
    },
    sheetTitle: {
        marginBottom: 16,
    },
    previewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 16,
        marginBottom: 4,
    },
});
