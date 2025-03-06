import { FieldType, TableField } from "../store/types"

/**
 * Format any field value for display
 */
export function formatFieldValue(value: unknown, field?: TableField): string {
  if (value === null || value === undefined) return '';
  
  // Handle specific field types if provided
  if (field?.type) {
    switch (field.type) {
      case FieldType.Date:
        return formatDateValue(value, false);
      case FieldType.DateTime:
        return formatDateValue(value, true);
      case FieldType.Checkbox:
        return formatBooleanValue(value);
      case FieldType.Number:
        return formatNumberValue(value, field);
      case FieldType.Currency:
        return formatCurrencyValue(value, field);
      case FieldType.Percent:
        return formatPercentValue(value, field);
      case FieldType.Duration:
        return formatDurationValue(value);
      case FieldType.MultiSelect:
        return formatMultiSelectValue(value);
      case FieldType.JSON:
        return formatJSONValue(value);
      case FieldType.User:
      case FieldType.Attachment:
        return formatJSONValue(value);
      default:
        return String(value);
    }
  }

  // Default handling based on value type
  if (value instanceof Date) return formatDateValue(value, true);
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

// Helper functions
function formatDateValue(value: unknown, includeTime: boolean): string {
  try {
    const date = value instanceof Date ? value : new Date(String(value));
    return includeTime ? date.toLocaleString() : date.toLocaleDateString();
  } catch {
    return String(value);
  }
}

function formatBooleanValue(value: unknown): string {
  return Boolean(value) ? 'Yes' : 'No';
}

function formatNumberValue(value: unknown, field: TableField): string {
  try {
    const num = Number(value);
    if (isNaN(num)) return String(value);
    
    if (field.decimals !== undefined) {
      return num.toFixed(field.decimals);
    }
    
    return String(num);
  } catch {
    return String(value);
  }
}

function formatCurrencyValue(value: unknown, field: TableField): string {
  try {
    const num = Number(value);
    if (isNaN(num)) return String(value);
    
    return new Intl.NumberFormat(field.locale || 'en-US', {
      style: 'currency',
      currency: field.currency || 'USD'
    }).format(num);
  } catch {
    return String(value);
  }
}

function formatPercentValue(value: unknown, field: TableField): string {
  try {
    const num = Number(value);
    if (isNaN(num)) return String(value);
    return `${(num * 100).toFixed(field.decimals || 0)}%`;
  } catch {
    return String(value);
  }
}

function formatDurationValue(value: unknown): string {
  try {
    const ms = Number(value);
    if (isNaN(ms)) return String(value);
    
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    return `${hours}h ${minutes}m ${seconds}s`;
  } catch {
    return String(value);
  }
}

function formatMultiSelectValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return String(value);
}

function formatJSONValue(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export const fieldHelpers = {
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