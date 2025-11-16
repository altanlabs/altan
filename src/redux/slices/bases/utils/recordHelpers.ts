/**
 * Record deduplication and manipulation helpers
 */

import type { BaseRecord } from '../../../../types/database';

/**
 * Deduplicates an array of records based on ID or content
 */
export const deduplicateRecords = (recordsArray: BaseRecord[]): BaseRecord[] => {
  const seen = new Map<string, boolean>();
  return recordsArray.filter((record) => {
    if (!record) return false;

    let recordKey: string;
    if (record.id) {
      recordKey = String(record.id);
    } else {
      recordKey = JSON.stringify(
        Object.keys(record)
          .sort()
          .reduce((acc: Record<string, unknown>, key) => {
            acc[key] = record[key];
            return acc;
          }, {}),
      );
    }

    if (seen.has(recordKey)) return false;
    seen.set(recordKey, true);
    return true;
  });
};

/**
 * Text data types that can be searched
 */
const TEXT_DATA_TYPES = ['text', 'character varying', 'varchar', 'char', 'character'] as const;

/**
 * Checks if a field is searchable (text-based)
 */
export const isTextSearchableField = (dataType: string | undefined): boolean => {
  if (!dataType) return false;
  const normalizedType = dataType.toLowerCase();
  return (TEXT_DATA_TYPES as readonly string[]).includes(normalizedType);
};

/**
 * Checks if table has a created_at field
 */
export const hasCreatedAtField = (fields: { name?: string; db_field_name?: string }[]): boolean => {
  return fields.some((field) => {
    const fieldName = (field.name || field.db_field_name || '').toLowerCase();
    return fieldName === 'created_at' || fieldName === 'createdat';
  });
};

