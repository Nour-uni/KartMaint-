"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sequelize = exports.sequelize = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sequelize_1 = require("sequelize");
Object.defineProperty(exports, "Sequelize", { enumerable: true, get: function () { return sequelize_1.Sequelize; } });
const database_1 = __importDefault(require("../config/database"));
exports.sequelize = database_1.default;
const db = {
    sequelize: database_1.default,
    Sequelize: sequelize_1.Sequelize,
};
// Auto-load all model files dynamically in src/models
const basename = path_1.default.basename(__filename);
const modelsDir = __dirname;
const modelFiles = fs_1.default
    .readdirSync(modelsDir)
    .filter((file) => {
    return (file.indexOf('.') !== 0 &&
        file !== basename &&
        (file.endsWith('.ts') || file.endsWith('.js')) &&
        !file.endsWith('.d.ts'));
});
// Initialize each model
for (const file of modelFiles) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const modelModule = require(path_1.default.join(modelsDir, file));
    const ModelClass = modelModule.default || modelModule[Object.keys(modelModule)[0]];
    if (ModelClass && typeof ModelClass.initModel === 'function') {
        const initializedModel = ModelClass.initModel(database_1.default);
        db[initializedModel.name] = initializedModel;
    }
    else if (ModelClass && ModelClass.prototype && ModelClass.prototype.sequelize) {
        db[ModelClass.name] = ModelClass;
    }
}
// Execute associations across all registered models
Object.keys(db).forEach((modelName) => {
    if (db[modelName] && typeof db[modelName].associate === 'function') {
        db[modelName].associate(db);
    }
});
exports.default = db;
//# sourceMappingURL=index.js.map