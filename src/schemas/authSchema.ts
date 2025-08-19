import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Formato de correo electronico invalido.'),
  password: z
    .string()
    .min(6, 'La contrasenia debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  email: z.email('Formato de correo electronico invalido'),
  password: z
    .string()
    .min(6, 'La contrasenia debe tener al menos 6 caracteres'),
});
