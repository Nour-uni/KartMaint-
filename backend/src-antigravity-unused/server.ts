import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import db, { sequelize } from './models';
import { logAudit } from './utils/auditLogger';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
app.use(express.json());

// Basic CORS headers (replace with the `cors` package when frontend is ready)
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (_req.method === 'OPTIONS') { res.sendStatus(204); return; }
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Health Check Endpoint
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: 'HEALTHY',
      database: 'CONNECTED',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'UNHEALTHY',
      error: err.message,
    });
  }
});

// Demo API Endpoint: Get Kart Fleet
app.get('/api/karts', async (_req: Request, res: Response) => {
  try {
    const karts = await db.Kart.findAll({
      include: [
        {
          model: db.MaintenanceLog,
          as: 'maintenanceLogs',
          limit: 3,
        },
      ],
      order: [['kart_number', 'ASC']],
    });
    res.json({ success: true, count: karts.length, data: karts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    console.log('🔄 Connecting to PostgreSQL database...');
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection established successfully.');

    // Sync database models
    await sequelize.sync({ force: false });
    console.log('✅ Models initialized and synchronized.');

    app.listen(PORT, () => {
      console.log(`🚀 KartMaint Server listening on http://localhost:${PORT}`);
      logAudit({
        action: 'SERVER_BOOTSTRAP',
        entity: 'SystemServer',
        changes: { port: PORT, status: 'RUNNING' },
      });
    });
  } catch (err: any) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

// ── Global Error Handler ─────────────────────────────────────────────────────
// Must be defined AFTER all routes
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

if (require.main === module) {
  bootstrap();
}

export default app;
