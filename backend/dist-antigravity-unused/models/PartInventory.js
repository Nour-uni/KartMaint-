"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartInventory = void 0;
const sequelize_1 = require("sequelize");
class PartInventory extends sequelize_1.Model {
    get isLowStock() {
        return this.quantityInStock <= this.minStockAlert;
    }
    static associate(_models) {
        // Inventory relationship can be linked to MaintenanceLog details in extended specs
    }
    static initModel(sequelize) {
        PartInventory.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
                primaryKey: true,
            },
            partNumber: {
                type: sequelize_1.DataTypes.STRING(80),
                allowNull: false,
                unique: true,
                field: 'part_number',
            },
            name: {
                type: sequelize_1.DataTypes.STRING(150),
                allowNull: false,
            },
            quantityInStock: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'quantity_in_stock',
            },
            minStockAlert: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 5,
                field: 'min_stock_alert',
            },
            unitPrice: {
                type: sequelize_1.DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.0,
                field: 'unit_price',
                get() {
                    const raw = this.getDataValue('unitPrice');
                    return raw !== null && raw !== undefined ? parseFloat(raw) : 0;
                },
            },
        }, {
            sequelize,
            tableName: 'part_inventories',
            underscored: true,
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    fields: ['part_number'],
                },
                {
                    fields: ['quantity_in_stock'],
                },
            ],
        });
        return PartInventory;
    }
}
exports.PartInventory = PartInventory;
exports.default = PartInventory;
//# sourceMappingURL=PartInventory.js.map