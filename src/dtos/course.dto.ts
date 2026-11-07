import { z } from 'zod';
import {
  createCourseSchema,
  updateCourseSchema,
  createLessonSchema,
  updateLessonSchema,
  updateProgressSchema,
} from '../schemas/courseSchema';

export type CreateCourseDto = z.infer<typeof createCourseSchema>;
export type UpdateCourseDto = z.infer<typeof updateCourseSchema>;
export type CreateLessonDto = z.infer<typeof createLessonSchema>;
export type UpdateLessonDto = z.infer<typeof updateLessonSchema>;
export type UpdateProgressDto = z.infer<typeof updateProgressSchema>;
