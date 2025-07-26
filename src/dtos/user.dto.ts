import { z } from 'zod';
import { createUserSchema, updateUserSchema } from '../schemas/userSchema';
/**
 * @interface CreateUserDto
 * @description DTO para la creacion de un nuevo usuario.
 * Tipo inferido directamente del esquema de validacion de Zod(createUserSchema);
 */
export type CreateUserDto = z.infer<typeof createUserSchema>;

/**
 * @interface CreateUserDto
 * @description DTO para la actualizacion de un usuario existente
 * Todos los campos son opcionales, permitiendo actualizaciones parciales.
 */
export type UpdateUserDto = z.infer<typeof updateUserSchema>;

/**
 * @interface ResponseUserDto
 * @description DTO define los campos que se enviaren como respuesta al cliente,
 * excluyendo informacion sensible como la contraseña.
 */
export interface UserResponseDto {
  id: number;
  username: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: Date;
}
