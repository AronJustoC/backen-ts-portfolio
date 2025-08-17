import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

export const ValidateBody =
  <T extends z.ZodTypeAny>(schema: T) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const tree = z.treeifyError(result.error);
      res.status(400).json({
        status: 'error',
        error: tree,
      });
      return;
    }
    req.body = result.data; // Tipado correctamente
    next();
  };
