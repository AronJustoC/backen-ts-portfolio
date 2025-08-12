import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { UserRepository } from '../repository/user.repository';
import { UserService } from '../services/user.services';
import { prisma } from '../utils/prisma.utils';

const router = Router();
const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.get('/', (_req, res) => {
  userController.get(_req, res);
});
router.post('/', (req, res) => {
  userController.create(req, res);
});
router.patch('/:id', (req, res) => {
  userController.update(req, res);
});
router.delete('/:id', (req, res) => {
  userController.remove(req, res);
});

export default router;
