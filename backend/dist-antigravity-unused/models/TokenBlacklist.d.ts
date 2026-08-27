import { Model, Optional, Sequelize } from 'sequelize';
export interface TokenBlacklistAttributes {
    id: string;
    jti: string;
    expiresAt: Date;
    reason?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface TokenBlacklistCreationAttributes extends Optional<TokenBlacklistAttributes, 'id' | 'reason'> {
}
export declare class TokenBlacklist extends Model<TokenBlacklistAttributes, TokenBlacklistCreationAttributes> implements TokenBlacklistAttributes {
    id: string;
    jti: string;
    expiresAt: Date;
    reason: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static associate(_models: any): void;
    static initModel(sequelize: Sequelize): typeof TokenBlacklist;
}
export default TokenBlacklist;
