import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().min(3, 'El titulo debe de tener al menos 3 caracteres.'),
  slug: z.string().min(3, 'El slug debe tener al menos 3 caracteres.'),
  description: z.string().optional(),
  imageUrl: z.url('Debe ser una URL de la imagen valida').optional(),
  publicado: z.boolean().optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

export const createLessonSchema = z.object({
  title: z.string().min(3, 'El titulo debe de tener al menos 3 caracteres.'),
  orden: z.number().int().min(1, 'El orden debe ser mayor a 0.'),
  content: z.string().min(1, 'El contenido es obligatorio.'),
  videoUrl: z.url('Debe ser una URL de video valida').optional(),
  attachmentUrl: z.url('Debe ser una URL de archivo valida').optional(),
  duration: z
    .number()
    .int()
    .min(0, 'La duracion no puede ser negativa.')
    .optional(),
  chapters: z
    .array(
      z.object({
        time: z.number().int().min(0, 'El tiempo no puede ser negativo.'),
        title: z.string().min(1, 'El titulo del capitulo es obligatorio.'),
      }),
    )
    .optional(),
});

export const updateLessonSchema = createLessonSchema.partial();

export const updateProgressSchema = z.object({
  completed: z.boolean().optional(),
  lastPosition: z
    .number()
    .int()
    .min(0, 'La posicion no puede ser negativa.')
    .optional(),
});
