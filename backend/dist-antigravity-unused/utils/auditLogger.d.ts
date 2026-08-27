import { Transaction } from 'sequelize';
export interface LogAuditOptions {
    userId?: string | null;
    action: string;
    entity: string;
    entityId?: string | null;
    changes?: Record<string, any> | null;
    ipAddress?: string | null;
    transaction?: Transaction;
}
/**
 * Persists administrative and operational actions to PostgreSQL via AuditLog model
 * and outputs structured JSON logs for observability.
 */
export declare function logAudit(options: LogAuditOptions): Promise<any>;
export default logAudit;
