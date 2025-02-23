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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDatabase = useDatabase;
var react_1 = require("react");
var react_redux_1 = require("react-redux");
var tablesSlice_1 = require("../store/tablesSlice");
var useAppDispatch_1 = require("./useAppDispatch");
function useDatabase(table, initialQuery) {
    var _this = this;
    var dispatch = (0, useAppDispatch_1.useAppDispatch)();
    var _a = (0, react_1.useState)(null), nextPageToken = _a[0], setNextPageToken = _a[1];
    var requestInProgress = (0, react_1.useRef)({});
    var tableData = (0, react_redux_1.useSelector)(function (state) {
        return (0, tablesSlice_1.selectTableData)(state, table);
    });
    var isLoadingRecords = (0, react_redux_1.useSelector)(function (state) { return state.tables.loading.records === "loading"; });
    var isLoadingSchema = (0, react_redux_1.useSelector)(function (state) { return state.tables.loading.schemas === "loading"; });
    var error = (0, react_redux_1.useSelector)(function (state) { return state.tables.error; });
    var _b = (0, react_1.useMemo)(function () { return ({
        records: (tableData === null || tableData === void 0 ? void 0 : tableData.records) || [],
        schema: (tableData === null || tableData === void 0 ? void 0 : tableData.schema) || null,
        initialized: (tableData === null || tableData === void 0 ? void 0 : tableData.initialized) || false,
        lastUpdated: (tableData === null || tableData === void 0 ? void 0 : tableData.lastUpdated) || null,
    }); }, [tableData]), records = _b.records, schema = _b.schema, initialized = _b.initialized, lastUpdated = _b.lastUpdated;
    // Add mounted ref to prevent state updates after unmount
    var isMounted = (0, react_1.useRef)(true);
    (0, react_1.useEffect)(function () {
        return function () {
            isMounted.current = false;
        };
    }, []);
    // Memoize initialQuery to prevent unnecessary effect re-runs
    var memoizedInitialQuery = (0, react_1.useMemo)(function () { return initialQuery || { limit: 100 }; }, [initialQuery]);
    // Helper to safely dispatch actions with error handling and cancellation check
    var safeDispatch = (0, react_1.useCallback)(function (action, onError) { return __awaiter(_this, void 0, void 0, function () {
        var result, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, dispatch(action).unwrap()];
                case 1:
                    result = _a.sent();
                    if (isMounted.current)
                        return [2 /*return*/, result];
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    onError === null || onError === void 0 ? void 0 : onError(e_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, undefined];
            }
        });
    }); }, [dispatch]);
    // Update effect to use safeDispatch
    (0, react_1.useEffect)(function () {
        if (!table || error)
            return;
        var schemaKey = "schema_".concat(table);
        var recordsKey = "records_".concat(table);
        if (!schema && !isLoadingSchema && !requestInProgress.current[schemaKey]) {
            requestInProgress.current[schemaKey] = true;
            safeDispatch((0, tablesSlice_1.fetchTableSchema)({ tableName: table })).finally(function () {
                if (isMounted.current) {
                    requestInProgress.current[schemaKey] = false;
                }
            });
        }
        if (!initialized && !isLoadingRecords && !requestInProgress.current[recordsKey]) {
            requestInProgress.current[recordsKey] = true;
            safeDispatch((0, tablesSlice_1.fetchTableRecords)({ tableName: table, queryParams: memoizedInitialQuery })).finally(function () {
                if (isMounted.current) {
                    requestInProgress.current[recordsKey] = false;
                }
            });
        }
    }, [
        table,
        schema,
        initialized,
        isLoadingRecords,
        isLoadingSchema,
        error,
        memoizedInitialQuery,
        safeDispatch,
    ]);
    // Update refresh to use safeDispatch and check mounted state
    var refresh = (0, react_1.useCallback)(function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (options, onError) {
            var result;
            var _a;
            if (options === void 0) { options = { limit: 20 }; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!isLoadingRecords) return [3 /*break*/, 2];
                        return [4 /*yield*/, safeDispatch((0, tablesSlice_1.fetchTableRecords)({ tableName: table, queryParams: options }), onError)];
                    case 1:
                        result = _b.sent();
                        if (result && isMounted.current) {
                            setNextPageToken((_a = result.nextPageToken) !== null && _a !== void 0 ? _a : null);
                        }
                        _b.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    }, [table, safeDispatch, isLoadingRecords]);
    var addRecord = (0, react_1.useCallback)(function (record, onError) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, safeDispatch((0, tablesSlice_1.createRecord)({ tableName: table, record: record }), onError)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [table, safeDispatch]);
    var modifyRecord = (0, react_1.useCallback)(function (recordId, updates, onError) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, safeDispatch((0, tablesSlice_1.updateRecord)({ tableName: table, recordId: recordId, updates: updates }), onError)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [table, safeDispatch]);
    var removeRecord = (0, react_1.useCallback)(function (recordId, onError) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, safeDispatch((0, tablesSlice_1.deleteRecord)({ tableName: table, recordId: recordId }), onError)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [table, safeDispatch]);
    var addRecords = (0, react_1.useCallback)(function (records, onError) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, safeDispatch((0, tablesSlice_1.createRecords)({ tableName: table, records: records }), onError)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [table, safeDispatch]);
    var removeRecords = (0, react_1.useCallback)(function (recordIds, onError) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, safeDispatch((0, tablesSlice_1.deleteRecords)({ tableName: table, recordIds: recordIds }), onError)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [table, safeDispatch]);
    return (0, react_1.useMemo)(function () { return ({
        records: records,
        schema: schema,
        isLoading: isLoadingRecords,
        schemaLoading: isLoadingSchema,
        error: error,
        nextPageToken: nextPageToken,
        lastUpdated: lastUpdated,
        refresh: refresh,
        fetchNextPage: function (onError) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(nextPageToken && !isLoadingRecords)) return [3 /*break*/, 2];
                        return [4 /*yield*/, refresh({ pageToken: nextPageToken, limit: 20 }, onError)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); },
        addRecord: addRecord,
        modifyRecord: modifyRecord,
        removeRecord: removeRecord,
        addRecords: addRecords,
        removeRecords: removeRecords,
    }); }, [
        records,
        schema,
        isLoadingRecords,
        isLoadingSchema,
        error,
        nextPageToken,
        lastUpdated,
        refresh,
        table,
        dispatch,
        addRecord,
        modifyRecord,
        removeRecord,
        addRecords,
        removeRecords,
    ]);
}
