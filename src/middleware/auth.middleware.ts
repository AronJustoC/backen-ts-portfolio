import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma.utils';
import { ValidateToken } from '../utils/jwt.utils';
import { UserRepository } from '../repository/user.repository';

export async function validateToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userRepository = new UserRepository(prisma);
  try {
    const header = req.header('Authorization');
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }
    const token = header.substring(7);
    if (!token) {
      return res.status(401).json({ error: 'Token invalido' });
    }
    const decoded = (await ValidateToken(token)) as { id: number };
    if (!decoded) {
      return res.status(401).json({ messages: 'Unauthorized' });
    }
    const user = await userRepository.getById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { password: _password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Usuario no auntenticado', details: error });
  }
}
