import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface MaintenanceLogAttributes {
  id: string;
  kartId: string;
  technicianId?: string | null;
  serviceType: string;
  description: string;
  laborHours: number;
  totalCost: number;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MaintenanceLogCreationAttributes
  extends Optional<
    MaintenanceLogAttributes,
    'id' | 'technicianId' | 'laborHours' | 'totalCost' | 'status' | 'completedAt'
  > {}

export class MaintenanceLog
  extends Model<MaintenanceLogAttributes, MaintenanceLogCreationAttributes>
  implements MaintenanceLogAttributes
{
  declare id: string;
  declare kartId: string;
  declare technicianId: string | null;
  declare serviceType: string;
  declare description: string;
  declare laborHours: number;
  declare totalCost: number;
  declare status: 'pending' | 'in_progress' | 'completed';
  declare completedAt: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  public static associate(models: any): void {
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

  public static initModel(sequelize: Sequelize): typeof MaintenanceLog {
    MaintenanceLog.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        kartId: {
          type: DataTypes.UUID,
          allowNull: false,
          field: 'kart_id',
          references: {
            model: 'karts',
            key: 'id',
          },
        },
        technicianId: {
          type: DataTypes.UUID,
          allowNull: true,
          field: 'technician_id',
          references: {
            model: 'users',
            key: 'id',
          },
        },
        serviceType: {
          type: DataTypes.STRING(100),
          allowNull: false,
          field: 'service_type',
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        laborHours: {
          type: DataTypes.DECIMAL(6, 2),
          allowNull: false,
          defaultValue: 0.0,
          field: 'labor_hours',
          get() {
            const raw = this.getDataValue('laborHours');
            return raw !== null && raw !== undefined ? parseFloat(raw as any) : 0;
          },
        },
        totalCost: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0.0,
          field: 'total_cost',
          get() {
            const raw = this.getDataValue('totalCost');
            return raw !== null && raw !== undefined ? parseFloat(raw as any) : 0;
          },
        },
        status: {
          type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
          allowNull: false,
          defaultValue: 'pending',
        },
        completedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'completed_at',
        },
      },
      {
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
      }
    );

    return MaintenanceLog;
  }
}

export default MaintenanceLog;
