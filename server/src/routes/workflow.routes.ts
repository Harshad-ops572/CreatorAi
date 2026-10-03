import { Router } from 'express';
import { z } from 'zod';
import { WorkflowTask } from '../models/WorkflowTask';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();
router.use(authMiddleware);

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  stage: z.enum(['idea', 'scripting', 'recording', 'editing', 'ready', 'published']).default('idea'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().optional(),
  assignedNotes: z.string().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().optional(),
  stage: z.enum(['idea', 'scripting', 'recording', 'editing', 'ready', 'published']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional().nullable(),
  assignedNotes: z.string().optional(),
  order: z.number().optional(),
});

// GET all tasks for project
router.get('/project/:projectId', async (req: AuthRequest, res, next) => {
  try {
    const tasks = await WorkflowTask.find({
      projectId: req.params.projectId,
      userId: req.user!.id,
    }).sort({ order: 1, createdAt: 1 });

    res.json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
});

// POST create task
router.post('/project/:projectId', validateBody(createTaskSchema), async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.params;
    const task = await WorkflowTask.create({
      ...req.body,
      projectId,
      userId: req.user!.id,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
    });

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
});

// PATCH update task stage / details (supports optimistic drag-and-drop updates)
router.patch('/:taskId', validateBody(updateTaskSchema), async (req: AuthRequest, res, next) => {
  try {
    const { taskId } = req.params;
    const updates: any = { ...req.body };
    if (updates.dueDate) updates.dueDate = new Date(updates.dueDate);

    const task = await WorkflowTask.findOneAndUpdate(
      { _id: taskId, userId: req.user!.id },
      { $set: updates },
      { new: true }
    );

    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found.' });
      return;
    }

    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
});

// DELETE task
router.delete('/:taskId', async (req: AuthRequest, res, next) => {
  try {
    const task = await WorkflowTask.findOneAndDelete({ _id: req.params.taskId, userId: req.user!.id });
    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found.' });
      return;
    }
    res.json({ success: true, data: { message: 'Task deleted.' } });
  } catch (err) {
    next(err);
  }
});

export default router;
