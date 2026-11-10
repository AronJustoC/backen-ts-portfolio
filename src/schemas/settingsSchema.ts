import { z } from 'zod';

export const updateNavSchema = z
  .object({
    tabs: z
      .object({
        proyectos: z.boolean().optional(),
        tienda: z.boolean().optional(),
        blog: z.boolean().optional(),
        cursos: z.boolean().optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export type UpdateNavDto = z.infer<typeof updateNavSchema>;
