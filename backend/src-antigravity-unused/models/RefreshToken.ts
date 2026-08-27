import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

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

export interface RefreshTokenCreationAttributes
  extends Optional<RefreshTokenAttributes, 'id' | 'createdByIp' | 'revokedAt' | 'replacedByToken'> {}

export class RefreshToken
  extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes>
  implements RefreshTokenAttributes
{
  declare id: string;
  declare userId: string;
  declare token: string;
  declare expiresAt: Date;
  declare createdByIp: string | null;
  declare revokedAt: Date | null;
  declare replacedByToken: string | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  public get isExpired(): boolean {
    return new Date() >= this.expiresAt;
  }

  public get isActiveToken(): boolean {
    return !this.revokedAt && !this.isExpired;
  }

  public static associate(models: any): void {
    if (models.User) {
      RefreshToken.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE',
      });
    }
  }

  public static initModel(sequelize: Sequelize): typeof RefreshToken {
    RefreshToken.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          field: 'user_id',
          references: {
            model: 'users',
            key: 'id',
          },
        },
        token: {
          type: DataTypes.STRING(500),
          allowNull: false,
        },
        expiresAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'expires_at',
        },
        createdByIp: {
          type: DataTypes.STRING(45),
          allowNull: true,
          field: 'created_by_ip',
        },
        revokedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'revoked_at',
        },
        replacedByToken: {
          type: DataTypes.STRING(500),
          allowNull: true,
          field: 'replaced_by_token',
        },
      },
      {
        sequelize,
        tableName: 'refresh_tokens',
        underscored: true,
        timestamps: true,
        indexes: [
          {
            name: 'refresh_tokens_user_id_token_idx',
            unique: true,
            fields: ['user_id', 'token'],
          },
          {
            fields: ['token'],
          },
        ],
      }
    );

    return RefreshToken;
  }
}

export default RefreshToken;
