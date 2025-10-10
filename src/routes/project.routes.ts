import { Router } from 'express';
import { prisma } from '../utils/prisma.utils';
import { ProjectRepository } from '../repository/project.repository';
import { ProjectService } from '../services/project.services';
import { ProjectController } from '../controllers/project.controller';
import { ValidateBody } from '../middleware/validateBody.middleware';
import { createProjectSchema } from '../schemas/projectSchema';
import { updatePostSchema } from '../schemas/postSchema';
import { checkRole } from '../middleware/role.middleware';

const router = Router();
const projectRepository = new ProjectRepository(prisma);
const projectService = new ProjectService(projectRepository);
const projectController = new ProjectController(projectService);

router.post('/', ValidateBody(createProjectSchema), (req, res) =>
  projectController.create(req, res),
);
router.get('/', (_req, res) => projectController.getAll(_req, res));
router.get('/:id', checkRole('ADMIN'), (req, res) =>
  projectController.gerById(req, res),
);
router.patch(
  '/:id',
  checkRole('ADMIN'),
  ValidateBody(updatePostSchema),
  (req, res) => projectController.update(req, res),
);
router.delete('/:id', checkRole('ADMIN'), (req, res) =>
  projectController.delete(req, res),
);

export default router;
