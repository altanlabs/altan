/**
 * Schemas slice
 * Single Responsibility: Manages database schema state only
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { BaseSchema } from '../../../../types/database';
import type { SchemaState } from '../types';

const initialState: SchemaState = {};

const schemasSlice = createSlice({
  name: 'bases/schemas',
  initialState,
  reducers: {
    setSchemasLoading(state, action: PayloadAction<{ baseId: string; loading: boolean }>) {
      const { baseId, loading } = action.payload;
      if (!state[baseId]) {
        state[baseId] = { items: [], loading: false, error: null };
      }
      state[baseId].loading = loading;
    },
    setSchemas(state, action: PayloadAction<{ baseId: string; schemas: BaseSchema[] }>) {
      const { baseId, schemas } = action.payload;
      if (!state[baseId]) {
        state[baseId] = { items: [], loading: false, error: null };
      }
      state[baseId].items = schemas;
      state[baseId].loading = false;
      state[baseId].error = null;
    },
    setSchemasError(state, action: PayloadAction<{ baseId: string; error: string }>) {
      const { baseId, error } = action.payload;
      if (!state[baseId]) {
        state[baseId] = { items: [], loading: false, error: null };
      }
      state[baseId].error = error;
      state[baseId].loading = false;
    },
  },
});

export const { setSchemasLoading, setSchemas, setSchemasError } = schemasSlice.actions;

export default schemasSlice.reducer;

