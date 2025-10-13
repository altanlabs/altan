import { createSlice, createSelector } from '@reduxjs/toolkit';

import {
  startAccountAttributeLoading,
  stopAccountAttributeLoading,
  setAccountAttribute,
  setAccountAttributeError,
} from './general';
import { optimai_tables, optimai_cloud, optimai_tables_v4 } from '../../utils/axios';

// ============================================================================
// SQL QUERY HELPERS
// ============================================================================

/**
 * Escape SQL string values to prevent injection
 */
const escapeSql = (value) => {
  if (value === null || value === undefined) return 'NULL';
  return String(value).replace(/'/g, "''");
};

/**
 * Build a single SQL condition from postgREST operator
 */
const buildCondition = (field, value) => {
  if (typeof value === 'string') {
    // PostgREST format: 'eq.value', 'ilike.*value*', 'in.(val1,val2)'
    if (value.startsWith('eq.')) {
      const val = value.substring(3);
      return `${field} = '${escapeSql(val)}'`;
    }
    if (value.startsWith('ilike.')) {
      const pattern = value.substring(6).replace(/\*/g, '%');
      return `${field} ILIKE '${escapeSql(pattern)}'`;
    }
    if (value.startsWith('in.')) {
      const vals = value.substring(4, value.length - 1).split(',');
      const quotedVals = vals.map((v) => `'${escapeSql(v)}'`).join(',');
      return `${field} IN (${quotedVals})`;
    }
    if (value.startsWith('gt.')) {
      return `${field} > '${escapeSql(value.substring(3))}'`;
    }
    if (value.startsWith('gte.')) {
      return `${field} >= '${escapeSql(value.substring(4))}'`;
    }
    if (value.startsWith('lt.')) {
      return `${field} < '${escapeSql(value.substring(3))}'`;
    }
    if (value.startsWith('lte.')) {
      return `${field} <= '${escapeSql(value.substring(4))}'`;
    }
    if (value.startsWith('neq.')) {
      return `${field} != '${escapeSql(value.substring(4))}'`;
    }
    if (value.startsWith('is.')) {
      const isVal = value.substring(3);
      return isVal.toLowerCase() === 'null' ? `${field} IS NULL` : `${field} IS ${isVal}`;
    }
  }

  // Default: exact match
  return `${field} = '${escapeSql(String(value))}'`;
};

/**
 * Build SQL WHERE clause from postgREST-style filters
 * @param {Object} filters - postgREST filters (e.g., { id: 'eq.123', name: 'ilike.*John*' })
 * @returns {string} SQL WHERE clause
 */
const buildWhereClause = (filters) => {
  if (!filters || Object.keys(filters).length === 0) return '';

  const conditions = [];
  // SQL control parameters that should NOT be in WHERE clause
  const sqlControlParams = ['limit', 'offset', 'order', 'select'];

  Object.entries(filters).forEach(([field, value]) => {
    // Skip SQL control parameters
    if (sqlControlParams.includes(field)) {
      return;
    }

    if (field === 'or') {
      // Handle OR conditions: or=(field1.ilike.*value*,field2.ilike.*value*)
      const orMatch = value.match(/\((.*)\)/);
      if (orMatch) {
        const orConditions = orMatch[1].split(',').map((cond) => {
          const [f, op] = cond.split('.');
          return buildCondition(f, `${op}`);
        });
        conditions.push(`(${orConditions.join(' OR ')})`);
      }
      return;
    }

    conditions.push(buildCondition(field, value));
  });

  return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
};

/**
 * Build SQL ORDER BY clause from postgREST order param
 * @param {string} order - postgREST order (e.g., 'created_at.desc', 'name.asc')
 * @returns {string} SQL ORDER BY clause
 */
const buildOrderClause = (order) => {
  if (!order) return '';

  const parts = order.split(',').map((part) => {
    const [field, direction] = part.split('.');
    const dir = direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    return `${field} ${dir}`;
  });

  return `ORDER BY ${parts.join(', ')}`;
};

/**
 * Build INSERT SQL statement
 */
const buildInsertSQL = (tableName, data) => {
  // Ensure data is an object, not an array
  if (Array.isArray(data)) {
    throw new Error('buildInsertSQL expects an object, got array');
  }

  const fields = Object.keys(data);
  const values = Object.values(data);

  // Filter out undefined/null/empty fields (let database use defaults)
  const validFields = [];
  const validValues = [];
  fields.forEach((field, index) => {
    const value = values[index];
    // Skip fields that are undefined or empty strings
    if (value !== undefined && value !== '') {
      validFields.push(field);
      validValues.push(value);
    }
  });

  if (validFields.length === 0) {
    throw new Error('No valid fields to insert');
  }

  const fieldsList = validFields.join(', ');
  const valuesList = validValues
    .map((v) => {
      if (v === null) return 'NULL';

      if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';

      if (typeof v === 'number') return v;

      if (typeof v === 'string') {
        // Try to parse if it looks like a JSON-stringified value
        let actualValue = v;
        if (v.startsWith('"') && v.endsWith('"')) {
          try {
            actualValue = JSON.parse(v);
          } catch {
            // If parsing fails, use original value
            actualValue = v;
          }
        }

        // Check if it's a date string (ISO 8601 format)
        const isDateString = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/.test(actualValue);
        if (isDateString) {
          return `'${escapeSql(actualValue)}'::timestamp`;
        }
        return `'${escapeSql(actualValue)}'`;
      }

      // Objects (arrays, JSON) - cast to jsonb
      if (typeof v === 'object') return `'${escapeSql(JSON.stringify(v))}'::jsonb`;

      return `'${escapeSql(v)}'`;
    })
    .join(', ');

  return `INSERT INTO ${tableName} (${fieldsList}) VALUES (${valuesList}) RETURNING *;`;
};

/**
 * Build UPDATE SQL statement
 */
const buildUpdateSQL = (tableName, recordId, changes) => {
  const setClauses = Object.entries(changes)
    .map(([field, value]) => {
      if (value === null || value === undefined) return `${field} = NULL`;

      // Handle different data types
      if (typeof value === 'boolean') {
        return `${field} = ${value ? 'TRUE' : 'FALSE'}`;
      }

      if (typeof value === 'number') {
        return `${field} = ${value}`;
      }

      if (typeof value === 'string') {
        // Try to parse if it looks like a JSON-stringified value
        let actualValue = value;
        if (value.startsWith('"') && value.endsWith('"')) {
          try {
            actualValue = JSON.parse(value);
          } catch {
            // If parsing fails, use original value
            actualValue = value;
          }
        }

        // Check if it's a date string (ISO 8601 format)
        const isDateString = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/.test(actualValue);
        if (isDateString) {
          // Cast to timestamp (works for both date and timestamp columns)
          return `${field} = '${escapeSql(actualValue)}'::timestamp`;
        }
        // Regular string
        return `${field} = '${escapeSql(actualValue)}'`;
      }

      // Objects (arrays, JSON) - cast to jsonb
      if (typeof value === 'object') {
        return `${field} = '${escapeSql(JSON.stringify(value))}'::jsonb`;
      }

      // Fallback
      return `${field} = '${escapeSql(value)}'`;
    })
    .join(', ');

  return `UPDATE ${tableName} SET ${setClauses} WHERE id = '${escapeSql(recordId)}' RETURNING *;`;
};

/**
 * Build DELETE SQL statement
 */
const buildDeleteSQL = (tableName, recordIds) => {
  const ids = Array.isArray(recordIds) ? recordIds : [recordIds];
  const idList = ids.map((id) => `'${escapeSql(id)}'`).join(',');
  return `DELETE FROM ${tableName} WHERE id IN (${idList});`;
};

/**
 * Execute raw SQL query via cloud proxy
 */
const executeSQL = async (baseId, query) => {
  try {
    console.log('📤 Executing SQL:', query.substring(0, 150) + '...');
    const response = await optimai_cloud.post(`/v1/pg-meta/${baseId}/query`, { query });
    console.log('📥 SQL Response:', {
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      length: response.data?.length,
      keys: response.data ? Object.keys(response.data).slice(0, 5) : 'no data',
      sample: Array.isArray(response.data) ? response.data[0] : response.data,
    });
    return response.data;
  } catch (error) {
    // Log the SQL query that failed for debugging
    console.error('❌ SQL Query Failed:', {
      query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
      error: error.response?.data || error.message,
      status: error.response?.status,
    });
    throw error;
  }
};

const initialState = {
  isLoading: false,
  error: null,
  initialized: false,
  bases: {},
  records: {},
  recordsState: {},
  // Schema metadata from pg-meta
  schemas: {}, // { [baseId]: { items: [], loading: false, error: null } }
  // Database navigation state
  databaseNavigation: {
    quickFilter: '',
    currentViewType: 'grid',
    isRefreshing: false,
    recordCount: 0,
    isSearching: false,
    searchResults: {},
    sqlTerminalMode: false,
  },
  // User cache for auth.users table to avoid redundant API calls
  userCache: {},
  userCacheState: {
    loading: false,
    lastFetched: null,
    error: null,
  },
  // Bucket cache for storage.buckets to avoid redundant API calls
  bucketCache: {},
  bucketCacheState: {
    loading: false,
    lastFetched: null,
    error: null,
  },
};

const slice = createSlice({
  name: 'bases',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    stopLoading(state) {
      state.isLoading = false;
      state.initialized = true;
    },
    hasError(state, action) {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearState(state) {
      Object.assign(state, initialState);
    },
    addBase(state, action) {
      const base = action.payload;
      state.bases[base.id] = base;
    },
    updateBase(state, action) {
      const { id, ...changes } = action.payload;
      state.bases[id] = { ...(state.bases[id] ?? {}), ...changes };
    },
    deleteBase(state, action) {
      const baseId = action.payload;
      if (baseId in state.bases) {
        delete state.bases[baseId];
      }
    },
    // Schema reducers (pg-meta)
    setSchemasLoading(state, action) {
      const { baseId, loading } = action.payload;
      if (!state.schemas[baseId]) {
        state.schemas[baseId] = { items: [], loading: false, error: null };
      }
      state.schemas[baseId].loading = loading;
    },
    setSchemas(state, action) {
      const { baseId, schemas } = action.payload;
      if (!state.schemas[baseId]) {
        state.schemas[baseId] = { items: [], loading: false, error: null };
      }
      state.schemas[baseId].items = schemas;
      state.schemas[baseId].loading = false;
      state.schemas[baseId].error = null;
    },
    setSchemasError(state, action) {
      const { baseId, error } = action.payload;
      if (!state.schemas[baseId]) {
        state.schemas[baseId] = { items: [], loading: false, error: null };
      }
      state.schemas[baseId].error = error;
      state.schemas[baseId].loading = false;
    },
    addSchema(state, action) {
      const { baseId, schema } = action.payload;
      if (!state.schemas[baseId]) {
        state.schemas[baseId] = { items: [], loading: false, error: null };
      }
      state.schemas[baseId].items.push(schema);
    },
    updateSchema(state, action) {
      const { baseId, schemaId, changes } = action.payload;
      if (state.schemas[baseId]?.items) {
        const index = state.schemas[baseId].items.findIndex((s) => s.id === schemaId);
        if (index !== -1) {
          state.schemas[baseId].items[index] = {
            ...state.schemas[baseId].items[index],
            ...changes,
          };
        }
      }
    },
    deleteSchema(state, action) {
      const { baseId, schemaId } = action.payload;
      if (state.schemas[baseId]?.items) {
        state.schemas[baseId].items = state.schemas[baseId].items.filter((s) => s.id !== schemaId);
      }
    },
    // Table reducers (using pg-meta structure)
    setTablesFromPgMeta(state, action) {
      const { baseId, tables } = action.payload;
      if (state.bases[baseId]) {
        // Store pg-meta tables directly without type mapping
        state.bases[baseId].tables = {
          items: tables.map((table) => ({
            id: table.id,
            name: table.name,
            db_name: table.name,
            schema: table.schema,
            rls_enabled: table.rls_enabled,
            rls_forced: table.rls_forced,
            replica_identity: table.replica_identity,
            comment: table.comment,
            bytes: table.bytes,
            size: table.size,
            live_rows_estimate: table.live_rows_estimate,
            dead_rows_estimate: table.dead_rows_estimate,
            // Add columns if included - use PostgreSQL types directly
            fields: table.columns
              ? {
                  items: table.columns.map((col) => ({
                    id: col.id,
                    name: col.name,
                    db_field_name: col.name,
                    data_type: col.data_type, // PostgreSQL type (no mapping)
                    format: col.format,
                    is_nullable: col.is_nullable,
                    is_unique: col.is_unique,
                    is_identity: col.is_identity,
                    identity_generation: col.identity_generation,
                    is_generated: col.is_generated,
                    is_updatable: col.is_updatable,
                    default_value: col.default_value,
                    comment: col.comment,
                    ordinal_position: col.ordinal_position,
                    enums: col.enums,
                    check: col.check,
                    table_id: col.table_id,
                    schema: col.schema,
                    table: col.table,
                  })),
                }
              : { items: [] },
            // Add primary keys and relationships if available
            primary_keys: table.primary_keys || [],
            relationships: table.relationships || [],
          })),
        };
      }
    },
    addTable(state, action) {
      const { baseId, table } = action.payload;
      if (state.bases[baseId]) {
        state.bases[baseId].tables = state.bases[baseId].tables || { items: [] };
        state.bases[baseId].tables.items.push(table);
      }
    },
    updateTable(state, action) {
      const { baseId, tableId, changes } = action.payload;
      if (state.bases[baseId]) {
        const tableIndex = state.bases[baseId].tables.items.findIndex((t) => t.id === tableId);
        if (tableIndex !== -1) {
          state.bases[baseId].tables.items[tableIndex] = {
            ...state.bases[baseId].tables.items[tableIndex],
            ...changes,
          };
        }
      }
    },
    deleteTable(state, action) {
      const { baseId, tableId } = action.payload;
      if (state.bases[baseId]) {
        state.bases[baseId].tables.items = state.bases[baseId].tables.items.filter(
          (t) => t.id !== tableId,
        );
      }
    },
    // Field/Column reducers (using pg-meta)
    setColumnsForTable(state, action) {
      const { baseId, tableId, columns } = action.payload;
      if (state.bases[baseId]) {
        const table = state.bases[baseId].tables.items.find((t) => t.id === tableId);
        if (table) {
          table.fields = {
            items: columns.map((col) => ({
              id: col.id,
              name: col.name,
              db_field_name: col.name,
              data_type: col.data_type, // PostgreSQL type (no mapping)
              format: col.format,
              is_nullable: col.is_nullable,
              is_unique: col.is_unique,
              is_identity: col.is_identity,
              identity_generation: col.identity_generation,
              is_generated: col.is_generated,
              is_updatable: col.is_updatable,
              default_value: col.default_value,
              comment: col.comment,
              ordinal_position: col.ordinal_position,
              enums: col.enums,
              check: col.check,
              table_id: col.table_id,
              schema: col.schema,
              table: col.table,
            })),
          };
        }
      }
    },
    addField(state, action) {
      const { baseId, tableId, field } = action.payload;
      if (state.bases[baseId]) {
        const table = state.bases[baseId].tables.items.find((t) => t.id === tableId);
        if (table) {
          table.fields = table.fields || { items: [] };
          table.fields.items.push(field);
        }
      }
    },
    updateField(state, action) {
      const { tableId, fieldId, changes } = action.payload;
      // Find the base that contains this table
      const baseId = Object.keys(state.bases).find((baseId) =>
        state.bases[baseId].tables?.items?.some((t) => t.id === tableId),
      );

      if (baseId) {
        const table = state.bases[baseId].tables.items.find((t) => t.id === tableId);
        if (table) {
          const fieldIndex = table.fields.items.findIndex((f) => f.id === fieldId);
          if (fieldIndex !== -1) {
            table.fields.items[fieldIndex] = {
              ...table.fields.items[fieldIndex],
              ...changes,
            };
          }
        }
      }
    },
    deleteField(state, action) {
      const { tableId, fieldId } = action.payload;
      // Find the base that contains this table
      const baseId = Object.keys(state.bases).find((baseId) =>
        state.bases[baseId].tables?.items?.some((t) => t.id === tableId),
      );

      if (baseId) {
        const table = state.bases[baseId].tables.items.find((t) => t.id === tableId);
        if (table && table.fields?.items) {
          table.fields.items = table.fields.items.filter((f) => f.id !== fieldId);

          // Also remove the field from any records that might have it
          if (state.records[tableId]?.items) {
            state.records[tableId].items.forEach((record) => {
              if (record) {
                const fieldName = table.fields.items.find((f) => f.id === fieldId)?.db_field_name;
                if (fieldName && record[fieldName] !== undefined) {
                  const recordCopy = { ...record };
                  delete recordCopy[fieldName];
                  Object.assign(record, recordCopy);
                }
              }
            });
          }
        }
      }
    },
    // View reducers
    addView(state, action) {
      const { baseId, tableId, view } = action.payload;
      if (state.bases[baseId]) {
        const table = state.bases[baseId].tables.items.find((t) => t.id === tableId);
        if (table) {
          table.views = table.views || { items: [] };
          table.views.items.push(view);
        }
      }
    },
    updateView(state, action) {
      const { baseId, tableId, viewId, changes } = action.payload;
      if (state.bases[baseId]) {
        const table = state.bases[baseId].tables.items.find((t) => t.id === tableId);
        if (table) {
          const viewIndex = table.views.items.findIndex((v) => v.id === viewId);
          if (viewIndex !== -1) {
            table.views.items[viewIndex] = {
              ...table.views.items[viewIndex],
              ...changes,
            };
          }
        }
      }
    },
    deleteView(state, action) {
      const { baseId, tableId, viewId } = action.payload;
      if (state.bases[baseId]) {
        const table = state.bases[baseId].tables.items.find((t) => t.id === tableId);
        if (table) {
          table.views.items = table.views.items.filter((v) => v.id !== viewId);
        }
      }
    },
    // Records reducers (unchanged - using postgREST)
    setTableRecordsLoading(state, action) {
      const { tableId, loading } = action.payload;
      if (!state.recordsState[tableId]) {
        state.recordsState[tableId] = {};
      }
      state.recordsState[tableId].loading = loading;
      state.recordsState[tableId].isFullyLoaded =
        !loading && !state.recordsState[tableId].next_page_token;
    },
    setTableRecords(state, action) {
      const { tableId, records, total, next_page_token, isPagination } = action.payload;

      const deduplicateRecords = (recordsArray) => {
        const seen = new Map();
        return recordsArray.filter((record) => {
          if (!record || !record.id) return false;
          if (seen.has(record.id)) return false;
          seen.set(record.id, true);
          return true;
        });
      };

      if (!state.records[tableId] || !isPagination) {
        state.records[tableId] = {
          items: deduplicateRecords(records.filter((record) => record !== undefined)),
          total,
        };
      } else {
        const combinedRecords = [...state.records[tableId].items, ...records];
        state.records[tableId] = {
          items: deduplicateRecords(combinedRecords),
          total,
        };
      }

      state.recordsState[tableId] = {
        ...state.recordsState[tableId],
        loading: false,
        lastFetched: Date.now(),
        next_page_token,
        isFullyLoaded: !next_page_token,
      };
    },
    updateTableRecord(state, action) {
      const { tableId, tableName, recordId, changes, isRealTime = false } = action.payload;

      let targetTableId = tableId;
      let tableRecords = state.records[tableId]?.items;

      if (!tableRecords && tableName) {
        for (const baseId of Object.keys(state.bases)) {
          const base = state.bases[baseId];
          if (base.tables?.items) {
            const matchingTable = base.tables.items.find(
              (table) => table.name === tableName || table.db_name === tableName,
            );
            if (matchingTable) {
              targetTableId = matchingTable.id;
              tableRecords = state.records[matchingTable.id]?.items;
              if (tableRecords) {
                break;
              }
            }
          }
        }
      }

      if (tableRecords) {
        const recordIndex = tableRecords.findIndex((r) => r.id === recordId);
        if (recordIndex !== -1) {
          tableRecords[recordIndex] = { ...tableRecords[recordIndex], ...changes };

          if (isRealTime && state.recordsState[targetTableId]) {
            state.recordsState[targetTableId].hasRealTimeUpdates = true;
            state.recordsState[targetTableId].lastRealTimeUpdate = Date.now();
          }
        }
      } else {
        const availableTables = Object.keys(state.records);
        for (const availableTableId of availableTables) {
          const availableTableRecords = state.records[availableTableId]?.items;
          if (availableTableRecords) {
            const foundRecordIndex = availableTableRecords.findIndex((r) => r.id === recordId);
            if (foundRecordIndex !== -1) {
              availableTableRecords[foundRecordIndex] = {
                ...availableTableRecords[foundRecordIndex],
                ...changes,
              };

              if (isRealTime && state.recordsState[availableTableId]) {
                state.recordsState[availableTableId].hasRealTimeUpdates = true;
                state.recordsState[availableTableId].lastRealTimeUpdate = Date.now();
              }
              return;
            }
          }
        }
      }
    },
    addTableRecord(state, action) {
      const {
        tableId,
        tableName,
        record,
        isRealTime = false,
        insertAtBeginning = false,
      } = action.payload;
      let targetTableId = tableId;

      if (!state.records[tableId] && tableName) {
        for (const baseId of Object.keys(state.bases)) {
          const base = state.bases[baseId];
          if (base.tables?.items) {
            const matchingTable = base.tables.items.find(
              (table) => table.name === tableName || table.db_name === tableName,
            );
            if (matchingTable && state.records[matchingTable.id]) {
              targetTableId = matchingTable.id;
              break;
            }
          }
        }
      }

      if (!state.records[targetTableId]) {
        state.records[targetTableId] = { items: [], total: 0 };
      }

      const existingIndex = state.records[targetTableId].items.findIndex(
        (existingRecord) => existingRecord.id === record.id,
      );

      if (existingIndex !== -1) {
        state.records[targetTableId].items[existingIndex] = record;
      } else {
        if (insertAtBeginning || isRealTime) {
          state.records[targetTableId].items.unshift(record);
        } else {
          state.records[targetTableId].items.push(record);
        }
        state.records[targetTableId].total += 1;

        if (isRealTime && state.recordsState[targetTableId]) {
          state.recordsState[targetTableId].hasRealTimeUpdates = true;
          state.recordsState[targetTableId].lastRealTimeUpdate = Date.now();
          if (state.recordsState[targetTableId].totalRecords !== undefined) {
            state.recordsState[targetTableId].totalRecords += 1;
            const pageSize = state.recordsState[targetTableId].pageSize || 50;
            state.recordsState[targetTableId].totalPages = Math.ceil(
              state.recordsState[targetTableId].totalRecords / pageSize,
            );
          }
        }
      }
    },
    deleteTableRecord(state, action) {
      const { tableId, tableName, recordId, isRealTime = false } = action.payload;
      let targetTableId = tableId;

      if (!state.records[tableId] && tableName) {
        for (const baseId of Object.keys(state.bases)) {
          const base = state.bases[baseId];
          if (base.tables?.items) {
            const matchingTable = base.tables.items.find(
              (table) => table.name === tableName || table.db_name === tableName,
            );
            if (matchingTable && state.records[matchingTable.id]) {
              targetTableId = matchingTable.id;
              break;
            }
          }
        }
      }

      if (state.records[targetTableId]) {
        const initialLength = state.records[targetTableId].items.length;
        state.records[targetTableId].items = state.records[targetTableId].items.filter(
          (record) => record.id !== recordId,
        );
        const finalLength = state.records[targetTableId].items.length;

        if (finalLength < initialLength) {
          state.records[targetTableId].total -= 1;

          if (isRealTime && state.recordsState[targetTableId]) {
            state.recordsState[targetTableId].hasRealTimeUpdates = true;
            state.recordsState[targetTableId].lastRealTimeUpdate = Date.now();
            if (state.recordsState[targetTableId].totalRecords !== undefined) {
              state.recordsState[targetTableId].totalRecords -= 1;
              const pageSize = state.recordsState[targetTableId].pageSize || 50;
              state.recordsState[targetTableId].totalPages = Math.ceil(
                Math.max(state.recordsState[targetTableId].totalRecords, 1) / pageSize,
              );
            }
          }
        }
      }
    },
    clearTableRecords(state, action) {
      const { tableId } = action.payload;
      delete state.records[tableId];
    },
    setTableRecordsState(state, action) {
      const { tableId, ...updates } = action.payload;
      if (!state.recordsState[tableId]) {
        state.recordsState[tableId] = {
          hasRealTimeUpdates: false,
          lastRealTimeUpdate: null,
        };
      }
      Object.assign(state.recordsState[tableId], updates);
    },
    integrateRealTimeUpdates(state, action) {
      const { tableId, updates, additions, deletions } = action.payload;

      if (!state.records[tableId]) {
        state.records[tableId] = { items: [], total: 0 };
      }

      const tableRecords = state.records[tableId];
      const recordsState = state.recordsState[tableId];
      const pageSize = recordsState?.pageSize || 50;
      const currentPage = recordsState?.currentPage || 0;
      let totalChanged = 0;

      if (deletions && deletions.length > 0) {
        const initialLength = tableRecords.items.length;
        tableRecords.items = tableRecords.items.filter((record) => !deletions.includes(record.id));
        const deletedCount = initialLength - tableRecords.items.length;
        totalChanged -= deletedCount;
      }

      if (updates && updates.length > 0) {
        updates.forEach((update) => {
          const index = tableRecords.items.findIndex((r) => r.id === update.id);
          if (index !== -1) {
            tableRecords.items[index] = { ...tableRecords.items[index], ...update };
          }
        });
      }

      if (additions && additions.length > 0) {
        additions.forEach((addition) => {
          const existingIndex = tableRecords.items.findIndex((r) => r.id === addition.id);
          if (existingIndex === -1) {
            if (currentPage === 0) {
              tableRecords.items.unshift(addition);

              if (tableRecords.items.length > pageSize) {
                tableRecords.items = tableRecords.items.slice(0, pageSize);
              }
            }
            totalChanged += 1;
          }
        });
      }

      tableRecords.total = Math.max(tableRecords.total + totalChanged, 0);

      if (recordsState) {
        recordsState.hasRealTimeUpdates = true;
        recordsState.lastRealTimeUpdate = Date.now();

        if (recordsState.totalRecords !== undefined) {
          recordsState.totalRecords = Math.max(recordsState.totalRecords + totalChanged, 0);
          recordsState.totalPages = Math.ceil(Math.max(recordsState.totalRecords, 1) / pageSize);

          if (currentPage > 0 && additions && additions.length > 0) {
            recordsState.hasNewRecordsOnPreviousPages = true;
          }
        }
      }
    },
    clearRealTimeUpdateFlags(state, action) {
      const { tableId } = action.payload;
      if (state.recordsState[tableId]) {
        state.recordsState[tableId].hasRealTimeUpdates = false;
        state.recordsState[tableId].hasNewRecordsOnPreviousPages = false;
      }
    },
    // Database navigation reducers
    setDatabaseQuickFilter(state, action) {
      state.databaseNavigation.quickFilter = action.payload;
    },
    setDatabaseViewType(state, action) {
      state.databaseNavigation.currentViewType = action.payload;
    },
    setDatabaseRefreshing(state, action) {
      state.databaseNavigation.isRefreshing = action.payload;
    },
    setDatabaseRecordCount(state, action) {
      state.databaseNavigation.recordCount = action.payload;
    },
    setDatabaseSearching(state, action) {
      state.databaseNavigation.isSearching = action.payload;
    },
    setDatabaseSearchResults(state, action) {
      const { tableId, results, query } = action.payload;
      state.databaseNavigation.searchResults[tableId] = {
        results,
        query,
        timestamp: Date.now(),
      };
    },
    clearDatabaseSearchResults(state, action) {
      const { tableId } = action.payload || {};
      if (tableId) {
        delete state.databaseNavigation.searchResults[tableId];
      } else {
        state.databaseNavigation.searchResults = {};
      }
    },
    setSQLTerminalMode(state, action) {
      state.databaseNavigation.sqlTerminalMode = action.payload;
    },
    clearDatabaseNavigation(state) {
      state.databaseNavigation = {
        quickFilter: '',
        currentViewType: 'grid',
        isRefreshing: false,
        recordCount: 0,
        isSearching: false,
        searchResults: {},
        sqlTerminalMode: false,
      };
    },
    // User cache reducers
    setUserCacheLoading(state, action) {
      state.userCacheState.loading = action.payload;
      if (action.payload) {
        state.userCacheState.error = null;
      }
    },
    setUserCache(state, action) {
      const { users, baseId } = action.payload;

      if (!state.userCache[baseId]) {
        state.userCache[baseId] = {};
      }

      users.forEach((user) => {
        if (user && user.id) {
          state.userCache[baseId][user.id] = user;
        }
      });

      state.userCacheState.loading = false;
      state.userCacheState.lastFetched = Date.now();
      state.userCacheState.error = null;
    },
    setUserCacheError(state, action) {
      state.userCacheState.loading = false;
      state.userCacheState.error = action.payload;
    },
    clearUserCache(state, action) {
      const { baseId } = action.payload || {};
      if (baseId) {
        delete state.userCache[baseId];
      } else {
        state.userCache = {};
      }
      state.userCacheState = {
        loading: false,
        lastFetched: null,
        error: null,
      };
    },
    // Bucket cache reducers
    setBucketCacheLoading(state, action) {
      state.bucketCacheState.loading = action.payload;
      if (action.payload) {
        state.bucketCacheState.error = null;
      }
    },
    setBucketCache(state, action) {
      const { buckets, baseId } = action.payload;

      if (!state.bucketCache[baseId]) {
        state.bucketCache[baseId] = {};
      }

      buckets.forEach((bucket) => {
        if (bucket && bucket.id) {
          state.bucketCache[baseId][bucket.id] = bucket;
        }
      });

      state.bucketCacheState.loading = false;
      state.bucketCacheState.lastFetched = Date.now();
      state.bucketCacheState.error = null;
    },
    setBucketCacheError(state, action) {
      state.bucketCacheState.loading = false;
      state.bucketCacheState.error = action.payload;
    },
    clearBucketCache(state, action) {
      const { baseId } = action.payload || {};
      if (baseId) {
        delete state.bucketCache[baseId];
      } else {
        state.bucketCache = {};
      }
      state.bucketCacheState = {
        loading: false,
        lastFetched: null,
        error: null,
      };
    },
    addBucketToCache(state, action) {
      const { bucket, baseId } = action.payload;
      if (!state.bucketCache[baseId]) {
        state.bucketCache[baseId] = {};
      }
      state.bucketCache[baseId][bucket.id] = bucket;
    },
    removeBucketFromCache(state, action) {
      const { bucketId, baseId } = action.payload;
      if (state.bucketCache[baseId]) {
        delete state.bucketCache[baseId][bucketId];
      }
    },
    updateBucketInCache(state, action) {
      const { bucket, baseId } = action.payload;
      if (state.bucketCache[baseId] && state.bucketCache[baseId][bucket.id]) {
        state.bucketCache[baseId][bucket.id] = bucket;
      }
    },
  },
});

export default slice.reducer;

// Export all actions
export const {
  addBase,
  updateBase,
  deleteBase,
  clearState: clearBaseState,
  // Schema actions
  setSchemasLoading,
  setSchemas,
  setSchemasError,
  addSchema,
  updateSchema,
  deleteSchema,
  // Table actions
  setTablesFromPgMeta,
  addTable,
  updateTable,
  deleteTable,
  // Field actions
  setColumnsForTable,
  addField,
  updateField,
  deleteField,
  // View actions
  addView,
  updateView,
  deleteView,
  // Record actions
  setTableRecords,
  updateTableRecord,
  addTableRecord,
  deleteTableRecord,
  clearTableRecords,
  setTableRecordsState,
  setTableRecordsLoading,
  // Database navigation actions
  setDatabaseQuickFilter,
  setDatabaseViewType,
  setDatabaseRefreshing,
  setDatabaseRecordCount,
  setDatabaseSearching,
  setDatabaseSearchResults,
  clearDatabaseSearchResults,
  setSQLTerminalMode,
  clearDatabaseNavigation,
  // User cache actions
  setUserCacheLoading,
  setUserCache,
  setUserCacheError,
  clearUserCache,
  // Bucket cache actions
  setBucketCacheLoading,
  setBucketCache,
  setBucketCacheError,
  clearBucketCache,
  addBucketToCache,
  removeBucketFromCache,
  updateBucketInCache,
  integrateRealTimeUpdates,
  clearRealTimeUpdateFlags,
} = slice.actions;

// ============================================================================
// PG-META THUNKS FOR SCHEMA MANAGEMENT
// ============================================================================

/**
 * Create a schema using pg-meta
 */
export const createSchema = (baseId, schemaData) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await optimai_cloud.post(`/v1/pg-meta/${baseId}/schemas/`, schemaData);
    const schema = response.data;
    dispatch(addSchema({ baseId, schema }));
    return schema;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    throw error;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

/**
 * Update a schema using pg-meta
 */
export const updateSchemaById = (baseId, schemaId, changes) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await optimai_cloud.patch(`/v1/pg-meta/${baseId}/schemas/${schemaId}`, changes);
    const schema = response.data;
    dispatch(updateSchema({ baseId, schemaId, changes: schema }));
    return schema;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    throw error;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

/**
 * Delete a schema using pg-meta
 */
export const deleteSchemaById =
  (baseId, schemaId, cascade = false) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      await optimai_cloud.delete(`/v1/pg-meta/${baseId}/schemas/${schemaId}`, {
        params: { cascade },
      });
      dispatch(deleteSchema({ baseId, schemaId }));
      return Promise.resolve();
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      throw error;
    } finally {
      dispatch(slice.actions.stopLoading());
    }
  };

