import { Router } from 'express';
import path from 'path';
import { Timeline } from '../models/Timeline';
import { Asset } from '../models/Asset';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { jobQueueService } from '../services/jobQueue.service';
import { storageService } from '../services/storage.service';
import { ffmpegService } from '../services/ffmpeg.service';

const router = Router();
router.use(authMiddleware);

// POST trigger video export render job
router.post('/project/:projectId/render', async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.params;
    const { aspectRatio, format } = req.body;

    const timeline = await Timeline.findOne({ projectId, userId: req.user!.id, isCurrent: true });
    if (!timeline || timeline.clips.length === 0) {
      res.status(400).json({ success: false, error: 'Cannot export an empty timeline. Please add clips or auto-draft first.' });
      return;
    }

    const job = await jobQueueService.enqueue(projectId, req.user!.id, 'render_export');

    // Asynchronously handle rendering
    jobQueueService.registerHandler('render_export', async (currentJob, updateProgress) => {
      await updateProgress(10, 'Preparing media assets and timeline tracks...');

      const targetAspect = aspectRatio || timeline.aspectRatio || '9:16';
      const outputFilename = `export_${projectId}_${Date.now()}.${format || 'mp4'}`;
      const projectDir = storageService.getProjectDir(projectId);
      const outputFilePath = path.join(projectDir, outputFilename);

      await updateProgress(30, 'Trimming and sequencing video segments...');

      // Map clips to absolute local file paths
      const renderClips = timeline.clips.map((clip) => {
        const localPath = storageService.getAbsolutePathFromUrl(clip.assetUrl);
        return {
          filePath: localPath,
          sourceStart: clip.sourceStart || 0,
          duration: clip.duration,
          speed: clip.speed || 1.0,
          captionText: clip.captionText,
        };
      });

      await updateProgress(50, `Rendering video with aspect ratio: ${targetAspect}...`);

      const renderedPath = await ffmpegService.renderTimeline(
        renderClips,
        outputFilePath,
        targetAspect,
        (percent) => {
          updateProgress(50 + Math.round(percent * 0.4), `Encoding frames: ${percent}%...`);
        }
      );

      await updateProgress(95, 'Finalizing video container & audio normalization...');

      const publicUrl = storageService.getPublicUrl(`${projectId}/${outputFilename}`);

      return {
        downloadUrl: publicUrl,
        filename: outputFilename,
        aspectRatio: targetAspect,
        duration: timeline.totalDuration,
        resolution: targetAspect === '9:16' ? '1080x1920' : targetAspect === '16:9' ? '1920x1080' : '1080x1080',
      };
    });

    res.status(202).json({
      success: true,
      data: {
        jobId: job.id,
        status: job.status,
        message: 'Video export job started in the background.',
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
