import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

export function validate(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = validated.body;
      req.query = validated.query;
      req.params = validated.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: Record<string, string[]> = {};
        
        error.errors.forEach((e) => {
          const field = e.path.slice(1).join('.'); // Remove 'body', 'query', or 'params'
          if (!details[field]) {
            details[field] = [];
          }
          details[field].push(e.message);
        });

        next(new ValidationError(details));
      } else {
        next(error);
      }
    }
  };
}
