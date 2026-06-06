import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';

import { useTheme } from '../../providers/ThemeProvider';
import { Theme } from '../../theme/theme';
import Button from '../ui/Button';
import { makeFormStyles } from './styles';

export type MultiEntryItem = {
    id?: string;
    steps?: number | string;
    alternatives?: MultiEntryItem[];
    [key: string]: any;
};

type RenderArgs<T> = {
    value: T[];
    item: T;
    index: number;
    alternativeIndex: number | null;
    canRemove: boolean;
};

type MultiEntryProps<T extends MultiEntryItem> = {
    theme?: Theme;
    value: T[];
    onChange: (next: T[]) => void;
    template: T;
    disabled?: boolean;
    removeAll?: boolean;
    startWithOne?: boolean;
    label?: string;
    notes?: string;
    addButton?: boolean;
    removeLabel?: string;
    steps?: boolean;
    reorganize?: boolean;
    draggable?: boolean;
    compactRemove?: boolean;
    renderEntry: (args: RenderArgs<T>) => React.ReactNode;
    renderSettings?: (args: RenderArgs<T>) => React.ReactNode;
    renderFooter?: (args: RenderArgs<T>) => React.ReactNode;
    onAdd?: () => void;
    onRemove?: () => void;
};

export const FormMultiEntry = <T extends MultiEntryItem>({
    theme,
    value,
    onChange,
    template,
    disabled = false,
    removeAll = false,
    startWithOne = true,
    label,
    notes,
    addButton = true,
    removeLabel = 'Remove',
    steps = false,
    reorganize = true,
    draggable = false,
    compactRemove = false,
    renderEntry,
    renderSettings,
    renderFooter,
    onAdd,
    onRemove,
}: MultiEntryProps<T>) => {
    const activeTheme = theme ?? useTheme();
    const styles = useMemo(() => makeStyles(activeTheme), [activeTheme]);
    const formStyles = useMemo(() => makeFormStyles(activeTheme), [activeTheme]);

    const [asking, setAsking] = useState<Record<string, boolean>>({});
    const [counter, setCounter] = useState(0);

    useEffect(() => {
        if (startWithOne && value.length === 0) handleAdd();
    }, []);

    const setValue = (next: T[]) => onChange(next);

    const handleAdd = () => {
        const nextCounter = counter + 1;
        setCounter(nextCounter);
        const nextItem = { ...template, id: `NEW-${nextCounter}` } as T;
        setValue([...value, nextItem]);
        onAdd?.();
    };

    const handleRemove = (index: number, force = false) => {
        if (!removeAll && value.length === 1) return;
        if (force) {
            const next = [...value];
            next.splice(index, 1);
            setValue(next);
            onRemove?.();
            return;
        }
        const key = `${index}`;
        if (asking[key]) {
            setAsking((p) => ({ ...p, [key]: false }));
            const next = [...value];
            next.splice(index, 1);
            setValue(next);
            onRemove?.();
        } else {
            setAsking((p) => ({ ...p, [key]: true }));
            setTimeout(() => {
                setAsking((p) => ({ ...p, [key]: false }));
            }, 2500);
        }
    };

    const reorderUp = (index: number) => {
        if (index === 0) return;
        const next = [...value];
        [next[index - 1], next[index]] = [next[index], next[index - 1]];
        setValue(next);
    };

    const reorderDown = (index: number) => {
        if (index === value.length - 1) return;
        const next = [...value];
        [next[index + 1], next[index]] = [next[index], next[index + 1]];
        setValue(next);
    };

    const renderItem = (item: T, index: number, drag?: () => void, isActive?: boolean) => {
        const isAsking = asking[`${index}`] ?? false;
        const canRemove = removeAll || value.length > 1;

        return (
            <View key={item.id ?? index} style={styles.entryRow}>
                <View style={styles.entryControls}>
                    {draggable && drag && (
                        <TouchableOpacity
                            onPressIn={drag}
                            delayPressIn={0}
                            hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                            style={styles.dragHandle}>
                            <MaterialIcons name="drag-indicator" size={22} color={activeTheme.color.muted} />
                        </TouchableOpacity>
                    )}

                    {steps && (
                        <View style={styles.stepBadge}>
                            <Text style={{ color: activeTheme.color.text }}>
                                {index + 1}
                            </Text>
                        </View>
                    )}

                    <View style={styles.entryContent}>
                        {renderEntry({ value, item, index, alternativeIndex: null, canRemove })}
                    </View>

                    {!draggable && reorganize && value.length > 1 && (
                        <View style={styles.reorderRow}>
                            <Button
                                iconOnly
                                intent="secondary"
                                buttonStyle={{ borderRadius: 0, height: 49, paddingTop: 5 }}
                                left={
                                    <MaterialIcons
                                        name="arrow-upward"
                                        size={20}
                                        color={
                                            index === 0
                                                ? activeTheme.color.muted ?? activeTheme.color.border
                                                : activeTheme.color.text
                                        } />
                                }
                                onPress={() => reorderUp(index)}
                                disabled={index === 0} />
                            <Button
                                iconOnly
                                intent="secondary"
                                buttonStyle={{ borderRadius: 0, height: 49, paddingTop: 5 }}
                                left={
                                    <MaterialIcons
                                        name="arrow-downward"
                                        size={20}
                                        color={
                                            index === value.length - 1
                                                ? activeTheme.color.muted ?? activeTheme.color.border
                                                : activeTheme.color.text
                                        }
                                    />
                                }
                                onPress={() => reorderDown(index)}
                                disabled={index === value.length - 1} />
                        </View>
                    )}

                    {canRemove && (
                        <Button
                            left={
                                compactRemove ? (
                                    <MaterialIcons name="delete" size={18} color="white" />
                                ) : undefined
                            }
                            title={
                                compactRemove ? undefined : isAsking ? 'Are you sure?' : removeLabel
                            }
                            buttonStyle={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, height: 49, paddingTop: 6 }}
                            onPress={() => handleRemove(index, compactRemove)}
                            iconOnly
                            intent="danger" />
                    )}
                    {renderSettings && (
                        <View style={styles.settings}>
                            {renderSettings({ value, item, index, alternativeIndex: null, canRemove })}
                        </View>
                    )}
                </View>
                {renderFooter && renderFooter({ value, item, index, alternativeIndex: null, canRemove })}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View style={styles.headerLeft}>
                    {label && <Text style={formStyles.label}>{label}</Text>}
                    {notes && <Text style={formStyles.helper}>{notes}</Text>}
                </View>
                {addButton && (
                    <Button
                        iconOnly
                        intent="primary"
                        size="sm"
                        left={<MaterialIcons name="add" size={20} color="white" />}
                        onPress={handleAdd}
                        disabled={disabled}
                    />
                )}
            </View>

            {draggable ? (
                <DraggableFlatList
                    data={value}
                    keyExtractor={(item, index) => String(item.id ?? index)}
                    onDragEnd={({ data }) => setValue(data)}
                    scrollEnabled={false}
                    renderItem={({ item, index, drag, isActive }: RenderItemParams<T>) => (
                        <ScaleDecorator>
                            {renderItem(item, index, drag, isActive)}
                        </ScaleDecorator>
                    )} />
            ) : (
                value.map((item, index) => renderItem(item, index))
            )}
        </View>
    );
};

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        container: { width: '100%' },

        headerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10,
        },

        headerLeft: { flex: 1 },

        entryRow: { marginBottom: 16 },

        entryControls: {
            flexDirection: 'row',
            alignItems: 'stretch',
        },

        dragHandle: {
            width: 36,
            minHeight: 49,
            alignItems: 'center',
            justifyContent: 'center',
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
            borderWidth: 1,
            borderRightWidth: 0,
            borderColor: theme.color.border,
            backgroundColor: theme.color.surface,
        },

        stepBadge: {
            minWidth: 40,
            height: 44,
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
            borderWidth: 1,
            borderColor: theme.color.border,
            alignItems: 'center',
            justifyContent: 'center',
        },

        entryContent: { flex: 1 },

        reorderRow: {
            flexDirection: 'row',
        },

        settings: {
            marginLeft: 6,
            justifyContent: 'center',
        },
    });
