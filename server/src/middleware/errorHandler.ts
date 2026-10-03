import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('API Error Encountered:', err);

  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  let message = err.message || 'An unexpected server error occurred. Please try again.';

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Uploaded file exceeds the maximum allowed limit of 100MB.';
    } else {
      message = `Upload error: ${err.message}`;
    }
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}
