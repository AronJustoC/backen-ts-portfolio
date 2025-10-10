import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { UserRepository } from '../repository/user.repository';
import { UserService } from '../services/user.services';
import { prisma } from '../utils/prisma.utils';
import { checkRole } from '../middleware/role.middleware';

const router = Router();

// Nota: En una app más grande, esta inicialización de clases se centralizaría.
const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// --- Rutas para gestionar usuarios (protegidas por token) ---

// GET /api/users -> Obtener todos los usuarios
router.get('/', (req, res) => userController.get(req, res));

// GET /api/users/:id -> Obtener un usuario por su ID
router.get('/:id', (req, res) => userController.getById(req, res));

// PATCH /api/users/:id -> Actualizar un usuario
router.patch('/:id', checkRole('ADMIN'), (req, res) =>
  userController.update(req, res),
);

// DELETE /api/users/:id -> Eliminar un usuario
router.delete('/:id', checkRole('ADMIN'), (req, res) =>
  userController.remove(req, res),
);

// La ruta POST para crear usuarios se ha eliminado de este archivo
// para evitar conflictos con el endpoint de registro público.

export default router;
