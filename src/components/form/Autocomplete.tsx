// src/components/form/Autocomplete.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { Theme } from '../../theme/theme';
import type { DropdownOption } from './Dropdown';
import { makeFormStyles } from './styles';

type AutocompleteProps<T = any> = {
    theme?: Theme;
    label?: string;
    helperText?: string;
    error?: string;
    disabled?: boolean;
    value?: string;
    onChangeText?: (text: string) => void;
    onSelect?: (value: T, option: DropdownOption<T>) => void;
    onCreateNew?: (query: string) => void;
    options: DropdownOption<T>[];
    placeholder?: string;
    minChars?: number;
    clearOnSelect?: boolean;
    fillOnSelect?: boolean;
    showCreateOption?: boolean;
    filterOption?: (option: DropdownOption<T>, query: string) => boolean;
    containerStyle?: any;
    inputStyle?: any;
    hideDetails?: boolean;
};

export const FormAutocomplete = <T,>({
    theme,
    label,
    helperText,
    error,
    disabled = false,
    value,
    onChangeText,
    onSelect,
    onCreateNew,
    options,
    placeholder = 'Search...',
    minChars = 1,
    clearOnSelect = false,
    fillOnSelect = true,
    showCreateOption = false,
    filterOption,
    containerStyle,
    inputStyle,
    hideDetails = false,
}: AutocompleteProps<T>) => {
    const activeTheme = theme ?? useTheme();
    const formStyles = useMemo(() => makeFormStyles(activeTheme), [activeTheme]);
    const [internalValue, setInternalValue] = useState(value ?? '');
    const [open, setOpen] = useState(false);
    const justSelectedRef = useRef(false);

    useEffect(() => {
        if (value !== undefined) {
            setInternalValue(value);
        }
    }, [value]);

    const handleChange = (text: string) => {
        if (justSelectedRef.current) {
            justSelectedRef.current = false;
            return;
        }
        if (value === undefined) setInternalValue(text);
        setOpen(true);
        onChangeText?.(text);
    };

    const handleSelect = (item: DropdownOption<T>) => {
        justSelectedRef.current = fillOnSelect;
        setOpen(false);
        onSelect?.(item.value, item);
        if (fillOnSelect) {
            if (value === undefined) setInternalValue(item.label);
            onChangeText?.(item.label);
        }
        if (clearOnSelect) {
            if (value === undefined) setInternalValue('');
            onChangeText?.('');
        }
    };

    const query = value !== undefined ? value : internalValue;
    const filtered = useMemo(() => {
        if (!open || query.length < minChars) return [] as DropdownOption<T>[];
        const q = query.toLowerCase();
        const filter = filterOption ?? ((opt: DropdownOption<T>, qText: string) => opt.label.toLowerCase().includes(qText));
        return options.filter((opt) => filter(opt, q));
    }, [options, query, minChars, filterOption, open]);

    const showCreate = showCreateOption && open && query.trim().length >= minChars &&
        !options.some((opt) => opt.label.toLowerCase() === query.trim().toLowerCase());

    const handleCreate = () => {
        const q = query.trim();
        onCreateNew?.(q);
        if (!onCreateNew) {
            onChangeText?.(q);
        }
        setOpen(false);
    };

    return (
        <View style={[formStyles.wrapper, containerStyle]}>
            {label ? (<Text style={formStyles.label}>{label}</Text>) : null}
            <TextInput
                value={query}
                placeholder={placeholder}
                placeholderTextColor={activeTheme.color.muted ?? '#AAA'}
                editable={!disabled}
                style={[
                    formStyles.input,
                    disabled && formStyles.inputDisabled,
                    error && formStyles.errorBorder,
                    inputStyle,
                ]}
                onChangeText={handleChange}
                onBlur={() => setOpen(false)}
            />
            {!hideDetails && helperText ? (<Text style={formStyles.helper}>{helperText}</Text>) : null}
            {!hideDetails && error ? (<Text style={formStyles.error}>{error}</Text>) : null}
            {(filtered.length > 0 || showCreate) ? (
                <View style={[styles.list, { borderColor: activeTheme.color.border, backgroundColor: activeTheme.color.background }]}>
                    <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                        {filtered.map((item, index) => (
                            <Pressable
                                key={String(index)}
                                onPress={() => handleSelect(item)}
                                style={({ pressed }) => [styles.listItem, { opacity: pressed ? 0.85 : 1 }]}
                            >
                                <Text style={{ color: activeTheme.color.text }}>{item.label}</Text>
                                {!!item.description && (
                                    <Text style={[styles.description, { color: activeTheme.color.muted }]}>
                                        {item.description}
                                    </Text>
                                )}
                            </Pressable>
                        ))}
                        {showCreate && (
                            <Pressable
                                onPress={handleCreate}
                                style={({ pressed }) => [styles.listItem, styles.createItem, { opacity: pressed ? 0.85 : 1 }]}>
                                <Text style={{ color: activeTheme.color.primary, fontWeight: '500' }}>
                                    Create: "{query.trim()}"
                                </Text>
                            </Pressable>
                        )}
                    </ScrollView>
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    list: {
        marginTop: 6,
        borderWidth: 1,
        borderRadius: 10,
        overflow: 'hidden',
        maxHeight: 220,
    },
    listItem: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#DDD',
    },
    createItem: {
        borderBottomWidth: 0,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#DDD',
    },
    description: {
        marginTop: 2,
        fontSize: 12,
    },
});
