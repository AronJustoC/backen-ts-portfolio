import { Router } from 'express';
import { CourseRepository } from '../repository/course.repository';
import { CourseService } from '../services/course.services';
import { CourseController } from '../controllers/course.controller';
import { ValidateBody } from '../middleware/validateBody.middleware';
import {
  createCourseSchema,
  updateCourseSchema,
  createLessonSchema,
  updateLessonSchema,
  updateProgressSchema,
} from '../schemas/courseSchema';
import { prisma } from '../utils/prisma.utils';
import { checkRole } from '../middleware/role.middleware';

const router = Router();
const courseRepository = new CourseRepository(prisma);
const courseService = new CourseService(courseRepository);
const courseController = new CourseController(courseService);

export { courseController };

// Rutas admin. El montaje en index.ts ya aplica validateToken.
router.get('/', checkRole(['ADMIN']), (req, res) =>
  courseController.listAdmin(req, res),
);
router.get('/:id', checkRole(['ADMIN']), (req, res) =>
  courseController.getById(req, res),
);
router.post(
  '/',
  checkRole(['ADMIN']),
  ValidateBody(createCourseSchema),
  (req, res) => courseController.create(req, res),
);
router.patch(
  '/:id',
  checkRole(['ADMIN']),
  ValidateBody(updateCourseSchema),
  (req, res) => courseController.update(req, res),
);
router.delete('/:id', checkRole(['ADMIN']), (req, res) =>
  courseController.delete(req, res),
);

router.post(
  '/:id/lessons',
  checkRole(['ADMIN']),
  ValidateBody(createLessonSchema),
  (req, res) => courseController.createLesson(req, res),
);
router.patch(
  '/:id/lessons/:lessonId',
  checkRole(['ADMIN']),
  ValidateBody(updateLessonSchema),
  (req, res) => courseController.updateLesson(req, res),
);
router.delete('/:id/lessons/:lessonId', checkRole(['ADMIN']), (req, res) =>
  courseController.deleteLesson(req, res),
);

// Alumno: solo requiere login (validateToken en el montaje).
router.post('/:id/enroll', (req, res) => courseController.enroll(req, res));
router.put(
  '/:id/lessons/:lessonId/progress',
  ValidateBody(updateProgressSchema),
  (req, res) => courseController.updateProgress(req, res),
);

export default router;
