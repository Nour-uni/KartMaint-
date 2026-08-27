import { Model, Optional, Sequelize } from 'sequelize';
export interface AuditLogAttributes {
    id: string;
    userId?: string | null;
    action: string;
    entity: string;
    entityId?: string | null;
    changes?: Record<string, any> | null;
    ipAddress?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface AuditLogCreationAttributes extends Optional<AuditLogAttributes, 'id' | 'userId' | 'entityId' | 'changes' | 'ipAddress'> {
}
export declare class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
    id: string;
    userId: string | null;
    action: string;
    entity: string;
    entityId: string | null;
    changes: Record<string, any> | null;
    ipAddress: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static associate(models: any): void;
    static initModel(sequelize: Sequelize): typeof AuditLog;
}
export default AuditLog;
