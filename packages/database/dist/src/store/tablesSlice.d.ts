import type { AxiosInstance } from "axios";
import { TableState, TableRecordItem, QueryParams, RootState, TableSchema } from "./types";
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
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction> | undefined;
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
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction> | undefined;
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
    recordId: string;
    updates: Record<string, unknown>;
}, {
    state: RootState;
    extra: {
        api: AxiosInstance;
    };
    rejectValue: string;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction> | undefined;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const deleteRecord: import("@reduxjs/toolkit").AsyncThunk<{
    tableId: string;
    recordId: string;
}, {
    tableName: string;
    recordId: string;
}, {
    state: RootState;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction> | undefined;
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
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction> | undefined;
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
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction> | undefined;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const deleteRecords: import("@reduxjs/toolkit").AsyncThunk<{
    tableId: string;
    recordIds: string[];
}, {
    tableName: string;
    recordIds: string[];
}, {
    state: RootState;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction> | undefined;
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
    lastUpdated: string;
} | null;
export declare const initializeTables: import("@reduxjs/toolkit").ActionCreatorWithPayload<DatabaseConfig, "tables/initializeTables">, clearTableData: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "tables/clearTableData">;
export declare const selectTablesState: (state: RootState) => TableState;
export declare const selectTableId: (state: RootState, tableName: string) => string;
export declare const selectTableRecords: (state: RootState, tableName: string) => TableRecordItem[];
export declare const selectTableTotal: (state: RootState, tableName: string) => number;
export declare const selectIsLoading: (state: RootState) => boolean;
export declare const selectTableSchema: (state: RootState, tableName: string) => TableSchema | null;
export declare const selectSchemaLoading: (state: RootState) => boolean;
declare const _default: import("redux").Reducer<TableState>;
export default _default;
