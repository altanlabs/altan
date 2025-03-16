import type { AxiosInstance } from "axios";
import { TableState, TableRecordItem, QueryParams, RootState, TableSchema, OptimisticUpdatePayload, OptimisticDeletePayload, RollbackUpdatePayload, RollbackAddPayload } from "./types";
import type { DatabaseConfig } from "../config";
export declare const fetchTableRecords: import("@reduxjs/toolkit").AsyncThunk<{
    tableId: string;
    records: TableRecordItem[];
    total: number;
    nextPageToken: string;
}, {
    tableName: string;
    queryParams?: QueryParams;
}, {
    state: RootState;
    extra: {
        api: AxiosInstance;
    };
    rejectValue: string;
    dispatch?: import("redux").Dispatch | undefined;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const createRecord: import("@reduxjs/toolkit").AsyncThunk<{
    tableId: string;
    record: TableRecordItem;
}, {
    tableName: string;
    record: Record<string, unknown>;
}, {
    state: RootState;
    extra: {
        api: AxiosInstance;
    };
    rejectValue: string;
    dispatch?: import("redux").Dispatch | undefined;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const updateRecord: import("@reduxjs/toolkit").AsyncThunk<{
    tableId: string;
    record: TableRecordItem;
}, {
    tableName: string;
    recordId: number;
    updates: Record<string, unknown>;
}, {
    state: RootState;
    extra: {
        api: AxiosInstance;
    };
    rejectValue: string;
    dispatch?: import("redux").Dispatch | undefined;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const deleteRecord: import("@reduxjs/toolkit").AsyncThunk<{
    tableId: string;
    recordId: number;
}, {
    tableName: string;
    recordId: number;
}, {
    state: RootState;
    dispatch?: import("redux").Dispatch | undefined;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const fetchTableSchema: import("@reduxjs/toolkit").AsyncThunk<{
    tableId: string;
    schema: TableSchema;
}, {
    tableName: string;
}, {
    state: RootState;
    extra: {
        api: AxiosInstance;
    };
    dispatch?: import("redux").Dispatch | undefined;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const createRecords: import("@reduxjs/toolkit").AsyncThunk<{
    tableId: string;
    records: TableRecordItem[];
}, {
    tableName: string;
    records: unknown[];
}, {
    state: RootState;
    extra: {
        api: AxiosInstance;
    };
    rejectValue: string;
    dispatch?: import("redux").Dispatch | undefined;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const deleteRecords: import("@reduxjs/toolkit").AsyncThunk<{
    tableId: string;
    recordIds: number[];
}, {
    tableName: string;
    recordIds: number[];
}, {
    state: RootState;
    dispatch?: import("redux").Dispatch | undefined;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const selectTableData: (state: RootState, tableName: string) => {
    records: TableRecordItem[];
    total: number;
    schema: TableSchema;
    initialized: boolean;
    nextPageToken: string | undefined;
    lastUpdated: string | undefined;
} | null;
export declare const initializeTables: import("@reduxjs/toolkit").ActionCreatorWithPayload<DatabaseConfig, "tables/initializeTables">, clearTableData: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "tables/clearTableData">, optimisticAddRecord: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    tableId: string;
    record: TableRecordItem;
}, "tables/optimisticAddRecord">, optimisticUpdateRecord: import("@reduxjs/toolkit").ActionCreatorWithPayload<OptimisticUpdatePayload, "tables/optimisticUpdateRecord">, optimisticDeleteRecord: import("@reduxjs/toolkit").ActionCreatorWithPayload<OptimisticDeletePayload, "tables/optimisticDeleteRecord">, optimisticAddRecords: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    tableId: string;
    records: TableRecordItem[];
}, "tables/optimisticAddRecords">, optimisticDeleteRecords: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    tableId: string;
    recordIds: number[];
}, "tables/optimisticDeleteRecords">, rollbackAddRecord: import("@reduxjs/toolkit").ActionCreatorWithPayload<RollbackAddPayload, "tables/rollbackAddRecord">, rollbackUpdateRecord: import("@reduxjs/toolkit").ActionCreatorWithPayload<RollbackUpdatePayload, "tables/rollbackUpdateRecord">;
export declare const selectTablesState: (state: RootState) => TableState;
export declare const selectTableId: (state: RootState, tableName: string) => string;
export declare const selectTableRecords: (state: RootState, tableName: string) => TableRecordItem[];
export declare const selectTableTotal: (state: RootState, tableName: string) => number;
export declare const selectIsLoading: (state: RootState) => boolean;
export declare const selectTableSchema: (state: RootState, tableName: string) => TableSchema | null;
export declare const selectSchemaLoading: (state: RootState) => boolean;
declare const _default: import("redux").Reducer<TableState>;
export default _default;
//# sourceMappingURL=tablesSlice.d.ts.map