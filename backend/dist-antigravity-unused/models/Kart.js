"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Kart = void 0;
const sequelize_1 = require("sequelize");
class Kart extends sequelize_1.Model {
    static associate(models) {
        if (models.MaintenanceLog) {
            Kart.hasMany(models.MaintenanceLog, {
                foreignKey: 'kartId',
                as: 'maintenanceLogs',
                onDelete: 'CASCADE',
            });
        }
    }
    static initModel(sequelize) {
        Kart.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
                primaryKey: true,
            },
            kartNumber: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                unique: true,
                field: 'kart_number',
            },
            vinSerial: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: false,
                unique: true,
                field: 'vin_serial',
            },
            status: {
                type: sequelize_1.DataTypes.ENUM('available', 'in_maintenance', 'decommissioned'),
                allowNull: false,
                defaultValue: 'available',
            },
            operatingHours: {
                type: sequelize_1.DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.0,
                field: 'operating_hours',
                get() {
                    const raw = this.getDataValue('operatingHours');
                    return raw !== null && raw !== undefined ? parseFloat(raw) : 0;
                },
            },
            notes: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
            },
        }, {
            sequelize,
            tableName: 'karts',
            underscored: true,
            paranoid: true,
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    fields: ['kart_number'],
                },
                {
                    unique: true,
                    fields: ['vin_serial'],
                },
                {
                    fields: ['status'],
                },
            ],
        });
        return Kart;
    }
}
exports.Kart = Kart;
exports.default = Kart;
//# sourceMappingURL=Kart.js.map