import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Request } from 'express';
import { storageService } from '../services/storage.service';

const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  // Videos
  'video/mp4',
  'video/quicktime', // .mov
  'video/webm',
  'video/x-matroska',
  // Audio
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
  'audio/x-m4a',
  // Documents
  'application/pdf',
  'text/plain',
  'text/markdown',
];

const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    const projectId = req.params.projectId || (req.body && req.body.projectId) || 'shared';
    const targetDir = storageService.getProjectDir(projectId);
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const randomHex = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase() || '.bin';
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
    cb(null, `${cleanBase}_${randomHex}${ext}`);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: images, videos, audio, PDF.`));
    }
  },
});
