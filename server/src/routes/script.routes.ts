import { Router } from 'express';
import { z } from 'zod';
import { Script } from '../models/Script';
import { Product } from '../models/Product';
import { Idea } from '../models/Idea';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { geminiService } from '../services/gemini.service';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();
router.use(authMiddleware);

const generateScriptSchema = z.object({
  ideaId: z.string().optional(),
  title: z.string().optional(),
  format: z.string().default('Reel'),
  targetDurationSeconds: z.number().optional().default(30),
});

// GET current script for project
router.get('/project/:projectId/current', async (req: AuthRequest, res, next) => {
  try {
    const script = await Script.findOne({
      projectId: req.params.projectId,
      userId: req.user!.id,
      isCurrent: true,
    }).sort({ version: -1 });

    res.json({ success: true, data: script });
  } catch (err) {
    next(err);
  }
});

// GET all script versions for project
router.get('/project/:projectId/versions', async (req: AuthRequest, res, next) => {
  try {
    const scripts = await Script.find({
      projectId: req.params.projectId,
      userId: req.user!.id,
    }).sort({ version: -1 });

    res.json({ success: true, data: scripts });
  } catch (err) {
    next(err);
  }
});

// POST generate script + shot plan
router.post('/project/:projectId/generate', aiLimiter, validateBody(generateScriptSchema), async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.params;
    const { ideaId, title, format, targetDurationSeconds } = req.body;

    const product = await Product.findOne({ projectId, userId: req.user!.id });
    if (!product) {
      res.status(400).json({ success: false, error: 'Product intelligence profile required before generating script.' });
      return;
    }

    let selectedIdea: any = null;
    if (ideaId) {
      selectedIdea = await Idea.findOne({ _id: ideaId, userId: req.user!.id });
    } else {
      selectedIdea = await Idea.findOne({ projectId, userId: req.user!.id, selected: true });
    }

    const scriptIdeaContext = {
      title: title || selectedIdea?.title || `Transform Your Content with ${product.profile.name}`,
      hook: selectedIdea?.hook || `Stop scrolling if you want your videos to look 10x better.`,
      format: format || selectedIdea?.format || 'Reel',
      targetDurationSeconds: targetDurationSeconds || selectedIdea?.targetDurationSeconds || 30,
    };

    const generated = await geminiService.generateScriptAndShotPlan(product.profile, scriptIdeaContext);

    // Determine new version
    const lastScript = await Script.findOne({ projectId, userId: req.user!.id }).sort({ version: -1 });
    const nextVersion = lastScript ? lastScript.version + 1 : 1;

    // Set existing scripts to not current
    await Script.updateMany({ projectId, userId: req.user!.id }, { isCurrent: false });

    const newScript = await Script.create({
      projectId,
      userId: req.user!.id,
      ideaId: selectedIdea?._id,
      title: generated.title,
      version: nextVersion,
      format: scriptIdeaContext.format,
      totalDurationSeconds: generated.totalDurationSeconds,
      sections: generated.sections,
      tone: generated.tone,
      isCurrent: true,
    });

    res.status(201).json({ success: true, data: newScript });
  } catch (err) {
    next(err);
  }
});

// PUT update script sections or details manually
router.put('/:scriptId', async (req: AuthRequest, res, next) => {
  try {
    const { scriptId } = req.params;
    const script = await Script.findOne({ _id: scriptId, userId: req.user!.id });
    if (!script) {
      res.status(404).json({ success: false, error: 'Script not found.' });
      return;
    }

    if (req.body.title) script.title = req.body.title;
    if (req.body.sections) {
      script.sections = req.body.sections;
      script.totalDurationSeconds = script.sections.reduce((acc, s) => acc + (s.durationSeconds || 5), 0);
    }
    if (req.body.tone) script.tone = req.body.tone;

    await script.save();
    res.json({ success: true, data: script });
  } catch (err) {
    next(err);
  }
});

export default router;
