import { createSlice, createSelector } from '@reduxjs/toolkit';

import { optimai_cloud } from '../../utils/axios';

// ============================================================================
// SQL HELPERS
// ============================================================================

const escapeSql = (value) => {
  if (value === null || value === undefined) return 'NULL';
  return String(value).replace(/'/g, "''");
};

const buildWhereClause = (filters) => {
  if (!filters || Object.keys(filters).length === 0) return '';

  const conditions = [];
  const sqlControlParams = ['limit', 'offset', 'order', 'select'];

  Object.entries(filters).forEach(([field, value]) => {
    if (sqlControlParams.includes(field)) return;

    if (typeof value === 'string' && value.startsWith('eq.')) {
      const val = value.substring(3);
      conditions.push(`${field} = '${escapeSql(val)}'`);
    } else {
      conditions.push(`${field} = '${escapeSql(String(value))}'`);
    }
  });

  return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
};

const buildOrderClause = (order) => {
  if (!order) return '';
  const parts = order.split(',').map((part) => {
    const [field, direction] = part.split('.');
    const dir = direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    return `${field} ${dir}`;
  });
  return `ORDER BY ${parts.join(', ')}`;
};

const executeSQL = async (cloudId, query) => {
  try {
    const response = await optimai_cloud.post(`/v1/pg-meta/${cloudId}/query`, { query });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  isLoading: false,
  error: null,
  clouds: {}, // { [cloudId]: { id, name, tables, ... } }
  tables: {}, // { [tableId]: { records, loading, pagination, ... } }
  userCache: {}, // { [cloudId]: { [userId]: user } }
};

// ============================================================================
// SLICE
// ============================================================================

const slice = createSlice({
  name: 'cloud',
  initialState,
  reducers: {
    // Loading states
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Cloud operations
    setCloud(state, action) {
      const cloud = action.payload;
      // API returns cloud_id, normalize to also have id for consistency
      const cloudId = cloud.cloud_id || cloud.id;
      state.clouds[cloudId] = { ...cloud, id: cloudId };
    },
    updateCloud(state, action) {
      const { id, ...changes } = action.payload;
      if (state.clouds[id]) {
        state.clouds[id] = { ...state.clouds[id], ...changes };
      }
    },
    removeCloud(state, action) {
      const cloudId = action.payload;
      delete state.clouds[cloudId];
      // Clean up related data
      delete state.userCache[cloudId];
    },

    // Table operations
    setTables(state, action) {
      const { cloudId, tables } = action.payload;
      if (state.clouds[cloudId]) {
        state.clouds[cloudId].tables = {
          items: tables.map((table) => ({
            id: table.id,
            name: table.name,
            schema: table.schema,
            rls_enabled: table.rls_enabled,
            fields: table.columns
              ? {
                  items: table.columns.map((col) => ({
                    id: col.id,
                    name: col.name,
                    data_type: col.data_type,
                    is_nullable: col.is_nullable,
                    is_unique: col.is_unique,
                    default_value: col.default_value,
                  })),
                }
              : { items: [] },
          })),
        };
      }
    },

    // Record operations
    setTableRecords(state, action) {
      const { tableId, records, total, isPagination } = action.payload;

      if (!state.tables[tableId] || !isPagination) {
        state.tables[tableId] = {
          records: records || [],
          total: total || 0,
          loading: false,
          currentPage: 0,
          pageSize: 50,
        };
      } else {
        // Append for pagination
        const existingIds = new Set(state.tables[tableId].records.map((r) => r.id));
        const newRecords = records.filter((r) => !existingIds.has(r.id));
        state.tables[tableId].records.push(...newRecords);
        state.tables[tableId].total = total || state.tables[tableId].total;
      }
    },
    setTableLoading(state, action) {
      const { tableId, loading } = action.payload;
      if (!state.tables[tableId]) {
        state.tables[tableId] = { records: [], total: 0, loading, currentPage: 0, pageSize: 50 };
      } else {
        state.tables[tableId].loading = loading;
      }
    },
    addRecord(state, action) {
      const { tableId, record } = action.payload;
      if (state.tables[tableId]) {
        state.tables[tableId].records.unshift(record);
        state.tables[tableId].total += 1;
      }
    },
    updateRecord(state, action) {
      const { tableId, recordId, changes } = action.payload;
      if (state.tables[tableId]) {
        const index = state.tables[tableId].records.findIndex((r) => r.id === recordId);
        if (index !== -1) {
          state.tables[tableId].records[index] = {
            ...state.tables[tableId].records[index],
            ...changes,
          };
        }
      }
    },
    removeRecord(state, action) {
      const { tableId, recordId } = action.payload;
      if (state.tables[tableId]) {
        state.tables[tableId].records = state.tables[tableId].records.filter(
          (r) => r.id !== recordId,
        );
        state.tables[tableId].total -= 1;
      }
    },

    // User cache
    setUsers(state, action) {
      const { cloudId, users } = action.payload;
      if (!state.userCache[cloudId]) {
        state.userCache[cloudId] = {};
      }
      users.forEach((user) => {
        if (user?.id) {
          state.userCache[cloudId][user.id] = user;
        }
      });
    },
  },
});

export default slice.reducer;

export const {
  setLoading,
  setError,
  setCloud,
  updateCloud,
  removeCloud,
  setTables,
  setTableRecords,
  setTableLoading,
  addRecord,
  updateRecord,
  removeRecord,
  setUsers,
} = slice.actions;

// ============================================================================
// THUNKS - Cloud Operations
// ============================================================================

export const fetchCloud = (cloudId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    // Fetch cloud metadata
    const response = await optimai_cloud.get(`/v1/instances/${cloudId}`);
    dispatch(setCloud(response.data));

    // Fetch tables
    const tablesResponse = await optimai_cloud.get(`/v1/pg-meta/${cloudId}/tables/`, {
      params: {
        include_columns: true,
        excluded_schemas: 'pg_catalog,information_schema',
        include_system_schemas: true,
      },
    });

    dispatch(setTables({ cloudId, tables: tablesResponse.data || [] }));

    return response.data;
  } catch (error) {
    dispatch(setError(error.message));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const createTable = (cloudId, tableData) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const tenantSchema = `tenant_${cloudId.replace(/-/g, '_')}`;
    const response = await optimai_cloud.post(`/v1/pg-meta/${cloudId}/tables/`, {
      ...tableData,
      schema: tenantSchema,
    });

    // Refresh tables
    await dispatch(fetchCloud(cloudId));

    return response.data;
  } catch (error) {
    dispatch(setError(error.message));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const deleteTable = (cloudId, tableId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await optimai_cloud.delete(`/v1/pg-meta/${cloudId}/tables/${tableId}`);

    // Refresh tables
    await dispatch(fetchCloud(cloudId));
  } catch (error) {
    dispatch(setError(error.message));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

// ============================================================================
// THUNKS - Record Operations
// ============================================================================

export const fetchRecords =
  (cloudId, tableId, options = {}) =>
  async (dispatch, getState) => {
    const { limit = 50, offset = 0, order, filters } = options;

    dispatch(setTableLoading({ tableId, loading: true }));

    try {
      const state = getState();
      const cloud = state.cloud.clouds[cloudId];
      const numericTableId = typeof tableId === 'string' ? parseInt(tableId, 10) : tableId;
      const table = cloud?.tables?.items?.find((t) => t.id === numericTableId);
      if (!table) {
        throw new Error(`Table ${tableId} not found in cloud ${cloudId}`);
      }

      const whereClause = buildWhereClause(filters);
      const orderClause = buildOrderClause(order || 'created_at.desc');

      const query = `
      SELECT * FROM ${table.name}
      ${whereClause}
      ${orderClause}
      LIMIT ${limit}
      ${offset > 0 ? `OFFSET ${offset}` : ''}
    `
        .trim()
        .replace(/\s+/g, ' ');

      const records = await executeSQL(cloudId, query);

      dispatch(
        setTableRecords({
          tableId,
          records,
          total: records.length,
          isPagination: offset > 0,
        }),
      );

      // Also update bases.js for GridView compatibility
      dispatch({
        type: 'bases/setTableRecords',
        payload: {
          tableId,
          records,
          total: records.length,
          isPagination: offset > 0,
        },
      });

      return records;
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setTableLoading({ tableId, loading: false }));
    }
  };

export const createRecord = (cloudId, tableId, data) => async (dispatch, getState) => {
  try {
    const state = getState();
    const cloud = state.cloud.clouds[cloudId];
    const numericTableId = typeof tableId === 'string' ? parseInt(tableId, 10) : tableId;
    const table = cloud?.tables?.items?.find((t) => t.id === numericTableId);

    if (!table) {
      throw new Error(`Table ${tableId} not found`);
    }

    const fields = Object.keys(data).filter((k) => data[k] !== undefined && data[k] !== '');
    const values = fields.map((f) => {
      const value = data[f];
      if (value === null) return 'NULL';
      if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
      if (typeof value === 'number') return value;
      if (typeof value === 'object') return `'${escapeSql(JSON.stringify(value))}'::jsonb`;
      return `'${escapeSql(value)}'`;
    });

    const query = `
      INSERT INTO ${table.name} (${fields.join(', ')})
      VALUES (${values.join(', ')})
      RETURNING *;
    `;

    const [record] = await executeSQL(cloudId, query);

    dispatch(addRecord({ tableId, record }));

    return record;
  } catch (error) {
    dispatch(setError(error.message));
    throw error;
  }
};

export const updateRecordById =
  (cloudId, tableId, recordId, changes) => async (dispatch, getState) => {
    try {
      const state = getState();
      const cloud = state.cloud.clouds[cloudId];
      const numericTableId = typeof tableId === 'string' ? parseInt(tableId, 10) : tableId;
      const table = cloud?.tables?.items?.find((t) => t.id === numericTableId);

      if (!table) {
        throw new Error(`Table ${tableId} not found`);
      }

      const setClauses = Object.entries(changes).map(([field, value]) => {
        if (value === null || value === undefined) return `${field} = NULL`;
        if (typeof value === 'boolean') return `${field} = ${value ? 'TRUE' : 'FALSE'}`;
        if (typeof value === 'number') return `${field} = ${value}`;
        if (typeof value === 'object')
          return `${field} = '${escapeSql(JSON.stringify(value))}'::jsonb`;
        return `${field} = '${escapeSql(value)}'`;
      });

      const query = `
      UPDATE ${table.name}
      SET ${setClauses.join(', ')}
      WHERE id = '${escapeSql(recordId)}'
      RETURNING *;
    `;

      const [record] = await executeSQL(cloudId, query);

      dispatch(updateRecord({ tableId, recordId, changes }));

      return record;
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    }
  };

export const deleteRecord = (cloudId, tableId, recordId) => async (dispatch, getState) => {
  try {
    const state = getState();
    const cloud = state.cloud.clouds[cloudId];
    const numericTableId = typeof tableId === 'string' ? parseInt(tableId, 10) : tableId;
    const table = cloud?.tables?.items?.find((t) => t.id === numericTableId);

    if (!table) {
      throw new Error(`Table ${tableId} not found`);
    }

    const query = `DELETE FROM ${table.name} WHERE id = '${escapeSql(recordId)}';`;

    await executeSQL(cloudId, query);

    dispatch(removeRecord({ tableId, recordId }));
  } catch (error) {
    dispatch(setError(error.message));
    throw error;
  }
};

// ============================================================================
// THUNKS - User Operations
// ============================================================================

export const fetchUsers = (cloudId) => async (dispatch) => {
  try {
    const query = 'SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 10000;';
    const users = await executeSQL(cloudId, query);

    dispatch(setUsers({ cloudId, users }));

    return users;
  } catch (error) {
    dispatch(setError(error.message));
    throw error;
  }
};

export const deleteUser = (cloudId, userId) => async (dispatch) => {
  try {
    const query = `DELETE FROM auth.users WHERE id = '${escapeSql(userId)}';`;
    await executeSQL(cloudId, query);

    // Refresh users
    await dispatch(fetchUsers(cloudId));
  } catch (error) {
    dispatch(setError(error.message));
    throw error;
  }
};

// ============================================================================
// SELECTORS
// ============================================================================

export const selectCloudState = (state) => state.cloud;

export const selectCloudById = createSelector(
  [(state) => state.cloud.clouds, (_, cloudId) => cloudId],
  (clouds, cloudId) => clouds[cloudId],
);

export const selectTablesByCloudId = createSelector([selectCloudById], (cloud) => {
  const tables = cloud?.tables?.items || [];
  // Only return tables in public schema
  return tables.filter((table) => table.schema === 'public');
});

export const selectTableById = createSelector(
  [selectTablesByCloudId, (_, __, tableId) => tableId],
  (tables, tableId) => {
    const numericTableId = typeof tableId === 'string' ? parseInt(tableId, 10) : tableId;
    return tables.find((t) => t.id === numericTableId);
  },
);

export const selectTableRecords = createSelector(
  [(state) => state.cloud.tables, (_, tableId) => tableId],
  (tables, tableId) => tables[tableId]?.records || [],
);

export const selectTableLoading = createSelector(
  [(state) => state.cloud.tables, (_, tableId) => tableId],
  (tables, tableId) => tables[tableId]?.loading || false,
);

export const selectTableState = createSelector(
  [(state) => state.cloud.tables, (_, tableId) => tableId],
  (tables, tableId) => tables[tableId] || { records: [], total: 0, loading: false },
);

export const selectUsersForCloud = createSelector(
  [(state) => state.cloud.userCache, (_, cloudId) => cloudId],
  (userCache, cloudId) => Object.values(userCache[cloudId] || {}),
);

export const selectUserById = createSelector(
  [(state) => state.cloud.userCache, (_, cloudId, userId) => ({ cloudId, userId })],
  (userCache, { cloudId, userId }) => userCache[cloudId]?.[userId],
);
