import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env } from './config/env';
import { connectDB } from './config/db';
import { ensureSeedData } from './utils/autoSeed';
import { standardLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import productRoutes from './routes/product.routes';
import ideasRoutes from './routes/ideas.routes';
import scriptRoutes from './routes/script.routes';
import assetRoutes from './routes/asset.routes';
import footageRoutes from './routes/footage.routes';
import timelineRoutes from './routes/timeline.routes';
import exportRoutes from './routes/export.routes';
import creatorRoutes from './routes/creator.routes';
import workflowRoutes from './routes/workflow.routes';
import analyticsRoutes from './routes/analytics.routes';
import jobRoutes from './routes/job.routes';
import healthRoutes from './routes/health.routes';

const app = express();

// Security Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Crucial for client media playback
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile, server-to-server)
      if (!origin) return callback(null, true);
      // Allow any vercel deployment, localhost, or configured CLIENT_URL
      if (
        origin === env.CLIENT_URL ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate Limiter
app.use('/api', standardLimiter);

// Serve static uploads
const uploadsPath = path.resolve(process.cwd(), env.UPLOAD_DIR);
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/products', productRoutes);
app.use('/api/ideas', ideasRoutes);
app.use('/api/scripts', scriptRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/footage', footageRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/creator', creatorRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/jobs', jobRoutes);

// Error Handler
app.use(errorHandler);

// Server startup
async function startServer() {
  await connectDB();
  await ensureSeedData();

  app.listen(env.PORT, () => {
    console.log(`=========================================`);
    console.log(` CreatorAi Backend Server Running!`);
    console.log(` URL: http://localhost:${env.PORT}`);
    console.log(` Client Origin: ${env.CLIENT_URL}`);
    console.log(` Health: http://localhost:${env.PORT}/api/health`);
    console.log(`=========================================`);
  });
}

startServer();
