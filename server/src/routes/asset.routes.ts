import { Router } from 'express';
import path from 'path';
import { Asset } from '../models/Asset';
import { Project } from '../models/Project';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { uploadMiddleware } from '../middleware/upload';
import { storageService } from '../services/storage.service';
import { ffmpegService } from '../services/ffmpeg.service';
import { vectorService } from '../services/vector.service';

const router = Router();
router.use(authMiddleware);

// GET all assets for a project with optional folder & search filters
router.get('/project/:projectId', async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.params;
    const { folder, q, tag } = req.query;

    const query: any = { projectId, userId: req.user!.id };

    if (folder && typeof folder === 'string') {
      query.folder = folder;
    }

    if (tag && typeof tag === 'string') {
      query.tags = tag;
    }

    let assets = await Asset.find(query).sort({ createdAt: -1 });

    // Semantic search query
    if (q && typeof q === 'string' && q.trim() !== '') {
      const searchTerms = q.toLowerCase().split(' ').filter(Boolean);
      const queryEmbedding = vectorService.generateFallbackEmbedding(q);

      const ranked = vectorService.rankMatches(queryEmbedding, assets, 50);
      assets = ranked.map((r) => r.item as any);
    }

    res.json({ success: true, data: assets });
  } catch (err) {
    next(err);
  }
});

// POST upload assets to project
router.post(
  '/project/:projectId/upload',
  uploadMiddleware.array('files', 15),
  async (req: AuthRequest, res, next) => {
    try {
      const { projectId } = req.params;
      const folder = (req.body.folder as string) || 'Raw Footage';

      const project = await Project.findOne({ _id: projectId, userId: req.user!.id });
      if (!project) {
        res.status(404).json({ success: false, error: 'Project not found.' });
        return;
      }

      const files = (req.files as Express.Multer.File[]) || [];
      const createdAssets = [];

      for (const file of files) {
        let type: 'video' | 'image' | 'audio' | 'document' = 'document';
        if (file.mimetype.startsWith('video/')) type = 'video';
        else if (file.mimetype.startsWith('image/')) type = 'image';
        else if (file.mimetype.startsWith('audio/')) type = 'audio';

        // Auto-tagging based on filename heuristics and type
        const tags: string[] = [];
        const lowerName = file.originalname.toLowerCase();

        if (lowerName.includes('product') || lowerName.includes('device') || lowerName.includes('gear')) tags.push('product');
        if (lowerName.includes('macro') || lowerName.includes('close') || lowerName.includes('detail')) tags.push('close-up');
        if (lowerName.includes('talk') || lowerName.includes('a-roll') || lowerName.includes('host') || lowerName.includes('face')) {
          tags.push('talking');
          tags.push('face');
        }
        if (lowerName.includes('demo') || lowerName.includes('test') || lowerName.includes('hand')) {
          tags.push('demo');
          tags.push('hand');
        }
        if (lowerName.includes('box') || lowerName.includes('pack')) tags.push('packaging');
        if (lowerName.includes('indoor') || lowerName.includes('studio') || lowerName.includes('desk')) tags.push('indoor');
        if (lowerName.includes('out') || lowerName.includes('street')) tags.push('outdoor');

        // Default tag if none found
        if (tags.length === 0) {
          tags.push(type === 'video' ? 'demo' : 'product');
        }

        // Probe media if video
        let metadata: any = {};
        if (type === 'video') {
          const probe = await ffmpegService.probeMedia(file.path);
          metadata = probe;
        }

        const relativeUrl = storageService.getPublicUrl(`${projectId}/${file.filename}`);
        const embeddingText = `${file.originalname} ${tags.join(' ')} ${folder} ${type}`;
        const embedding = vectorService.generateFallbackEmbedding(embeddingText);

        const asset = await Asset.create({
          projectId,
          userId: req.user!.id,
          folder,
          type,
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: file.path,
          url: relativeUrl,
          tags,
          metadata,
          embedding,
        });

        createdAssets.push(asset);
      }

      res.status(201).json({ success: true, data: createdAssets });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH update asset tags or folder
router.patch('/:assetId', async (req: AuthRequest, res, next) => {
  try {
    const { assetId } = req.params;
    const { tags, folder } = req.body;

    const asset = await Asset.findOne({ _id: assetId, userId: req.user!.id });
    if (!asset) {
      res.status(404).json({ success: false, error: 'Asset not found.' });
      return;
    }

    if (tags && Array.isArray(tags)) asset.tags = tags;
    if (folder && typeof folder === 'string') asset.folder = folder;

    await asset.save();
    res.json({ success: true, data: asset });
  } catch (err) {
    next(err);
  }
});

// DELETE asset (removes document and physical file)
router.delete('/:assetId', async (req: AuthRequest, res, next) => {
  try {
    const { assetId } = req.params;
    const asset = await Asset.findOne({ _id: assetId, userId: req.user!.id });
    if (!asset) {
      res.status(404).json({ success: false, error: 'Asset not found.' });
      return;
    }

    await storageService.deleteFile(asset.path);
    await Asset.deleteOne({ _id: assetId });

    res.json({ success: true, data: { message: 'Asset deleted successfully.' } });
  } catch (err) {
    next(err);
  }
});

export default router;
