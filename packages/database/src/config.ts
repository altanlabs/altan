// src/databases/config.ts

/**
 * Ensures each value in SAMPLE_TABLES is a valid UUID.
 */
function isValidUUID(value: string): boolean {
  // This regex checks for a UUID of the form xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/**
 * Validates that SAMPLE_TABLES only contains valid UUID table names.
 */
export function validateDatabaseConfig(config: DatabaseConfig): void {
  for (const entry of Object.values(config.SAMPLE_TABLES)) {
    if (!isValidUUID(entry)) {
      throw new Error(`Table name "${entry}" is not a valid UUID.`);
    }
  }
}

/**
 * Represents the structure of your database configuration,
 * with required fields and types.
 */
export interface DatabaseConfig {
  API_BASE_URL: string;
  SAMPLE_TABLES: Record<string, string>;
}

// Optionally, you can remove the mutable config-related functions entirely.
