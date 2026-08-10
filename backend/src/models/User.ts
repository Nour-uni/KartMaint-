import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';

export interface UserAttributes {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  password?: string;
  role: 'admin' | 'controller' | 'mechanic';
  mustChangePassword: boolean;
  isActive: boolean;
  // Account lockout
  failedLoginAttempts: number;
  lockedUntil?: Date | null;
  // Password reset
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, 'id' | 'mustChangePassword' | 'isActive'> {
  password?: string;
}

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: string;
  declare fullName: string;
  declare email: string;
  declare passwordHash: string;
  declare password?: string;
  declare role: 'admin' | 'controller' | 'mechanic';
  declare mustChangePassword: boolean;
  declare isActive: boolean;
  declare failedLoginAttempts: number;
  declare lockedUntil: Date | null;
  declare passwordResetToken: string | null;
  declare passwordResetExpires: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date | null;

  // Instance method for password verification
  public async comparePassword(plainText: string): Promise<boolean> {
    return bcrypt.compare(plainText, this.passwordHash);
  }

  // Association registration
  public static associate(models: any): void {
    if (models.RefreshToken) {
      User.hasMany(models.RefreshToken, {
        foreignKey: 'userId',
        as: 'refreshTokens',
        onDelete: 'CASCADE',
      });
    }
    if (models.MaintenanceLog) {
      User.hasMany(models.MaintenanceLog, {
        foreignKey: 'technicianId',
        as: 'maintenanceLogs',
        onDelete: 'SET NULL',
      });
    }
    if (models.AuditLog) {
      User.hasMany(models.AuditLog, {
        foreignKey: 'userId',
        as: 'auditLogs',
        onDelete: 'SET NULL',
      });
    }
  }

  public static initModel(sequelize: Sequelize): typeof User {
    User.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        fullName: {
          type: DataTypes.STRING(120),
          allowNull: false,
          field: 'full_name',
        },
        email: {
          type: DataTypes.STRING(150),
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
          },
          set(val: string) {
            this.setDataValue('email', val.trim().toLowerCase());
          },
        },
        passwordHash: {
          type: DataTypes.STRING(255),
          allowNull: false,
          field: 'password_hash',
        },
        role: {
          type: DataTypes.ENUM('admin', 'controller', 'mechanic'),
          allowNull: false,
          defaultValue: 'mechanic',
        },
        mustChangePassword: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          field: 'must_change_password',
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          field: 'is_active',
        },
        failedLoginAttempts: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          allowNull: false,
          field: 'failed_login_attempts',
        },
        lockedUntil: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
          field: 'locked_until',
        },
        passwordResetToken: {
          type: DataTypes.STRING(255),
          allowNull: true,
          defaultValue: null,
          field: 'password_reset_token',
        },
        passwordResetExpires: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
          field: 'password_reset_expires',
        },
        // Virtual property for transparent password setting and bcrypt hashing
        password: {
          type: DataTypes.VIRTUAL,
          set(value: string) {
            if (value) {
              const salt = bcrypt.genSaltSync(10);
              const hash = bcrypt.hashSync(value, salt);
              this.setDataValue('passwordHash', hash);
            }
          },
        } as any,
      },
      {
        sequelize,
        tableName: 'users',
        underscored: true,
        paranoid: true,
        timestamps: true,
        indexes: [
          {
            unique: true,
            fields: ['email'],
          },
          {
            fields: ['role'],
          },
          {
            fields: ['is_active'],
          },
        ],
      }
    );

    return User;
  }
}

export default User;
