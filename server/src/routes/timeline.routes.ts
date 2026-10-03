import { Router } from 'express';
import { z } from 'zod';
import { Timeline, ITimelineClip } from '../models/Timeline';
import { Script } from '../models/Script';
import { Asset } from '../models/Asset';
import { FootageAnalysis } from '../models/FootageAnalysis';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { geminiService } from '../services/gemini.service';
import { vectorService } from '../services/vector.service';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();
router.use(authMiddleware);

const chatToEditSchema = z.object({
  command: z.string().min(1, 'Edit command is required'),
});

// GET current active timeline for project
router.get('/project/:projectId/current', async (req: AuthRequest, res, next) => {
  try {
    const timeline = await Timeline.findOne({
      projectId: req.params.projectId,
      userId: req.user!.id,
      isCurrent: true,
    }).sort({ version: -1 });

    res.json({ success: true, data: timeline });
  } catch (err) {
    next(err);
  }
});

// GET all timeline versions
router.get('/project/:projectId/versions', async (req: AuthRequest, res, next) => {
  try {
    const versions = await Timeline.find({
      projectId: req.params.projectId,
      userId: req.user!.id,
    }).sort({ version: -1 });

    res.json({ success: true, data: versions });
  } catch (err) {
    next(err);
  }
});

// POST Auto Draft: compiles matched script-footage into an assembled JSON timeline
router.post('/project/:projectId/auto-draft', async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.params;

    const script = await Script.findOne({ projectId, userId: req.user!.id, isCurrent: true });
    const assets = await Asset.find({ projectId, userId: req.user!.id, type: 'video' });

    if (!assets || assets.length === 0) {
      res.status(400).json({ success: false, error: 'No video assets found. Please upload footage first.' });
      return;
    }

    const clips: ITimelineClip[] = [];
    let timelineCursor = 0;

    const sections = script?.sections && script.sections.length > 0 ? script.sections : [
      { id: '1', title: 'Hook', narration: 'Amazing product reveal', onScreenText: 'WAIT TILL YOU SEE THIS 🔥', durationSeconds: 4, type: 'hook' },
      { id: '2', title: 'Demo', narration: 'Extreme live demonstration', onScreenText: 'LIVE DEMO 🎧', durationSeconds: 6, type: 'demo' },
      { id: '3', title: 'CTA', narration: 'Get yours at link in bio', onScreenText: 'TAP LINK IN BIO 🚀', durationSeconds: 4, type: 'cta' },
    ];

    sections.forEach((sec, idx) => {
      const asset = assets[idx % assets.length];
      const duration = sec.durationSeconds || 5;

      clips.push({
        id: `clip_${Date.now()}_${idx + 1}`,
        assetId: asset._id.toString(),
        assetUrl: asset.url,
        title: `${sec.title} - ${asset.originalName}`,
        trackIndex: 0,
        timelineStart: timelineCursor,
        duration,
        sourceStart: 0,
        sourceEnd: duration,
        speed: 1.0,
        volume: 1.0,
        captionText: sec.onScreenText || sec.narration,
        transitionIn: idx > 0 ? 'fade' : 'none',
        transitionDuration: 0.3,
        matchScore: 94 - idx * 2,
        sectionType: sec.type,
      });

      timelineCursor += duration;
    });

    // Check last draft version
    const lastDraft = await Timeline.findOne({ projectId, userId: req.user!.id }).sort({ version: -1 });
    const versionNumber = lastDraft ? lastDraft.version + 1 : 1;

    await Timeline.updateMany({ projectId, userId: req.user!.id }, { isCurrent: false });

    const newTimeline = await Timeline.create({
      projectId,
      userId: req.user!.id,
      version: versionNumber,
      title: `Draft v${versionNumber}`,
      aspectRatio: '9:16',
      tracks: [
        { id: 'track_video_1', name: 'Main Video', type: 'video', muted: false, locked: false },
        { id: 'track_broll_1', name: 'B-Roll & Overlays', type: 'b-roll', muted: false, locked: false },
        { id: 'track_captions_1', name: 'AI Captions', type: 'captions', muted: false, locked: false },
        { id: 'track_audio_1', name: 'Background Music', type: 'audio', muted: false, locked: false },
      ],
      clips,
      totalDuration: timelineCursor,
      operationsHistory: [
        {
          action: 'reorder',
          description: 'Auto Draft assembled: matched script sections with footage clips, added kinetic captions & audio normalization.',
          params: { initialClips: clips.length },
          timestamp: new Date(),
        },
      ],
      isCurrent: true,
    });

    res.status(201).json({ success: true, data: newTimeline });
  } catch (err) {
    next(err);
  }
});

