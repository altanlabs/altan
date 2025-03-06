import { TableField } from "../store/types";
/**
 * Format any field value for display
 */
export declare function formatFieldValue(value: unknown, field?: TableField): string;
declare function formatDateValue(value: unknown, includeTime: boolean): string;
declare function formatBooleanValue(value: unknown): string;
declare function formatNumberValue(value: unknown, field: TableField): string;
declare function formatCurrencyValue(value: unknown, field: TableField): string;
declare function formatPercentValue(value: unknown, field: TableField): string;
declare function formatDurationValue(value: unknown): string;
declare function formatMultiSelectValue(value: unknown): string;
declare function formatJSONValue(value: unknown): string;
export declare const fieldHelpers: {
    formatFieldValue: typeof formatFieldValue;
    formatDateValue: typeof formatDateValue;
    formatBooleanValue: typeof formatBooleanValue;
    formatNumberValue: typeof formatNumberValue;
    formatCurrencyValue: typeof formatCurrencyValue;
    formatPercentValue: typeof formatPercentValue;
    formatDurationValue: typeof formatDurationValue;
    formatMultiSelectValue: typeof formatMultiSelectValue;
    formatJSONValue: typeof formatJSONValue;
};
export {};
//# sourceMappingURL=fields.d.ts.map