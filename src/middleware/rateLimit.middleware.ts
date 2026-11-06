import { rateLimit } from 'express-rate-limit';

export const comentariosLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados comentarios. Inténtalo más tarde.' },
});
