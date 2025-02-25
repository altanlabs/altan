"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDatabase = useDatabase;
const react_1 = require("react");
const react_redux_1 = require("react-redux");
const tablesSlice_1 = require("../store/tablesSlice");
const useAppDispatch_1 = require("./useAppDispatch");
function useDatabase(table, initialQuery) {
    const dispatch = (0, useAppDispatch_1.useAppDispatch)();
    const [nextPageToken, setNextPageToken] = (0, react_1.useState)(null);
    const requestInProgress = (0, react_1.useRef)({});
    const tableData = (0, react_redux_1.useSelector)((state) => (0, tablesSlice_1.selectTableData)(state, table));
    const isLoadingRecords = (0, react_redux_1.useSelector)((state) => state.tables.loading.records === "loading");
    const isLoadingSchema = (0, react_redux_1.useSelector)((state) => state.tables.loading.schemas === "loading");
    const error = (0, react_redux_1.useSelector)((state) => state.tables.error);
    const { records, schema, initialized, lastUpdated } = (0, react_1.useMemo)(() => ({
        records: (tableData === null || tableData === void 0 ? void 0 : tableData.records) || [],
        schema: (tableData === null || tableData === void 0 ? void 0 : tableData.schema) || null,
        initialized: (tableData === null || tableData === void 0 ? void 0 : tableData.initialized) || false,
        lastUpdated: (tableData === null || tableData === void 0 ? void 0 : tableData.lastUpdated) || null,
    }), [tableData]);
    // Add mounted ref to prevent state updates after unmount
    const isMounted = (0, react_1.useRef)(true);
    (0, react_1.useEffect)(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);
    // Memoize initialQuery to prevent unnecessary effect re-runs
    const memoizedInitialQuery = (0, react_1.useMemo)(() => initialQuery || { limit: 100 }, [initialQuery]);
    // Helper to safely dispatch actions with error handling and cancellation check
    const safeDispatch = (0, react_1.useCallback)(async (action, onError) => {
        try {
            const result = await dispatch(action).unwrap();
            if (isMounted.current)
                return result;
        }
        catch (e) {
            onError === null || onError === void 0 ? void 0 : onError(e);
        }
        return undefined;
    }, [dispatch]);
    // Update effect to use safeDispatch
    (0, react_1.useEffect)(() => {
        if (!table || error)
            return;
        const schemaKey = `schema_${table}`;
        const recordsKey = `records_${table}`;
        if (!schema && !isLoadingSchema && !requestInProgress.current[schemaKey]) {
            requestInProgress.current[schemaKey] = true;
            safeDispatch((0, tablesSlice_1.fetchTableSchema)({ tableName: table })).finally(() => {
                if (isMounted.current) {
                    requestInProgress.current[schemaKey] = false;
                }
            });
        }
        if (!initialized && !isLoadingRecords && !requestInProgress.current[recordsKey]) {
            requestInProgress.current[recordsKey] = true;
            safeDispatch((0, tablesSlice_1.fetchTableRecords)({ tableName: table, queryParams: memoizedInitialQuery })).finally(() => {
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
    const refresh = (0, react_1.useCallback)(async (options = { limit: 20 }, onError) => {
        var _a;
        if (!isLoadingRecords) {
            const result = await safeDispatch((0, tablesSlice_1.fetchTableRecords)({ tableName: table, queryParams: options }), onError);
            if (result && isMounted.current) {
                setNextPageToken((_a = result.nextPageToken) !== null && _a !== void 0 ? _a : null);
            }
        }
    }, [table, safeDispatch, isLoadingRecords]);
    const addRecord = (0, react_1.useCallback)(async (record, onError) => {
        await safeDispatch((0, tablesSlice_1.createRecord)({ tableName: table, record }), onError);
    }, [table, safeDispatch]);
    const modifyRecord = (0, react_1.useCallback)(async (recordId, updates, onError) => {
        await safeDispatch((0, tablesSlice_1.updateRecord)({ tableName: table, recordId, updates }), onError);
    }, [table, safeDispatch]);
    const removeRecord = (0, react_1.useCallback)(async (recordId, onError) => {
        await safeDispatch((0, tablesSlice_1.deleteRecord)({ tableName: table, recordId }), onError);
    }, [table, safeDispatch]);
    const addRecords = (0, react_1.useCallback)(async (records, onError) => {
        await safeDispatch((0, tablesSlice_1.createRecords)({ tableName: table, records }), onError);
    }, [table, safeDispatch]);
    const removeRecords = (0, react_1.useCallback)(async (recordIds, onError) => {
        await safeDispatch((0, tablesSlice_1.deleteRecords)({ tableName: table, recordIds }), onError);
    }, [table, safeDispatch]);
    return (0, react_1.useMemo)(() => ({
        records,
        schema,
        isLoading: isLoadingRecords,
        schemaLoading: isLoadingSchema,
        error,
        nextPageToken,
        lastUpdated,
        refresh,
        fetchNextPage: async (onError) => {
            if (nextPageToken && !isLoadingRecords) {
                await refresh({ pageToken: nextPageToken, limit: 20 }, onError);
            }
        },
        addRecord,
        modifyRecord,
        removeRecord,
        addRecords,
        removeRecords,
    }), [
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
//# sourceMappingURL=useDatabase.js.map