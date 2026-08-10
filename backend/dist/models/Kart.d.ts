import { Model, Optional, Sequelize } from 'sequelize';
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
export interface KartCreationAttributes extends Optional<KartAttributes, 'id' | 'status' | 'operatingHours' | 'notes'> {
}
export declare class Kart extends Model<KartAttributes, KartCreationAttributes> implements KartAttributes {
    id: string;
    kartNumber: number;
    vinSerial: string;
    status: 'available' | 'in_maintenance' | 'decommissioned';
    operatingHours: number;
    notes: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
    static associate(models: any): void;
    static initModel(sequelize: Sequelize): typeof Kart;
}
export default Kart;
