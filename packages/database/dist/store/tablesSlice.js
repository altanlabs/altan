"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectSchemaLoading = exports.selectTableSchema = exports.selectIsLoading = exports.selectTableTotal = exports.selectTableRecords = exports.selectTableId = exports.selectTablesState = exports.clearTableData = exports.initializeTables = exports.selectTableData = exports.deleteRecords = exports.createRecords = exports.fetchTableSchema = exports.deleteRecord = exports.updateRecord = exports.createRecord = exports.fetchTableRecords = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const initialState = {
    tables: { byId: {}, byName: {}, allIds: [] },
    schemas: { byTableId: {} },
    records: { byTableId: {} },
    loading: { tables: "idle", records: "idle", schemas: "idle" },
    error: null,
    initialized: {}
};
const getTableId = (state, tableName) => {
    const tableId = state.tables.tables.byName[tableName];
    if (!tableId)
        throw new Error(`Table ${tableName} not found`);
    return tableId;
};
exports.fetchTableRecords = (0, toolkit_1.createAsyncThunk)("tables/fetchRecords", async ({ tableName, queryParams = {} }, thunkAPI) => {
    const maxRetries = 3;
    let lastError;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const tableId = getTableId(thunkAPI.getState(), tableName);
            const { api } = thunkAPI.extra;
            const response = await api.post(`/table/${tableId}/record/query`, {
                filters: queryParams.filters || [],
                sort: queryParams.sort || [],
                limit: queryParams.limit || 100,
                page_token: queryParams.pageToken,
                fields: queryParams.fields,
                amount: queryParams.amount || "all"
            });
            return {
                tableId,
                records: response.data.records,
                total: response.data.total,
                nextPageToken: response.data.next_page_token
            };
        }
        catch (error) {
            lastError = error;
            if (attempt < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
                continue;
            }
        }
    }
    return thunkAPI.rejectWithValue(lastError instanceof Error ? lastError.message : 'Failed to fetch records');
});
exports.createRecord = (0, toolkit_1.createAsyncThunk)("tables/createRecord", async ({ tableName, record }, thunkAPI) => {
    try {
        const tableId = getTableId(thunkAPI.getState(), tableName);
        const { api } = thunkAPI.extra;
        const response = await api.post(`/table/${tableId}/record`, {
            records: [{ fields: record }]
        });
        return { tableId, record: response.data.records[0] };
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error instanceof Error ? error.message : 'Failed to create record');
    }
});
exports.updateRecord = (0, toolkit_1.createAsyncThunk)("tables/updateRecord", async ({ tableName, recordId, updates }, thunkAPI) => {
    const state = thunkAPI.getState();
    const tableId = getTableId(state, tableName);
    const { api } = thunkAPI.extra;
    const response = await api.patch(`/table/${tableId}/record/${recordId}`, {
        fields: updates
    });
    return { tableId, record: response.data.record };
});
exports.deleteRecord = (0, toolkit_1.createAsyncThunk)("tables/deleteRecord", async ({ tableName, recordId }, thunkAPI) => {
    const state = thunkAPI.getState();
    const tableId = state.tables.tables.byName[tableName];
    if (!tableId)
        throw new Error(`Table ${tableName} not found`);
    const { api } = thunkAPI.extra;
    await api.delete(`/table/${tableId}/record/${recordId}`);
    return { tableId, recordId };
});
exports.fetchTableSchema = (0, toolkit_1.createAsyncThunk)("tables/fetchSchema", async ({ tableName }, thunkAPI) => {
    const state = thunkAPI.getState();
    const tableId = state.tables.tables.byName[tableName];
    if (!tableId)
        throw new Error(`Table ${tableName} not found`);
    const { api } = thunkAPI.extra;
    const response = await api.get(`/table/${tableId}`);
    return { tableId, schema: response.data.table };
});
exports.createRecords = (0, toolkit_1.createAsyncThunk)("tables/createRecords", async ({ tableName, records }, thunkAPI) => {
    try {
        const tableId = getTableId(thunkAPI.getState(), tableName);
        const { api } = thunkAPI.extra;
        const response = await api.post(`/table/${tableId}/record`, {
            records: records.map(record => ({ fields: record }))
        });
        return { tableId, records: response.data.records };
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error instanceof Error ? error.message : 'Failed to create records');
    }
});
exports.deleteRecords = (0, toolkit_1.createAsyncThunk)("tables/deleteRecords", async ({ tableName, recordIds }, thunkAPI) => {
    const state = thunkAPI.getState();
    const tableId = state.tables.tables.byName[tableName];
    if (!tableId)
        throw new Error(`Table ${tableName} not found`);
    const { api } = thunkAPI.extra;
    await api.delete(`/table/${tableId}/record`, {
        data: { records: recordIds }
    });
    return { tableId, recordIds };
});
const tablesSlice = (0, toolkit_1.createSlice)({
    name: "tables",
    initialState,
    reducers: {
        initializeTables: (state, action) => {
            const { SAMPLE_TABLES } = action.payload;
            Object.entries(SAMPLE_TABLES).forEach(([name, id]) => {
                state.tables.byId[id] = { id, name };
                state.tables.byName[name] = id;
                if (!state.tables.allIds.includes(id))
                    state.tables.allIds.push(id);
                state.initialized[id] = false;
            });
        },
        clearTableData: (state, action) => {
            const tableId = state.tables.byName[action.payload];
            if (tableId) {
                delete state.records.byTableId[tableId];
                state.initialized[tableId] = false;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(exports.fetchTableRecords.pending, (state) => {
            state.loading.records = "loading";
            state.error = null;
        })
            .addCase(exports.fetchTableRecords.fulfilled, (state, action) => {
            const { tableId, records, total, nextPageToken } = action.payload;
            state.records.byTableId[tableId] = {
                items: records,
                total,
                lastUpdated: new Date().toISOString(),
                nextPageToken
            };
            state.loading.records = "idle";
            state.initialized[tableId] = true;
            state.error = null;
        })
            .addCase(exports.fetchTableRecords.rejected, (state, action) => {
            state.loading.records = "error";
            state.error = action.payload || 'An unknown error occurred';
        })
            .addCase(exports.createRecord.fulfilled, (state, action) => {
            var _a;
            const { tableId, record } = action.payload;
            if ((_a = state.records.byTableId[tableId]) === null || _a === void 0 ? void 0 : _a.items) {
                state.records.byTableId[tableId].items.push(record);
            }
        })
            .addCase(exports.updateRecord.fulfilled, (state, action) => {
            var _a;
            const { tableId, record } = action.payload;
            const items = (_a = state.records.byTableId[tableId]) === null || _a === void 0 ? void 0 : _a.items;
            if (items) {
                const index = items.findIndex((r) => r.id === record.id);
                if (index !== -1)
                    items[index] = record;
            }
        })
            .addCase(exports.deleteRecord.fulfilled, (state, action) => {
            var _a;
            const { tableId, recordId } = action.payload;
            const items = (_a = state.records.byTableId[tableId]) === null || _a === void 0 ? void 0 : _a.items;
            if (items) {
                state.records.byTableId[tableId].items = items.filter((r) => r.id !== recordId);
            }
        })
            .addCase(exports.fetchTableSchema.pending, (state) => {
            state.loading.schemas = "loading";
        })
            .addCase(exports.fetchTableSchema.fulfilled, (state, action) => {
            const { tableId, schema } = action.payload;
            state.schemas.byTableId[tableId] = schema;
            state.loading.schemas = "idle";
        })
            .addCase(exports.fetchTableSchema.rejected, (state, action) => {
            state.loading.schemas = "idle";
            state.error = action.error.message || null;
        })
            .addCase(exports.createRecords.fulfilled, (state, action) => {
            var _a;
            const { tableId, records } = action.payload;
            if ((_a = state.records.byTableId[tableId]) === null || _a === void 0 ? void 0 : _a.items) {
                state.records.byTableId[tableId].items.push(...records);
            }
        })
            .addCase(exports.deleteRecords.fulfilled, (state, action) => {
            var _a;
            const { tableId, recordIds } = action.payload;
            const items = (_a = state.records.byTableId[tableId]) === null || _a === void 0 ? void 0 : _a.items;
            if (items) {
                state.records.byTableId[tableId].items = items.filter((r) => !recordIds.includes(r.id));
            }
        });
    }
});
const selectTableData = (state, tableName) => {
    const tableId = state.tables.tables.byName[tableName];
    if (!tableId)
        return null;
    const recordData = state.tables.records.byTableId[tableId];
    return {
        records: (recordData === null || recordData === void 0 ? void 0 : recordData.items) || [],
        total: (recordData === null || recordData === void 0 ? void 0 : recordData.total) || 0,
        schema: state.tables.schemas.byTableId[tableId],
        initialized: state.tables.initialized[tableId],
        nextPageToken: recordData === null || recordData === void 0 ? void 0 : recordData.nextPageToken,
        lastUpdated: recordData === null || recordData === void 0 ? void 0 : recordData.lastUpdated
    };
};
exports.selectTableData = selectTableData;
_a = tablesSlice.actions, exports.initializeTables = _a.initializeTables, exports.clearTableData = _a.clearTableData;
const selectTablesState = (state) => state.tables;
exports.selectTablesState = selectTablesState;
const selectTableId = (state, tableName) => state.tables.tables.byName[tableName];
exports.selectTableId = selectTableId;
const selectTableRecords = (state, tableName) => {
    var _a;
    const tableId = state.tables.tables.byName[tableName];
    return tableId ? ((_a = state.tables.records.byTableId[tableId]) === null || _a === void 0 ? void 0 : _a.items) || [] : [];
};
exports.selectTableRecords = selectTableRecords;
const selectTableTotal = (state, tableName) => {
    var _a;
    const tableId = state.tables.tables.byName[tableName];
    return tableId ? ((_a = state.tables.records.byTableId[tableId]) === null || _a === void 0 ? void 0 : _a.total) || 0 : 0;
};
exports.selectTableTotal = selectTableTotal;
const selectIsLoading = (state) => state.tables.loading.records === "loading";
exports.selectIsLoading = selectIsLoading;
const selectTableSchema = (state, tableName) => {
    const tableId = state.tables.tables.byName[tableName];
    return tableId ? state.tables.schemas.byTableId[tableId] : null;
};
exports.selectTableSchema = selectTableSchema;
const selectSchemaLoading = (state) => state.tables.loading.schemas === "loading";
exports.selectSchemaLoading = selectSchemaLoading;
exports.default = tablesSlice.reducer;
//# sourceMappingURL=tablesSlice.js.map