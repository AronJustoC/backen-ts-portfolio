import { z } from 'zod';

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const CORREO_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const limpiarControl = (valor: string) => valor.replace(CONTROL, '');

export const crearComentarioSchema = z.object({
  nombre: z
    .string()
    .transform(limpiarControl)
    .pipe(
      z
        .string()
        .trim()
        .min(1, 'El nombre es obligatorio')
        .max(
          80,
          'El nombre es obligatorio y debe tener como máximo 80 caracteres',
        ),
    ),
  correo: z
    .string()
    .transform(limpiarControl)
    .pipe(z.string().trim().toLowerCase().max(254))
    .refine(
      (valor) => valor === '' || CORREO_REGEX.test(valor),
      'El correo electrónico no es válido',
    )
    .optional(),
  cuerpo: z
    .string()
    .transform(limpiarControl)
    .pipe(z.string().trim().min(1, 'El comentario es obligatorio')),
  website: z.string().max(500).optional(),
});
