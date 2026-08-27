const sequelize = require('./config/database');

async function checkSchema() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    console.log('Tables in database:', tables);
    
    for (const table of tables) {
      const description = await queryInterface.describeTable(table);
      console.log(`\nTable: ${table}`);
      Object.keys(description).forEach(col => {
        console.log(`  - ${col}: ${description[col].type} (allowNull: ${description[col].allowNull})`);
      });
    }
  } catch (err) {
    console.error('Error describing schema:', err);
  } finally {
    await sequelize.close();
  }
}

checkSchema();
