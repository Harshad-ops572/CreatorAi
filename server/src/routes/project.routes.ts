import { Router } from 'express';
import { z } from 'zod';
import { Project } from '../models/Project';
import { Product } from '../models/Product';
import { Idea } from '../models/Idea';
import { Script } from '../models/Script';
import { Asset } from '../models/Asset';
import { FootageAnalysis } from '../models/FootageAnalysis';
import { Timeline } from '../models/Timeline';
import { Job } from '../models/Job';
import { WorkflowTask } from '../models/WorkflowTask';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { storageService } from '../services/storage.service';

const router = Router();
router.use(authMiddleware);

const createProjectSchema = z.object({
  title: z.string().min(1, 'Project title is required'),
  description: z.string().optional().default(''),
  targetPlatform: z.enum(['reels', 'shorts', 'tiktok', 'youtube', 'linkedin']).default('reels'),
  aspectRatio: z.enum(['9:16', '16:9', '1:1']).default('9:16'),
});

const updateProjectSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['idea', 'scripting', 'recording', 'editing', 'ready', 'published']).optional(),
  targetPlatform: z.enum(['reels', 'shorts', 'tiktok', 'youtube', 'linkedin']).optional(),
  aspectRatio: z.enum(['9:16', '16:9', '1:1']).optional(),
  thumbnailUrl: z.string().optional(),
});

// GET all projects for logged-in user
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const projects = await Project.find({ userId: req.user!.id }).sort({ updatedAt: -1 });
    res.json({ success: true, data: projects });
  } catch (err) {
    next(err);
  }
});

// POST create project
router.post('/', validateBody(createProjectSchema), async (req: AuthRequest, res, next) => {
  try {
    const project = await Project.create({
      ...req.body,
      userId: req.user!.id,
    });

    // Create initial timeline for this project
    await Timeline.create({
      projectId: project._id,
      userId: req.user!.id,
      version: 1,
      title: 'Draft v1',
      aspectRatio: project.aspectRatio,
      tracks: [
        { id: 'track_video_1', name: 'Main Video', type: 'video', muted: false, locked: false },
        { id: 'track_broll_1', name: 'B-Roll & Overlays', type: 'b-roll', muted: false, locked: false },
        { id: 'track_captions_1', name: 'AI Captions', type: 'captions', muted: false, locked: false },
        { id: 'track_audio_1', name: 'Background Music', type: 'audio', muted: false, locked: false },
      ],
      clips: [],
      totalDuration: 0,
      isCurrent: true,
    });

    // Create initial Kanban workflow tasks
    const stages = [
      { stage: 'idea', title: 'Brainstorm & Select Viral Hook', priority: 'high' },
      { stage: 'scripting', title: 'Generate AI Timed Script & Shot Plan', priority: 'high' },
      { stage: 'recording', title: 'Upload Product Media & B-Roll Clips', priority: 'medium' },
      { stage: 'editing', title: 'Auto-Assemble Draft & Chat-to-Edit', priority: 'medium' },
      { stage: 'ready', title: 'Export 9:16 Reel & Platform Adaptations', priority: 'low' },
    ];

    for (let i = 0; i < stages.length; i++) {
      await WorkflowTask.create({
        projectId: project._id,
        userId: req.user!.id,
        stage: stages[i].stage as any,
        title: stages[i].title,
        priority: stages[i].priority as any,
        order: i,
      });
    }

    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
});

// GET single project details
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user!.id });
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found.' });
      return;
    }
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
});

// PATCH update project
router.patch('/:id', validateBody(updateProjectSchema), async (req: AuthRequest, res, next) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      { $set: req.body },
      { new: true }
    );
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found.' });
      return;
    }
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
});

// DELETE project (permanently removes all associated data and storage files)
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findOne({ _id: projectId, userId: req.user!.id });
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found.' });
      return;
    }

    // Delete all linked documents
    await Promise.all([
      Project.deleteOne({ _id: projectId }),
      Product.deleteMany({ projectId }),
      Idea.deleteMany({ projectId }),
      Script.deleteMany({ projectId }),
      Asset.deleteMany({ projectId }),
      FootageAnalysis.deleteMany({ projectId }),
      Timeline.deleteMany({ projectId }),
      Job.deleteMany({ projectId }),
      WorkflowTask.deleteMany({ projectId }),
    ]);

    // Delete local media folder for this project
    await storageService.deleteProjectDirectory(projectId);

    res.json({ success: true, data: { message: 'Project and all associated media permanently removed.' } });
  } catch (err) {
    next(err);
  }
});

export default router;
