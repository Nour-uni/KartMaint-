"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLog = void 0;
const sequelize_1 = require("sequelize");
class AuditLog extends sequelize_1.Model {
    static associate(models) {
        if (models.User) {
            AuditLog.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user',
                onDelete: 'SET NULL',
            });
        }
    }
    static initModel(sequelize) {
        AuditLog.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
                primaryKey: true,
            },
            userId: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: true,
                field: 'user_id',
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            action: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: false,
            },
            entity: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: false,
            },
            entityId: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: true,
                field: 'entity_id',
            },
            changes: {
                type: sequelize_1.DataTypes.JSONB,
                allowNull: true,
            },
            ipAddress: {
                type: sequelize_1.DataTypes.STRING(45),
                allowNull: true,
                field: 'ip_address',
            },
        }, {
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
        });
        return AuditLog;
    }
}
exports.AuditLog = AuditLog;
exports.default = AuditLog;
//# sourceMappingURL=AuditLog.js.map