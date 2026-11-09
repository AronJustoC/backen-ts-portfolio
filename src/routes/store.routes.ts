import { Router } from 'express';
import { StoreRepository } from '../repository/store.repository';
import { StoreService } from '../services/store.service';
import { StoreController } from '../controllers/store.controller';
import { checkRole } from '../middleware/role.middleware';
import { validateToken } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma.utils';

const router = Router();
const storeRepository = new StoreRepository(prisma);
const storeService = new StoreService(storeRepository);
const storeController = new StoreController(storeService);

export { storeController };

// Public read-only endpoints (no auth).
router.get('/store/products', (req, res) =>
  storeController.listPublicProducts(req, res),
);
router.get('/store/products/:slug', (req, res) =>
  storeController.getPublicProduct(req, res),
);
router.get('/store/categories', (req, res) =>
  storeController.listPublicCategories(req, res),
);

// Rutas admin. El montaje en index.ts es en la raíz, por eso se aplica
// validateToken por ruta (las públicas deben quedar sin auth).
router.get(
  '/store/admin/products',
  validateToken,
  checkRole(['ADMIN']),
  (req, res) => storeController.listAdminProducts(req, res),
);
router.post(
  '/store/categories',
  validateToken,
  checkRole(['ADMIN']),
  (req, res) => storeController.createCategory(req, res),
);
router.put(
  '/store/categories/:id',
  validateToken,
  checkRole(['ADMIN']),
  (req, res) => storeController.updateCategory(req, res),
);
router.delete(
  '/store/categories/:id',
  validateToken,
  checkRole(['ADMIN']),
  (req, res) => storeController.deleteCategory(req, res),
);
router.post(
  '/store/products',
  validateToken,
  checkRole(['ADMIN']),
  (req, res) => storeController.createProduct(req, res),
);
router.put(
  '/store/products/:id',
  validateToken,
  checkRole(['ADMIN']),
  (req, res) => storeController.updateProduct(req, res),
);
router.patch(
  '/store/products/:id/sold-out',
  validateToken,
  checkRole(['ADMIN']),
  (req, res) => storeController.setSoldOut(req, res),
);
router.delete(
  '/store/products/:id',
  validateToken,
  checkRole(['ADMIN']),
  (req, res) => storeController.deleteProduct(req, res),
);

export default router;
