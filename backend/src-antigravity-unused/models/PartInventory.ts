import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface PartInventoryAttributes {
  id: string;
  partNumber: string;
  name: string;
  quantityInStock: number;
  minStockAlert: number;
  unitPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PartInventoryCreationAttributes
  extends Optional<PartInventoryAttributes, 'id' | 'quantityInStock' | 'minStockAlert' | 'unitPrice'> {}

export class PartInventory
  extends Model<PartInventoryAttributes, PartInventoryCreationAttributes>
  implements PartInventoryAttributes
{
  declare id: string;
  declare partNumber: string;
  declare name: string;
  declare quantityInStock: number;
  declare minStockAlert: number;
  declare unitPrice: number;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  public get isLowStock(): boolean {
    return this.quantityInStock <= this.minStockAlert;
  }

  public static associate(_models: any): void {
    // Inventory relationship can be linked to MaintenanceLog details in extended specs
  }

  public static initModel(sequelize: Sequelize): typeof PartInventory {
    PartInventory.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        partNumber: {
          type: DataTypes.STRING(80),
          allowNull: false,
          unique: true,
          field: 'part_number',
        },
        name: {
          type: DataTypes.STRING(150),
          allowNull: false,
        },
        quantityInStock: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'quantity_in_stock',
        },
        minStockAlert: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 5,
          field: 'min_stock_alert',
        },
        unitPrice: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0.0,
          field: 'unit_price',
          get() {
            const raw = this.getDataValue('unitPrice');
            return raw !== null && raw !== undefined ? parseFloat(raw as any) : 0;
          },
        },
      },
      {
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
      }
    );

    return PartInventory;
  }
}

export default PartInventory;
