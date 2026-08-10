require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');
const User = require('./models/User');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'KartMaint API is running' });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    await sequelize.sync(); // creates the users table if it doesn't exist yet
    console.log('✅ Models synced');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Unable to connect to the database:', err.message);
  }
}

start();