import type { AxiosInstance } from "axios";
export interface TableRecord {
    id: string;
    name: string;
}
export interface TableRecordItem {
    id: string;
    [key: string]: unknown;
    created_time?: string;
    updated_at?: string;
    last_modified_time?: string;
    last_modified_by?: string;
}
export interface TableRecordAPIResponse {
    tableId: string;
    record: TableRecordItem;
}
export interface TableRecordsAPIResponse {
    tableId: string;
    records: TableRecordItem[];
}
export interface TableRecordData {
    items: TableRecordItem[];
    total: number;
    lastUpdated: string;
    nextPageToken?: string;
}
export type LoadingStatus = "idle" | "loading" | "error";
export interface LoadingState {
    tables: LoadingStatus;
    records: LoadingStatus;
    schemas: LoadingStatus;
}
export interface TableFieldOption {
    color?: string;
    label?: string;
}
export declare enum FieldType {
    SingleLineText = "singleLineText",
    MultiLineText = "multiLineText",
    Select = "select",
    LongText = "longText",
    Number = "number",
    SingleSelect = "singleSelect",
    MultiSelect = "multiSelect",
    Date = "date",
    DateTime = "dateTime",
    Checkbox = "checkbox",
    User = "user",
    Attachment = "attachment",
    Reference = "reference",
    Email = "email",
    Phone = "phone",
    URL = "url",
    Duration = "duration",
    Rating = "rating",
    Formula = "formula",
    Rollup = "rollup",
    Count = "count",
    Lookup = "lookup",
    Currency = "currency",
    Percent = "percent",
    ForeignKey = "foreignKey",
    JSON = "json",
    Trigger = "trigger"
}
export interface TableField {
    type: FieldType;
    name?: string;
    hidden?: boolean;
    computed?: boolean;
    required?: boolean;
    readonly?: boolean;
    placeholder?: string;
    table_id?: string;
    cell_value_type?: string;
    is_multiple_cell_value?: boolean;
    db_field_type?: string;
    db_field_name?: string;
    not_null?: boolean;
    unique?: boolean;
    is_primary?: boolean;
    is_computed?: boolean;
    is_pending?: boolean;
    has_error?: boolean;
    order?: number;
    version?: number;
    created_by?: string;
    date_creation?: string;
    id?: string;
    options?: TableFieldOptions;
    min?: number;
    max?: number;
    step?: number;
    decimals?: number;
    format?: 'decimal' | 'percent' | 'currency';
    currency?: string;
    locale?: string;
    rows?: number;
}
export interface TableView {
    id: string;
    table_id: string;
    name: string;
    type: string;
    sort: Record<string, unknown>;
    options: Record<string, unknown>;
    order: number;
    version: number;
    column_meta: Record<string, unknown>;
    enable_share: boolean;
    created_by: string;
    date_creation: string;
}
export interface TableSchema {
    base_id: string;
    name: string;
    description: string;
    version: number;
    order: number;
    created_by: string;
    permission_type: string;
    date_creation: string;
    id: string;
    fields: {
        items: TableField[];
    };
}
export type FilterOperator = "eq" | "neq" | "gt" | "lt" | "contains" | "startsWith";
export interface QueryFilter {
    field: string;
    operator: FilterOperator;
    value: unknown;
}
export interface QuerySort {
    field: string;
    direction: "asc" | "desc";
}
export interface QueryParams {
    filters?: QueryFilter[];
    sort?: QuerySort[];
    limit?: number;
    pageToken?: string;
    fields?: string[];
    amount?: "all" | "first" | "one";
}
export interface FetchOptions extends QueryParams {
}
declare const dummyStore: import("@reduxjs/toolkit/dist/configureStore").ToolkitStore<{
    tables: TableState;
}, import("redux").AnyAction, import("@reduxjs/toolkit").MiddlewareArray<[import("@reduxjs/toolkit").ThunkMiddleware<{
    tables: TableState;
}, import("redux").AnyAction, {
    api: AxiosInstance;
}>]>>;
export type RootState = ReturnType<typeof dummyStore.getState>;
export type AppDispatch = typeof dummyStore.dispatch;
export interface DatabaseHookReturn {
    records: TableRecordItem[];
    schema: TableSchema | null;
    isLoading: boolean;
    schemaLoading: boolean;
    error: string | null;
    nextPageToken: string | null;
    lastUpdated: string | null;
    refresh: (options?: FetchOptions, onError?: (error: Error) => void) => Promise<void>;
    fetchNextPage: (onError?: (error: Error) => void) => Promise<void>;
    addRecord: (record: Record<string, unknown>, onError?: (error: Error) => void) => Promise<TableRecordAPIResponse | undefined>;
    modifyRecord: (recordId: string, updates: Record<string, unknown>, onError?: (error: Error) => void) => Promise<TableRecordAPIResponse | undefined>;
    removeRecord: (recordId: string, onError?: (error: Error) => void) => Promise<void>;
    addRecords: (records: Record<string, unknown>[], onError?: (error: Error) => void) => Promise<TableRecordsAPIResponse | undefined>;
    removeRecords: (recordIds: string[], onError?: (error: Error) => void) => Promise<void>;
}
export interface TableState {
    tables: {
        byId: Record<string, TableRecord>;
        byName: Record<string, string>;
        allIds: string[];
    };
    schemas: {
        byTableId: Record<string, TableSchema>;
    };
    records: {
        byTableId: Record<string, TableRecordData>;
    };
    loading: LoadingState;
    error: string | null;
    initialized: Record<string, boolean>;
}
export declare enum DateFormat {
    Local = "Local",
    Friendly = "Friendly",
    US = "US",
    European = "European",
    ISO = "ISO"
}
export declare enum TimeFormat {
    TwelveHour = "12 hour",
    TwentyFourHour = "24 hour"
}
export declare enum TimeZone {
    GMT_UTC = "GMT/UTC",
    Local = "local"
}
export interface DateOptions {
    include_time?: boolean;
    display_time_zone?: boolean;
    date_format?: DateFormat;
    time_format?: TimeFormat;
    time_zone?: TimeZone;
}
export interface ReferenceOptions {
    foreign_table_id: string;
    allow_multiple?: boolean;
    cascade_delete?: boolean;
}
export interface SelectOption {
    label: string;
    id?: string;
    color: string;
}
export interface CheckboxOptions {
    icon?: string;
    color?: string;
}
export interface RatingOptions {
    icon?: string;
    color?: string;
    maximum?: number;
}
export interface UserOptions {
    allow_multiple?: boolean;
    notify_users?: boolean;
}
export interface TableFieldOptions {
    required?: boolean;
    date_options?: DateOptions;
    reference_options?: ReferenceOptions;
    select_options?: SelectOption[];
    number_options?: Record<string, unknown>;
    checkbox_options?: CheckboxOptions;
    rating_options?: RatingOptions;
    user_options?: UserOptions;
    default?: unknown;
    validation?: Record<string, unknown>;
}
export {};
//# sourceMappingURL=types.d.ts.map