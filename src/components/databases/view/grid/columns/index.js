import { getAttachmentColumnDef } from './attachmentColumnDef';
import { getCheckboxColumnDef } from './checkboxColumnDef.jsx';
import { getCreatedAtColumnDef } from './createdAtColumnDef.jsx';
import { getCreatedByColumnDef } from './createdByColumnDef.jsx';
import { getCurrencyColumnDef } from './currencyColumnDef.jsx';
import { getDefaultColumnDef } from './defaultColumnDef.jsx';
import { getIdColumnDef } from './idColumnDef.jsx';
import { getJsonColumnDef } from './jsonColumnDef.jsx';
import { getLongTextColumnDef } from './longTextColumnDef.jsx';
import { getNewColumnDef } from './newColumnDef.jsx';
import { getRatingColumnDef } from './ratingColumnDef.jsx';
import { getReferenceColumnDef } from './referenceColumnDef.jsx';
import { getSelectColumnDef } from './selectColumnDef.jsx';
import { getTriggerColumnDef } from './triggerColumnDef.jsx';
import { getUpdatedAtColumnDef } from './updatedAtColumnDef.jsx';
import { getUpdatedByColumnDef } from './updatedByColumnDef.jsx';
import { getUrlColumnDef } from './urlColumnDef.jsx';
import { getUserColumnDef } from './userColumnDef.jsx';
import { FIELD_TYPES } from '../../../fields/utils/fieldTypes';

/**
 * Map PostgreSQL data_type to appropriate column definition
 */
const getColumnDefForPostgresType = (dataType, format) => {
  const lowerType = (dataType || '').toLowerCase();
  const lowerFormat = (format || '').toLowerCase();

  // JSON types
  if (lowerType === 'jsonb' || lowerType === 'json') {
    return 'json';
  }

  // Boolean types
  if (lowerType === 'boolean' || lowerType === 'bool') {
    return 'checkbox';
  }

  // UUID types (could be user references)
  if (lowerType === 'uuid' || lowerFormat === 'uuid') {
    return 'uuid';
  }

  // Numeric types
  if (
    lowerType === 'numeric' ||
    lowerType === 'decimal' ||
    lowerType === 'integer' ||
    lowerType === 'bigint' ||
    lowerType === 'smallint' ||
    lowerType === 'real' ||
    lowerType === 'double precision'
  ) {
    return 'number';
  }

  // Timestamp types
  if (
    lowerType.includes('timestamp') ||
    lowerFormat === 'timestamptz' ||
    lowerType === 'date' ||
    lowerType === 'time'
  ) {
    return 'timestamp';
  }

  // Text types (includes varchar, char, text)
  return 'text';
};

