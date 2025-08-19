import express from 'express';
import corsMiddleware from './middleware/cors.middleware';
import { rateLimit } from 'express-rate-limit';
import mainRouter from './routes/index';
import { errorMiddleware } from './middleware/error.middleware';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

export default function CreateServer() {
  const app = express();

  // Middlewares globales
  app.use(corsMiddleware);
  app.disable('x-powered-by');
  app.use(express.json());
  app.use(limiter);

  // Enrutador principal con prefijo /api
  app.use('/api', mainRouter);

  // Middleware de manejo de errores (debe ser el último)
  app.use(errorMiddleware);

  return app;
}
