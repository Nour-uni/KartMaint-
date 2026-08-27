"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class User extends sequelize_1.Model {
    // Instance method for password verification
    async comparePassword(plainText) {
        return bcryptjs_1.default.compare(plainText, this.passwordHash);
    }
    // Association registration
    static associate(models) {
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
    static initModel(sequelize) {
        User.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
                primaryKey: true,
            },
            fullName: {
                type: sequelize_1.DataTypes.STRING(120),
                allowNull: false,
                field: 'full_name',
            },
            email: {
                type: sequelize_1.DataTypes.STRING(150),
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true,
                },
                set(val) {
                    this.setDataValue('email', val.trim().toLowerCase());
                },
            },
            passwordHash: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false,
                field: 'password_hash',
            },
            role: {
                type: sequelize_1.DataTypes.ENUM('admin', 'controller', 'mechanic'),
                allowNull: false,
                defaultValue: 'mechanic',
            },
            mustChangePassword: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: true,
                field: 'must_change_password',
            },
            isActive: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: true,
                field: 'is_active',
            },
            // Virtual property for transparent password setting and bcrypt hashing
            password: {
                type: sequelize_1.DataTypes.VIRTUAL,
                set(value) {
                    if (value) {
                        const salt = bcryptjs_1.default.genSaltSync(10);
                        const hash = bcryptjs_1.default.hashSync(value, salt);
                        this.setDataValue('passwordHash', hash);
                    }
                },
            },
        }, {
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
        });
        return User;
    }
}
exports.User = User;
exports.default = User;
//# sourceMappingURL=User.js.map