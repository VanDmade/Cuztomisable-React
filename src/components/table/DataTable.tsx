// src/components/table/DataTable.tsx
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, ScrollView, Text, TextInput, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { getApi as api } from '../../api/api';
import { Dropdown, type DropdownOption } from '../../components/form/Dropdown';
import { FormInput } from '../../components/form/Input';
import Button from '../../components/ui/Button';
import { useTheme } from '../../providers/ThemeProvider';
import { DataTableRow } from './rows/DataTableRow';

export type DataTableColumn<T> = {
    key: string;
    title: string;
    width?: number;
    flex?: number;
    align?: 'left' | 'center' | 'right';
    render?: (row: T) => React.ReactNode;
    accessor?: (row: T) => string | number | null | undefined;
    headerStyle?: StyleProp<ViewStyle>;
    headerTextStyle?: StyleProp<TextStyle>;
    cellStyle?: StyleProp<ViewStyle>;
    cellTextStyle?: StyleProp<TextStyle>;
};

export type DataTableFilter = {
    key: string;
    label: string;
    options: DropdownOption<string | number>[];
    placeholder?: string;
    defaultValue?: string | number;
};

type PaginationMeta = {
    total?: number;
    page?: number;
    perPage?: number;
};

type DataTableProps<T> = {
    url?: string;
    columns: DataTableColumn<T>[];
    rowKey?: (row: T, index: number) => string | number;
    searchable?: boolean;
    filters?: DataTableFilter[];
    filterButton?: React.ReactNode;
    initialPageSize?: number;
    pageSizeOptions?: number[];
    extraParams?: Record<string, any>;
    onRowPress?: (row: T) => void;
    getRowStyle?: (row: T, index: number) => ViewStyle | undefined;
    getCellStyle?: (row: T, colKey: string, index: number) => ViewStyle | undefined;
    getCellTextStyle?: (row: T, colKey: string, index: number) => TextStyle | undefined;
    showHeader?: boolean;
    minLoadingDuration?: number;
    renderLoading?: React.ReactNode;
    renderRow?: (props: {
        item: T;
        index: number;
        setRows: React.Dispatch<React.SetStateAction<T[]>>;
    }) => React.ReactNode;
};

const DEFAULT_PAGE_SIZES = [10, 25, 50];

function extractRows<T>(payload: any): { rows: T[]; meta?: PaginationMeta } {
    if (!payload) {
        return { rows: [] };
    }

    if (Array.isArray(payload)) {
        return { rows: payload };
    }

    if (Array.isArray(payload.data)) {
        const { data, ...meta } = payload;
        return { rows: data, meta };
    }

    if (Array.isArray(payload?.items)) {
        return { rows: payload.items, meta: payload.meta ?? payload.pagination };
    }

    return { rows: [], meta: payload?.meta ?? payload?.pagination };
}

