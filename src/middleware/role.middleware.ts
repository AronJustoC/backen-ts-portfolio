import { Request, Response, NextFunction } from 'express';
import { UserPayload } from '../types/express';

export const checkRole = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserPayload;

    if (!user || user.role !== requiredRole) {
      return res
        .status(403)
        .json({ message: 'Forbidden: Insufficient permissions' });
    }
    return next();
  };
};
