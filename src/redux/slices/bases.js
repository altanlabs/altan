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
    isSearching: false,
    searchResults: {},
  },
  // User cache for auth.users table to avoid redundant API calls
  userCache: {},
  userCacheState: {
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
            const matchingTable = base.tables.items.find(
              (table) => table.name === tableName || table.db_name === tableName,
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
              availableTableRecords[foundRecordIndex] = {
                ...availableTableRecords[foundRecordIndex],
                ...changes,
              };
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

      // Check if record already exists to prevent duplicates
      const existingIndex = state.records[targetTableId].items.findIndex(
        (existingRecord) => existingRecord.id === record.id,
      );

      if (existingIndex !== -1) {
        // Update existing record instead of adding duplicate
        state.records[targetTableId].items[existingIndex] = record;
      } else {
        // Add new record
        state.records[targetTableId].items.push(record);
        state.records[targetTableId].total += 1;
      }
    },
    deleteTableRecord(state, action) {
      const { tableId, tableName, recordId } = action.payload;
      let targetTableId = tableId;

      // If tableId doesn't exist in records but we have a tableName, try to find by name
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
      const { tableId, ...updates } = action.payload;
      if (!state.recordsState[tableId]) {
        state.recordsState[tableId] = {};
      }
      // Merge with existing state instead of overwriting
      Object.assign(state.recordsState[tableId], updates);
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
    clearDatabaseNavigation(state) {
      state.databaseNavigation = {
        quickFilter: '',
        currentViewType: 'grid',
        isRefreshing: false,
        recordCount: 0,
        isSearching: false,
        searchResults: {},
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

      // Store users by ID for quick lookup
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
  setDatabaseSearching,
  setDatabaseSearchResults,
  clearDatabaseSearchResults,
  clearDatabaseNavigation,
  // User cache actions
  setUserCacheLoading,
  setUserCache,
  setUserCacheError,
  clearUserCache,
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

// Thunk actions for tables
export const createTable = (baseId, tableData) => async (dispatch) => {
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

export const updateTableById = (baseId, tableId, changes) => async (dispatch) => {
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

export const deleteTableById = (baseId, tableId) => async (dispatch) => {
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
export const createField = (table, fieldData) => async (dispatch) => {
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

export const updateFieldThunk = (tableId, fieldId, changes) => async (dispatch) => {
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

export const deleteFieldThunk = (tableId, fieldId) => async (dispatch) => {
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
      const response = await optimai_database.get(`/admin/records/${baseId}/${tableName}`, {
        params: queryParams,
      });

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

export const getTableRecord =
  (tableId, recordId, customTableName = null) =>
  async (dispatch, getState) => {
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

      // Use admin proxy for all tables (including auth tables)
      const response = await optimai_database.get(`/admin/records/${baseId}/${tableName}`, {
        params: { id: `eq.${recordId}` }, // PostgREST format for exact match
      });

      const records = Array.isArray(response.data) ? response.data : response.data.records || [];
      const record = records.find((r) => r.id === recordId) || records[0];

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

    // Transform data for PostgREST format
    let postgreSQLData;
    if (recordData.records && recordData.records.length > 0) {
      // Extract the fields from the Altan API format
      postgreSQLData = recordData.records[0].fields;
    } else {
      // If it's already in the correct format, use as is
      postgreSQLData = recordData;
    }

    // Use admin proxy for all tables (including auth tables)
    const response = await optimai_database.post(
      `/admin/records/${baseId}/${tableName}`,
      postgreSQLData,
    );
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

      // Use admin proxy for all tables (including auth tables)
      const response = await optimai_database.patch(
        `/admin/records/${baseId}/${tableName}?id=eq.${recordId}`,
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

export const deleteTableRecordThunk = (tableId, recordIds) => async (dispatch, getState) => {
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

    // Pass recordIds in the request body
    const ids = Array.isArray(recordIds) ? recordIds : [recordIds];

    // Use admin proxy for all tables (including auth tables)
    const BATCH_SIZE = 50; // Reasonable batch size to avoid URL length issues
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      const batchIds = ids.slice(i, i + BATCH_SIZE);
      const idFilter =
        batchIds.length === 1 ? `id=eq.${batchIds[0]}` : `id=in.(${batchIds.join(',')})`;
      await optimai_database.delete(`/admin/records/${baseId}/${tableName}?${idFilter}`);
    }

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

// Thunk action to preload users for a base
export const preloadUsersForBase = (baseId) => async (dispatch, getState) => {
  const state = getState();
  const userCacheState = state.bases.userCacheState;
  const existingUsers = state.bases.userCache[baseId];

  // Don't fetch if we already have users cached and it's not too old (1 hour)
  const ONE_HOUR = 60 * 60 * 1000;
  if (
    existingUsers &&
    Object.keys(existingUsers).length > 0 &&
    userCacheState.lastFetched &&
    Date.now() - userCacheState.lastFetched < ONE_HOUR
  ) {
    return Promise.resolve(existingUsers);
  }

  // Don't fetch if already loading
  if (userCacheState.loading) {
    return Promise.resolve({});
  }

  dispatch(setUserCacheLoading(true));

  try {
    // Find auth.users table in this base
    const base = state.bases.bases[baseId];
    if (!base || !base.tables || !base.tables.items) {
      throw new Error(`Base ${baseId} not found or has no tables`);
    }
    // Look for user table with various possible names
    const authUsersTable = base.tables.items.find(
      (table) =>
        table.db_name === 'auth.users' ||
        table.name === 'auth.users' ||
        table.db_name === 'users' ||
        table.name === 'users' ||
        table.db_name === 'auth_users' ||
        table.name === 'auth_users' ||
        table.name?.toLowerCase().includes('user'),
    );

    if (!authUsersTable) {
      // If no user table, just mark as complete
      dispatch(setUserCache({ users: [], baseId }));
      return Promise.resolve({});
    }

    // Fetch all users from auth.users table using admin proxy
    const response = await optimai_database.get(
      `/admin/records/${baseId}/${authUsersTable.db_name || authUsersTable.name}`,
      {
        params: { limit: 1000 }, // Should be enough for most use cases
      },
    );

    const users = Array.isArray(response.data) ? response.data : response.data.records || [];

    dispatch(setUserCache({ users, baseId }));

    return Promise.resolve(state.bases.userCache[baseId] || {});
  } catch (error) {
    dispatch(setUserCacheError(error.message));
    throw error;
  }
};

// CSV Import thunk
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

// Load initial records with pagination support
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

    // If we already have records and not forcing reload or searching, return existing
    if (!forceReload && !searchQuery && !filters && records?.items?.length > 0 && !append) {
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

      // Handle auth tables the same way as regular tables using admin proxy
      // No special case needed anymore

      // Build query parameters for regular tables
      const queryParams = {
        limit,
        offset,
      };

      // Add search functionality using PostgREST text search
      if (searchQuery && searchQuery.trim()) {
        // eslint-disable-next-line no-console
        console.log('🔍 Building search query for:', searchQuery.trim());
        
        // Get all text-based fields for full-text search
        const textFields = table.fields?.items?.filter((field) =>
          ['text', 'long_text', 'email', 'url', 'phone', 'single_line_text'].includes(field.type),
        );

        // eslint-disable-next-line no-console
        console.log('📝 Text fields for search:', textFields?.map(f => f.db_field_name));

        if (textFields && textFields.length > 0) {
          // Create OR conditions for text search across multiple fields
          const searchConditions = textFields
            .map((field) => `${field.db_field_name}.ilike.*${searchQuery.trim()}*`)
            .join(',');
          queryParams.or = `(${searchConditions})`;
          
          // eslint-disable-next-line no-console
          console.log('🔍 Search query params:', queryParams);
        } else {
          // eslint-disable-next-line no-console
          console.log('⚠️ No text fields found for search');
        }
      }

      // Add custom filters if provided
      if (filters) {
        Object.assign(queryParams, filters);
      }

      // Use existing total count, we'll get it from the actual data response
      let totalCount = records?.total || recordsState?.totalRecords || 0;

      // Fetch the actual records
      const response = await optimai_database.get(`/admin/records/${baseId}/${tableName}`, {
        params: queryParams,
      });

      const responseRecords = Array.isArray(response.data)
        ? response.data
        : response.data.records || [];

      // If we don't have a count yet, get it using select=count(*)
      if (!totalCount || totalCount === 0) {
        try {
          const countResponse = await optimai_database.head(`/admin/records/${baseId}/${tableName}`, {
            headers: {
              Prefer: 'count=exact',
            },
          });

          // PostgREST returns count in Content-Range header: "0-49/12345"
          const contentRange = countResponse.headers['content-range'] || countResponse.headers['Content-Range'];
          if (contentRange) {
            const match = contentRange.match(/\/(\d+)$/);
            if (match) {
              totalCount = parseInt(match[1], 10);
              // eslint-disable-next-line no-console
              console.log('✅ Got count using HEAD request:', totalCount);
            }
          }
        } catch (countError) {
          // eslint-disable-next-line no-console
          console.log('Count query failed, estimating from data:', countError);

          // Fallback: estimate from the data we got
          if (responseRecords.length < limit) {
            totalCount = responseRecords.length;
          } else {
            totalCount = Math.max(responseRecords.length * 20, 1000);
          }
          // eslint-disable-next-line no-console
          console.log('📊 Using estimated count:', totalCount);
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
          cached: false, // Never cache paginated or searched results
          searchQuery,
          currentPage: page,
          pageSize: limit,
          totalPages: Math.ceil(Math.max(totalCount, 1) / limit),
          totalRecords: totalCount,
        }),
      );

      return getState().bases.records[tableId];
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      throw error;
    } finally {
      dispatch(slice.actions.setTableRecordsLoading({ tableId, loading: false }));
    }
  };

// Get total record count for a table using PostgREST select=count(*)
export const getTableRecordCount = (tableId) => async (dispatch, getState) => {
  try {
    const state = getState();

    // Find the base that contains this table
    const baseId = Object.keys(state.bases.bases).find((baseId) =>
      state.bases.bases[baseId].tables?.items?.some((t) => t.id === tableId),
    );
    if (!baseId) {
      throw new Error(`Could not find base containing table ${tableId}`);
    }

    // Find the table to get its name
    const base = state.bases.bases[baseId];
    const table = base.tables?.items?.find((t) => t.id === tableId);
    const tableName = table?.db_name || table?.name;

    if (!tableName) {
      throw new Error(`Could not find table name for table ${tableId}`);
    }

    // Use PostgREST HEAD request with Prefer: count=exact (most optimal)
    const response = await optimai_database.head(`/admin/records/${baseId}/${tableName}`, {
      headers: {
        Prefer: 'count=exact',
      },
    });

    // PostgREST returns count in Content-Range header: "0-49/12345"
    const contentRange = response.headers['content-range'] || response.headers['Content-Range'];
    // eslint-disable-next-line no-console
    console.log('🔍 Count function - Content-Range header:', contentRange);

    if (contentRange) {
      const match = contentRange.match(/\/(\d+)$/);
      if (match) {
        const count = parseInt(match[1], 10);
        // eslint-disable-next-line no-console
        console.log('✅ Count function extracted count:', count);
        return count;
      }
    }

    return 0;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to get table record count:', error);
    return 0;
  }
};

// Legacy function for backward compatibility - now just calls loadTableRecords
export const loadAllTableRecords = (tableId, forceReload = false) =>
  loadTableRecords(tableId, { limit: 50, forceReload });

// Database-level search using the admin proxy
export const searchTableRecords = (tableId, query) => async (dispatch) => {
  // eslint-disable-next-line no-console
  console.log('🔍 searchTableRecords called with query:', query);
  
  if (!query || !query.trim()) {
    // eslint-disable-next-line no-console
    console.log('🧹 Clearing search - empty query');
    // If query is empty, clear search results and load regular records
    dispatch(clearDatabaseSearchResults({ tableId }));
    dispatch(loadTableRecords(tableId, { forceReload: true }));
    return;
  }

  // eslint-disable-next-line no-console
  console.log('🔍 Starting search for:', query.trim());
  dispatch(setDatabaseSearching(true));

  try {
    // Use the new loadTableRecords with search functionality
    const result = await dispatch(
      loadTableRecords(tableId, {
        searchQuery: query.trim(),
        forceReload: true,
        limit: 100, // Higher limit for search results
      }),
    );

    // Store search results separately for UI indication
    dispatch(
      setDatabaseSearchResults({
        tableId,
        results: result.items || [],
        query: query.trim(),
      }),
    );

    return result;
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(setDatabaseSearching(false));
  }
};

// Load specific page of records
export const loadTablePage = (tableId, page) => async (dispatch, getState) => {
  // eslint-disable-next-line no-console
  console.log('📄 loadTablePage called for table:', tableId, 'page:', page);
  
  const state = getState();
  const recordsState = state.bases.recordsState[tableId];

  // eslint-disable-next-line no-console
  console.log('📊 Current recordsState:', recordsState);

  if (!recordsState || recordsState.loading) {
    // eslint-disable-next-line no-console
    console.log('⚠️ Cannot load page - no recordsState or already loading');
    return;
  }

  const pageSize = recordsState.pageSize || 50;
  const searchQuery = recordsState.searchQuery;

  // eslint-disable-next-line no-console
  console.log('📄 Loading page with params:', { page, pageSize, searchQuery });

  try {
    await dispatch(
      loadTableRecords(tableId, {
        page,
        limit: pageSize,
        searchQuery, // Maintain search context
        forceReload: true, // Always reload when changing pages
      }),
    );
    // eslint-disable-next-line no-console
    console.log('✅ Successfully loaded page:', page);
  } catch (loadError) {
    // eslint-disable-next-line no-console
    console.error('Failed to load table page:', loadError);
    throw loadError;
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

export const selectTablePaginationInfo = createSelector(
  [selectTableRecordsState],
  (recordsState) => {
    if (!recordsState) return null;

    return {
      currentPage: recordsState.currentPage || 0,
      totalPages: recordsState.totalPages || 1,
      pageSize: recordsState.pageSize || 50,
      totalRecords: recordsState.totalRecords || 0,
      isLastPageFound: true, // We always know the total with database count
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

export const selectDatabaseSearching = createSelector(
  [selectDatabaseNavigation],
  (navigation) => navigation.isSearching,
);

export const selectDatabaseSearchResults = createSelector(
  [selectDatabaseNavigation, (_, tableId) => tableId],
  (navigation, tableId) => navigation.searchResults[tableId] || null,
);

// User cache selectors
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

export const createUserDisplayValueSelector = (baseId, userId) =>
  createSelector([(state) => selectUserCacheForBase(state, baseId)], (users) => {
    const user = users[userId];
    if (!user) {
      return userId; // Fallback to ID if user not found
    }

    // Try different possible field names for display value
    // Common field names in auth systems: email, username, name, first_name, last_name, display_name, etc.
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
      // Try concatenating first and last name
      (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : null) ||
      (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null) ||
      userId;

    return displayValue;
  });
