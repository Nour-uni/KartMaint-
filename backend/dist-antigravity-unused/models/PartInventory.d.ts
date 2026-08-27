import { Model, Optional, Sequelize } from 'sequelize';
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
export interface PartInventoryCreationAttributes extends Optional<PartInventoryAttributes, 'id' | 'quantityInStock' | 'minStockAlert' | 'unitPrice'> {
}
export declare class PartInventory extends Model<PartInventoryAttributes, PartInventoryCreationAttributes> implements PartInventoryAttributes {
    id: string;
    partNumber: string;
    name: string;
    quantityInStock: number;
    minStockAlert: number;
    unitPrice: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    get isLowStock(): boolean;
    static associate(_models: any): void;
    static initModel(sequelize: Sequelize): typeof PartInventory;
}
export default PartInventory;
