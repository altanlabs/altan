/**
 * Database Types - Shared type definitions for database/pg-meta operations
 * These types are used by both Services and Redux layers
 */

// ============================================================================
// PG-Meta Types (from PostgreSQL metadata)
// ============================================================================

export interface PgMetaColumn {
  id: number;
  name: string;
  data_type: string;
  format?: string;
  is_nullable: boolean;
  is_unique: boolean;
  is_identity: boolean;
  identity_generation?: string;
  is_generated: boolean;
  is_updatable: boolean;
  default_value?: string;
  comment?: string;
  ordinal_position: number;
  enums?: string[];
  check?: string;
  table_id: number;
  schema: string;
  table: string;
}

export interface PgMetaTable {
  id: number;
  name: string;
  schema: string;
  rls_enabled?: boolean;
  rls_forced?: boolean;
  replica_identity?: string;
  comment?: string;
  bytes?: number;
  size?: string;
  live_rows_estimate?: number;
  dead_rows_estimate?: number;
  columns?: PgMetaColumn[];
  primary_keys?: unknown[];
  relationships?: unknown[];
}

// ============================================================================
// Application Types (normalized for app usage)
// ============================================================================

export interface BaseField {
  id: number;
  name: string;
  db_field_name: string;
  data_type: string;
  format?: string | undefined;
  is_nullable: boolean;
  is_unique: boolean;
  is_identity: boolean;
  identity_generation?: string | undefined;
  is_generated: boolean;
  is_updatable: boolean;
  is_primary?: boolean | undefined;
  default_value?: string | undefined;
  comment?: string | undefined;
  ordinal_position: number;
  enums?: string[] | undefined;
  check?: string | undefined;
  table_id: number;
  schema: string;
  table: string;
}

export interface BaseTable {
  id: number;
  name: string;
  db_name: string;
  schema: string;
  rls_enabled?: boolean | undefined;
  rls_forced?: boolean | undefined;
  replica_identity?: string | undefined;
  comment?: string | undefined;
  bytes?: number | undefined;
  size?: string | undefined;
  live_rows_estimate?: number | undefined;
  dead_rows_estimate?: number | undefined;
  fields: {
    items: BaseField[];
  };
  primary_keys?: unknown[] | undefined;
  relationships?: unknown[] | undefined;
}

export interface BaseSchema {
  id: number;
  name: string;
  owner?: string;
}

export interface BaseRecord {
  id?: string;
  [key: string]: unknown;
}

export interface RLSPolicy {
  id: number;
  name: string;
  schema: string;
  table: string;
  action: string;
  roles: string[];
  command: string;
  definition: string;
  check?: string;
}

// ============================================================================
// User & Bucket Types
// ============================================================================

export interface BaseUser {
  id: string;
  email?: string;
  username?: string;
  name?: string;
  display_name?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  user_name?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  [key: string]: unknown;
}

export interface BaseBucket {
  id: string;
  name: string;
  public?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

// ============================================================================
// Cloud Instance Types
// ============================================================================

export interface CloudInstance {
  id: string;
  name?: string;
  status?: string;
  created_at?: string;
  [key: string]: unknown;
}

