// src/components/form/MultiSelect.tsx
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../providers/ThemeProvider';
import { Theme } from '../../theme/theme';
import type { DropdownOption } from './Dropdown';
import { makeFormStyles } from './styles';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export type MultiSelectHandle = {
    open: () => void;
    close: () => void;
};

type MultiSelectProps<T = any> = {
    theme?: Theme;
    label?: string;
    value: T[];
    onChange: (val: T[]) => void;
    options: DropdownOption<T>[];
    placeholder?: string;
    disabled?: boolean;
    bordered?: boolean;
    containerStyle?: ViewStyle;
    textStyle?: TextStyle;
    fieldStyle?: ViewStyle;
    modalTitle?: string;
    showField?: boolean;
    maxSelections?: number;
    renderChip?: (option: DropdownOption<T>) => React.ReactNode;
    renderOption?: (option: DropdownOption<T>, selected: boolean) => React.ReactNode;
};

export const FormMultiSelect = forwardRef(function FormMultiSelectInner<T = any>({
    theme,
    label,
    value,
    onChange,
    options,
    placeholder = 'Select...',
    disabled = false,
    bordered = false,
    containerStyle,
    textStyle,
    fieldStyle,
    modalTitle = 'Select options',
    showField = true,
    maxSelections,
    renderChip,
    renderOption,
}: MultiSelectProps<T>, ref: React.Ref<MultiSelectHandle>) {
    const activeTheme = theme ?? useTheme();
    const insets = useSafeAreaInsets();
    const formStyles = useMemo(() => makeFormStyles(activeTheme), [activeTheme]);
    const [visible, setVisible] = useState(false);
    const heightRef = useRef(0);
    const opacity = useRef(new Animated.Value(0)).current;
    const sheetY = useRef(new Animated.Value(0)).current;

    useImperativeHandle(ref, () => ({
        open: () => {
            if (!disabled) {
                setVisible(true);
            }
        },
        close: () => {
            animateOutAnd(() => setVisible(false));
        },
    }));

    useEffect(() => {
        if (!visible) {
            return;
        }
        opacity.setValue(0);
        sheetY.setValue(heightRef.current || SCREEN_HEIGHT);
        const easeOut = Easing.out(Easing.cubic);
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 180, easing: easeOut, useNativeDriver: false }),
            Animated.timing(sheetY, { toValue: 0, duration: 220, easing: easeOut, useNativeDriver: false }),
        ]).start();
    }, [visible, opacity, sheetY]);

    const animateOutAnd = (cb: () => void) => {
        const easeIn = Easing.in(Easing.cubic);
        Animated.parallel([
            Animated.timing(opacity, { toValue: 0, duration: 160, easing: easeIn, useNativeDriver: false }),
            Animated.timing(sheetY, { toValue: heightRef.current || SCREEN_HEIGHT, duration: 160, easing: easeIn, useNativeDriver: false }),
        ]).start(({ finished }) => finished && cb());
    };

    const open = () => {
        if (disabled) {
            return;
        }
        setVisible(true);
    };

    const close = () => animateOutAnd(() => setVisible(false));

    const toggleValue = (val: T) => {
        const exists = value.some((v) => v === val);
        if (exists) {
            onChange(value.filter((v) => v !== val));
            return;
        }
        if (maxSelections && value.length >= maxSelections) {
            return;
        }
        onChange([...value, val]);
    };

    const selectedOptions = options.filter((opt) => value.some((v) => v === opt.value));
    const atLeastOneSelected = value.length > 0;
    return (
        <View style={formStyles.wrapper}>
            {label && (
                <Text style={formStyles.label}>
                    {label}
                </Text>
            )}
            {showField ? (
                <TouchableOpacity
                    style={[
                        styles.field,
                        activeTheme.utils.pxsm,
                        !atLeastOneSelected && { paddingVertical: 16 },
                        atLeastOneSelected && { paddingBottom: 10, paddingTop: 10 },
                        bordered && [{ borderWidth: 1, borderColor: activeTheme.color.border }, formStyles.input, activeTheme.utils.pxmd],
                        fieldStyle,
                        containerStyle,
                        disabled && formStyles.inputDisabled,
                    ]}
                    onPress={open}
                    disabled={disabled}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                            {selectedOptions.length > 0 ? (
                                <View style={styles.chips}>
                                    {selectedOptions.map((opt) => (
                                        <React.Fragment key={String(opt.value)}>
                                            {renderChip ? (
                                                renderChip(opt)
                                            ) : (
                                                <View
                                                    style={[
                                                        formStyles.chip,
                                                        { backgroundColor: activeTheme.color.background },
                                                    ]}>
                                                    <Text
                                                        style={[
                                                            formStyles.chipText,
                                                            textStyle,
                                                            { color: activeTheme.color.text },
                                                        ]}
                                                        numberOfLines={1}>
                                                        {opt.selectedText ?? opt.label}
                                                    </Text>
                                                </View>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </View>
                            ) : (
                                <Text
                                    style={[
                                        { color: activeTheme.color.text },
                                        activeTheme.typography.variants.placeholder,
                                        textStyle,
                                    ]}
                                    numberOfLines={1}>
                                    {placeholder}
                                </Text>
                            )}
                            {/* Example usage: atLeastOneSelected ? ... : ... */}
                        </View>
                        <Text style={[activeTheme.styles.chevron, textStyle, { marginLeft: 8 }]}>▼</Text>
                    </View>
                </TouchableOpacity>
            ) : null}
            <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={close}>
                <Pressable style={activeTheme.styles.backdropHitbox} onPress={close}>
                    <Animated.View style={[activeTheme.styles.backdrop, { opacity }]} />
                </Pressable>
                <Animated.View
                    onLayout={(e) => { heightRef.current = e.nativeEvent.layout.height; }}
                    style={[
                        styles.dropdown,
                        activeTheme.utils.pblg,
                        { transform: [{ translateY: sheetY }], backgroundColor: activeTheme.color.background, paddingBottom: 40 + insets.bottom },
                    ]}>
                    <View style={[styles.dropdownHeader, activeTheme.utils.pxmd, activeTheme.utils.pymd]}>
                        <Text style={[styles.dropdownHeaderText, { color: activeTheme.color.text }]}>{modalTitle}</Text>
                        <TouchableOpacity onPress={close}>
                            <Text style={{ color: activeTheme.color.link, fontWeight: '600' }}>Done</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        style={{ flex: 1 }}
                        keyboardShouldPersistTaps="handled"
                        data={options}
                        keyExtractor={(_, idx) => String(idx)}
                        renderItem={({ item }) => {
                            const selected = value.some((v) => v === item.value);
                            return (
                                <TouchableOpacity
                                    style={[
                                        activeTheme.styles.row,
                                        activeTheme.styles.rowSpaceBetween,
                                        activeTheme.utils.pymd,
                                        activeTheme.utils.pxmd,
                                        selected && activeTheme.styles.rowSelected,
                                    ]}
                                    onPress={() => toggleValue(item.value)}>
                                    <View style={activeTheme.styles.rowLeft}>
                                        <Text style={[activeTheme.styles.rowLabel, { color: activeTheme.color.text }]}>{item.label}</Text>
                                        {!!item.description && (
                                            <Text style={[activeTheme.styles.rowDesc, { color: activeTheme.color.muted }]}>{item.description}</Text>
                                        )}
                                    </View>
                                    <Text style={{ color: selected ? activeTheme.color.primary : activeTheme.color.muted }}>
                                        {selected ? 'Selected' : ' '}
                                    </Text>
                                </TouchableOpacity>
                            );
                        }} />
                </Animated.View>
            </Modal>
        </View>
    );
}) as <T = any>(p: MultiSelectProps<T> & { ref?: React.Ref<MultiSelectHandle> }) => React.ReactElement;

const styles = StyleSheet.create({
    field: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    chips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        flex: 1,
    },
    dropdown: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: '60%',
    },
    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#CCC',
    },
    dropdownHeaderText: {
        fontWeight: '600',
        fontSize: 16,
    },
});
