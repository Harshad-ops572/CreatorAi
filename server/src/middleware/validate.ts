import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
        res.status(400).json({
          success: false,
          error: `Validation failed: ${errorMessages}`,
        });
        return;
      }
      res.status(400).json({ success: false, error: 'Malformed request data.' });
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
        res.status(400).json({
          success: false,
          error: `Query validation failed: ${errorMessages}`,
        });
        return;
      }
      res.status(400).json({ success: false, error: 'Malformed query parameters.' });
    }
  };
}
