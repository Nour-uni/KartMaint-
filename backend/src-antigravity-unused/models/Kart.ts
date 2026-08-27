import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface KartAttributes {
  id: string;
  kartNumber: number;
  vinSerial: string;
  status: 'available' | 'in_maintenance' | 'decommissioned';
  operatingHours: number;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface KartCreationAttributes
  extends Optional<KartAttributes, 'id' | 'status' | 'operatingHours' | 'notes'> {}

export class Kart
  extends Model<KartAttributes, KartCreationAttributes>
  implements KartAttributes
{
  declare id: string;
  declare kartNumber: number;
  declare vinSerial: string;
  declare status: 'available' | 'in_maintenance' | 'decommissioned';
  declare operatingHours: number;
  declare notes: string | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date | null;

  public static associate(models: any): void {
    if (models.MaintenanceLog) {
      Kart.hasMany(models.MaintenanceLog, {
        foreignKey: 'kartId',
        as: 'maintenanceLogs',
        onDelete: 'CASCADE',
      });
    }
  }

  public static initModel(sequelize: Sequelize): typeof Kart {
    Kart.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        kartNumber: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: true,
          field: 'kart_number',
        },
        vinSerial: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
          field: 'vin_serial',
        },
        status: {
          type: DataTypes.ENUM('available', 'in_maintenance', 'decommissioned'),
          allowNull: false,
          defaultValue: 'available',
        },
        operatingHours: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0.0,
          field: 'operating_hours',
          get() {
            const raw = this.getDataValue('operatingHours');
            return raw !== null && raw !== undefined ? parseFloat(raw as any) : 0;
          },
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
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
      }
    );

    return Kart;
  }
}

export default Kart;