export function DataTable<T>({
    url,
    columns,
    rowKey,
    searchable = true,
    filters = [],
    filterButton,
    initialPageSize = 10,
    pageSizeOptions = DEFAULT_PAGE_SIZES,
    extraParams,
    onRowPress,
    getRowStyle,
    getCellStyle,
    getCellTextStyle,
    showHeader = true,
    minLoadingDuration = 0,
    renderLoading,
    renderRow,
}: DataTableProps<T>) {
    const theme = useTheme();

    const [rows, setRows] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterValues, setFilterValues] = useState<Record<string, string | number | undefined>>(() => {
        return filters.reduce((acc, f) => {
            acc[f.key] = f.defaultValue;
            return acc;
        }, {} as Record<string, string | number | undefined>);
    });
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [pageInput, setPageInput] = useState(String(page));

    useEffect(() => {
        const id = setTimeout(() => setSearchTerm(searchInput.trim()), 350);
        return () => clearTimeout(id);
    }, [searchInput]);

    useEffect(() => {
        setPage(1);
        setPageInput('1');
    }, [searchTerm, pageSize, filterValues, extraParams]);

    useEffect(() => {
        setPageInput(String(page));
    }, [page]);

    const params = useMemo(() => {
        const baseParams: Record<string, any> = {
            page,
            per_page: pageSize,
        };
        if (searchTerm) {
            baseParams.search = searchTerm;
        }
        Object.entries(filterValues).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                baseParams[key] = value;
            }
        });
        return {
            ...baseParams,
            filters: Object.entries(extraParams ?? {}).map(([key, value]) => ({
                key,
                value,
            })),
        };
    }, [page, pageSize, searchTerm, filterValues, extraParams]);

    useEffect(() => {
        if (!url) {
            return;
        }
        let active = true;
        const load = async () => {
            const startTime = Date.now();
            try {
                setLoading(true);
                setError(null);
                const response = await api().get(url, { params });
                const payload = extractRows<T>(response.data);
                if (!active) {
                    return;
                }
                setRows(payload.rows ?? []);
                setMeta({
                    total: payload.meta?.total ?? 0,
                    page: payload.meta?.page ?? 1,
                    perPage: payload.meta?.perPage ?? 0,
                });
            } catch (err: any) {
                if (!active) {
                    return;
                }
                setError(err?.message ?? 'Unable to load data.');
                setRows([]);
                setMeta(null);
            } finally {
                if (active) {
                    const elapsed = Date.now() - startTime;
                    const remaining = minLoadingDuration - elapsed;
                    if (remaining > 0) {
                        await new Promise((resolve) => setTimeout(resolve, remaining));
                    }
                    if (active) {
                        setLoading(false);
                    }
                }
            }
        };
        load();
        return () => {
            active = false;
        };
    }, [url, params]);

    const total = meta?.total;
    const maxPage = total ? Math.max(1, Math.ceil(total / pageSize)) : null;
    const canPrev = page > 1 && !loading;
    const canNext = !loading && (maxPage ? page < maxPage : rows.length === pageSize);

    const renderHeader = () => {
        if (!columns || !Array.isArray(columns) || columns.length === 0) {
            return null;
        }
        return (
            <View
                style={[
                    theme.styles.row,
                    theme.utils.pysm,
                    theme.utils.pxsm,
                    {
                        borderBottomWidth: 1,
                        borderBottomColor: theme.color.border,
                    },
                ]}>
                {columns.map((col) => (
                    <View
                        key={col.key}
                        style={{
                            width: col.width,
                            flex: col.flex ?? (col.width ? 0 : 1),
                            paddingRight: 12,
                            ...(col.headerStyle as object),
                        }}>
                        <Text
                            style={[
                                theme.typography.variants.caption,
                                {
                                    color: theme.color.muted,
                                    textAlign: col.align ?? 'left',
                                },
                                col.headerTextStyle,
                            ]}>
                            {col.title}
                        </Text>
                    </View>
                ))}
            </View>
        );
    };

    const defaultRenderRow = ({ item, index }: { item: T; index: number }) => {
        if (!columns || !Array.isArray(columns) || columns.length === 0) {
            return null;
        }
        return (
            <DataTableRow
                item={item}
                index={index}
                columns={columns}
                theme={theme}
                rowKey={rowKey}
                onRowPress={onRowPress}
                getRowStyle={getRowStyle}
                getCellStyle={getCellStyle}
                getCellTextStyle={getCellTextStyle} />
        );
    };

    return (
        <View style={[theme.styles.container, theme.styles.background]}>
            <View>
                {(searchable || filterButton) ? (
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'stretch',
                            gap: 0,
                            marginBottom: 12,
                        }}>
                        <View style={{ flex: 1 }}>
                            {searchable ? (
                                <FormInput
                                    theme={theme}
                                    placeholder="Search..."
                                    value={searchInput}
                                    onChangeText={setSearchInput}
                                    hideDetails
                                    fontSize={18}
                                    style={[filterButton ? { borderTopRightRadius: 0, borderBottomRightRadius: 0 } : null]}
                                    inputContainerStyle={{
                                        borderTopRightRadius: 0,
                                        borderBottomRightRadius: 0,
                                    }}
                                />
                            ) : null}
                        </View>
                        {filterButton ? (<View>{filterButton}</View>) : null}
                    </View>
                ) : null}
                {filters.length > 0 ? (
                    <View style={[theme.styles.row, { gap: 12, flexWrap: 'wrap' }]}>
                        {filters.map((filter) => (
                            <View key={filter.key} style={{ minWidth: 160, flex: 1 }}>
                                <Dropdown
                                    theme={theme}
                                    options={filter.options}
                                    value={filterValues[filter.key]}
                                    placeholder={filter.placeholder ?? filter.label}
                                    onSelect={(val) => {
                                        setFilterValues((prev) => ({
                                            ...prev,
                                            [filter.key]: val,
                                        }));
                                    }} />
                            </View>
                        ))}
                    </View>
                ) : null}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ minWidth: '100%' }}>
                    {showHeader ? renderHeader() : null}

                    {loading ? (
                        renderLoading ?? (
                            <View style={[theme.utils.pxmd, theme.utils.pymd]}>
                                <Text style={{ color: theme.color.muted }}>Loading...</Text>
                            </View>
                        )
                    ) : error ? (
                        <View style={[theme.utils.pxmd, theme.utils.pymd]}>
                            <Text style={{ color: theme.color.danger }}>{error}</Text>
                        </View>
                    ) : rows.length === 0 ? (
                        <View style={[theme.utils.pxmd, theme.utils.pymd]}>
                            <Text style={{ color: theme.color.muted }}>No results found.</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={rows}
                            keyExtractor={(item, index) =>
                                String(rowKey ? rowKey(item, index) : index)
                            }
                            renderItem={({ item, index }) =>
                                renderRow
                                    ? renderRow({ item, index, setRows })
                                    : defaultRenderRow({ item, index })
                            } />
                    )}
                </View>
            </ScrollView>
            <View style={[theme.utils.ptmd]}>
                <Dropdown
                    theme={theme}
                    value={pageSize}
                    options={pageSizeOptions.map((size) => ({
                        label: String(size),
                        value: size,
                    }))}
                    onSelect={(val) => setPageSize(Number(val))}
                    bordered />
            </View>
            <View
                style={[
                    theme.utils.ptmd,
                    {
                        flexDirection: 'row',
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    },
                ]}>
                <Button
                    iconOnly
                    disabled={!canPrev}
                    onPress={() => setPage((p) => Math.max(1, p - 1))}
                    left={
                        <MaterialIcons
                            name="chevron-left"
                            size={20}
                            color={canPrev ? theme.color.buttonTextColor : theme.color.muted} />
                    } />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ color: theme.color.muted, fontSize: 21 }}>Page</Text>
                    <TextInput
                        value={pageInput}
                        onChangeText={setPageInput}
                        onBlur={() => {
                            const parsed = parseInt(pageInput, 10);
                            if (!isNaN(parsed)) {
                                const clamped = Math.max(1, Math.min(parsed, maxPage ?? parsed));
                                setPage(clamped);
                                setPageInput(String(clamped));
                            } else {
                                setPageInput(String(page));
                            }
                        }}
                        keyboardType="number-pad"
                        selectTextOnFocus
                        style={{
                            color: theme.color.text,
                            fontSize: 21,
                            fontWeight: '600',
                            borderBottomWidth: 1,
                            borderBottomColor: theme.color.border,
                            minWidth: 32,
                            textAlign: 'center',
                            paddingVertical: 2,
                        }} />
                    {maxPage ? (
                        <Text style={{ color: theme.color.muted, fontSize: 21 }}>of {maxPage}</Text>
                    ) : null}
                </View>
                <Button
                    iconOnly
                    disabled={!canNext}
                    onPress={() => setPage((p) => Math.min(maxPage ?? p + 1, p + 1))}
                    left={
                        <MaterialIcons
                            name="chevron-right"
                            size={20}
                            color={canNext ? theme.color.buttonTextColor : theme.color.muted} />
                    } />
            </View>
        </View>
    );
}