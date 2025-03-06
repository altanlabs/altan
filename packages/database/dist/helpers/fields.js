"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fieldHelpers = void 0;
exports.formatFieldValue = formatFieldValue;
const types_1 = require("../store/types");
/**
 * Format any field value for display
 */
function formatFieldValue(value, field) {
    if (value === null || value === undefined)
        return '';
    // Handle specific field types if provided
    if (field === null || field === void 0 ? void 0 : field.type) {
        switch (field.type) {
            case types_1.FieldType.Date:
                return formatDateValue(value, false);
            case types_1.FieldType.DateTime:
                return formatDateValue(value, true);
            case types_1.FieldType.Checkbox:
                return formatBooleanValue(value);
            case types_1.FieldType.Number:
                return formatNumberValue(value, field);
            case types_1.FieldType.Currency:
                return formatCurrencyValue(value, field);
            case types_1.FieldType.Percent:
                return formatPercentValue(value, field);
            case types_1.FieldType.Duration:
                return formatDurationValue(value);
            case types_1.FieldType.MultiSelect:
                return formatMultiSelectValue(value);
            case types_1.FieldType.JSON:
                return formatJSONValue(value);
            case types_1.FieldType.User:
            case types_1.FieldType.Attachment:
                return formatJSONValue(value);
            default:
                return String(value);
        }
    }
    // Default handling based on value type
    if (value instanceof Date)
        return formatDateValue(value, true);
    if (typeof value === 'object')
        return JSON.stringify(value);
    return String(value);
}
// Helper functions
function formatDateValue(value, includeTime) {
    try {
        const date = value instanceof Date ? value : new Date(String(value));
        return includeTime ? date.toLocaleString() : date.toLocaleDateString();
    }
    catch (_a) {
        return String(value);
    }
}
function formatBooleanValue(value) {
    return Boolean(value) ? 'Yes' : 'No';
}
function formatNumberValue(value, field) {
    try {
        const num = Number(value);
        if (isNaN(num))
            return String(value);
        if (field.decimals !== undefined) {
            return num.toFixed(field.decimals);
        }
        return String(num);
    }
    catch (_a) {
        return String(value);
    }
}
function formatCurrencyValue(value, field) {
    try {
        const num = Number(value);
        if (isNaN(num))
            return String(value);
        return new Intl.NumberFormat(field.locale || 'en-US', {
            style: 'currency',
            currency: field.currency || 'USD'
        }).format(num);
    }
    catch (_a) {
        return String(value);
    }
}
function formatPercentValue(value, field) {
    try {
        const num = Number(value);
        if (isNaN(num))
            return String(value);
        return `${(num * 100).toFixed(field.decimals || 0)}%`;
    }
    catch (_a) {
        return String(value);
    }
}
function formatDurationValue(value) {
    try {
        const ms = Number(value);
        if (isNaN(ms))
            return String(value);
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${hours}h ${minutes}m ${seconds}s`;
    }
    catch (_a) {
        return String(value);
    }
}
function formatMultiSelectValue(value) {
    if (Array.isArray(value)) {
        return value.join(', ');
    }
    return String(value);
}
function formatJSONValue(value) {
    try {
        return JSON.stringify(value, null, 2);
    }
    catch (_a) {
        return String(value);
    }
}
exports.fieldHelpers = {
    formatFieldValue,
    formatDateValue,
    formatBooleanValue,
    formatNumberValue,
    formatCurrencyValue,
    formatPercentValue,
    formatDurationValue,
    formatMultiSelectValue,
    formatJSONValue
};
//# sourceMappingURL=fields.js.map