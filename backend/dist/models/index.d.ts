import { Sequelize } from 'sequelize';
import sequelize from '../config/database';
export interface DBInterface {
    sequelize: Sequelize;
    Sequelize: typeof Sequelize;
    [key: string]: any;
}
declare const db: DBInterface;
export { sequelize, Sequelize };
export default db;
