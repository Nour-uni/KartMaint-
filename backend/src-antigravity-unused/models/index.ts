import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';
import sequelize from '../config/database';

export interface DBInterface {
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
  [key: string]: any;
}

const db: DBInterface = {
  sequelize,
  Sequelize,
};

// Auto-load all model files dynamically in src/models
const basename = path.basename(__filename);
const modelsDir = __dirname;

const modelFiles = fs
  .readdirSync(modelsDir)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      (file.endsWith('.ts') || file.endsWith('.js')) &&
      !file.endsWith('.d.ts')
    );
  });

// Initialize each model
for (const file of modelFiles) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const modelModule = require(path.join(modelsDir, file));
  const ModelClass = modelModule.default || modelModule[Object.keys(modelModule)[0]];

  if (ModelClass && typeof ModelClass.initModel === 'function') {
    const initializedModel = ModelClass.initModel(sequelize);
    db[initializedModel.name] = initializedModel;
  } else if (ModelClass && ModelClass.prototype && ModelClass.prototype.sequelize) {
    db[ModelClass.name] = ModelClass;
  }
}

// Execute associations across all registered models
Object.keys(db).forEach((modelName) => {
  if (db[modelName] && typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

export { sequelize, Sequelize };
export default db;
