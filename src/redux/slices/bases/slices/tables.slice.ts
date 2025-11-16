/**
 * Tables slice
 * Single Responsibility: Manages table metadata (not records)
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { PgMetaTable, BaseTable, PgMetaColumn, BaseField } from '../../../../types/database';
import type { TablesState } from '../types';

const initialState: TablesState = {};

const tablesSlice = createSlice({
  name: 'bases/tables',
  initialState,
  reducers: {
    setTables(state, action: PayloadAction<{ baseId: string; tables: PgMetaTable[] }>) {
      const { baseId, tables } = action.payload;
      state[baseId] = {
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
          fields: {
            items: table.columns
              ? table.columns.map((col) => ({
                  id: col.id,
                  name: col.name,
                  db_field_name: col.name,
                  data_type: col.data_type,
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
                }))
              : [],
          },
          primary_keys: table.primary_keys || [],
          relationships: table.relationships || [],
        })),
      };
    },
    addTable(state, action: PayloadAction<{ baseId: string; table: BaseTable }>) {
      const { baseId, table } = action.payload;
      if (!state[baseId]) {
        state[baseId] = { items: [] };
      }
      state[baseId].items.push(table);
    },
    updateTable(state, action: PayloadAction<{ baseId: string; tableId: number; changes: Partial<BaseTable> }>) {
      const { baseId, tableId, changes } = action.payload;
      if (state[baseId]) {
        const tableIndex = state[baseId].items.findIndex((t) => t.id === tableId);
        if (tableIndex !== -1) {
          state[baseId].items[tableIndex] = {
            ...state[baseId].items[tableIndex],
            ...changes,
          };
        }
      }
    },
    deleteTable(state, action: PayloadAction<{ baseId: string; tableId: number }>) {
      const { baseId, tableId } = action.payload;
      if (state[baseId]) {
        state[baseId].items = state[baseId].items.filter((t) => t.id !== tableId);
      }
    },
    setColumns(state, action: PayloadAction<{ baseId: string; tableId: number; columns: PgMetaColumn[] }>) {
      const { baseId, tableId, columns } = action.payload;
      if (state[baseId]) {
        const table = state[baseId].items.find((t) => t.id === tableId);
        if (table) {
          table.fields = {
            items: columns.map((col) => ({
              id: col.id,
              name: col.name,
              db_field_name: col.name,
              data_type: col.data_type,
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
    addField(state, action: PayloadAction<{ baseId: string; tableId: number; field: BaseField }>) {
      const { baseId, tableId, field } = action.payload;
      if (state[baseId]) {
        const table = state[baseId].items.find((t) => t.id === tableId);
        if (table) {
          if (!table.fields) table.fields = { items: [] };
          table.fields.items.push(field);
        }
      }
    },
    updateField(state, action: PayloadAction<{ baseId: string; tableId: number; fieldId: number; changes: Partial<BaseField> }>) {
      const { baseId, tableId, fieldId, changes } = action.payload;
      if (state[baseId]) {
        const table = state[baseId].items.find((t) => t.id === tableId);
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
    deleteField(state, action: PayloadAction<{ baseId: string; tableId: number; fieldId: number }>) {
      const { baseId, tableId, fieldId } = action.payload;
      if (state[baseId]) {
        const table = state[baseId].items.find((t) => t.id === tableId);
        if (table?.fields?.items) {
          table.fields.items = table.fields.items.filter((f) => f.id !== fieldId);
        }
      }
    },
  },
});

export const { setTables, addTable, updateTable, deleteTable, setColumns, addField, updateField, deleteField } =
  tablesSlice.actions;

export default tablesSlice.reducer;

