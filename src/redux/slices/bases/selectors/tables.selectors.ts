/**
 * Tables selectors
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';
import type { BaseTable } from '../../../../types/database';

export const selectTablesState = (state: RootState) => state.bases.tables;

export const selectTablesByBaseId = createSelector(
  [(state: RootState) => state.bases.tables, (_: RootState, baseId: string) => baseId],
  (tables, baseId): BaseTable[] => {
    const baseTables = tables[baseId]?.items || [];
    return baseTables.filter((table) => table.schema === 'public');
  },
);

export const selectAllTablesByBaseId = createSelector(
  [
    (state: RootState) => state.bases.tables,
    (state: RootState) => state.cloud,
    (_: RootState, baseId: string) => baseId,
  ],
  (basesTables, cloudState, baseId) => {
    const baseTables = basesTables[baseId]?.items;
    if (Array.isArray(baseTables) && baseTables.length > 0) {
      return baseTables;
    }

    const cloudTables = cloudState?.clouds?.[baseId]?.tables?.items;
    if (Array.isArray(cloudTables) && cloudTables.length > 0) {
      return cloudTables;
    }

    return [];
  },
);

export const selectTableById = createSelector(
  [selectTablesByBaseId, (_: RootState, __: string, tableId: number) => tableId],
  (tables, tableId) => {
    const numericTableId = typeof tableId === 'string' ? parseInt(tableId, 10) : tableId;
    return tables.find((table) => table.id === numericTableId);
  },
);

export const selectFieldsByTableId = createSelector(
  [selectTableById],
  (table) => table?.fields?.items || [],
);

