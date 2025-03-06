import { configureStore } from "@reduxjs/toolkit";
import type { AxiosInstance } from "axios";
import tablesReducer from "./tablesSlice";

// Database Types
export interface TableRecord {
  id: string;
  name: string;
}

export interface TableRecordItem {
  id: string;
  [key: string]: unknown; // Allow any fields directly on the record
  created_time?: string;
  updated_at?: string;
  last_modified_time?: string;
  last_modified_by?: string;
}

export interface TableRecordAPIResponse {
  tableId: string;
  record: TableRecordItem
}

export interface TableRecordsAPIResponse {
  tableId: string;
  records: TableRecordItem[]
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

// Schema Types
export interface TableFieldOption {
  color?: string
  label?: string
}

// Field Types
export enum FieldType {
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
  
  // Database specific
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
  
  // Metadata
  order?: number;
  version?: number;
  created_by?: string;
  date_creation?: string;
  id?: string;
  
  // Field specific options
  options?: TableFieldOptions;
  
  // Number specific
  min?: number;
  max?: number;
  step?: number;
  decimals?: number;
  format?: 'decimal' | 'percent' | 'currency';
  currency?: string;
  locale?: string;
  
  // Textarea specific
  rows?: number;
}

export interface TableView {
  id: string
  table_id: string
  name: string
  type: string
  sort: Record<string, unknown>
  options: Record<string, unknown>
  order: number
  version: number
  column_meta: Record<string, unknown>
  enable_share: boolean
  created_by: string
  date_creation: string
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
// Query Types
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

// Hook Types
export interface FetchOptions extends QueryParams {}

// Redux Store Types
const dummyStore = configureStore({
  reducer: { tables: tablesReducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: {} as { api: AxiosInstance }
      }
    })
});

export type RootState = ReturnType<typeof dummyStore.getState>;
export type AppDispatch = typeof dummyStore.dispatch;

// Export a type for the hook return value
export interface DatabaseHookReturn {
  records: TableRecordItem[]
  schema: TableSchema | null
  isLoading: boolean
  schemaLoading: boolean
  error: string | null
  nextPageToken: string | null
  lastUpdated: string | null
  refresh: (options?: FetchOptions, onError?: (error: Error) => void) => Promise<void>
  fetchNextPage: (onError?: (error: Error) => void) => Promise<void>
  addRecord: (record: Record<string, unknown>, onError?: (error: Error) => void) => Promise<TableRecordAPIResponse | undefined>
  modifyRecord: (recordId: string, updates: Record<string, unknown>, onError?: (error: Error) => void) => Promise<TableRecordAPIResponse | undefined>
  removeRecord: (recordId: string, onError?: (error: Error) => void) => Promise<void>
  addRecords: (records: Record<string, unknown>[], onError?: (error: Error) => void) => Promise<TableRecordsAPIResponse | undefined>
  removeRecords: (recordIds: string[], onError?: (error: Error) => void) => Promise<void>
}

// Update the TableState interface to use the correct schema type
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

// --------------------------
// Option Types for Fields
// --------------------------

// Date and Time Options
export enum DateFormat {
  Local = "Local",
  Friendly = "Friendly",
  US = "US",
  European = "European",
  ISO = "ISO"
}

export enum TimeFormat {
  TwelveHour = "12 hour",
  TwentyFourHour = "24 hour"
}

export enum TimeZone {
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

// Reference Options for fields referencing another table
export interface ReferenceOptions {
  foreign_table_id: string;
  allow_multiple?: boolean;
  cascade_delete?: boolean;
}

// Select Option for dropdown-like fields
export interface SelectOption {
  label: string;
  id?: string;
  color: string;
}

// Checkbox Options if field is a checkbox
export interface CheckboxOptions {
  icon?: string;
  color?: string;
}

// Rating Options if field represents a rating
export interface RatingOptions {
  icon?: string;
  color?: string;
  maximum?: number;
}

// User Options for fields that reference users
export interface UserOptions {
  allow_multiple?: boolean;
  notify_users?: boolean;
}

// --------------------------
// Main Field Options Object
// --------------------------
export interface TableFieldOptions {
  // A common required flag for the field.
  required?: boolean;
  // Options specific to date or datetime fields.
  date_options?: DateOptions;
  // Options for fields that reference another table.
  reference_options?: ReferenceOptions;
  // Options for dropdown or select fields.
  select_options?: SelectOption[];
  // Options for number fields, can include min, max, etc.
  number_options?: Record<string, unknown>;
  // Options for checkbox fields.
  checkbox_options?: CheckboxOptions;
  // Options for rating fields.
  rating_options?: RatingOptions;
  // Options for user reference fields.
  user_options?: UserOptions;
  // A default value for the field.
  default?: unknown;
  // Additional validation parameters.
  validation?: Record<string, unknown>;
} 