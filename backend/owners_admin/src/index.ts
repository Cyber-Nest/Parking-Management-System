// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import { env } from './config/env';
// import { connectDatabase } from './config/database';
// import adminAuthRoutes from './routes/adminAuth.routes';
// import ticketRoutes from './routes/ticket.routes';
// import paymentRoutes from './routes/payment.routes';
// import parkingPlanRoutes from './routes/parkingPlan.routes';
// import officerRoutes from './routes/officer.routes';
// import sessionRoutes from './routes/session.routes';
// import settingsRoutes from './routes/settings.routes';
// import reportsRoutes from './routes/reports.routes';
// import penaltyRuleRoutes from './routes/penaltyRule.routes';
// import taxRoutes from './routes/tax.routes';
// import pricingRoutes from './routes/pricing.routes';
// import userRoutes from './routes/user.routes';
// import roleRoutes from './routes/role.routes';
// import customerRoutes from './routes/customer.routes';
// import parkingZoneRoutes from './routes/parkingZone.routes';
// import enforcementRoutes from './routes/enforcement.routes';
// import officerAuthRoutes from './routes/officerAuth.routes';
// import mediaRoutes from './routes/media.routes';
// import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware';
// import { getCloudinarySetupError, isCloudinaryConfigured } from './services/cloudinary.service';

// dotenv.config();

// const app = express();

// const corsAllowList = [
//   'http://localhost:3000',
//   'http://127.0.0.1:3000',
//   'http://localhost:3001',
//   'http://127.0.0.1:3001',
//   'http://localhost:5173',
//   env.frontendUrl,
//   ...(process.env.CORS_ORIGINS ?? '')
//     .split(',')
//     .map((s) => s.trim())
//     .filter(Boolean),
// ].filter((v, i, a) => Boolean(v) && a.indexOf(v) === i) as string[];

// app.use(
//   cors({
//     credentials: true,
//     origin: env.nodeEnv === 'production' ? corsAllowList : true,
//   })
// );
// app.use(express.json({ limit: '12mb' }));
// app.use(express.urlencoded({ extended: true, limit: '12mb' }));

// app.get('/health', (_req, res) => {
//   res.status(200).json({
//     success: true,
//     message: 'ParkSmart Owners Admin API is running',
//     env: env.nodeEnv,
//     timestamp: new Date().toISOString(),
//   });
// });

// app.use('/api/admin/auth', adminAuthRoutes);
// app.use('/api/admin/tickets', ticketRoutes);
// app.use('/api/admin/payments', paymentRoutes);
// app.use('/api/admin/parking-plans', parkingPlanRoutes);
// app.use('/api/admin/parking-zones', parkingZoneRoutes);
// app.use('/api/admin/officers', officerRoutes);
// app.use('/api/admin/sessions', sessionRoutes);
// app.use('/api/admin/settings', settingsRoutes);
// app.use('/api/admin/reports', reportsRoutes);
// app.use('/api/admin/penalty-rules', penaltyRuleRoutes);
// app.use('/api/admin/taxes', taxRoutes);
// app.use('/api/admin/pricings', pricingRoutes);
// app.use('/api/admin/users', userRoutes);
// app.use('/api/admin/roles', roleRoutes);
// app.use('/api/customer', customerRoutes);
// app.use('/api/officer/auth', officerAuthRoutes);
// app.use('/api/officer', enforcementRoutes);
// app.use('/api/media', mediaRoutes);
// app.use(notFoundHandler);
// app.use(errorHandler);

// const startServer = async (): Promise<void> => {
//   try {
//     await connectDatabase();
//     app.listen(env.port, () => {
//       console.log(`ParkSmart Owners Admin API running at http://localhost:${env.port}`);
//       const cloudinarySetupError = getCloudinarySetupError();
//       console.log(
//         isCloudinaryConfigured()
//           ? '[Cloudinary] Media uploads enabled (URLs stored in database)'
//           : cloudinarySetupError
//             ? `[Cloudinary] NOT ready — ${cloudinarySetupError}`
//             : '[Cloudinary] NOT configured — set CLOUDINARY_URL in .env for media uploads',
//       );
//     });
//   } catch (error) {
//     const message = error instanceof Error ? error.message : 'Unknown startup error';
//     console.error(`[Startup] Failed to start server: ${message}`);
//     process.exit(1);
//   }
// };

// void startServer();

import dotenv from "dotenv";

import app from "./app";

import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { ensureParkingPlanSchema, ensureSystemSettingsSchema } from "./config/schema-migration";

import {
  getCloudinarySetupError,
  isCloudinaryConfigured,
} from "./services/cloudinary.service";

dotenv.config();

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    await ensureParkingPlanSchema();
    await ensureSystemSettingsSchema();

    app.listen(env.port, () => {
      console.log(
        `ParkSmart Owners Admin API running at http://localhost:${env.port}`,
      );

      const cloudinarySetupError = getCloudinarySetupError();

      console.log(
        isCloudinaryConfigured()
          ? "[Cloudinary] Media uploads enabled (URLs stored in database)"
          : cloudinarySetupError
            ? `[Cloudinary] NOT ready — ${cloudinarySetupError}`
            : "[Cloudinary] NOT configured — set CLOUDINARY_URL in .env for media uploads",
      );
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown startup error";

    console.error(`[Startup] Failed to start server: ${message}`);

    process.exit(1);
  }
};

void startServer();