export const createColumnDefs = ({
  fields,
  table,
  members,
  handleExpandRecord,
  setShowFieldDialog,
  getCommonFieldMenuItems,
  onEditField,
  getAdditionalColumnProps,
  baseId,
}) => {
  const getFieldIcon = (dataType) => {
    // Map PostgreSQL types to icons
    const columnType = getColumnDefForPostgresType(dataType);
    const typeMapping = {
      json: 'json',
      checkbox: 'checkbox',
      number: 'number',
      timestamp: 'date',
      uuid: 'text', // UUID fields default to text icon
      text: 'text',
    };
    const mappedType = typeMapping[columnType] || 'text';
    return FIELD_TYPES.find((type) => type.id === mappedType)?.icon;
  };

  // System field names that should appear on the right
  const systemFieldNames = ['created_at', 'updated_at', 'created_by', 'updated_by'];

  // Separate regular fields from system fields
  const regularFields = fields.filter(
    (field) => field.name !== 'id' && !systemFieldNames.includes(field.name),
  );
  const systemFields = fields.filter((field) => systemFieldNames.includes(field.name));

  // Sort system fields in specific order
  const sortedSystemFields = systemFieldNames
    .map((name) => systemFields.find((f) => f.name === name))
    .filter(Boolean);

  return [
    // 1. ID column (left-most, with expand icon)
    getIdColumnDef({ handleExpandRecord }),

    // 2. Regular user-defined fields (middle)
    ...regularFields.map((field) => {
      // Check if this field is a foreign key by looking at table relationships
      // Note: pg-meta relationships don't have constraint_type, but all relationships are foreign keys
      const foreignKeyRelationship = table.relationships?.find(
        (rel) => rel.source_column_name === field.db_field_name,
      );
      const isForeignKey = !!foreignKeyRelationship;

      // Determine column type based on PostgreSQL data_type
      const columnType = getColumnDefForPostgresType(field.data_type, field.format);

      // Add the icon component and ensure we use db_field_name
      const fieldWithIcon = {
        ...field,
        icon: getFieldIcon(field.data_type),
        field: field.db_field_name,
        headerName: field.name,
      };

      // Get additional column props if provided
      const additionalProps = getAdditionalColumnProps ? getAdditionalColumnProps(field) : {};

      // If this is a foreign key, use reference column definition
      if (isForeignKey && foreignKeyRelationship) {
        const fieldWithFKOptions = {
          ...fieldWithIcon,
          options: {
            reference_options: {
              foreign_table: foreignKeyRelationship.target_table_name,
              foreign_table_name: foreignKeyRelationship.target_table_name,
              relationship_name: foreignKeyRelationship.constraint_name,
              target_column_name: foreignKeyRelationship.target_column_name,
            },
          },
        };
        return getReferenceColumnDef({
          field: fieldWithFKOptions,
          table,
          getCommonFieldMenuItems,
          onEditField,
          additionalProps,
          baseId,
        });
      }

      // Map PostgreSQL types to column definitions
      switch (columnType) {
        case 'json':
          return getJsonColumnDef({
            field: fieldWithIcon,
            getCommonFieldMenuItems,
            onEditField,
            additionalProps,
          });
        case 'checkbox':
          return getCheckboxColumnDef({
            field: fieldWithIcon,
            getCommonFieldMenuItems,
            onEditField,
            additionalProps,
          });
        case 'uuid':
          // Check field name to determine if it's a user reference
          // (system fields like created_by/updated_by are handled at the end)
          if (field.name.includes('user_id') || field.name.endsWith('_by')) {
            return getUserColumnDef({
              field: fieldWithIcon,
              getCommonFieldMenuItems,
              members,
              onEditField,
              additionalProps,
            });
          }
          // Otherwise treat as default UUID display
          return getDefaultColumnDef({
            field: fieldWithIcon,
            getCommonFieldMenuItems,
            onEditField,
            additionalProps,
          });
        case 'number':
          return getDefaultColumnDef({
            field: fieldWithIcon,
            getCommonFieldMenuItems,
            onEditField,
            cellEditor: 'agNumberCellEditor',
            additionalProps,
          });
        case 'timestamp':
          // Regular timestamp fields (system fields handled separately at the end)
          return getDefaultColumnDef({
            field: fieldWithIcon,
            getCommonFieldMenuItems,
            onEditField,
            cellEditor: 'agDateCellEditor',
            additionalProps,
          });
        case 'text':
        default:
          return getDefaultColumnDef({
            field: fieldWithIcon,
            getCommonFieldMenuItems,
            onEditField,
            additionalProps,
          });
      }
    }),

    // 3. System fields (right side, before "New Column")
    // Order: created_at, updated_at, created_by, updated_by
    ...sortedSystemFields.map((field) => {
      const fieldWithIcon = {
        ...field,
        icon: getFieldIcon(field.data_type),
        field: field.db_field_name,
        headerName: field.name,
      };

      // Use dedicated column definitions for system fields
      if (field.name === 'created_at') {
        return getCreatedAtColumnDef();
      }
      if (field.name === 'updated_at') {
        return getUpdatedAtColumnDef();
      }
      if (field.name === 'created_by') {
        return getCreatedByColumnDef({ table, members });
      }
      if (field.name === 'updated_by') {
        return getUpdatedByColumnDef({ table, members });
      }

      // Fallback (shouldn't reach here)
      return getDefaultColumnDef({
        field: fieldWithIcon,
        getCommonFieldMenuItems,
        onEditField,
      });
    }),

    // 4. "New Column" button (far right)
    getNewColumnDef({ setShowFieldDialog }),
  ];
};
