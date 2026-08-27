"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceLog = void 0;
const sequelize_1 = require("sequelize");
class MaintenanceLog extends sequelize_1.Model {
    static associate(models) {
        if (models.Kart) {
            MaintenanceLog.belongsTo(models.Kart, {
                foreignKey: 'kartId',
                as: 'kart',
                onDelete: 'CASCADE',
            });
        }
        if (models.User) {
            MaintenanceLog.belongsTo(models.User, {
                foreignKey: 'technicianId',
                as: 'technician',
                onDelete: 'SET NULL',
            });
        }
    }
    static initModel(sequelize) {
        MaintenanceLog.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
                primaryKey: true,
            },
            kartId: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: false,
                field: 'kart_id',
                references: {
                    model: 'karts',
                    key: 'id',
                },
            },
            technicianId: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: true,
                field: 'technician_id',
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            serviceType: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: false,
                field: 'service_type',
            },
            description: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false,
            },
            laborHours: {
                type: sequelize_1.DataTypes.DECIMAL(6, 2),
                allowNull: false,
                defaultValue: 0.0,
                field: 'labor_hours',
                get() {
                    const raw = this.getDataValue('laborHours');
                    return raw !== null && raw !== undefined ? parseFloat(raw) : 0;
                },
            },
            totalCost: {
                type: sequelize_1.DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.0,
                field: 'total_cost',
                get() {
                    const raw = this.getDataValue('totalCost');
                    return raw !== null && raw !== undefined ? parseFloat(raw) : 0;
                },
            },
            status: {
                type: sequelize_1.DataTypes.ENUM('pending', 'in_progress', 'completed'),
                allowNull: false,
                defaultValue: 'pending',
            },
            completedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                field: 'completed_at',
            },
        }, {
            sequelize,
            tableName: 'maintenance_logs',
            underscored: true,
            timestamps: true,
            indexes: [
                {
                    fields: ['kart_id'],
                },
                {
                    fields: ['technician_id'],
                },
                {
                    fields: ['status'],
                },
                {
                    name: 'maintenance_logs_kart_status_idx',
                    fields: ['kart_id', 'status'],
                },
            ],
        });
        return MaintenanceLog;
    }
}
exports.MaintenanceLog = MaintenanceLog;
exports.default = MaintenanceLog;
//# sourceMappingURL=MaintenanceLog.js.map