/**
 * Fetch all tables for a base using pg-meta
 * Each base has its own PostgreSQL schema: tenant_{base_id} with hyphens replaced by underscores
 */
export const fetchTables =
  (baseId, options = {}) =>
  async (dispatch, getState) => {
      const {
        include_columns = true,
        include_relationships = true,
        excluded_schemas = 'pg_catalog,information_schema',
        forceReload = false,
      } = options;

    // Check if tables already exist in state (unless force reload)
    if (!forceReload) {
      const state = getState();
      const existingBase = state.bases.bases[baseId];
      if (existingBase?.tables?.items && existingBase.tables.items.length > 0) {
        console.log('✅ Tables already cached for base:', baseId, '- skipping fetch');
        return existingBase.tables.items;
      }
    }

    dispatch(slice.actions.startLoading());
    try {
      console.log('📡 Fetching tables from pg-meta for base:', baseId);
      const response = await optimai_cloud.get(`/v1/pg-meta/${baseId}/tables/`, {
        params: {
          include_columns,
          include_relationships,
          excluded_schemas,
          include_system_schemas: true, // Include auth schema for Supabase
        },
      });

      console.log('response', response.data);

      const tables = response.data || [];
      dispatch(setTablesFromPgMeta({ baseId, tables }));
      return tables;
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      throw error;
    } finally {
      dispatch(slice.actions.stopLoading());
    }
  };

