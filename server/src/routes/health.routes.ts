import { Router } from 'express';
import mongoose from 'mongoose';
import { env } from '../config/env';

const router = Router();

router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const hasGeminiKey = Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== '');

  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      database: dbStatus,
      geminiAi: hasGeminiKey ? 'configured' : 'fallback-active',
      nodeVersion: process.version,
    },
  });
});

export default router;
