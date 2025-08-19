import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.services';
import { UserService } from '../services/user.services';
import { createUserSchema } from '../schemas/userSchema';
import { loginSchema } from '../schemas/authSchema';
import { UserRepository } from '../repository/user.repository';
import { ValidateBody } from '../middleware/validateBody.middleware';
import { prisma } from '../utils/prisma.utils';

const router = Router();

// --- Instanciación de Dependencias ---
// En una aplicación más grande, esto se haría con un contenedor de inyección de dependencias
const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);
const authService = new AuthService(userService);
const authController = new AuthController(authService, userService);

// --- Definición de Rutas ---
// POST /api/auth/register
router.post('/register', ValidateBody(createUserSchema), (req, res) =>
  authController.register(req, res),
);

// POST /api/auth/login
router.post('/login', ValidateBody(loginSchema), (req, res) =>
  authController.login(req, res),
);

router.post('/refresh', (req, res, next) =>
  authController.refreshSession(req, res, next),
);

export default router;
