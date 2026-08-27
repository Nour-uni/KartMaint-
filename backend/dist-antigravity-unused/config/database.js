"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbName = process.env.DB_NAME || 'kartmaint_db';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbPoolMax = parseInt(process.env.DB_POOL_MAX || '10', 10);
const databaseUrl = process.env.DATABASE_URL;
let sequelizeOptions = {
    dialect: 'postgres',
    host: dbHost,
    port: dbPort,
    pool: {
        max: dbPoolMax,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
        underscored: true,
        timestamps: true,
    },
};
// Handle SSL for cloud providers (e.g. Supabase, Neon, AWS RDS)
if (process.env.DB_SSL === 'true' || (databaseUrl && databaseUrl.includes('supabase'))) {
    sequelizeOptions.dialectOptions = {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    };
}
exports.sequelize = databaseUrl
    ? new sequelize_1.Sequelize(databaseUrl, sequelizeOptions)
    : new sequelize_1.Sequelize(dbName, dbUser, dbPassword, sequelizeOptions);
exports.default = exports.sequelize;
//# sourceMappingURL=database.js.map