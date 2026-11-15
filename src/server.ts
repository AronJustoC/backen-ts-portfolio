import express from 'express';
import corsMiddleware from './middleware/cors.middleware';
import { rateLimit } from 'express-rate-limit';
import mainRouter from './routes/index';
import { errorMiddleware } from './middleware/error.middleware';
import './utils/redis.utils';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  // El web (SSR) llama desde una sola IP interna: 100 se agotaba y devolvía 429.
  limit: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

export default function CreateServer() {
  const app = express();
  // Caddy es el único proxy delante del API: su X-Forwarded-For trae la IP real del visitante,
  // así el límite cuenta por visitante y no por el contenedor del web.
  app.set('trust proxy', 1);

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
