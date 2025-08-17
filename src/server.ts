import express from 'express';
import UserRoutes from './routes/user.routes';
import corsMiddleware from './middleware/cors.middleware';
import { rateLimit } from 'express-rate-limit';
import { validateToken } from './middleware/auth.middleware';

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

export default function CreateServer() {
  const app = express();
  app.use(corsMiddleware);
  app.disable('x-powered-by');
  app.use(express.json());
  app.use(limiter);
  app.use('users/', validateToken, UserRoutes);
  return app;
}
