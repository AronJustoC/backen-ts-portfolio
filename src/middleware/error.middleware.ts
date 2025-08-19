import type { Request, Response, NextFunction } from 'express';

// Este middleware atrapará cualquier error no controlado en la aplicación
export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  // Evita enviar detalles del error al cliente en producción
  res.status(500).json({ message: 'Ha ocurrido un error interno en el servidor.' });
};