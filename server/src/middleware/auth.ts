import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ success: false, error: 'Authentication required. Please log in.' });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
      name: string;
    };

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'Invalid or expired session. Please log in again.' });
  }
}