/**
 * Create a table using pg-meta
 * Tables are created in the tenant-specific schema
 */
export const createTable = (baseId, tableData) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    // Generate tenant schema name: tenant_{base_id} with hyphens → underscores
    const tenantSchema = `tenant_${baseId.replace(/-/g, '_')}`;

    // Ensure table is created in the tenant schema
    const tablePayload = {
      ...tableData,
      schema: tenantSchema, // Override to ensure correct schema
    };

    const response = await optimai_cloud.post(`/v1/pg-meta/${baseId}/tables/`, tablePayload);
    const table = response.data;

    // Transform to our internal format
    const transformedTable = {
      id: table.id,
      name: table.name,
      db_name: table.name,
      schema: table.schema,
      comment: table.comment,
      rls_enabled: table.rls_enabled || false,
      rls_forced: table.rls_forced || false,
      replica_identity: table.replica_identity || 'DEFAULT',
      bytes: table.bytes || 0,
      size: table.size || '0 bytes',
      fields: { items: [] },
      views: { items: [] },
      primary_keys: table.primary_keys || [],
      relationships: table.relationships || [],
    };

    dispatch(addTable({ baseId, table: transformedTable }));
    return transformedTable;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    throw error;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

/**
 * Update a table using pg-meta
 */
export const updateTableById = (baseId, tableId, changes) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await optimai_cloud.patch(`/v1/pg-meta/${baseId}/tables/${tableId}`, changes);
    const table = response.data;

    dispatch(
      updateTable({
        baseId,
        tableId,
        changes: {
          name: table.name,
          db_name: table.name,
          schema: table.schema,
          comment: table.comment,
          rls_enabled: table.rls_enabled,
          rls_forced: table.rls_forced,
        },
      }),
    );
    return table;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    throw error;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

