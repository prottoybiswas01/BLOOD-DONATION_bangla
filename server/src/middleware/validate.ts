import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        res.status(400).json({
          success: false,
          message: 'প্রদত্ত তথ্যে ভুল রয়েছে। অনুগ্রহ করে ফর্মটি সঠিকভাবে পূরণ করুন।',
          errors: formattedErrors
        });
        return;
      }
      res.status(400).json({ success: false, message: 'অবৈধ ইনপুট ডাটা।' });
    }
  };
}
