/**
 * Creates a timestamped PostgreSQL database backup file using pg_dump.
 */
export declare function createDatabaseBackup(): Promise<string>;
export default createDatabaseBackup;
