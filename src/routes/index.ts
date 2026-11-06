import { Router } from 'express';
import authRouter from './auth.routes';
import userRouter from './user.routes';
import postRouter, { postController } from './post.routes';
import projectRouter, { projectController } from './project.routes';
import uploadRouter from './upload.routes';
import { validateToken } from '../middleware/auth.middleware';
import { checkRole } from '../middleware/role.middleware';
import { ValidateBody } from '../middleware/validateBody.middleware';
import { crearComentarioSchema } from '../schemas/comentarioSchema';
import { comentariosLimiter } from '../middleware/rateLimit.middleware';
import {
  aprobar,
  crear,
  eliminar,
  getPendientes,
  listarPublicos,
} from '../controllers/comentario.controller';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', validateToken, userRouter);

// Public read-only endpoints consumed by the Astro frontend (no auth)
router.get('/posts/public', (req, res) => postController.getAll(req, res));
router.get('/posts/public/:slug', (req, res) =>
  postController.getBySlug(req, res),
);
router.get('/posts/public/:slug/comentarios', (req, res) =>
  listarPublicos(req, res),
);
router.post(
  '/posts/public/:slug/comentarios',
  comentariosLimiter,
  ValidateBody(crearComentarioSchema),
  (req, res) => crear(req, res),
);
router.get('/projects/public', (req, res) =>
  projectController.getAll(req, res),
);

// Admin moderation endpoints (auth required)
router.get(
  '/comentarios/pendientes',
  validateToken,
  checkRole(['ADMIN']),
  (req, res) => getPendientes(req, res),
);
router.patch(
  '/comentarios/:id/aprobar',
  validateToken,
  checkRole(['ADMIN']),
  (req, res) => aprobar(req, res),
);
router.delete(
  '/comentarios/:id',
  validateToken,
  checkRole(['ADMIN']),
  (req, res) => eliminar(req, res),
);

router.use('/posts', validateToken, postRouter);
router.use('/projects', validateToken, projectRouter);
router.use('/uploads', validateToken, uploadRouter);
export default router;
