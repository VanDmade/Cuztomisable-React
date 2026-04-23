// src/components/table/rows/DataTableRow.tsx
import { Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

export type DataTableRowProps<T> = {
    item: T;
    index: number;
    columns: any[];
    theme: any;
    rowKey?: (row: T, index: number) => string | number;
    onRowPress?: (row: T) => void;
    getRowStyle?: (row: T, index: number) => ViewStyle | undefined;
    getCellStyle?: (row: T, colKey: string, index: number) => ViewStyle | undefined;
    getCellTextStyle?: (row: T, colKey: string, index: number) => TextStyle | undefined;
};

export function DataTableRow<T>({
    item,
    index,
    columns,
    theme,
    rowKey,
    onRowPress,
    getRowStyle,
    getCellStyle,
    getCellTextStyle,
}: DataTableRowProps<T>) {
    const RowComponent = onRowPress ? TouchableOpacity : View;
    return (
        <RowComponent
            key={rowKey ? rowKey(item, index) : index}
            style={[
                theme.styles.row,
                theme.utils.pysm,
                theme.utils.pxsm,
                { borderBottomWidth: 1, borderBottomColor: theme.color.border },
                getRowStyle ? getRowStyle(item, index) : undefined,
            ]}
            onPress={onRowPress ? () => onRowPress(item) : undefined}>
        {columns.map((col) => {
            const value = col.render ? col.render(item) : col.accessor ? col.accessor(item) : (item as any)?.[col.key];
            return (
                <View
                    key={col.key}
                    style={[
                        { width: col.width, flex: col.flex ?? (col.width ? 0 : 1), paddingRight: 12 },
                        col.cellStyle,
                        getCellStyle ? getCellStyle(item, col.key, index) : undefined,
                    ]}>
                    {typeof value === 'string' || typeof value === 'number' || value === null || value === undefined ? (
                        <Text
                            style={[
                                { color: theme.color.text, textAlign: col.align ?? 'left' },
                                col.cellTextStyle,
                                getCellTextStyle ? getCellTextStyle(item, col.key, index) : undefined,
                            ]}>
                            {value ?? '--'}
                        </Text>
                    ) : (
                        <View>{value}</View>
                    )}
                </View>
            );
        })}
        </RowComponent>
    );
}
