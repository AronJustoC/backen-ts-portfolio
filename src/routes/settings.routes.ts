import { Router } from 'express';
import { SettingsRepository } from '../repository/settings.repository';
import { SettingsService } from '../services/settings.service';
import { SettingsController } from '../controllers/settings.controller';
import { validateToken } from '../middleware/auth.middleware';
import { checkRole } from '../middleware/role.middleware';
import { prisma } from '../utils/prisma.utils';

const router = Router();
const settingsRepository = new SettingsRepository(prisma);
const settingsService = new SettingsService(settingsRepository);
const settingsController = new SettingsController(settingsService);

router.get('/nav', (req, res) => settingsController.getNav(req, res));

router.patch(
  '/nav',
  validateToken,
  checkRole(['ADMIN']),
  (req, res) => settingsController.updateNav(req, res),
);

export default router;
