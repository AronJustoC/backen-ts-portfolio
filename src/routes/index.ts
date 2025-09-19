import { Router } from 'express';
import authRouter from './auth.routes';
import userRouter from './user.routes';
import postRouter from './post.routes';
import projectRouter from './project.routes';
import { validateToken } from '../middleware/auth.middleware';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', validateToken, userRouter);
router.use('/posts', validateToken, postRouter);
router.use('/projects', validateToken, projectRouter);
export default router;
