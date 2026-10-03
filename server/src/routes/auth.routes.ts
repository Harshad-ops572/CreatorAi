import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User';
import { env } from '../config/env';
import { authLimiter } from '../middleware/rateLimiter';
import { validateBody } from '../middleware/validate';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

function sendAuthToken(res: Response, user: any) {
  const token = jwt.sign(
    { id: user._id.toString(), email: user.email, name: user.name },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: env.IS_PRODUCTION,
    sameSite: env.IS_PRODUCTION ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
}

router.post('/register', authLimiter, validateBody(registerSchema), async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(400).json({ success: false, error: 'An account with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      name,
    });

    const token = sendAuthToken(res, user);

    res.status(201).json({
      success: true,
      data: {
        user: { id: user._id, email: user.email, name: user.name },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', authLimiter, validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    const token = sendAuthToken(res, user);

    res.json({
      success: true,
      data: {
        user: { id: user._id, email: user.email, name: user.name },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Instant One-Click Demo Login for smooth zero-friction evaluation
router.post('/demo-login', async (req, res, next) => {
  try {
    let demoUser = await User.findOne({ email: 'creator@creatorai.io' });
    if (!demoUser) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('creator123', salt);
      demoUser = await User.create({
        email: 'creator@creatorai.io',
        name: 'Alex Rivera',
        passwordHash,
      });
    }

    const token = sendAuthToken(res, demoUser);

    res.json({
      success: true,
      data: {
        user: { id: demoUser._id, email: demoUser.email, name: demoUser.name },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findById(req.user?.id).select('-passwordHash');
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    res.json({
      success: true,
      data: {
        user: { id: user._id, email: user.email, name: user.name },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, data: { message: 'Logged out successfully.' } });
});

export default router;
