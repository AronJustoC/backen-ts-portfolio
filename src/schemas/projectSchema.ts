import z from 'zod';

export const createProjectSchema = z.object({
  title: z
    .string('El titulo es requerido')
    .min(3, 'El titulo debe tener al menos 3 caracteres.'),
  description: z.string().optional().nullable(),
  imageUrl: z.url('La url de la imagen debe der valida.').optional().nullable(),
  repoUrl: z
    .url('La URL del repositorio debe ser valida.')
    .optional()
    .nullable(),
  liveUrl: z
    .url('La URL del sitio en vivo debe ser valida.')
    .optional()
    .nullable(),
});

export const updateProjectSchema = z.object({
  title: z
    .string('El titulo es requerido')
    .min(3, 'El titulo debe tener al menos 3 caracteres.')
    .optional(),
  description: z.string().optional().nullable(),
  imageUrl: z.url('La url de la imagen debe der valida.').optional().nullable(),
  repoUrl: z
    .url('La URL del repositorio debe ser valida.')
    .optional()
    .nullable(),
  liveUrl: z
    .url('La URL del sitio en vivo debe ser valida.')
    .optional()
    .nullable(),
});
