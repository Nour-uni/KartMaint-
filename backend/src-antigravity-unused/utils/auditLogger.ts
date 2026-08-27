import { Transaction } from 'sequelize';
import db from '../models';

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
export async function logAudit(options: LogAuditOptions): Promise<any> {
  const { userId, action, entity, entityId, changes, ipAddress, transaction } = options;

  const logPayload = {
    timestamp: new Date().toISOString(),
    level: 'AUDIT',
    userId: userId || 'SYSTEM',
    action,
    entity,
    entityId: entityId || null,
    ipAddress: ipAddress || null,
    changes: changes || null,
  };

  // 1. Structured Console Output
  console.log(JSON.stringify(logPayload));

  try {
    // 2. Database Persistence via AuditLog Model
    const AuditLogModel = db.AuditLog;
    if (!AuditLogModel) {
      console.warn('⚠️ AuditLog model is not loaded in db registry.');
      return null;
    }

    const auditEntry = await AuditLogModel.create(
      {
        userId: userId || null,
        action,
        entity,
        entityId: entityId || null,
        changes: changes || null,
        ipAddress: ipAddress || null,
      },
      { transaction }
    );

    return auditEntry;
  } catch (err: any) {
    console.error('❌ Failed to persist audit log to database:', err.message);
    // Silent catch so audit logging failure does not crash primary business transactions unless required
    return null;
  }
}

export default logAudit;
