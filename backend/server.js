require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const kartRoutes = require('./routes/kartRoutes');
const stockRoutes = require('./routes/stockRoutes');
const equipmentRequestRoutes = require('./routes/equipmentRequestRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { startDailyReminderJob } = require('./cron/dailyReminder');
const repairReportRoutes = require('./routes/repairReportRoutes');

const app = express();

// Allow requests from the configured frontend URL only
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'KartMaint API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/karts', kartRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/equipment-requests', equipmentRequestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/repair-reports', repairReportRoutes);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    await sequelize.sync({ alter: true });
    console.log('✅ Models synced');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
    startDailyReminderJob();
  } catch (err) {
    console.error('❌ Unable to connect to the database:', err.message);
  }
}

if (process.env.NODE_ENV !== 'test') {
  // Validate required environment variables before starting
  const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET', 'FRONTEND_URL'];
  const missing = REQUIRED_ENV.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
  start();
}

module.exports = app;