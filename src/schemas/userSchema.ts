import { z } from 'zod';

export const createUserSchema = z.object({
  username: z
    .string()
    .min(4, 'El nombre de usuario debe tener al menos 4 caracteres.'),
  email: z.email('Formato de correo electronico invalido.'),
  password: z
    .string()
    .min(6, 'La contrasenia debe tener al menos 6 caracteres'),
  bio: z.string().optional(),
  avatarUrl: z.url('URL del avatar invalida').optional(),
});

export const updateUserSchema = z.object({
  username: z
    .string()
    .min(4, 'El nombre de usuario debe tener al menos 4 caracteres.')
    .optional(),
  email: z.email('Formato de correo electronico invalido.').optional(),
  password: z
    .string()
    .min(6, 'La contrasenia debe tener al menos 6 caracteres')
    .optional(),
  bio: z.string().optional(),
  avatarUrl: z.url('URL del avatar invalida').optional(),
});