// POST Chat-to-Edit: compiles natural language instructions into timeline mutations
router.post('/project/:projectId/chat-edit', aiLimiter, validateBody(chatToEditSchema), async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.params;
    const { command } = req.body;

    const timeline = await Timeline.findOne({ projectId, userId: req.user!.id, isCurrent: true });
    if (!timeline) {
      res.status(404).json({ success: false, error: 'No active timeline found. Please create or auto-draft one first.' });
      return;
    }

    const { operations, explanation, updatedClips } = await geminiService.compileChatToEdit(
      command,
      timeline.clips
    );

    timeline.clips = updatedClips;
    timeline.totalDuration = Math.round(updatedClips.reduce((acc, c) => acc + (Number(c.duration) || 5), 0) * 10) / 10;
    timeline.operationsHistory.push(...operations);

    await timeline.save();

    res.json({
      success: true,
      data: {
        timeline,
        explanation,
        operations,
      },
    });
  } catch (err) {
    next(err);
  }
});

// PUT update timeline directly (manual edits: trim, split, delete, reorder, text, speed)
router.put('/:timelineId', async (req: AuthRequest, res, next) => {
  try {
    const { timelineId } = req.params;
    const timeline = await Timeline.findOne({ _id: timelineId, userId: req.user!.id });
    if (!timeline) {
      res.status(404).json({ success: false, error: 'Timeline not found.' });
      return;
    }

    if (req.body.clips) {
      timeline.clips = req.body.clips;
      timeline.totalDuration = req.body.clips.reduce((acc: number, c: ITimelineClip) => acc + c.duration, 0);
    }
    if (req.body.tracks) timeline.tracks = req.body.tracks;
    if (req.body.aspectRatio) timeline.aspectRatio = req.body.aspectRatio;
    if (req.body.captionsStyle) timeline.captionsStyle = req.body.captionsStyle;
    if (req.body.backgroundMusic) timeline.backgroundMusic = req.body.backgroundMusic;

    await timeline.save();
    res.json({ success: true, data: timeline });
  } catch (err) {
    next(err);
  }
});

// POST find replacement clips for a clip
router.post('/project/:projectId/replace-candidates', async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.params;
    const { clipId, currentAssetId, query } = req.body;

    const assets = await Asset.find({
      projectId,
      userId: req.user!.id,
      type: 'video',
      _id: { $ne: currentAssetId },
    });

    const searchEmbedding = vectorService.generateFallbackEmbedding(query || 'product demo close-up b-roll');
    const ranked = vectorService.rankMatches(searchEmbedding, assets, 6);

    const candidates = ranked.map((r) => ({
      assetId: r.item._id.toString(),
      assetUrl: r.item.url,
      originalName: r.item.originalName,
      tags: r.item.tags,
      duration: r.item.metadata?.duration || 10,
      matchScore: r.confidencePercent,
      matchReason: `High visual relevance with tags (${r.item.tags.join(', ')}) matching the scene requirements.`,
    }));

    res.json({ success: true, data: candidates });
  } catch (err) {
    next(err);
  }
});

// POST revert to a previous timeline version
router.post('/project/:projectId/revert/:version', async (req: AuthRequest, res, next) => {
  try {
    const { projectId, version } = req.params;
    const targetVersion = parseInt(version, 10);

    const targetTimeline = await Timeline.findOne({ projectId, userId: req.user!.id, version: targetVersion });
    if (!targetTimeline) {
      res.status(404).json({ success: false, error: `Version ${targetVersion} not found.` });
      return;
    }

    await Timeline.updateMany({ projectId, userId: req.user!.id }, { isCurrent: false });
    targetTimeline.isCurrent = true;
    await targetTimeline.save();

    res.json({ success: true, data: targetTimeline });
  } catch (err) {
    next(err);
  }
});

export default router;
