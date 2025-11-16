/**
 * Utility functions for table operations
 */

import type { CloudTable, CloudField, CloudInstance } from '../../../../services';

/**
 * Normalizes table ID to number format
 */
export const normalizeTableId = (tableId: string | number): number => {
  return typeof tableId === 'string' ? parseInt(tableId, 10) : tableId;
};

/**
 * Finds a table by ID in a cloud instance
 */
export const findTableById = (
  cloud: CloudInstance | undefined,
  tableId: string | number,
): CloudTable | undefined => {
  if (!cloud?.tables?.items) return undefined;
  const numericTableId = normalizeTableId(tableId);
  return cloud.tables.items.find((t) => t.id === numericTableId);
};

/**
 * Transforms columns to fields format for consistency
 */
export const transformColumnsToFields = (columns: CloudField[]): { items: CloudField[] } => {
  return {
    items: columns.map((col) => ({
      ...col,
      db_field_name: col.db_field_name ?? col.name,
    })),
  };
};

/**
 * Normalizes table data for storage
 */
export const normalizeTable = (table: CloudTable): CloudTable => ({
  id: table.id,
  name: table.name,
  schema: table.schema,
  rls_enabled: table.rls_enabled ?? false,
  relationships: table.relationships ?? [],
  fields: table.fields?.items
    ? table.fields
    : table.columns
    ? transformColumnsToFields(table.columns)
    : { items: [] },
});

/**
 * Text data types for searchable fields
 */
const TEXT_DATA_TYPES = ['text', 'character varying', 'varchar', 'char', 'character'] as const;

/**
 * Checks if text field is searchable based on data type
 */
export const isTextSearchableField = (field: CloudField): boolean => {
  const dataType = field.data_type?.toLowerCase() || '';
  return (TEXT_DATA_TYPES as readonly string[]).includes(dataType);
};

