import { Router } from 'express';
import { PostRepository } from '../repository/post.repository';
import { PostService } from '../services/post.services';
import { PostController } from '../controllers/post.controller';
import { ValidateBody } from '../middleware/validateBody.middleware';
import { createPostSchema, updatePostSchema } from '../schemas/postSchema';
import { prisma } from '../utils/prisma.utils';
import { checkRole } from '../middleware/role.middleware';

const router = Router();
const postRepository = new PostRepository(prisma);
const postService = new PostService(postRepository);
const postController = new PostController(postService);

export { postController };

router.post('/', ValidateBody(createPostSchema), (req, res) =>
  postController.create(req, res),
);
router.get('/', (req, res) => postController.getAll(req, res));
router.get('/:id', (req, res) => postController.getById(req, res));
router.patch('/:id', ValidateBody(updatePostSchema), (req, res) =>
  postController.update(req, res),
);
router.delete('/:id', checkRole(['ADMIN']), (req, res) =>
  postController.delete(req, res),
);

export default router;
