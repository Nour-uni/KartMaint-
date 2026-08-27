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
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = __importStar(require("./models"));
const auditLogger_1 = require("./utils/auditLogger");
async function seedEverything() {
    console.log('🌱 Starting Idempotent Database Seeding...');
    try {
        // Authenticate and synchronize schema safely
        await models_1.sequelize.authenticate();
        console.log('✅ Database connection verified.');
        await models_1.sequelize.sync({ force: false });
        console.log('✅ Database schema synchronized.');
        // 1. Seed Super Admin User
        const [adminUser, adminCreated] = await models_1.default.User.findOrCreate({
            where: { email: 'admin@kartmaint.com' },
            defaults: {
                fullName: 'Super Administrator',
                email: 'admin@kartmaint.com',
                password: 'AdminSecurePassword2026!',
                role: 'admin',
                mustChangePassword: false,
                isActive: true,
            },
        });
        console.log(adminCreated
            ? `✅ Created Admin User: ${adminUser.email}`
            : `ℹ️ Admin User already exists: ${adminUser.email}`);
        // 2. Seed Lead Mechanic User
        const [mechanicUser, mechanicCreated] = await models_1.default.User.findOrCreate({
            where: { email: 'mechanic@kartmaint.com' },
            defaults: {
                fullName: 'Alex Vance (Lead Mechanic)',
                email: 'mechanic@kartmaint.com',
                password: 'MechanicPass2026!',
                role: 'mechanic',
                mustChangePassword: false,
                isActive: true,
            },
        });
        console.log(mechanicCreated
            ? `✅ Created Mechanic User: ${mechanicUser.email}`
            : `ℹ️ Mechanic User already exists: ${mechanicUser.email}`);
        // 3. Seed Track Controller User
        const [controllerUser, controllerCreated] = await models_1.default.User.findOrCreate({
            where: { email: 'controller@kartmaint.com' },
            defaults: {
                fullName: 'Sarah Connor (Track Controller)',
                email: 'controller@kartmaint.com',
                password: 'ControllerPass2026!',
                role: 'controller',
                mustChangePassword: false,
                isActive: true,
            },
        });
        console.log(controllerCreated
            ? `✅ Created Controller User: ${controllerUser.email}`
            : `ℹ️ Controller User already exists: ${controllerUser.email}`);
        // 4. Seed Kart Fleet Inventory
        const kartsData = [
            { kartNumber: 101, vinSerial: 'KM-2026-0101', status: 'available', operatingHours: 42.5 },
            { kartNumber: 102, vinSerial: 'KM-2026-0102', status: 'available', operatingHours: 38.0 },
            { kartNumber: 103, vinSerial: 'KM-2026-0103', status: 'in_maintenance', operatingHours: 115.2 },
            { kartNumber: 104, vinSerial: 'KM-2026-0104', status: 'available', operatingHours: 18.7 },
        ];
        const seededKarts = [];
        for (const k of kartsData) {
            const [kart, created] = await models_1.default.Kart.findOrCreate({
                where: { kartNumber: k.kartNumber },
                defaults: {
                    ...k,
                    notes: 'Standard GX270 9HP Racing Kart',
                },
            });
            seededKarts.push(kart);
            console.log(created
                ? `✅ Created Kart #${kart.kartNumber} (${kart.vinSerial})`
                : `ℹ️ Kart #${kart.kartNumber} already exists`);
        }
        // 5. Seed Spare Parts Inventory
        const partsData = [
            { partNumber: 'BRK-PAD-01', name: 'Ceramic Racing Brake Pads', quantityInStock: 24, minStockAlert: 8, unitPrice: 35.5 },
            { partNumber: 'TYR-RNG-02', name: 'Soft Compound Slick Tires (Set)', quantityInStock: 12, minStockAlert: 4, unitPrice: 120.0 },
            { partNumber: 'ENG-OIL-5W30', name: 'Synthetic Racing Engine Oil (1L)', quantityInStock: 50, minStockAlert: 15, unitPrice: 18.99 },
            { partNumber: 'DRV-BLT-04', name: 'Kevlar Torque Converter Belt', quantityInStock: 3, minStockAlert: 5, unitPrice: 42.0 },
        ];
        for (const p of partsData) {
            const [part, created] = await models_1.default.PartInventory.findOrCreate({
                where: { partNumber: p.partNumber },
                defaults: p,
            });
            console.log(created
                ? `✅ Created Part: ${part.name} [${part.partNumber}]`
                : `ℹ️ Part already exists: ${part.partNumber}`);
        }
        // 6. Seed Initial Maintenance Log
        const targetKart = seededKarts.find((k) => k.status === 'in_maintenance') || seededKarts[0];
        if (targetKart) {
            const [mLog, mCreated] = await models_1.default.MaintenanceLog.findOrCreate({
                where: {
                    kartId: targetKart.id,
                    serviceType: '100-Hour Engine Overhaul & Brake Replacement',
                },
                defaults: {
                    kartId: targetKart.id,
                    technicianId: mechanicUser.id,
                    serviceType: '100-Hour Engine Overhaul & Brake Replacement',
                    description: 'Replaced brake pads, flushed brake fluid, and performed full oil change.',
                    laborHours: 3.5,
                    totalCost: 155.5,
                    status: 'in_progress',
                },
            });
            console.log(mCreated
                ? `✅ Seeded Maintenance Log for Kart #${targetKart.kartNumber}`
                : `ℹ️ Maintenance log already exists for Kart #${targetKart.kartNumber}`);
        }
        // 7. Record Seeding Action in Audit Log
        await (0, auditLogger_1.logAudit)({
            userId: adminUser.id,
            action: 'SYSTEM_SEED_EXECUTION',
            entity: 'SystemDatabase',
            changes: {
                status: 'SUCCESS',
                seededAt: new Date().toISOString(),
            },
        });
        console.log('🎉 Idempotent Seeding Completed Successfully!');
    }
    catch (err) {
        console.error('❌ Error executing database seeding:', err);
        process.exit(1);
    }
    finally {
        await models_1.sequelize.close();
    }
}
// Execute if run directly via CLI
if (require.main === module) {
    seedEverything();
}
exports.default = seedEverything;
//# sourceMappingURL=seed-everything.js.map