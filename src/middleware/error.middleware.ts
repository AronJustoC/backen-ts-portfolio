import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/error.utils';

// Único punto que traduce errores a respuestas HTTP. Los controladores delegan aquí con next(error).
// Nunca envía el objeto de error al cliente: solo mensajes controlados.
export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Conflicto con un recurso existente.' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Recurso no encontrado' });
    }
  }
  console.error(`[ERROR] ${req.method} ${req.path}:`, err instanceof Error ? err.message : err);
  res
    .status(500)
    .json({ message: 'Ha ocurrido un error interno en el servidor.' });
};
