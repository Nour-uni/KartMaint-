"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshToken = void 0;
const sequelize_1 = require("sequelize");
class RefreshToken extends sequelize_1.Model {
    get isExpired() {
        return new Date() >= this.expiresAt;
    }
    get isActiveToken() {
        return !this.revokedAt && !this.isExpired;
    }
    static associate(models) {
        if (models.User) {
            RefreshToken.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user',
                onDelete: 'CASCADE',
            });
        }
    }
    static initModel(sequelize) {
        RefreshToken.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
                primaryKey: true,
            },
            userId: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: false,
                field: 'user_id',
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            token: {
                type: sequelize_1.DataTypes.STRING(500),
                allowNull: false,
            },
            expiresAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                field: 'expires_at',
            },
            createdByIp: {
                type: sequelize_1.DataTypes.STRING(45),
                allowNull: true,
                field: 'created_by_ip',
            },
            revokedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                field: 'revoked_at',
            },
            replacedByToken: {
                type: sequelize_1.DataTypes.STRING(500),
                allowNull: true,
                field: 'replaced_by_token',
            },
        }, {
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
        });
        return RefreshToken;
    }
}
exports.RefreshToken = RefreshToken;
exports.default = RefreshToken;
//# sourceMappingURL=RefreshToken.js.map