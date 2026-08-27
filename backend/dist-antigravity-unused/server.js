"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const models_1 = __importStar(require("./models"));
const auditLogger_1 = require("./utils/auditLogger");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Health Check Endpoint
app.get('/api/health', async (_req, res) => {
    try {
        await models_1.sequelize.authenticate();
        res.json({
            status: 'HEALTHY',
            database: 'CONNECTED',
            timestamp: new Date().toISOString(),
        });
    }
    catch (err) {
        res.status(500).json({
            status: 'UNHEALTHY',
            error: err.message,
        });
    }
});
// Demo API Endpoint: Get Kart Fleet
app.get('/api/karts', async (_req, res) => {
    try {
        const karts = await models_1.default.Kart.findAll({
            include: [
                {
                    model: models_1.default.MaintenanceLog,
                    as: 'maintenanceLogs',
                    limit: 3,
                },
            ],
            order: [['kart_number', 'ASC']],
        });
        res.json({ success: true, count: karts.length, data: karts });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
const PORT = process.env.PORT || 5000;
async function bootstrap() {
    try {
        console.log('🔄 Connecting to PostgreSQL database...');
        await models_1.sequelize.authenticate();
        console.log('✅ PostgreSQL connection established successfully.');
        // Sync database models
        await models_1.sequelize.sync({ force: false });
        console.log('✅ Models initialized and synchronized.');
        app.listen(PORT, () => {
            console.log(`🚀 KartMaint Server listening on http://localhost:${PORT}`);
            (0, auditLogger_1.logAudit)({
                action: 'SERVER_BOOTSTRAP',
                entity: 'SystemServer',
                changes: { port: PORT, status: 'RUNNING' },
            });
        });
    }
    catch (err) {
        console.error('❌ Failed to start server:', err.message);
        process.exit(1);
    }
}
if (require.main === module) {
    bootstrap();
}
exports.default = app;
//# sourceMappingURL=server.js.map