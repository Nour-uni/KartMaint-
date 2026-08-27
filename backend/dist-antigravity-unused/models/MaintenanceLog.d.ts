import { Model, Optional, Sequelize } from 'sequelize';
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
export interface MaintenanceLogCreationAttributes extends Optional<MaintenanceLogAttributes, 'id' | 'technicianId' | 'laborHours' | 'totalCost' | 'status' | 'completedAt'> {
}
export declare class MaintenanceLog extends Model<MaintenanceLogAttributes, MaintenanceLogCreationAttributes> implements MaintenanceLogAttributes {
    id: string;
    kartId: string;
    technicianId: string | null;
    serviceType: string;
    description: string;
    laborHours: number;
    totalCost: number;
    status: 'pending' | 'in_progress' | 'completed';
    completedAt: Date | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static associate(models: any): void;
    static initModel(sequelize: Sequelize): typeof MaintenanceLog;
}
export default MaintenanceLog;
