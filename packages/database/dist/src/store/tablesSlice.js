"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectSchemaLoading = exports.selectTableSchema = exports.selectIsLoading = exports.selectTableTotal = exports.selectTableRecords = exports.selectTableId = exports.selectTablesState = exports.clearTableData = exports.initializeTables = exports.selectTableData = exports.deleteRecords = exports.createRecords = exports.fetchTableSchema = exports.deleteRecord = exports.updateRecord = exports.createRecord = exports.fetchTableRecords = void 0;
var toolkit_1 = require("@reduxjs/toolkit");
var initialState = {
    tables: { byId: {}, byName: {}, allIds: [] },
    schemas: { byTableId: {} },
    records: { byTableId: {} },
    loading: { tables: "idle", records: "idle", schemas: "idle" },
    error: null,
    initialized: {}
};
var getTableId = function (state, tableName) {
    var tableId = state.tables.tables.byName[tableName];
    if (!tableId)
        throw new Error("Table ".concat(tableName, " not found"));
    return tableId;
};
exports.fetchTableRecords = (0, toolkit_1.createAsyncThunk)("tables/fetchRecords", function (_a, thunkAPI_1) { return __awaiter(void 0, [_a, thunkAPI_1], void 0, function (_b, thunkAPI) {
    var maxRetries, lastError, _loop_1, attempt, state_1;
    var tableName = _b.tableName, _c = _b.queryParams, queryParams = _c === void 0 ? {} : _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                maxRetries = 3;
                _loop_1 = function (attempt) {
                    var tableId, api, response, error_1;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0:
                                _e.trys.push([0, 2, , 5]);
                                tableId = getTableId(thunkAPI.getState(), tableName);
                                api = thunkAPI.extra.api;
                                return [4 /*yield*/, api.post("/table/".concat(tableId, "/record/query"), {
                                        filters: queryParams.filters || [],
                                        sort: queryParams.sort || [],
                                        limit: queryParams.limit || 100,
                                        page_token: queryParams.pageToken,
                                        fields: queryParams.fields,
                                        amount: queryParams.amount || "all"
                                    })];
                            case 1:
                                response = _e.sent();
                                return [2 /*return*/, { value: {
                                            tableId: tableId,
                                            records: response.data.records,
                                            total: response.data.total,
                                            nextPageToken: response.data.next_page_token
                                        } }];
                            case 2:
                                error_1 = _e.sent();
                                lastError = error_1;
                                if (!(attempt < maxRetries - 1)) return [3 /*break*/, 4];
                                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000 * Math.pow(2, attempt)); })];
                            case 3:
                                _e.sent();
                                return [2 /*return*/, "continue"];
                            case 4: return [3 /*break*/, 5];
                            case 5: return [2 /*return*/];
                        }
                    });
                };
                attempt = 0;
                _d.label = 1;
            case 1:
                if (!(attempt < maxRetries)) return [3 /*break*/, 4];
                return [5 /*yield**/, _loop_1(attempt)];
            case 2:
                state_1 = _d.sent();
                if (typeof state_1 === "object")
                    return [2 /*return*/, state_1.value];
                _d.label = 3;
            case 3:
                attempt++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/, thunkAPI.rejectWithValue(lastError instanceof Error ? lastError.message : 'Failed to fetch records')];
        }
    });
}); });
exports.createRecord = (0, toolkit_1.createAsyncThunk)("tables/createRecord", function (_a, thunkAPI_1) { return __awaiter(void 0, [_a, thunkAPI_1], void 0, function (_b, thunkAPI) {
    var tableId, api, response, error_2;
    var tableName = _b.tableName, record = _b.record;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                tableId = getTableId(thunkAPI.getState(), tableName);
                api = thunkAPI.extra.api;
                return [4 /*yield*/, api.post("/table/".concat(tableId, "/record"), {
                        records: [{ fields: record }]
                    })];
            case 1:
                response = _c.sent();
                return [2 /*return*/, { tableId: tableId, record: response.data.records[0] }];
            case 2:
                error_2 = _c.sent();
                return [2 /*return*/, thunkAPI.rejectWithValue(error_2 instanceof Error ? error_2.message : 'Failed to create record')];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.updateRecord = (0, toolkit_1.createAsyncThunk)("tables/updateRecord", function (_a, thunkAPI_1) { return __awaiter(void 0, [_a, thunkAPI_1], void 0, function (_b, thunkAPI) {
    var state, tableId, api, response;
    var tableName = _b.tableName, recordId = _b.recordId, updates = _b.updates;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                state = thunkAPI.getState();
                tableId = getTableId(state, tableName);
                api = thunkAPI.extra.api;
                return [4 /*yield*/, api.patch("/table/".concat(tableId, "/record/").concat(recordId), {
                        fields: updates
                    })];
            case 1:
                response = _c.sent();
                return [2 /*return*/, { tableId: tableId, record: response.data.record }];
        }
    });
}); });
exports.deleteRecord = (0, toolkit_1.createAsyncThunk)("tables/deleteRecord", function (_a, thunkAPI_1) { return __awaiter(void 0, [_a, thunkAPI_1], void 0, function (_b, thunkAPI) {
    var state, tableId, api;
    var tableName = _b.tableName, recordId = _b.recordId;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                state = thunkAPI.getState();
                tableId = state.tables.tables.byName[tableName];
                if (!tableId)
                    throw new Error("Table ".concat(tableName, " not found"));
                api = thunkAPI.extra.api;
                return [4 /*yield*/, api.delete("/table/".concat(tableId, "/record/").concat(recordId))];
            case 1:
                _c.sent();
                return [2 /*return*/, { tableId: tableId, recordId: recordId }];
        }
    });
}); });
exports.fetchTableSchema = (0, toolkit_1.createAsyncThunk)("tables/fetchSchema", function (_a, thunkAPI_1) { return __awaiter(void 0, [_a, thunkAPI_1], void 0, function (_b, thunkAPI) {
    var state, tableId, api, response;
    var tableName = _b.tableName;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                state = thunkAPI.getState();
                tableId = state.tables.tables.byName[tableName];
                if (!tableId)
                    throw new Error("Table ".concat(tableName, " not found"));
                api = thunkAPI.extra.api;
                return [4 /*yield*/, api.get("/table/".concat(tableId))];
            case 1:
                response = _c.sent();
                return [2 /*return*/, { tableId: tableId, schema: response.data.table }];
        }
    });
}); });
exports.createRecords = (0, toolkit_1.createAsyncThunk)("tables/createRecords", function (_a, thunkAPI_1) { return __awaiter(void 0, [_a, thunkAPI_1], void 0, function (_b, thunkAPI) {
    var tableId, api, response, error_3;
    var tableName = _b.tableName, records = _b.records;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                tableId = getTableId(thunkAPI.getState(), tableName);
                api = thunkAPI.extra.api;
                return [4 /*yield*/, api.post("/table/".concat(tableId, "/record"), {
                        records: records.map(function (record) { return ({ fields: record }); })
                    })];
            case 1:
                response = _c.sent();
                return [2 /*return*/, { tableId: tableId, records: response.data.records }];
            case 2:
                error_3 = _c.sent();
                return [2 /*return*/, thunkAPI.rejectWithValue(error_3 instanceof Error ? error_3.message : 'Failed to create records')];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.deleteRecords = (0, toolkit_1.createAsyncThunk)("tables/deleteRecords", function (_a, thunkAPI_1) { return __awaiter(void 0, [_a, thunkAPI_1], void 0, function (_b, thunkAPI) {
    var state, tableId, api;
    var tableName = _b.tableName, recordIds = _b.recordIds;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                state = thunkAPI.getState();
                tableId = state.tables.tables.byName[tableName];
                if (!tableId)
                    throw new Error("Table ".concat(tableName, " not found"));
                api = thunkAPI.extra.api;
                return [4 /*yield*/, api.delete("/table/".concat(tableId, "/record"), {
                        data: { records: recordIds }
                    })];
            case 1:
                _c.sent();
                return [2 /*return*/, { tableId: tableId, recordIds: recordIds }];
        }
    });
}); });
var tablesSlice = (0, toolkit_1.createSlice)({
    name: "tables",
    initialState: initialState,
    reducers: {
        initializeTables: function (state, action) {
            var SAMPLE_TABLES = action.payload.SAMPLE_TABLES;
            Object.entries(SAMPLE_TABLES).forEach(function (_a) {
                var name = _a[0], id = _a[1];
                state.tables.byId[id] = { id: id, name: name };
                state.tables.byName[name] = id;
                if (!state.tables.allIds.includes(id))
                    state.tables.allIds.push(id);
                state.initialized[id] = false;
            });
        },
        clearTableData: function (state, action) {
            var tableId = state.tables.byName[action.payload];
            if (tableId) {
                delete state.records.byTableId[tableId];
                state.initialized[tableId] = false;
            }
        }
    },
    extraReducers: function (builder) {
        builder
            .addCase(exports.fetchTableRecords.pending, function (state) {
            state.loading.records = "loading";
            state.error = null;
        })
            .addCase(exports.fetchTableRecords.fulfilled, function (state, action) {
            var _a = action.payload, tableId = _a.tableId, records = _a.records, total = _a.total, nextPageToken = _a.nextPageToken;
            state.records.byTableId[tableId] = {
                items: records,
                total: total,
                lastUpdated: new Date().toISOString(),
                nextPageToken: nextPageToken
            };
            state.loading.records = "idle";
            state.initialized[tableId] = true;
            state.error = null;
        })
            .addCase(exports.fetchTableRecords.rejected, function (state, action) {
            state.loading.records = "error";
            state.error = action.payload || 'An unknown error occurred';
        })
            .addCase(exports.createRecord.fulfilled, function (state, action) {
            var _a;
            var _b = action.payload, tableId = _b.tableId, record = _b.record;
            if ((_a = state.records.byTableId[tableId]) === null || _a === void 0 ? void 0 : _a.items) {
                state.records.byTableId[tableId].items.push(record);
            }
        })
            .addCase(exports.updateRecord.fulfilled, function (state, action) {
            var _a;
            var _b = action.payload, tableId = _b.tableId, record = _b.record;
            var items = (_a = state.records.byTableId[tableId]) === null || _a === void 0 ? void 0 : _a.items;
            if (items) {
                var index = items.findIndex(function (r) { return r.id === record.id; });
                if (index !== -1)
                    items[index] = record;
            }
        })
            .addCase(exports.deleteRecord.fulfilled, function (state, action) {
            var _a;
            var _b = action.payload, tableId = _b.tableId, recordId = _b.recordId;
            var items = (_a = state.records.byTableId[tableId]) === null || _a === void 0 ? void 0 : _a.items;
            if (items) {
                state.records.byTableId[tableId].items = items.filter(function (r) { return r.id !== recordId; });
            }
        })
            .addCase(exports.fetchTableSchema.pending, function (state) {
            state.loading.schemas = "loading";
        })
            .addCase(exports.fetchTableSchema.fulfilled, function (state, action) {
            var _a = action.payload, tableId = _a.tableId, schema = _a.schema;
            state.schemas.byTableId[tableId] = schema;
            state.loading.schemas = "idle";
        })
            .addCase(exports.fetchTableSchema.rejected, function (state, action) {
            state.loading.schemas = "idle";
            state.error = action.error.message || null;
        })
            .addCase(exports.createRecords.fulfilled, function (state, action) {
            var _a;
            var _b;
            var _c = action.payload, tableId = _c.tableId, records = _c.records;
            if ((_b = state.records.byTableId[tableId]) === null || _b === void 0 ? void 0 : _b.items) {
                (_a = state.records.byTableId[tableId].items).push.apply(_a, records);
            }
        })
            .addCase(exports.deleteRecords.fulfilled, function (state, action) {
            var _a;
            var _b = action.payload, tableId = _b.tableId, recordIds = _b.recordIds;
            var items = (_a = state.records.byTableId[tableId]) === null || _a === void 0 ? void 0 : _a.items;
            if (items) {
                state.records.byTableId[tableId].items = items.filter(function (r) { return !recordIds.includes(r.id); });
            }
        });
    }
});
var selectTableData = function (state, tableName) {
    var tableId = state.tables.tables.byName[tableName];
    if (!tableId)
        return null;
    var recordData = state.tables.records.byTableId[tableId];
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
exports.initializeTables = (_a = tablesSlice.actions, _a.initializeTables), exports.clearTableData = _a.clearTableData;
var selectTablesState = function (state) { return state.tables; };
exports.selectTablesState = selectTablesState;
var selectTableId = function (state, tableName) { return state.tables.tables.byName[tableName]; };
exports.selectTableId = selectTableId;
var selectTableRecords = function (state, tableName) {
    var _a;
    var tableId = state.tables.tables.byName[tableName];
    return tableId ? ((_a = state.tables.records.byTableId[tableId]) === null || _a === void 0 ? void 0 : _a.items) || [] : [];
};
exports.selectTableRecords = selectTableRecords;
var selectTableTotal = function (state, tableName) {
    var _a;
    var tableId = state.tables.tables.byName[tableName];
    return tableId ? ((_a = state.tables.records.byTableId[tableId]) === null || _a === void 0 ? void 0 : _a.total) || 0 : 0;
};
exports.selectTableTotal = selectTableTotal;
var selectIsLoading = function (state) { return state.tables.loading.records === "loading"; };
exports.selectIsLoading = selectIsLoading;
var selectTableSchema = function (state, tableName) {
    var tableId = state.tables.tables.byName[tableName];
    return tableId ? state.tables.schemas.byTableId[tableId] : null;
};
exports.selectTableSchema = selectTableSchema;
var selectSchemaLoading = function (state) { return state.tables.loading.schemas === "loading"; };
exports.selectSchemaLoading = selectSchemaLoading;
exports.default = tablesSlice.reducer;
