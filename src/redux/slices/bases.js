import { createSlice, createSelector } from '@reduxjs/toolkit';

import {
  startAccountAttributeLoading,
  stopAccountAttributeLoading,
  setAccountAttribute,
  setAccountAttributeError,
} from './general';
import { optimai_tables, optimai_database } from '../../utils/axios';

const initialState = {
  isLoading: false,
  error: null,
  initialized: false,
  bases: {},
  records: {},
  recordsState: {},
  // Database navigation state
  databaseNavigation: {
    quickFilter: '',
    currentViewType: 'grid',
    isRefreshing: false,
    recordCount: 0,
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
    // Table reducers
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
    // Field reducers
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
          // Add null check for fields.items
          table.fields.items = table.fields.items.filter((f) => f.id !== fieldId);

          // Also remove the field from any records that might have it
          if (state.records[tableId]?.items) {
            state.records[tableId].items.forEach((record) => {
              if (record) {
                const fieldName = table.fields.items.find((f) => f.id === fieldId)?.db_field_name;
                if (fieldName && record[fieldName] !== undefined) {
                  // Create a shallow copy to avoid modifying the parameter directly
                  const recordCopy = { ...record };
                  delete recordCopy[fieldName];
                  // Replace the original record with our modified copy
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
    // Records reducers
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

      // Helper function to deduplicate records by ID
      const deduplicateRecords = (recordsArray) => {
        const seen = new Map();
        return recordsArray.filter((record) => {
          if (!record || !record.id) return false;
          if (seen.has(record.id)) return false;
          seen.set(record.id, true);
          return true;
        });
      };

      // Initialize if needed or handle first load
      if (!state.records[tableId] || !isPagination) {
        state.records[tableId] = {
          items: deduplicateRecords(records.filter((record) => record !== undefined)),
          total,
        };
      } else {
        // Append new records for pagination, ensuring no duplicates
        const combinedRecords = [...state.records[tableId].items, ...records];
        state.records[tableId] = {
          items: deduplicateRecords(combinedRecords),
          total,
        };
      }

      // Update records state
      state.recordsState[tableId] = {
        ...state.recordsState[tableId],
        loading: false,
        lastFetched: Date.now(),
        next_page_token,
        isFullyLoaded: !next_page_token,
      };
    },
    updateTableRecord(state, action) {
      const { tableId, tableName, recordId, changes } = action.payload;

      // First try to find by exact tableId
      let tableRecords = state.records[tableId]?.items;

      // If not found by tableId and we have a tableName, try to find by table name
      if (!tableRecords && tableName) {
        // Look through all bases to find a table with matching name
        for (const baseId of Object.keys(state.bases)) {
          const base = state.bases[baseId];
          if (base.tables?.items) {
            const matchingTable = base.tables.items.find((table) =>
              table.name === tableName || table.db_name === tableName,
            );
            if (matchingTable) {
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
        }
      } else {
        // Last resort: Try to find the record in any available table
        const availableTables = Object.keys(state.records);
        for (const availableTableId of availableTables) {
          const availableTableRecords = state.records[availableTableId]?.items;
          if (availableTableRecords) {
            const foundRecordIndex = availableTableRecords.findIndex((r) => r.id === recordId);
            if (foundRecordIndex !== -1) {
              availableTableRecords[foundRecordIndex] = { ...availableTableRecords[foundRecordIndex], ...changes };
              return;
            }
          }
        }
      }
    },
    addTableRecord(state, action) {
      const { tableId, tableName, record } = action.payload;
      let targetTableId = tableId;

      // If tableId doesn't exist in records but we have a tableName, try to find by name
      if (!state.records[tableId] && tableName) {
        for (const baseId of Object.keys(state.bases)) {
          const base = state.bases[baseId];
          if (base.tables?.items) {
            const matchingTable = base.tables.items.find((table) =>
              table.name === tableName || table.db_name === tableName,
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
      state.records[targetTableId].items.push(record);
      state.records[targetTableId].total += 1;
    },
    deleteTableRecord(state, action) {
      const { tableId, tableName, recordId } = action.payload;
      let targetTableId = tableId;

      // If tableId doesn't exist in records but we have a tableName, try to find by name
      if (!state.records[tableId] && tableName) {
        for (const baseId of Object.keys(state.bases)) {
          const base = state.bases[baseId];
          if (base.tables?.items) {
            const matchingTable = base.tables.items.find((table) =>
              table.name === tableName || table.db_name === tableName,
            );
            if (matchingTable && state.records[matchingTable.id]) {
              targetTableId = matchingTable.id;
              break;
            }
          }
        }
      }

      if (state.records[targetTableId]) {
        state.records[targetTableId].items = state.records[targetTableId].items.filter(
          (record) => record.id !== recordId,
        );
        state.records[targetTableId].total -= 1;
      }
    },
    clearTableRecords(state, action) {
      const { tableId } = action.payload;
      delete state.records[tableId];
    },
    setTableRecordsState(state, action) {
      const { tableId, loading, lastFetched, queryParams, cached = false } = action.payload;
      state.recordsState[tableId] = {
        loading,
        lastFetched,
        queryParams,
        cached,
      };
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
    clearDatabaseNavigation(state) {
      state.databaseNavigation = {
        quickFilter: '',
        currentViewType: 'grid',
        isRefreshing: false,
        recordCount: 0,
      };
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
  addTable,
  updateTable,
  deleteTable,
  addField,
  updateField,
  deleteField,
  addView,
  updateView,
  deleteView,
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
  clearDatabaseNavigation,
} = slice.actions;

// Thunk actions for bases
export const getBaseById = (baseId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    // Use legacy API first to check if this is a v2 base
    const response = await optimai_tables.get(`/base/${baseId}`);
    const base = response.data;
    dispatch(slice.actions.addBase(base.base));
    return Promise.resolve(base);
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

// Thunk actions for bases
export const getBasesByAccountID = (accountId) => async (dispatch) => {
  dispatch(startAccountAttributeLoading('bases'));
  try {
    const response = await optimai_tables.get(`/base/list/${accountId}`);
    // La estructura parece ser response.data.data.bases
    const bases = response.data?.data?.bases || response.data?.bases || [];
    bases.forEach((base) => {
      dispatch(slice.actions.addBase(base));
    });
    // Establecer las bases en el estado de la cuenta y marcar como inicializado
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

    // Construct query params
    const params = new URLSearchParams();
    if (altanerComponentId) params.append('altaner_component_id', altanerComponentId);
    if (prompt) params.append('prompt', prompt);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    // For new bases, use the current version of the API (v2)
    const response = await optimai_tables.post(`/base${queryString}`, augmentedBaseData);
    return response.data.base;
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const fetchBaseById = (baseId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    // First get the base with legacy API to determine which API to use for future calls
    const response = await optimai_tables.get(`/base/${baseId}`);
    const base = response.data.base;
    dispatch(slice.actions.addBase(base));
    // Store the API version in the state so we have it for future reference
    return base;
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const updateBaseById = (baseId, baseData) => async (dispatch, getState) => {
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

export const duplicateBase = (duplicateData) => async (dispatch, getState) => {
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

export const deleteBaseById = (baseId) => async (dispatch, getState) => {
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

// Thunk actions for tables
export const createTable = (baseId, tableData) => async (dispatch, getState) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await optimai_tables.post(`/base/${baseId}/table`, tableData);
    return Promise.resolve(response.data);
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const updateTableById = (baseId, tableId, changes) => async (dispatch, getState) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await optimai_tables.patch(`/table/${tableId}`, changes);
    return Promise.resolve(response.data);
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const deleteTableById = (baseId, tableId) => async (dispatch, getState) => {
  dispatch(slice.actions.startLoading());
  try {
    await optimai_tables.delete(`/table/${tableId}`);
    return Promise.resolve();
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

// Thunk actions for fields
export const createField = (table, fieldData) => async (dispatch, getState) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await optimai_tables.post(`/table/${table.id}/field`, fieldData);
    return Promise.resolve(response.data);
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const updateFieldThunk = (tableId, fieldId, changes) => async (dispatch, getState) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await optimai_tables.patch(`/table/${tableId}/field/${fieldId}`, changes);
    return Promise.resolve(response.data);
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const deleteFieldThunk = (tableId, fieldId) => async (dispatch, getState) => {
  dispatch(slice.actions.startLoading());
  try {
    await optimai_tables.delete(`/table/${tableId}/field/${fieldId}`);
    dispatch(slice.actions.deleteField({ tableId, fieldId }));
    return Promise.resolve();
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

// Thunk actions for views
export const createViewThunk = (baseId, tableId, viewData) => async (dispatch, getState) => {
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

export const updateViewThunk = (baseId, tableId, viewId, changes) => async (dispatch, getState) => {
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

export const deleteViewThunk = (baseId, tableId, viewId) => async (dispatch, getState) => {
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

// Record thunks
export const queryTableRecords =
  (tableId, queryParams = {}) =>
  async (dispatch, getState) => {
    try {
      // Find the base that contains this table
      const state = getState();
      const baseId = Object.keys(state.bases.bases).find((baseId) =>
        state.bases.bases[baseId].tables?.items?.some((t) => t.id === tableId),
      );
      if (!baseId) {
        throw new Error(`Could not find base containing table ${tableId}`);
      }

      // Find the table to get its name for Supabase-style endpoint
      const base = state.bases.bases[baseId];
      const table = base.tables?.items?.find((t) => t.id === tableId);
      const tableName = table?.db_name || table?.name;
      
      if (!tableName) {
        throw new Error(`Could not find table name for table ${tableId}`);
      }

      // Use Supabase-style endpoint: /admin/records/{baseId}/{tableName}
      // GET request with query parameters following Supabase pattern
      console.log(`🔄 Querying records from: https://database.altan.ai/admin/records/${baseId}/${tableName}`, queryParams);
      const response = await optimai_database.get(
        `/admin/records/${baseId}/${tableName}`,
        {
          params: queryParams,
        },
      );

      // Process response data following Supabase format
      const records = Array.isArray(response.data) ? response.data : response.data.records || [];
      const total = response.data.total || records.length;
      const next_page_token = response.data.next_page_token || null;

      dispatch(
        slice.actions.setTableRecords({
          tableId,
          records,
          total,
          next_page_token,
          isPagination: !!queryParams.page_token,
        }),
      );

      return response.data;
    } catch (e) {
      // Error occurred when querying table records via database API
      throw e;
    }
  };

export const getTableRecord = (tableId, recordId, customTableName = null) => async (dispatch, getState) => {
  dispatch(slice.actions.startLoading());
  try {
    const state = getState();
    
    // Find the base and table info
    let baseId, tableName;
    for (const [bId, base] of Object.entries(state.bases.bases)) {
      if (base.tables?.items) {
        const table = base.tables.items.find((t) => t.id === tableId);
        if (table) {
          baseId = bId;
          tableName = customTableName || table.name || table.db_name;
          break;
        }
      }
    }
    
    if (!baseId || !tableName) {
      throw new Error(`Could not find base or table name for table ${tableId}`);
    }
    
    if (customTableName && customTableName.startsWith('auth.')) {
      const response = await optimai_tables.post(`/table/${tableId}/record/query`, {
        id: recordId,
      });
      return Promise.resolve(response.data.record);
    }
    
    // Use Supabase-style endpoint for regular tables
    const response = await optimai_database.get(`/admin/records/${baseId}/${tableName}`, {
      params: { id: recordId }
    });
    
    const records = Array.isArray(response.data) ? response.data : response.data.records || [];
    const record = records.find(r => r.id === recordId) || records[0];
    
    return Promise.resolve(record);
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const createTableRecords = (tableId, recordData) => async (dispatch, getState) => {
  dispatch(slice.actions.startLoading());
  try {
    // Find the base that contains this table
    const state = getState();
    let baseId, tableName;
    for (const [bId, base] of Object.entries(state.bases.bases)) {
      if (base.tables?.items) {
        const table = base.tables.items.find((t) => t.id === tableId);
        if (table) {
          baseId = bId;
          tableName = table.db_name || table.name;
          break;
        }
      }
    }
    
    if (!baseId || !tableName) {
      throw new Error(`Could not find base or table name for table ${tableId}`);
    }

    if (tableName && tableName.startsWith('auth.')) {
      const response = await optimai_tables.post(`/table/${tableId}/record`, recordData);
      return Promise.resolve(response.data);
    }

    // Transform data for Supabase format
    let supabaseData;
    if (recordData.records && recordData.records.length > 0) {
      // Extract the fields from the Altan API format
      supabaseData = recordData.records[0].fields;
    } else {
      // If it's already in the correct format, use as is
      supabaseData = recordData;
    }

    // Use Supabase-style endpoint with proxy for creating records
    const response = await optimai_database.post(`/admin/records/${baseId}/${tableName}`, supabaseData);
    return Promise.resolve(response.data);
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const updateTableRecordThunk =
  (tableId, recordId, changes) => async (dispatch, getState) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await optimai_tables.patch(`/table/${tableId}/record/${recordId}`, {
        fields: changes,
      });
      return Promise.resolve(response.data.record);
    } catch (e) {
      dispatch(slice.actions.hasError(e.message));
      throw e;
    } finally {
      dispatch(slice.actions.stopLoading());
    }
  };

export const deleteTableRecordThunk = (tableId, recordIds) => async (dispatch, getState) => {
  dispatch(slice.actions.startLoading());
  try {
    // Find the base that contains this table to determine which API to use
    const state = getState();
    // Pass recordIds in the request body
    const ids = Array.isArray(recordIds) ? recordIds : [recordIds];
    await optimai_tables.delete(`/table/${tableId}/record`, {
      data: { ids },
    });

    // Update state for each deleted record
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

// Add this new thunk action
export const searchTableRecords = (tableId, query) => async (dispatch, getState) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await optimai_tables.get(`/table/${tableId}/record/search`, {
      params: { query },
    });

    // Merge search results with existing records
    dispatch(
      slice.actions.setTableRecords({
        tableId,
        records: response.data.records,
        total: response.data.records.length,
        next_page_token: null,
        isPagination: false, // Add this flag to indicate search results
      }),
    );

    return response.data;
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const loadAllTableRecords =
  (tableId, forceReload = false) =>
  async (dispatch, getState) => {
    const BATCH_SIZE = 3000;
    const DELAY_BETWEEN_BATCHES = 500;

    const state = getState();
    const recordsState = state.bases.recordsState[tableId];
    const records = state.bases.records[tableId];

    // If we already have fully loaded records for this table, don't reload them
    if (recordsState?.cached && records?.items?.length > 0 && !forceReload) {
      return Promise.resolve(records);
    }

    // If loading is already in progress, don't start another load
    if (recordsState?.loading) {
      return;
    }

    dispatch(slice.actions.setTableRecordsLoading({ tableId, loading: true }));

    try {
      // Find the base that contains this table
      const baseId = Object.keys(state.bases.bases).find((baseId) =>
        state.bases.bases[baseId].tables?.items?.some((t) => t.id === tableId),
      );
      if (!baseId) {
        throw new Error(`Could not find base containing table ${tableId}`);
      }

      // Find the table to get its name for Supabase-style endpoint
      const base = state.bases.bases[baseId];
      const table = base.tables?.items?.find((t) => t.id === tableId);
      const tableName = table?.db_name || table?.name;
      
      if (!tableName) {
        throw new Error(`Could not find table name for table ${tableId}`);
      }

      if (tableName && tableName.startsWith('auth.')) {
        const response = await optimai_tables.post(`/table/${tableId}/record/query`, {
          limit: BATCH_SIZE,
        });

        const responseRecords = Array.isArray(response.data.records) ? response.data.records : [];
        dispatch(
          slice.actions.setTableRecords({
            tableId,
            records: responseRecords,
            total: response.data.total || responseRecords.length,
            next_page_token: null,
            isPagination: false,
          }),
        );

        // Mark as cached since auth tables don't support pagination
        dispatch(
          slice.actions.setTableRecordsState({
            tableId,
            loading: false,
            lastFetched: Date.now(),
            cached: true,
          }),
        );

        return getState().bases.records[tableId];
      }

      // Resume from where we left off if we have a page token
      let pageToken = recordsState?.next_page_token;
      let hasMore = true;

      // Initial load if needed
      if (!pageToken && (!records || records.items.length === 0)) {
        const response = await optimai_database.get(`/admin/records/${baseId}/${tableName}`, {
          params: {
            limit: BATCH_SIZE,
          },
        });

        const responseRecords = Array.isArray(response.data) ? response.data : response.data.records || [];
        dispatch(
          slice.actions.setTableRecords({
            tableId,
            records: responseRecords,
            total: response.data.total || responseRecords.length,
            next_page_token: response.data.next_page_token,
            isPagination: false,
          }),
        );

        pageToken = response.data.next_page_token;
        hasMore = !!pageToken;
      }

      // Load remaining records if we have more
      while (hasMore) {
        const response = await optimai_database.get(`/admin/records/${baseId}/${tableName}`, {
          params: {
            limit: BATCH_SIZE,
            page_token: pageToken,
          },
        });

        const responseRecords = Array.isArray(response.data) ? response.data : response.data.records || [];
        dispatch(
          slice.actions.setTableRecords({
            tableId,
            records: responseRecords,
            total: response.data.total || responseRecords.length,
            next_page_token: response.data.next_page_token,
            isPagination: true,
          }),
        );

        pageToken = response.data.next_page_token;
        hasMore = !!pageToken;

        if (hasMore) {
          await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
        }
      }

      // Mark this table's records as fully cached when all are loaded
      if (!hasMore) {
        dispatch(
          slice.actions.setTableRecordsState({
            tableId,
            loading: false,
            lastFetched: Date.now(),
            cached: true,
          }),
        );
      }

      return getState().bases.records[tableId];
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      throw error;
    } finally {
      dispatch(slice.actions.setTableRecordsLoading({ tableId, loading: false }));
    }
  };

// Base selectors
export const selectBaseState = (state) => state.bases;
export const selectBases = (state) => selectBaseState(state).bases;

// Memoized complex selectors
export const selectBaseById = createSelector(
  [selectBases, (_, baseId) => baseId],
  (bases, baseId) => bases[baseId],
);

export const selectTablesByBaseId = createSelector(
  [selectBaseById],
  (base) => base?.tables?.items || [],
);

export const selectTableById = createSelector(
  [selectTablesByBaseId, (_, __, tableId) => tableId],
  (tables, tableId) => tables.find((table) => table.id === tableId),
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
    // Si no hay vistas, crear una vista por defecto
    if (!views || views.length === 0) {
      return {
        id: 'default',
        name: 'Default View',
        type: 'grid',
        is_default: true,
      };
    }

    // Buscar la vista por ID o usar la primera disponible
    return views.find((v) => v.id === viewId) || views[0];
  },
);

// Records selectors
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

export const createRecordPrimaryValueSelector = (baseId, tableId, recordId) =>
  createSelector(
    [
      (state) => selectTableRecords(state, tableId),
      (state) => selectFieldsByTableId(state, baseId, tableId),
    ],
    (records, fields) => {
      const record = records.find((r) => r.id === recordId);
      if (!record) return `Record ${recordId}`;

      // Try to find primary field first, fallback to first field
      const fieldToUse = fields.find((field) => field.is_primary) || fields[0];
      return record[fieldToUse?.db_field_name] || `Record ${recordId}`;
    },
  );

// Database navigation selectors
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
