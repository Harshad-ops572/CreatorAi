import { Router } from 'express';
import { Product } from '../models/Product';
import { Script } from '../models/Script';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { geminiService } from '../services/gemini.service';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();
router.use(authMiddleware);

// POST Multi-Platform Adaptation
router.post('/project/:projectId/platform-adaptation', aiLimiter, async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.params;

    const product = await Product.findOne({ projectId, userId: req.user!.id });
    if (!product) {
      res.status(400).json({ success: false, error: 'Product intelligence profile required.' });
      return;
    }

    const script = await Script.findOne({ projectId, userId: req.user!.id, isCurrent: true });
    const scriptContext = {
      title: script?.title || product.profile.name,
      hook: script?.sections?.[0]?.narration || 'Amazing new gear',
      totalDurationSeconds: script?.totalDurationSeconds || 30,
    };

    const adaptations = await geminiService.adaptForPlatforms(product.profile, scriptContext);

    res.json({ success: true, data: adaptations });
  } catch (err) {
    next(err);
  }
});

// POST Thumbnail Concepts Generator
router.post('/project/:projectId/thumbnail-concepts', aiLimiter, async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.params;

    const product = await Product.findOne({ projectId, userId: req.user!.id });
    if (!product) {
      res.status(400).json({ success: false, error: 'Product intelligence profile required.' });
      return;
    }

    const script = await Script.findOne({ projectId, userId: req.user!.id, isCurrent: true });
    const title = script?.title || product.profile.name;

    const concepts = await geminiService.generateThumbnailConcepts(product.profile, title);

    res.json({ success: true, data: concepts });
  } catch (err) {
    next(err);
  }
});

// POST Captions and Post Generator
router.post('/project/:projectId/caption-generator', aiLimiter, async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.params;
    const { platform = 'reels' } = req.body;

    const product = await Product.findOne({ projectId, userId: req.user!.id });
    if (!product) {
      res.status(400).json({ success: false, error: 'Product intelligence profile required.' });
      return;
    }

    const script = await Script.findOne({ projectId, userId: req.user!.id, isCurrent: true });
    const scriptContext = {
      title: script?.title || product.profile.name,
      hook: script?.sections?.[0]?.narration || 'Check this out',
      totalDurationSeconds: script?.totalDurationSeconds || 30,
    };

    const adaptations = await geminiService.adaptForPlatforms(product.profile, scriptContext);
    const platformData = adaptations[platform] || adaptations['reels'];

    res.json({
      success: true,
      data: {
        platform,
        caption: platformData.description,
        hook: platformData.hook,
        hashtags: platformData.hashtags,
        cta: platformData.callToAction,
        bestTime: platformData.bestTimeToPost,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
