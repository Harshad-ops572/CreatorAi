import { Router } from 'express';
import { z } from 'zod';
import { Idea } from '../models/Idea';
import { Product } from '../models/Product';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { geminiService } from '../services/gemini.service';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();
router.use(authMiddleware);

const generateIdeasSchema = z.object({
  format: z.enum(['Reel', 'Short', 'YouTube video', 'Ad', 'Review', 'Tutorial', 'Unboxing', 'Educational', 'UGC']).default('Reel'),
  customAngle: z.string().optional(),
});

// GET all ideas for project
router.get('/project/:projectId', async (req: AuthRequest, res, next) => {
  try {
    const ideas = await Idea.find({
      projectId: req.params.projectId,
      userId: req.user!.id,
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: ideas });
  } catch (err) {
    next(err);
  }
});

// POST generate 3+ product-specific ideas with Gemini
router.post('/project/:projectId/generate', aiLimiter, validateBody(generateIdeasSchema), async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.params;
    const { format } = req.body;

    const product = await Product.findOne({ projectId, userId: req.user!.id });
    if (!product) {
      res.status(400).json({
        success: false,
        error: 'Please upload product details or generate a product profile first.',
      });
      return;
    }

    const generatedIdeas = await geminiService.generateContentIdeas(product.profile, format);

    const savedIdeas = [];
    for (const item of generatedIdeas) {
      const doc = await Idea.create({
        projectId,
        userId: req.user!.id,
        title: item.title,
        format: format as any,
        hook: item.hook,
        angle: item.angle,
        targetDurationSeconds: item.targetDurationSeconds || 30,
        whyItWorks: item.whyItWorks,
        callToAction: item.callToAction,
        selected: false,
      });
      savedIdeas.push(doc);
    }

    res.status(201).json({ success: true, data: savedIdeas });
  } catch (err) {
    next(err);
  }
});

// POST select/use idea
router.post('/:ideaId/select', async (req: AuthRequest, res, next) => {
  try {
    const { ideaId } = req.params;
    const idea = await Idea.findOne({ _id: ideaId, userId: req.user!.id });
    if (!idea) {
      res.status(404).json({ success: false, error: 'Idea not found.' });
      return;
    }

    // Unselect others in same project
    await Idea.updateMany({ projectId: idea.projectId, userId: req.user!.id }, { selected: false });

    idea.selected = true;
    await idea.save();

    res.json({ success: true, data: idea });
  } catch (err) {
    next(err);
  }
});

// DELETE an idea
router.delete('/:ideaId', async (req: AuthRequest, res, next) => {
  try {
    const idea = await Idea.findOneAndDelete({ _id: req.params.ideaId, userId: req.user!.id });
    if (!idea) {
      res.status(404).json({ success: false, error: 'Idea not found.' });
      return;
    }
    res.json({ success: true, data: { message: 'Idea deleted.' } });
  } catch (err) {
    next(err);
  }
});

export default router;
