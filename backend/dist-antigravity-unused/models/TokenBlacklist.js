"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenBlacklist = void 0;
const sequelize_1 = require("sequelize");
class TokenBlacklist extends sequelize_1.Model {
    static associate(_models) {
        // Standalone security model, no direct relational foreign keys
    }
    static initModel(sequelize) {
        TokenBlacklist.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
                primaryKey: true,
            },
            jti: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false,
                unique: true,
            },
            expiresAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                field: 'expires_at',
            },
            reason: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: true,
            },
        }, {
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
        });
        return TokenBlacklist;
    }
}
exports.TokenBlacklist = TokenBlacklist;
exports.default = TokenBlacklist;
//# sourceMappingURL=TokenBlacklist.js.map