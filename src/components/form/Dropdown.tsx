// src/components/form/Dropdown.tsx
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    FlatList,
    Keyboard,
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
import { makeFormStyles } from './styles';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export type DropdownOption<T = any> = {
    label: string;
    value: T;
    description?: string;
    rightText?: string;
    selectedText?: string;
    divider?: boolean;
};

export type DropdownHandle = {
    open: () => void;
    close: () => void;
};

type DropdownProps<T = any> = {
    theme?: Theme;
    label?: string;
    value?: T;
    onSelect: (val: T) => void;
    options: DropdownOption<T>[];
    placeholder?: string;
    disabled?: boolean;
    bordered?: boolean;
    containerStyle?: ViewStyle;
    textStyle?: TextStyle;
    subTextStyle?: TextStyle;
    fieldStyle?: ViewStyle;
    modalTitle?: string;
    showField?: boolean;
};

export const Dropdown = forwardRef(function DropdownInner<T = any>(
    {
        theme,
        label,
        value,
        onSelect,
        options,
        placeholder = 'Select...',
        disabled = false,
        bordered = false,
        containerStyle,
        textStyle,
        subTextStyle,
        fieldStyle,
        modalTitle = 'Select an option',
        showField = true,
    }: DropdownProps<T>,
    ref: React.Ref<DropdownHandle>
) {
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
                Keyboard.dismiss();
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
        if (disabled) return;
        Keyboard.dismiss();
        setVisible(true);
    };

    const close = () => animateOutAnd(() => setVisible(false));
    const selectedOption = options.find(opt => !opt?.divider && opt?.value === value);

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
                        bordered && [{ borderWidth: 1, borderColor: activeTheme.color.border }, formStyles.input, activeTheme.utils.pxmd],
                        fieldStyle,
                        containerStyle,
                        disabled && formStyles.inputDisabled,
                    ]}
                    onPress={open}
                    disabled={disabled}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <Text
                            style={[
                                { color: activeTheme.color.text, flex: 1 },
                                !selectedOption && activeTheme.typography.variants.placeholder,
                                textStyle,
                            ]}
                            numberOfLines={1}>
                            {selectedOption ? (selectedOption.selectedText ?? selectedOption.label) : placeholder}
                        </Text>
                        <Text style={[activeTheme.styles.chevron, textStyle, { marginLeft: 8, flexShrink: 0 }]}>▼</Text>
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
                            <Text style={{ color: activeTheme.color.link, fontWeight: '600' }}>Close</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        style={{ flex: 1 }}
                        keyboardShouldPersistTaps="handled"
                        data={options}
                        keyExtractor={(_, idx) => String(idx)}
                        renderItem={({ item }) => item.divider ? (
                            <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: activeTheme.color.border, marginHorizontal: 16, marginVertical: 4 }} />
                        ) : (
                            <TouchableOpacity
                                style={[
                                    activeTheme.styles.row,
                                    activeTheme.styles.rowSpaceBetween,
                                    activeTheme.utils.pymd,
                                    activeTheme.utils.pxmd,
                                    value === item.value && activeTheme.styles.rowSelected,
                                    { color: activeTheme.color.text },
                                ]}
                                onPress={() => {
                                    onSelect(item.value);
                                    close();
                                }}>
                                 <View style={[activeTheme.styles.rowLeft]}>
                                    <Text style={[activeTheme.styles.rowLabel, textStyle, { color: activeTheme.color.text }]}>{item.label}</Text>
                                    {!!item.description && <Text style={[activeTheme.styles.rowDesc, subTextStyle, { color: activeTheme.color.muted }]}>{item.description}</Text>}
                                </View>
                                 <View style={[activeTheme.styles.rowRight]}>
                                    {!!item.rightText && <Text style={[activeTheme.styles.rowRightText, textStyle, { color: activeTheme.color.text }]}>{item.rightText}</Text>}
                                </View>
                            </TouchableOpacity>
                        )} />
                </Animated.View>
            </Modal>
        </View>
    );
}) as <T = any>(p: DropdownProps<T> & { ref?: React.Ref<DropdownHandle> }) => React.ReactElement;

const styles = StyleSheet.create({
    field: {
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
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
