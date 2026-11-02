import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env.js';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  console.error('[API Error]:', err);

  let statusCode = err.statusCode || 500;
  if (err.message && typeof err.message === 'string' && err.message.startsWith('DATABASE_UNAVAILABLE:')) {
    statusCode = 503;
  }

  const message = err.message || 'সার্ভারে অভ্যন্তরীণ ত্রুটি দেখা দিয়েছে। পরে চেষ্টা করুন।';

  res.status(statusCode).json({
    success: false,
    message,
    ...(ENV.NODE_ENV === 'development' && { devStack: err.stack })
  });
}

