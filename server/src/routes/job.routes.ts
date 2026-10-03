import { Router } from 'express';
import { Job } from '../models/Job';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// GET job status and progress
router.get('/:jobId', async (req: AuthRequest, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, userId: req.user!.id });
    if (!job) {
      res.status(404).json({ success: false, error: 'Job not found.' });
      return;
    }

    res.json({
      success: true,
      data: {
        id: job._id,
        type: job.type,
        status: job.status,
        progress: job.progress,
        currentStepMessage: job.currentStepMessage,
        resultPayload: job.resultPayload,
        errorMessage: job.errorMessage,
        retries: job.retries,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
