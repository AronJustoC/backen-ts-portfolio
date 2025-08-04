import { hash, compare } from 'bcryptjs';

/**
 * El "cost factor" o "salt rounds". Define cuanta computacion se necesita para clear el hash.
 * Un numero mas alto es mas seguro pero mas lento. 10 es un estandar muy bueno y seguro.
 */
const SALT_ROUND = 10;

/**
 * Transforma una contraseña de texto plano en un hash seguro e irreversible.
 * Esta es la funcion que usas ANTES de guardar la contraseña de un usuario en la base de datos.
 *
 * @param plainTextPassword - La contraseña que el usuario proveyo (ej. "password123").
 * @returns Una promesa que se resuelve con el hash de la contraseña (ej: "2a$10$K1...").
 */
export const hashPassword = async (
  plainTextPassword: string,
): Promise<string> => {
  const hashedPassword = await hash(plainTextPassword, SALT_ROUND);
  return hashedPassword;
};

/**
 * Compara una contraseña de texto plano con un hash para ver si coinciden.
 * Esta es la funcion que usas cuando un usuario intenta iniciar sesion.
 *
 * @param plainTextPassword - La contraseña que el usuario acaba de ingresar en el login.
 * @param hashedPassword - El hash que tienes guardado en tu base de datos.
 * @returns Una promesa que se resuelve con `true` si la contraseña es correcta, o `false` si no lo es.
 */
export const comparePassword = async (
  plainTextPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  const isMatch = await compare(plainTextPassword, hashedPassword);
  return isMatch;
};
