import type { Request, Response, NextFunction } from 'express';
import { ValidateToken } from '../utils/jwt.utils';

export async function validateToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const header = req.header('Authorization');
    if (!header) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }
    const token = header.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token invalido' });
    }
    const user = (await ValidateToken(token)) as { _id: string };
    if (!user) {
      return res.status(403).json({ error: 'Usuario no auntenticado' });
    }
    req.headers.user_id = user._id;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Usuario no auntenticado', details: error });
  }
}

