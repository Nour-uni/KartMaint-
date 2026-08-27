"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = logAudit;
const models_1 = __importDefault(require("../models"));
/**
 * Persists administrative and operational actions to PostgreSQL via AuditLog model
 * and outputs structured JSON logs for observability.
 */
async function logAudit(options) {
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
        const AuditLogModel = models_1.default.AuditLog;
        if (!AuditLogModel) {
            console.warn('⚠️ AuditLog model is not loaded in db registry.');
            return null;
        }
        const auditEntry = await AuditLogModel.create({
            userId: userId || null,
            action,
            entity,
            entityId: entityId || null,
            changes: changes || null,
            ipAddress: ipAddress || null,
        }, { transaction });
        return auditEntry;
    }
    catch (err) {
        console.error('❌ Failed to persist audit log to database:', err.message);
        // Silent catch so audit logging failure does not crash primary business transactions unless required
        return null;
    }
}
exports.default = logAudit;
//# sourceMappingURL=auditLogger.js.map