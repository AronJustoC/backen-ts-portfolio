import { Router } from 'express';
import { courseController } from './course.routes';

// Rutas del alumno autenticado. El montaje en index.ts aplica validateToken.
const router = Router();

router.get('/courses', (req, res) => courseController.myCourses(req, res));
router.get('/courses/:slug', (req, res) =>
  courseController.myCourseProgress(req, res),
);

export default router;
