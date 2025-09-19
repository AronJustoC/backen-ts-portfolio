import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(3, 'El titulo debe de tener al menos 3 caracteres.'),
  content: z
    .string()
    .min(10, 'El contenido debe tener al menos 10 caracteres.'),
  imageUrl: z.url('Debe ser una URL de la imagen valida').optional(),
  slug: z.string().min(3, 'El slug debe tener al manos 3 caracteres.'),
});

export const updatePostSchema = z.object({
  title: z
    .string()
    .min(3, 'El titulo debe de tener al menos 3 caracteres.')
    .optional(),
  content: z
    .string()
    .min(10, 'El contenido debe tener al menos 10 caracteres.')
    .optional(),
  imageUrl: z.url('Debe ser una URL de la imagen valida').optional(),
  slug: z
    .string()
    .min(3, 'El slug debe tener al manos 3 caracteres.')
    .optional(),
});