/**
 * Delete a table using pg-meta
 */
export const deleteTableById =
  (baseId, tableId, cascade = false) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      await optimai_cloud.delete(`/v1/pg-meta/${baseId}/tables/${tableId}`, {
        params: { cascade },
      });
      dispatch(deleteTable({ baseId, tableId }));
      return Promise.resolve();
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      throw error;
    } finally {
      dispatch(slice.actions.stopLoading());
    }
  };

/**
 * Fetch RLS policies for a table using pg-meta
 * @param {string} baseId - Base ID
 * @param {string} tableId - Table ID (numeric)
 * @param {string} tableName - Table name (for pg-meta lookup)
 * @param {string} schemaName - Schema name (e.g., tenant_xxx)
 */
export const fetchTablePolicies = (baseId, tableId, tableName, schemaName) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    console.log('🔐 Fetching RLS policies for table:', { baseId, tableId, tableName, schemaName });

    const response = await optimai_cloud.get(`/v1/pg-meta/${baseId}/policies/`, {
      params: {
        table_name: tableName,
      },
    });

    const policies = response.data || [];
    console.log('🔐 Policies fetched:', {
      count: policies.length,
      policies,
      structure: policies[0] ? Object.keys(policies[0]) : 'no policies',
    });

    return policies;
  } catch (error) {
    console.error('❌ Error fetching policies:', error);
    dispatch(slice.actions.hasError(error.message));
    throw error;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

/**
 * Fetch columns for a table using pg-meta
 */
export const fetchColumns = (baseId, tableId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    // Generate tenant schema name: tenant_{base_id} with hyphens → underscores
    const tenantSchema = `tenant_${baseId.replace(/-/g, '_')}`;

    const response = await optimai_cloud.get(`/v1/pg-meta/${baseId}/columns/`, {
      params: {
        included_schemas: tenantSchema,
        exclude_system_schemas: true,
      },
    });

    // Filter columns for this specific table
    const allColumns = response.data || [];
    const columns = allColumns.filter((col) => col.table_id === tableId);

    dispatch(setColumnsForTable({ baseId, tableId, columns }));
    return columns;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    throw error;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

/**
 * Create a column/field using pg-meta
 * @param {Object} table - Table object with id and base_id
 * @param {Object} fieldData - Field data with PostgreSQL types
 * @param {string} fieldData.name - Column name
 * @param {string} fieldData.type - PostgreSQL type (text, integer, boolean, etc.)
 * @param {boolean} fieldData.is_nullable - Allow NULL values
 * @param {boolean} fieldData.is_unique - Enforce unique constraint
 * @param {*} fieldData.default_value - Default value
 * @param {string} fieldData.comment - Column comment
 */
export const createField = (table, fieldData) => async (dispatch, getState) => {
  dispatch(slice.actions.startLoading());
  try {
    // Find the base ID for this table
    const state = getState();
    const baseId = Object.keys(state.bases.bases).find((bId) =>
      state.bases.bases[bId].tables?.items?.some((t) => t.id === table.id),
    );

    if (!baseId) {
      throw new Error(`Could not find base for table ${table.id}`);
    }

    // Use PostgreSQL types directly - no mapping
    const columnData = {
      table_id: table.id,
      name: fieldData.db_field_name || fieldData.name,
      type: fieldData.type || 'text', // PostgreSQL type directly
      is_nullable: fieldData.is_nullable !== false,
      is_unique: fieldData.is_unique || false,
      default_value: fieldData.default_value,
      comment: fieldData.description || fieldData.comment,
    };

    const response = await optimai_cloud.post(`/v1/pg-meta/${baseId}/columns/`, columnData);
    const column = response.data;

    // Store column data directly from pg-meta
    const field = {
      id: column.id,
      name: column.name,
      db_field_name: column.name,
      data_type: column.data_type, // PostgreSQL type
      format: column.format,
      is_nullable: column.is_nullable,
      is_unique: column.is_unique,
      is_identity: column.is_identity,
      identity_generation: column.identity_generation,
      is_generated: column.is_generated,
      is_updatable: column.is_updatable,
      default_value: column.default_value,
      comment: column.comment,
      ordinal_position: column.ordinal_position,
      enums: column.enums,
      check: column.check,
      table_id: column.table_id,
      schema: column.schema,
      table: column.table,
    };

    dispatch(addField({ baseId, tableId: table.id, field }));
    return field;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    throw error;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

/**
 * Update a column/field using pg-meta
 * @param {string} tableId - Table ID
 * @param {string} fieldId - Column ID
 * @param {Object} changes - Changes to apply (using PostgreSQL types)
 * @param {string} changes.name - New column name
 * @param {string} changes.type - PostgreSQL type (text, integer, boolean, etc.)
 * @param {boolean} changes.is_nullable - Allow NULL values
 * @param {boolean} changes.is_unique - Enforce unique constraint
 * @param {*} changes.default_value - Default value
 * @param {string} changes.comment - Column comment
 */
export const updateFieldThunk = (tableId, fieldId, changes) => async (dispatch, getState) => {
  dispatch(slice.actions.startLoading());
  try {
    // Find the base ID for this table
    const state = getState();
    const baseId = Object.keys(state.bases.bases).find((bId) =>
      state.bases.bases[bId].tables?.items?.some((t) => t.id === tableId),
    );

    if (!baseId) {
      throw new Error(`Could not find base for table ${tableId}`);
    }

    // Use PostgreSQL types directly - no mapping
    const columnChanges = {};
    if (changes.name) columnChanges.name = changes.name;
    if (changes.type) columnChanges.type = changes.type; // PostgreSQL type directly
    if (changes.is_nullable !== undefined) columnChanges.is_nullable = changes.is_nullable;
    if (changes.is_unique !== undefined) columnChanges.is_unique = changes.is_unique;
    if (changes.default_value !== undefined) columnChanges.default_value = changes.default_value;
    if (changes.comment !== undefined) columnChanges.comment = changes.comment;

    const response = await optimai_cloud.patch(`/v1/pg-meta/${baseId}/columns/${fieldId}`, columnChanges);
    const column = response.data;

    // Store column data directly from pg-meta
    const fieldChanges = {
      name: column.name,
      db_field_name: column.name,
      data_type: column.data_type, // PostgreSQL type
      format: column.format,
      is_nullable: column.is_nullable,
      is_unique: column.is_unique,
      is_identity: column.is_identity,
      identity_generation: column.identity_generation,
      is_generated: column.is_generated,
      is_updatable: column.is_updatable,
      default_value: column.default_value,
      comment: column.comment,
      ordinal_position: column.ordinal_position,
      enums: column.enums,
      check: column.check,
    };

    dispatch(updateField({ tableId, fieldId, changes: fieldChanges }));
    return fieldChanges;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    throw error;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

/**
 * Delete a column/field using pg-meta
 */
export const deleteFieldThunk =
  (tableId, fieldId, cascade = false) =>
  async (dispatch, getState) => {
    dispatch(slice.actions.startLoading());
    try {
      // Find the base ID for this table
      const state = getState();
      const baseId = Object.keys(state.bases.bases).find((bId) =>
        state.bases.bases[bId].tables?.items?.some((t) => t.id === tableId),
      );

      if (!baseId) {
        throw new Error(`Could not find base for table ${tableId}`);
      }

      await optimai_cloud.delete(`/v1/pg-meta/${baseId}/columns/${fieldId}`, {
        params: { cascade },
      });

      dispatch(deleteField({ tableId, fieldId }));
      return Promise.resolve();
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      throw error;
    } finally {
      dispatch(slice.actions.stopLoading());
    }
  };

// ============================================================================
// BASE OPERATIONS
// ============================================================================

/**
 * Get base by ID and fetch its tables using pg-meta
 */
export const getBaseById = (baseId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    // Get base metadata from legacy API (base info only)
    const response = await optimai_tables_v4.get(`/databases/${baseId}`);
    const base = response.data;

    // Add base to state
    dispatch(slice.actions.addBase(base));

    // Fetch tables and columns using pg-meta
    await dispatch(fetchTables(baseId, { include_columns: true }));

    return Promise.resolve(base);
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

/**
 * Get all bases for an account and fetch their tables using pg-meta
 */
export const getBasesByAccountID = (accountId) => async (dispatch) => {
  dispatch(startAccountAttributeLoading('bases'));
  try {
    const response = await optimai_tables.get(`/base/list/${accountId}`);
    const bases = response.data?.data?.bases || response.data?.bases || [];

    // Add all bases to state
    bases.forEach((base) => {
      dispatch(slice.actions.addBase(base));
    });

    // Fetch tables for each base using pg-meta
    await Promise.all(
      bases.map((base) =>
        dispatch(
          fetchTables(base.id, { include_columns: true, include_relationships: true }),
        ).catch((err) => {
          // eslint-disable-next-line no-console
          console.error(`Failed to fetch tables for base ${base.id}:`, err);
          // Don't fail the entire operation if one base fails
        }),
      ),
    );

    dispatch(setAccountAttribute({ key: 'bases', value: bases }));
    return Promise.resolve(bases);
  } catch (e) {
    dispatch(setAccountAttributeError({ key: 'bases', error: e.message }));
    throw e;
  } finally {
    dispatch(stopAccountAttributeLoading('bases'));
  }
};

export const createBase = (baseData, altanerComponentId) => async (dispatch, getState) => {
  dispatch(slice.actions.startLoading());
  const accountId = getState().general.account.id;

  try {
    const { prompt, ...restBaseData } = baseData;
    const augmentedBaseData = { ...restBaseData, account_id: accountId };

    const params = new URLSearchParams();
    if (altanerComponentId) params.append('altaner_component_id', altanerComponentId);
    if (prompt) params.append('prompt', prompt);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const response = await optimai_tables.post(`/base${queryString}`, augmentedBaseData);
    return response.data.base;
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

/**
 * Fetch base by ID and load its schema using pg-meta
 */
export const fetchBaseById = (baseId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    // Get base metadata from legacy API
    const response = await optimai_tables.get(`/base/${baseId}`);
    const base = response.data.base;
    dispatch(slice.actions.addBase(base));

    // Fetch tables and columns using pg-meta
    await dispatch(fetchTables(baseId, { include_columns: true }));

    return base;
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const updateBaseById = (baseId, baseData) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await optimai_tables.patch(`/base/${baseId}`, baseData);
    return Promise.resolve(response.data);
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const duplicateBase = (duplicateData) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await optimai_tables.post('/base/duplicate', duplicateData);
    return Promise.resolve(response.data.base);
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const deleteBaseById = (baseId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    await optimai_tables.delete(`/base/${baseId}/permanent`);
    return Promise.resolve();
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

// View thunks - keeping legacy for now
export const createViewThunk = (baseId, tableId, viewData) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await optimai_tables.post(`/base/${baseId}/table/${tableId}/view`, viewData);
    return Promise.resolve(response.data);
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const updateViewThunk = (baseId, tableId, viewId, changes) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await optimai_tables.patch(
      `/base/${baseId}/table/${tableId}/view/${viewId}`,
      changes,
    );
    return Promise.resolve(response.data);
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const deleteViewThunk = (baseId, tableId, viewId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    await optimai_tables.delete(`/base/${baseId}/table/${tableId}/view/${viewId}`);
    return Promise.resolve();
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

// ============================================================================
// RECORD OPERATIONS (using pg-meta raw SQL)
// ============================================================================

export const queryTableRecords =
  (tableId, queryParams = {}) =>
  async (dispatch, getState) => {
    try {
      const state = getState();
      // Convert tableId to number for comparison (pg-meta returns numeric IDs)
      const numericTableId = typeof tableId === 'string' ? parseInt(tableId, 10) : tableId;

      const baseId = Object.keys(state.bases.bases).find((baseId) =>
        state.bases.bases[baseId].tables?.items?.some((t) => t.id === numericTableId),
      );
      if (!baseId) {
        throw new Error(`Could not find base containing table ${tableId}`);
      }

      const base = state.bases.bases[baseId];
      const table = base.tables?.items?.find((t) => t.id === numericTableId);
      const tableName = table?.db_name || table?.name;
      const schemaName = table?.schema;

      if (!tableName || !schemaName) {
        throw new Error(`Could not find table name or schema for table ${tableId}`);
      }

      // Check if table has a created_at field and auto-sort if no order is specified
      const hasCreatedAtField = table?.fields?.items?.some((field) => {
        const fieldName = (field.name || field.db_field_name || '').toLowerCase();
        return fieldName === 'created_at' || fieldName === 'createdat';
      });

      // Merge query params with default sorting by created_at if field exists
      const finalQueryParams = { ...queryParams };
      if (hasCreatedAtField && !queryParams.order) {
        finalQueryParams.order = 'created_at.desc';
      }

      // Build SQL query
      const whereClause = buildWhereClause(finalQueryParams);
      const orderClause = buildOrderClause(finalQueryParams.order);
      const limit = finalQueryParams.limit ? `LIMIT ${finalQueryParams.limit}` : '';
      const offset = finalQueryParams.offset ? `OFFSET ${finalQueryParams.offset}` : '';

      // Build clean SQL query (single line)
      const queryParts = ['SELECT * FROM', tableName];
      if (whereClause) queryParts.push(whereClause);
      if (orderClause) queryParts.push(orderClause);
      if (limit) queryParts.push(limit);
      if (offset) queryParts.push(offset);
      const query = queryParts.join(' ') + ';';

      const records = await executeSQL(baseId, query);
      const total = records.length;
      const next_page_token =
        records.length === finalQueryParams.limit
          ? (finalQueryParams.offset || 0) + finalQueryParams.limit
          : null;

      dispatch(
        slice.actions.setTableRecords({
          tableId,
          records,
          total,
          next_page_token,
          isPagination: !!queryParams.page_token,
        }),
      );

      return { records, total, next_page_token };
    } catch (e) {
      throw e;
    }
  };

export const getTableRecord =
  (tableId, recordId, customTableName = null) =>
  async (dispatch, getState) => {
    dispatch(slice.actions.startLoading());
    try {
      const state = getState();
      // Convert tableId to number for comparison (pg-meta returns numeric IDs)
      const numericTableId = typeof tableId === 'string' ? parseInt(tableId, 10) : tableId;

      let baseId, tableName, schemaName;
      for (const [bId, base] of Object.entries(state.bases.bases)) {
        if (base.tables?.items) {
          const table = base.tables.items.find((t) => t.id === numericTableId);
          if (table) {
            baseId = bId;
            tableName = customTableName || table.name || table.db_name;
            schemaName = table.schema;
            break;
          }
        }
      }

      if (!baseId || !tableName || !schemaName) {
        throw new Error(`Could not find base, table name, or schema for table ${tableId}`);
      }

      const query = `SELECT * FROM ${tableName} WHERE id = '${escapeSql(recordId)}' LIMIT 1;`;
      const records = await executeSQL(baseId, query);
      const record = records[0];

      return Promise.resolve(record);
    } catch (e) {
      dispatch(slice.actions.hasError(e.message));
      throw e;
    } finally {
      dispatch(slice.actions.stopLoading());
    }
  };

export const createTableRecords =
  (tableId, recordData, options = {}) =>
  async (dispatch, getState) => {
    const { suppressLoading = false } = options;

    if (!suppressLoading) {
      dispatch(slice.actions.startLoading());
    }

    try {
      const state = getState();
      // Convert tableId to number for comparison (pg-meta returns numeric IDs)
      const numericTableId = typeof tableId === 'string' ? parseInt(tableId, 10) : tableId;

      let baseId, tableName, schemaName;
      for (const [bId, base] of Object.entries(state.bases.bases)) {
        if (base.tables?.items) {
          const table = base.tables.items.find((t) => t.id === numericTableId);
          if (table) {
            baseId = bId;
            tableName = table.db_name || table.name;
            schemaName = table.schema;
            break;
          }
        }
      }

      if (!baseId || !tableName || !schemaName) {
        throw new Error(`Could not find base, table name, or schema for table ${tableId}`);
      }

      let postgreSQLData;
      if (recordData.records && recordData.records.length > 0) {
        postgreSQLData = recordData.records[0].fields;
      } else if (Array.isArray(recordData) && recordData.length > 0) {
        // If recordData is an array, take the first item
        postgreSQLData = recordData[0];
      } else {
        postgreSQLData = recordData;
      }

      console.log('🔍 INSERT data:', { recordData, postgreSQLData, isArray: Array.isArray(postgreSQLData) });

      const query = buildInsertSQL(tableName, postgreSQLData);
      const records = await executeSQL(baseId, query);

      // Add each inserted record to Redux state
      if (Array.isArray(records) && records.length > 0) {
        records.forEach((record) => {
          dispatch(
            slice.actions.addTableRecord({
              tableId,
              record,
              insertAtBeginning: true, // Insert at beginning so it appears at top of list
            }),
          );
        });
      }

      // Return in format expected by GridView: { records: [...] }
      return Promise.resolve({ records });
    } catch (e) {
      if (!suppressLoading) {
        dispatch(slice.actions.hasError(e.message));
      }
      throw e;
    } finally {
      if (!suppressLoading) {
        dispatch(slice.actions.stopLoading());
      }
    }
  };

export const updateTableRecordThunk =
  (tableId, recordId, changes, options = {}) =>
  async (dispatch, getState) => {
    const { isRealTime = false, suppressLoading = false } = options;

    if (!suppressLoading) {
      dispatch(slice.actions.startLoading());
    }

    try {
      const state = getState();
      // Convert tableId to number for comparison (pg-meta returns numeric IDs)
      const numericTableId = typeof tableId === 'string' ? parseInt(tableId, 10) : tableId;

      let baseId, tableName, schemaName;
      for (const [bId, base] of Object.entries(state.bases.bases)) {
        if (base.tables?.items) {
          const table = base.tables.items.find((t) => t.id === numericTableId);
          if (table) {
            baseId = bId;
            tableName = table.db_name || table.name;
            schemaName = table.schema;
            break;
          }
        }
      }

      if (!baseId || !tableName || !schemaName) {
        throw new Error(`Could not find base, table name, or schema for table ${tableId}`);
      }

      const query = buildUpdateSQL(tableName, recordId, changes);
      const records = await executeSQL(baseId, query);

      dispatch(
        slice.actions.updateTableRecord({
          tableId,
          recordId,
          changes,
          isRealTime,
        }),
      );

      return Promise.resolve(records[0]);
    } catch (e) {
      if (!suppressLoading) {
        dispatch(slice.actions.hasError(e.message));
      }
      throw e;
    } finally {
      if (!suppressLoading) {
        dispatch(slice.actions.stopLoading());
      }
    }
  };

export const deleteTableRecordThunk = (tableId, recordIds) => async (dispatch, getState) => {
  dispatch(slice.actions.startLoading());
  try {
    const state = getState();
    // Convert tableId to number for comparison (pg-meta returns numeric IDs)
    const numericTableId = typeof tableId === 'string' ? parseInt(tableId, 10) : tableId;

    let baseId, tableName, schemaName;
    for (const [bId, base] of Object.entries(state.bases.bases)) {
      if (base.tables?.items) {
        const table = base.tables.items.find((t) => t.id === numericTableId);
        if (table) {
          baseId = bId;
          tableName = table.db_name || table.name;
          schemaName = table.schema;
          break;
        }
      }
    }

    if (!baseId || !tableName || !schemaName) {
      throw new Error(`Could not find base, table name, or schema for table ${tableId}`);
    }

    const ids = Array.isArray(recordIds) ? recordIds : [recordIds];

    // Execute delete in batches
    const BATCH_SIZE = 50;
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      const batchIds = ids.slice(i, i + BATCH_SIZE);
      const query = buildDeleteSQL(tableName, batchIds);
      await executeSQL(baseId, query);
    }

    ids.forEach((recordId) => {
      dispatch(slice.actions.deleteTableRecord({ tableId, recordId }));
    });

    return Promise.resolve();
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const preloadUsersForBase = (baseId) => async (dispatch, getState) => {
  const state = getState();
  const userCacheState = state.bases.userCacheState;
  const existingUsers = state.bases.userCache[baseId];

  const ONE_HOUR = 60 * 60 * 1000;
  if (
    existingUsers &&
    Object.keys(existingUsers).length > 0 &&
    userCacheState.lastFetched &&
    Date.now() - userCacheState.lastFetched < ONE_HOUR
  ) {
    return Promise.resolve(existingUsers);
  }

  if (userCacheState.loading) {
    return Promise.resolve({});
  }

  dispatch(setUserCacheLoading(true));

  try {
    const base = state.bases.bases[baseId];
    if (!base || !base.tables || !base.tables.items) {
      throw new Error(`Base ${baseId} not found or has no tables`);
    }

    // Self-hosted Supabase always uses auth.users
    const query = 'SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 10000;';
    const users = await executeSQL(baseId, query);

    dispatch(setUserCache({ users, baseId }));

    return Promise.resolve(state.bases.userCache[baseId] || {});
  } catch (error) {
    dispatch(setUserCacheError(error.message));
    throw error;
  }
};

export const preloadBucketsForBase = (baseId) => async (dispatch, getState) => {
  const state = getState();
  const bucketCacheState = state.bases.bucketCacheState;
  const existingBuckets = state.bases.bucketCache[baseId];

  const ONE_HOUR = 60 * 60 * 1000;
  if (
    existingBuckets &&
    Object.keys(existingBuckets).length > 0 &&
    bucketCacheState.lastFetched &&
    Date.now() - bucketCacheState.lastFetched < ONE_HOUR
  ) {
    return Promise.resolve(existingBuckets);
  }

  if (bucketCacheState.loading) {
    return Promise.resolve({});
  }

  dispatch(setBucketCacheLoading(true));

  try {
    const base = state.bases.bases[baseId];
    if (!base || !base.tables || !base.tables.items) {
      throw new Error(`Base ${baseId} not found or has no tables`);
    }

    // Query storage.buckets table
    const query = 'SELECT * FROM storage.buckets ORDER BY created_at DESC;';
    const buckets = await executeSQL(baseId, query);

    dispatch(setBucketCache({ buckets, baseId }));

    return Promise.resolve(state.bases.bucketCache[baseId] || {});
  } catch (error) {
    dispatch(setBucketCacheError(error.message));
    throw error;
  }
};

export const importCSVToTable = (tableId, importData) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await optimai_tables.post(`/table/${tableId}/import-csv`, importData);
    return Promise.resolve(response.data);
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

/**
 * Export database to CSV (single table) or ZIP (all tables)
 * @param {string} baseId - Database ID
 * @param {string} tableName - Optional. If provided, exports single table. If omitted, exports all tables to ZIP
 */
export const exportDatabaseToCSV =
  (baseId, tableName = null) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const params = tableName ? { table_name: tableName } : {};
      const response = await optimai_tables_v4.get(`/databases/${baseId}/export/csv`, {
        params,
        responseType: 'blob',
      });

      return Promise.resolve(response.data);
    } catch (e) {
      dispatch(slice.actions.hasError(e.message));
      throw e;
    } finally {
      dispatch(slice.actions.stopLoading());
    }
  };

/**
 * Export database schema as SQL dump using pg_dump
 * @param {string} baseId - Database ID
 * @param {boolean} includeData - If true, exports both schema and data. Default: false (schema only)
 */
export const exportDatabaseToSQL =
  (baseId, includeData = false) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const params = includeData ? { include_data: true } : {};
      const response = await optimai_cloud.get(`/v1/pg-meta/${baseId}/export/schema`, {
        params,
        responseType: 'blob',
      });

      return Promise.resolve(response.data);
    } catch (e) {
      dispatch(slice.actions.hasError(e.message));
      throw e;
    } finally {
      dispatch(slice.actions.stopLoading());
    }
  };

export const loadTableRecords =
  (tableId, options = {}) =>
  async (dispatch, getState) => {
    const {
      limit = 50,
      page = 0,
      forceReload = false,
      searchQuery = null,
      filters = null,
      append = false,
    } = options;

    const offset = page * limit;

    const state = getState();
    const recordsState = state.bases.recordsState[tableId];
    const records = state.bases.records[tableId];

    if (!forceReload && !searchQuery && !filters && records?.items?.length > 0 && !append) {
      return Promise.resolve(records);
    }

    if (recordsState?.loading) {
      return;
    }

    dispatch(slice.actions.setTableRecordsLoading({ tableId, loading: true }));

    try {
      // Convert tableId to number for comparison (pg-meta returns numeric IDs)
      const numericTableId = typeof tableId === 'string' ? parseInt(tableId, 10) : tableId;

      const baseId = Object.keys(state.bases.bases).find((baseId) =>
        state.bases.bases[baseId].tables?.items?.some((t) => t.id === numericTableId),
      );
      if (!baseId) {
        throw new Error(`Could not find base containing table ${tableId}`);
      }

      const base = state.bases.bases[baseId];
      const table = base.tables?.items?.find((t) => t.id === numericTableId);
      const tableName = table?.db_name || table?.name;
      const schemaName = table?.schema;

      if (!tableName || !schemaName) {
        throw new Error(`Could not find table name or schema for table ${tableId}`);
      }

      const queryParams = {
        limit,
        offset,
      };

      // Check if table has a created_at field and auto-sort if no order is specified
      const hasCreatedAtField = table?.fields?.items?.some((field) => {
        const fieldName = (field.name || field.db_field_name || '').toLowerCase();
        return fieldName === 'created_at' || fieldName === 'createdat';
      });

      // Add default sorting by created_at if field exists and no custom order in options
      if (hasCreatedAtField && !options.order) {
        queryParams.order = 'created_at.desc';
      } else if (options.order) {
        queryParams.order = options.order;
      }

      if (searchQuery && searchQuery.trim()) {
        // Filter text-based PostgreSQL types for search
        const textFields = table.fields?.items?.filter((field) => {
          const dataType = field.data_type?.toLowerCase() || '';
          return (
            dataType === 'text' ||
            dataType === 'character varying' ||
            dataType === 'varchar' ||
            dataType === 'char' ||
            dataType === 'character'
          );
        });

        if (textFields && textFields.length > 0) {
          const searchConditions = textFields
            .map((field) => `${field.db_field_name}.ilike.*${searchQuery.trim()}*`)
            .join(',');
          queryParams.or = `(${searchConditions})`;
        }
      }

      if (filters) {
        Object.assign(queryParams, filters);
      }

      // Build SQL query
      const whereClause = buildWhereClause(queryParams);
      const orderClause = buildOrderClause(queryParams.order);
      const limitClause = `LIMIT ${limit}`;
      const offsetClause = offset > 0 ? `OFFSET ${offset}` : '';

      // Build clean SQL query (single line)
      const queryParts = ['SELECT * FROM', tableName];
      if (whereClause) queryParts.push(whereClause);
      if (orderClause) queryParts.push(orderClause);
      if (limitClause) queryParts.push(limitClause);
      if (offsetClause) queryParts.push(offsetClause);
      const query = queryParts.join(' ') + ';';

      console.log('🔍 Executing SQL Query:', {
        tableId,
        tableName,
        schemaName,
        query: query.substring(0, 300),
        queryParams,
      });

      const responseRecords = await executeSQL(baseId, query);
      console.log('✅ SQL Query Result:', {
        recordCount: responseRecords?.length || 0,
        firstRecord: responseRecords?.[0],
      });

      // Get total count if needed
      let totalCount = records?.total || recordsState?.totalRecords || 0;
      if (!totalCount || totalCount === 0) {
        try {
          const countQuery = `SELECT COUNT(*) as count FROM ${tableName} ${whereClause};`;
          const countResult = await executeSQL(baseId, countQuery);
          totalCount = parseInt(countResult[0]?.count || 0, 10);
        } catch {
          if (responseRecords.length < limit) {
            totalCount = responseRecords.length;
          } else {
            totalCount = Math.max(responseRecords.length * 20, 1000);
          }
        }
      }

      dispatch(
        slice.actions.setTableRecords({
          tableId,
          records: responseRecords,
          total: totalCount,
          next_page_token: responseRecords.length === limit ? offset + limit : null,
          isPagination: append,
        }),
      );

      dispatch(
        slice.actions.setTableRecordsState({
          tableId,
          loading: false,
          lastFetched: Date.now(),
          cached: false,
          searchQuery,
          currentPage: page,
          pageSize: limit,
          totalPages: Math.ceil(Math.max(totalCount, 1) / limit),
          totalRecords: totalCount,
        }),
      );

      return getState().bases.records[tableId];
    } catch (error) {
      console.error('❌ loadTableRecords failed:', {
        tableId,
        error: error.message,
        response: error.response?.data,
      });
      dispatch(slice.actions.hasError(error.message));
      dispatch(slice.actions.setTableRecordsLoading({ tableId, loading: false }));
      // Don't throw to prevent infinite retries
      return { items: [], total: 0 };
    } finally {
      dispatch(slice.actions.setTableRecordsLoading({ tableId, loading: false }));
    }
  };

export const getTableRecordCount = (tableId) => async (dispatch, getState) => {
  try {
    const state = getState();
    // Convert tableId to number for comparison (pg-meta returns numeric IDs)
    const numericTableId = typeof tableId === 'string' ? parseInt(tableId, 10) : tableId;

    const baseId = Object.keys(state.bases.bases).find((baseId) =>
      state.bases.bases[baseId].tables?.items?.some((t) => t.id === numericTableId),
    );
    if (!baseId) {
      throw new Error(`Could not find base containing table ${tableId}`);
    }

    const base = state.bases.bases[baseId];
    const table = base.tables?.items?.find((t) => t.id === numericTableId);
    const tableName = table?.db_name || table?.name;
    const schemaName = table?.schema;

    if (!tableName || !schemaName) {
      throw new Error(`Could not find table name or schema for table ${tableId}`);
    }

    const query = `SELECT COUNT(*) as count FROM ${schemaName}.${tableName};`;
    const result = await executeSQL(baseId, query);
    return parseInt(result[0]?.count || 0, 10);
  } catch {
    return 0;
  }
};

export const loadAllTableRecords = (tableId, forceReload = false) =>
  loadTableRecords(tableId, { limit: 50, forceReload });

export const handleRealTimeUpdates = (tableId, updates) => async (dispatch) => {
  try {
    const { additions = [], updates: modifications = [], deletions = [] } = updates;

    if (additions.length > 0 || modifications.length > 0 || deletions.length > 0) {
      dispatch(
        integrateRealTimeUpdates({
          tableId,
          updates: modifications.length > 0 ? modifications : undefined,
          additions: additions.length > 0 ? additions : undefined,
          deletions:
            deletions.length > 0
              ? deletions.map((id) => (typeof id === 'string' ? id : id.id))
              : undefined,
        }),
      );
    }

    return Promise.resolve({
      success: true,
      processed: additions.length + modifications.length + deletions.length,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error handling real-time updates:', error);
    throw error;
  }
};

export const reloadTablePageWithRealTime =
  (tableId, page = 0) =>
  async (dispatch, getState) => {
    const state = getState();
    const recordsState = state.bases.recordsState[tableId];

    if (!recordsState) {
      return dispatch(loadTableRecords(tableId, { page, forceReload: true }));
    }

    const pageSize = recordsState.pageSize || 50;
    const hasRealTimeUpdates = recordsState.hasRealTimeUpdates;

    try {
      const result = await dispatch(
        loadTableRecords(tableId, {
          page,
          limit: pageSize,
          forceReload: true,
        }),
      );

      if (hasRealTimeUpdates) {
        dispatch(clearRealTimeUpdateFlags({ tableId }));
      }

      return result;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error reloading table page:', error);
      throw error;
    }
  };

export const searchTableRecords = (tableId, query) => async (dispatch, getState) => {
  if (!query || !query.trim()) {
    dispatch(clearDatabaseSearchResults({ tableId }));
    dispatch(setDatabaseSearching(false));

    const state = getState();
    const recordsState = state.bases.recordsState[tableId];
    const currentPage = recordsState?.currentPage || 0;
    const pageSize = recordsState?.pageSize || 50;

    await dispatch(
      loadTableRecords(tableId, {
        page: currentPage,
        limit: pageSize,
        forceReload: true,
      }),
    );

    return;
  }

  dispatch(setDatabaseSearching(true));

  try {
    const state = getState();
    // Convert tableId to number for comparison (pg-meta returns numeric IDs)
    const numericTableId = typeof tableId === 'string' ? parseInt(tableId, 10) : tableId;

    const recordsState = state.bases.recordsState[tableId];
    const baseId = Object.keys(state.bases.bases).find((baseId) =>
      state.bases.bases[baseId].tables?.items?.some((t) => t.id === numericTableId),
    );
    if (!baseId) {
      throw new Error(`Could not find base containing table ${tableId}`);
    }

    const base = state.bases.bases[baseId];
    const table = base.tables?.items?.find((t) => t.id === numericTableId);
    const tableName = table?.db_name || table?.name;
    const schemaName = table?.schema;

    if (!tableName || !schemaName) {
      throw new Error(`Could not find table name or schema for table ${tableId}`);
    }

    const searchQuery = query.trim();

    // Filter text-based PostgreSQL types for search
    const textFields =
      table.fields?.items?.filter((field) => {
        const dataType = field.data_type?.toLowerCase() || '';
        return (
          dataType === 'text' ||
          dataType === 'character varying' ||
          dataType === 'varchar' ||
          dataType === 'char' ||
          dataType === 'character'
        );
      }) || [];

    if (textFields.length === 0) {
      dispatch(setDatabaseSearching(false));
      return;
    }

    // Build SQL WHERE clause with ILIKE for search
    const searchConditions = textFields
      .map((field) => `${field.db_field_name} ILIKE '%${escapeSql(searchQuery)}%'`)
      .join(' OR ');

    // Build clean SQL query (single line)
    const sqlQuery = `SELECT * FROM ${tableName} WHERE ${searchConditions} ORDER BY created_at DESC LIMIT 500;`;

    const searchRecords = await executeSQL(baseId, sqlQuery);

    const currentRecords = state.bases.records[tableId]?.items || [];
    const existingIds = new Set(currentRecords.map((record) => record.id));
    const newSearchRecords = searchRecords.filter((record) => !existingIds.has(record.id));

    const mergedRecords = [...currentRecords, ...newSearchRecords];

    dispatch(
      slice.actions.setTableRecords({
        tableId,
        records: mergedRecords,
        total: mergedRecords.length,
        next_page_token: null,
        isPagination: false,
      }),
    );

    dispatch(
      setDatabaseSearchResults({
        tableId,
        results: newSearchRecords,
        query: searchQuery,
        totalSearchResults: searchRecords.length,
        newRecordsFound: newSearchRecords.length,
      }),
    );

    if (recordsState) {
      dispatch(
        slice.actions.setTableRecordsState({
          tableId,
          isSearchMode: true,
          searchQuery,
          originalPage: recordsState.currentPage || 0,
          originalPageSize: recordsState.pageSize || 50,
        }),
      );
    }

    return { items: searchRecords, isSearch: true };
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(setDatabaseSearching(false));
  }
};

export const loadTablePage = (tableId, page) => async (dispatch, getState) => {
  const state = getState();
  const recordsState = state.bases.recordsState[tableId];

  if (!recordsState || recordsState.loading) {
    return;
  }

  const pageSize = recordsState.pageSize || 50;
  const searchQuery = recordsState.searchQuery;

  try {
    await dispatch(
      loadTableRecords(tableId, {
        page,
        limit: pageSize,
        searchQuery,
        forceReload: true,
      }),
    );
  } catch (loadError) {
    throw loadError;
  }
};

// ============================================================================
// SELECTORS (unchanged)
// ============================================================================

export const selectBaseState = (state) => state.bases;
export const selectBases = (state) => selectBaseState(state).bases;

export const selectBaseById = createSelector(
  [selectBases, (_, baseId) => baseId],
  (bases, baseId) => bases[baseId],
);

export const selectTablesByBaseId = createSelector(
  [selectBaseById],
  (base) => {
    const tables = base?.tables?.items || [];
    // Filter to only show tables in the 'public' schema
    return tables.filter((table) => table.schema === 'public');
  },
);

export const selectTableById = createSelector(
  [selectTablesByBaseId, (_, __, tableId) => tableId],
  (tables, tableId) => {
    // Convert tableId to number for comparison (pg-meta returns numeric IDs)
    const numericTableId = typeof tableId === 'string' ? parseInt(tableId, 10) : tableId;
    return tables.find((table) => table.id === numericTableId);
  },
);

export const selectFieldsByTableId = createSelector(
  [selectTableById],
  (table) => table?.fields?.items || [],
);

export const selectViewsByTableId = createSelector(
  [selectTableById],
  (table) => table?.views?.items || [],
);

export const selectCurrentView = createSelector(
  [selectViewsByTableId, (_, __, ___, viewId) => viewId],
  (views, viewId) => {
    if (!views || views.length === 0) {
      return {
        id: 'default',
        name: 'Default View',
        type: 'grid',
        is_default: true,
      };
    }

    return views.find((v) => v.id === viewId) || views[0];
  },
);

export const selectRecordsState = createSelector([selectBaseState], (state) => state.records);

export const selectTableRecords = createSelector(
  [selectRecordsState, (_, tableId) => tableId],
  (records, tableId) => records[tableId]?.items || [],
);

export const selectTableRecordsTotal = createSelector(
  [selectRecordsState, (_, tableId) => tableId],
  (records, tableId) => records[tableId]?.total || 0,
);

export const selectTableRecordsState = createSelector(
  [selectBaseState, (_, tableId) => tableId],
  (state, tableId) => state.recordsState[tableId],
);

export const selectIsTableRecordsLoading = createSelector(
  [selectTableRecordsState],
  (recordsState) => recordsState?.loading ?? false,
);

export const selectTableRecordById = createSelector(
  [selectTableRecords, (_, __, recordId) => recordId],
  (records, recordId) => records.find((record) => record.id === recordId),
);

export const selectTablePaginationInfo = createSelector(
  [selectTableRecordsState],
  (recordsState) => {
    if (!recordsState) return null;

    return {
      currentPage: recordsState.currentPage || 0,
      totalPages: recordsState.totalPages || 1,
      pageSize: recordsState.pageSize || 50,
      totalRecords: recordsState.totalRecords || 0,
      isLastPageFound: true,
      hasNewRecordsOnPreviousPages: recordsState.hasNewRecordsOnPreviousPages || false,
    };
  },
);

export const selectTableTotalRecords = createSelector(
  [selectTableRecordsState],
  (recordsState) => recordsState?.totalRecords || 0,
);

export const createRecordPrimaryValueSelector = (baseId, tableId, recordId) =>
  createSelector(
    [
      (state) => selectTableRecords(state, tableId),
      (state) => selectFieldsByTableId(state, baseId, tableId),
    ],
    (records, fields) => {
      const record = records.find((r) => r.id === recordId);
      if (!record) return `Record ${recordId}`;

      const fieldToUse = fields.find((field) => field.is_primary) || fields[0];
      return record[fieldToUse?.db_field_name] || `Record ${recordId}`;
    },
  );

export const selectDatabaseNavigation = createSelector(
  [selectBaseState],
  (state) => state.databaseNavigation,
);

export const selectDatabaseQuickFilter = createSelector(
  [selectDatabaseNavigation],
  (navigation) => navigation.quickFilter,
);

export const selectDatabaseViewType = createSelector(
  [selectDatabaseNavigation],
  (navigation) => navigation.currentViewType,
);

export const selectDatabaseRefreshing = createSelector(
  [selectDatabaseNavigation],
  (navigation) => navigation.isRefreshing,
);

export const selectDatabaseRecordCount = createSelector(
  [selectDatabaseNavigation],
  (navigation) => navigation.recordCount,
);

export const selectDatabaseSearching = createSelector(
  [selectDatabaseNavigation],
  (navigation) => navigation.isSearching,
);

export const selectDatabaseSearchResults = createSelector(
  [selectDatabaseNavigation, (_, tableId) => tableId],
  (navigation, tableId) => navigation.searchResults[tableId] || null,
);

export const selectSQLTerminalMode = createSelector(
  [selectDatabaseNavigation],
  (navigation) => navigation.sqlTerminalMode,
);

export const selectUserCache = createSelector([selectBaseState], (state) => state.userCache);

export const selectUserCacheState = createSelector(
  [selectBaseState],
  (state) => state.userCacheState,
);

export const selectUserCacheForBase = createSelector(
  [selectUserCache, (_, baseId) => baseId],
  (userCache, baseId) => userCache[baseId] || {},
);

export const selectUserById = createSelector(
  [selectUserCacheForBase, (_, __, userId) => userId],
  (users, userId) => users[userId] || null,
);

// Bucket cache selectors
export const selectBucketCache = createSelector([selectBaseState], (state) => state.bucketCache);

export const selectBucketCacheState = createSelector(
  [selectBaseState],
  (state) => state.bucketCacheState,
);

export const selectBucketCacheForBase = createSelector(
  [selectBucketCache, (_, baseId) => baseId],
  (bucketCache, baseId) => bucketCache[baseId] || {},
);

export const selectBucketById = createSelector(
  [selectBucketCacheForBase, (_, __, bucketId) => bucketId],
  (buckets, bucketId) => buckets[bucketId] || null,
);

export const createUserDisplayValueSelector = (baseId, userId) =>
  createSelector([(state) => selectUserCacheForBase(state, baseId)], (users) => {
    const user = users[userId];
    if (!user) {
      return userId;
    }

    const displayValue =
      user.email ||
      user.username ||
      user.name ||
      user.display_name ||
      user.full_name ||
      user.first_name ||
      user.last_name ||
      user.user_name ||
      user.displayName ||
      user.firstName ||
      user.lastName ||
      (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : null) ||
      (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null) ||
      userId;

    return displayValue;
  });
