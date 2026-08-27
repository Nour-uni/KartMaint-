import { Model, Optional, Sequelize } from 'sequelize';
export interface RefreshTokenAttributes {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    createdByIp?: string | null;
    revokedAt?: Date | null;
    replacedByToken?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface RefreshTokenCreationAttributes extends Optional<RefreshTokenAttributes, 'id' | 'createdByIp' | 'revokedAt' | 'replacedByToken'> {
}
export declare class RefreshToken extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes> implements RefreshTokenAttributes {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    createdByIp: string | null;
    revokedAt: Date | null;
    replacedByToken: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    get isExpired(): boolean;
    get isActiveToken(): boolean;
    static associate(models: any): void;
    static initModel(sequelize: Sequelize): typeof RefreshToken;
}
export default RefreshToken;
