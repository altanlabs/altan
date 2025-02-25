/**
 * Validates that SAMPLE_TABLES only contains valid UUID table names.
 */
export declare function validateDatabaseConfig(config: DatabaseConfig): void;
/**
 * Represents the structure of your database configuration,
 * with required fields and types.
 */
export interface DatabaseConfig {
    API_BASE_URL: string;
    SAMPLE_TABLES: Record<string, string>;
}
//# sourceMappingURL=config.d.ts.map