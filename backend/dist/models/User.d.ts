import { Model, Optional, Sequelize } from 'sequelize';
export interface UserAttributes {
    id: string;
    fullName: string;
    email: string;
    passwordHash: string;
    password?: string;
    role: 'admin' | 'controller' | 'mechanic';
    mustChangePassword: boolean;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}
export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'mustChangePassword' | 'isActive'> {
    password?: string;
}
export declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    id: string;
    fullName: string;
    email: string;
    passwordHash: string;
    password?: string;
    role: 'admin' | 'controller' | 'mechanic';
    mustChangePassword: boolean;
    isActive: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
    comparePassword(plainText: string): Promise<boolean>;
    static associate(models: any): void;
    static initModel(sequelize: Sequelize): typeof User;
}
export default User;
