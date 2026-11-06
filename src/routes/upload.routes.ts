import { Router } from 'express';
import { checkRole } from '../middleware/role.middleware';
import { createUploadSignature } from '../services/upload.services';

const router = Router();

router.post('/signature', checkRole(['ADMIN']), (req, res) =>
  res.json(createUploadSignature()),
);

export default router;
