import { Router } from 'express';
import authRouter from './auth.routes';
import userRouter from './user.routes';
import postRouter, { postController } from './post.routes';
import projectRouter, { projectController } from './project.routes';
import { validateToken } from '../middleware/auth.middleware';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', validateToken, userRouter);

// Public read-only endpoints consumed by the Astro frontend (no auth)
router.get('/posts/public', (req, res) => postController.getAll(req, res));
router.get('/posts/public/:slug', (req, res) =>
  postController.getBySlug(req, res),
);
router.get('/projects/public', (req, res) =>
  projectController.getAll(req, res),
);

router.use('/posts', validateToken, postRouter);
router.use('/projects', validateToken, projectRouter);
export default router;
