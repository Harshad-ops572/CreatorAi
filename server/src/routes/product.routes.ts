import { Router } from 'express';
import { z } from 'zod';
import { Product } from '../models/Product';
import { Project } from '../models/Project';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { uploadMiddleware } from '../middleware/upload';
import { validateBody } from '../middleware/validate';
import { geminiService } from '../services/gemini.service';
import { storageService } from '../services/storage.service';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();
router.use(authMiddleware);

const updateProfileSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  features: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  usp: z.string().optional(),
  price: z.string().optional(),
  targetAudience: z.array(z.string()).optional(),
  brandTone: z.array(z.string()).optional(),
  keyClaims: z.array(z.string()).optional(),
  visualStyle: z.string().optional(),
});

// GET product for a project
router.get('/project/:projectId', async (req: AuthRequest, res, next) => {
  try {
    const product = await Product.findOne({
      projectId: req.params.projectId,
      userId: req.user!.id,
    });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// POST upload product media + description & trigger Gemini intelligence extraction
router.post(
  '/project/:projectId/upload',
  uploadMiddleware.array('files', 10),
  async (req: AuthRequest, res, next) => {
    try {
      const { projectId } = req.params;
      const { name, rawDescription } = req.body;

      const project = await Project.findOne({ _id: projectId, userId: req.user!.id });
      if (!project) {
        res.status(404).json({ success: false, error: 'Project not found.' });
        return;
      }

      const files = (req.files as Express.Multer.File[]) || [];
      const uploadedFileRecords = files.map((f) => ({
        filename: f.filename,
        originalName: f.originalname,
        mimeType: f.mimetype,
        path: f.path,
        url: storageService.getPublicUrl(`${projectId}/${f.filename}`),
      }));

      // Find or create product record
      let product = await Product.findOne({ projectId, userId: req.user!.id });

      const fileNames = uploadedFileRecords.map((f) => f.originalName);

      // Call Gemini for Product Intelligence Extraction
      const extractedProfile = await geminiService.extractProductProfile(
        name || project.title,
        rawDescription || '',
        fileNames
      );

      if (!product) {
        product = await Product.create({
          projectId,
          userId: req.user!.id,
          name: name || project.title,
          rawDescription: rawDescription || '',
          uploadedFiles: uploadedFileRecords,
          profile: extractedProfile,
        });
      } else {
        product.name = name || product.name;
        product.rawDescription = rawDescription || product.rawDescription;
        product.uploadedFiles = [...product.uploadedFiles, ...uploadedFileRecords];
        product.profile = extractedProfile;
        await product.save();
      }

      res.status(200).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }
);

// POST manually re-extract intelligence profile with AI
router.post('/project/:projectId/analyze-profile', aiLimiter, async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.params;
    const product = await Product.findOne({ projectId, userId: req.user!.id });
    if (!product) {
      res.status(404).json({ success: false, error: 'No product information found for this project.' });
      return;
    }

    const fileNames = product.uploadedFiles.map((f) => f.originalName);
    const updatedProfile = await geminiService.extractProductProfile(
      product.name,
      product.rawDescription,
      fileNames
    );

    product.profile = updatedProfile;
    await product.save();

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// PATCH edit product profile
router.patch('/project/:projectId/profile', validateBody(updateProfileSchema), async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.params;
    const product = await Product.findOne({ projectId, userId: req.user!.id });
    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found.' });
      return;
    }

    product.profile = {
      ...product.profile,
      ...req.body,
    };
    await product.save();

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

export default router;
