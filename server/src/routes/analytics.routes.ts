import { Router } from 'express';
import { AnalyticsEntry } from '../models/Analytics';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { geminiService } from '../services/gemini.service';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();
router.use(authMiddleware);

// GET analytics overview & charts data
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    let entries = await AnalyticsEntry.find({ userId: req.user!.id }).sort({ date: -1 });

    // Aggregate summary metrics
    const totalViews = entries.reduce((acc, e) => acc + e.views, 0);
    const totalWatchTime = entries.reduce((acc, e) => acc + e.watchTimeSeconds, 0);
    const avgEngagement = entries.length > 0
      ? Math.round((entries.reduce((acc, e) => acc + e.engagementRate, 0) / entries.length) * 10) / 10
      : 0;
    const avgRetention3s = entries.length > 0
      ? Math.round((entries.reduce((acc, e) => acc + e.retentionAt3s, 0) / entries.length) * 10) / 10
      : 0;

    // Platform breakdown
    const platformMix: Record<string, number> = {
      reels: 0,
      shorts: 0,
      tiktok: 0,
      youtube: 0,
      linkedin: 0,
    };
    entries.forEach((e) => {
      platformMix[e.platform] = (platformMix[e.platform] || 0) + e.views;
    });

    // Hook performance breakdown
    const hookPerformance: Record<string, { views: number; count: number; retention3s: number }> = {};
    entries.forEach((e) => {
      if (!hookPerformance[e.hookType]) {
        hookPerformance[e.hookType] = { views: 0, count: 0, retention3s: 0 };
      }
      hookPerformance[e.hookType].views += e.views;
      hookPerformance[e.hookType].count += 1;
      hookPerformance[e.hookType].retention3s += e.retentionAt3s;
    });

    const hookStats = Object.entries(hookPerformance).map(([hookType, stats]) => ({
      hookType,
      avgViews: Math.round(stats.views / stats.count),
      avgRetention3s: Math.round(stats.retention3s / stats.count),
      count: stats.count,
    }));

    // AI Creator observations
    const observations = await geminiService.generateAnalyticsObservations(entries);

    res.json({
      success: true,
      data: {
        summary: {
          totalViews,
          totalWatchTimeSeconds: totalWatchTime,
          avgEngagementRate: avgEngagement,
          avgRetention3s,
          totalVideos: entries.length,
        },
        platformMix,
        hookStats,
        entries,
        observations,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST add manual entry or CSV row
router.post('/entry', async (req: AuthRequest, res, next) => {
  try {
    const entry = await AnalyticsEntry.create({
      ...req.body,
      userId: req.user!.id,
      date: req.body.date ? new Date(req.body.date) : new Date(),
    });

    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    next(err);
  }
});

// POST import sample batch
router.post('/seed-sample', async (req: AuthRequest, res, next) => {
  try {
    const sampleData = [
      {
        videoTitle: 'Stop Ruining Your Sound (Microphone Mistake)',
        platform: 'reels',
        hookType: 'visual_shock',
        views: 45200,
        watchTimeSeconds: 125000,
        avgWatchPercentage: 74,
        engagementRate: 6.8,
        shares: 1240,
        saves: 2190,
        retentionAt3s: 82,
        date: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      },
      {
        videoTitle: 'The $129 vs $800 Audio Battle',
        platform: 'shorts',
        hookType: 'contrarian',
        views: 89400,
        watchTimeSeconds: 231000,
        avgWatchPercentage: 68,
        engagementRate: 8.2,
        shares: 3410,
        saves: 4890,
        retentionAt3s: 79,
        date: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      },
      {
        videoTitle: 'Can you hear this noise reduction in action?',
        platform: 'tiktok',
        hookType: 'question',
        views: 124000,
        watchTimeSeconds: 310000,
        avgWatchPercentage: 81,
        engagementRate: 9.4,
        shares: 5800,
        saves: 7200,
        retentionAt3s: 89,
        date: new Date(Date.now() - 8 * 24 * 3600 * 1000),
      },
      {
        videoTitle: 'Why Creators Are Dumping Traditional Mics',
        platform: 'youtube',
        hookType: 'problem_solution',
        views: 18400,
        watchTimeSeconds: 89000,
        avgWatchPercentage: 58,
        engagementRate: 5.1,
        shares: 420,
        saves: 950,
        retentionAt3s: 66,
        date: new Date(Date.now() - 12 * 24 * 3600 * 1000),
      },
    ];

    const created = [];
    for (const item of sampleData) {
      const doc = await AnalyticsEntry.create({
        ...item,
        userId: req.user!.id,
      });
      created.push(doc);
    }

    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
});

export default router;
