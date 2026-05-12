import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import adminAuthRoutes from './routes/adminAuth.routes';
import ticketRoutes from './routes/ticket.routes';
import paymentRoutes from './routes/payment.routes';
import parkingPlanRoutes from './routes/parkingPlan.routes';
import officerRoutes from './routes/officer.routes';
import sessionRoutes from './routes/session.routes';
import settingsRoutes from './routes/settings.routes';
import reportsRoutes from './routes/reports.routes';
import penaltyRuleRoutes from './routes/penaltyRule.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', env.frontendUrl].filter(Boolean),
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'ParkSmart Owners Admin API is running',
    env: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/tickets', ticketRoutes);
app.use('/api/admin/payments', paymentRoutes);
app.use('/api/admin/parking-plans', parkingPlanRoutes);
app.use('/api/admin/officers', officerRoutes);
app.use('/api/admin/sessions', sessionRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/admin/reports', reportsRoutes);
app.use('/api/admin/penalty-rules', penaltyRuleRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    app.listen(env.port, () => {
      console.log(`ParkSmart Owners Admin API running at http://localhost:${env.port}`);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown startup error';
    console.error(`[Startup] Failed to start server: ${message}`);
    process.exit(1);
  }
};

void startServer();