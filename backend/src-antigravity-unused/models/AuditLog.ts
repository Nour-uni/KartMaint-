import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

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

export interface AuditLogCreationAttributes
  extends Optional<AuditLogAttributes, 'id' | 'userId' | 'entityId' | 'changes' | 'ipAddress'> {}

export class AuditLog
  extends Model<AuditLogAttributes, AuditLogCreationAttributes>
  implements AuditLogAttributes
{
  declare id: string;
  declare userId: string | null;
  declare action: string;
  declare entity: string;
  declare entityId: string | null;
  declare changes: Record<string, any> | null;
  declare ipAddress: string | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  public static associate(models: any): void {
    if (models.User) {
      AuditLog.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'SET NULL',
      });
    }
  }

  public static initModel(sequelize: Sequelize): typeof AuditLog {
    AuditLog.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: true,
          field: 'user_id',
          references: {
            model: 'users',
            key: 'id',
          },
        },
        action: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        entity: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        entityId: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: 'entity_id',
        },
        changes: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        ipAddress: {
          type: DataTypes.STRING(45),
          allowNull: true,
          field: 'ip_address',
        },
      },
      {
        sequelize,
        tableName: 'audit_logs',
        underscored: true,
        timestamps: true,
        indexes: [
          {
            fields: ['user_id'],
          },
          {
            fields: ['action'],
          },
          {
            fields: ['entity', 'entity_id'],
          },
          {
            fields: ['created_at'],
          },
        ],
      }
    );

    return AuditLog;
  }
}

export default AuditLog;
