import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface TokenBlacklistAttributes {
  id: string;
  jti: string;
  expiresAt: Date;
  reason?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TokenBlacklistCreationAttributes
  extends Optional<TokenBlacklistAttributes, 'id' | 'reason'> {}

export class TokenBlacklist
  extends Model<TokenBlacklistAttributes, TokenBlacklistCreationAttributes>
  implements TokenBlacklistAttributes
{
  declare id: string;
  declare jti: string;
  declare expiresAt: Date;
  declare reason: string | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  public static associate(_models: any): void {
    // Standalone security model, no direct relational foreign keys
  }

  public static initModel(sequelize: Sequelize): typeof TokenBlacklist {
    TokenBlacklist.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        jti: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
        },
        expiresAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'expires_at',
        },
        reason: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'token_blacklists',
        underscored: true,
        timestamps: true,
        indexes: [
          {
            unique: true,
            fields: ['jti'],
          },
          {
            fields: ['expires_at'],
          },
        ],
      }
    );

    return TokenBlacklist;
  }
}

export default TokenBlacklist;
