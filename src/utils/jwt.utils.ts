import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';

const { sign, verify } = jwt;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';
/**
 * Interfaz que define la estructura de los datos que se guardaran en token.
 * Es una buena practica usar una Interfaz para asegurar la consistencia del payload.
 */
interface TokenPayload extends JwtPayload {
  id: number;
  email: string;
}
/**
 * Interfaz que define la respuesta que entregara la funcion de generacion de tokens.
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Genera un par de tokens: un Access Token de corta duracion y un Refresh Token de larga duracion.
 * Esta funcion es asincrona, no hay necesidad de usar async/await aqui.
 *
 * @param user - El objeto de usuario que contiene el id y el email para el payload.
 */
export const generateTokenPair = (user: {
  id: number;
  email: string;
}): TokenResponse => {
  const accessTokenPayload: TokenPayload = {
    id: user.id,
    email: user.email,
  };

  const refreshTokenPayload = {
    id: user.id,
  };

  const accessToken = sign(accessTokenPayload, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = sign(refreshTokenPayload, JWT_SECRET, {
    expiresIn: '30d',
  });
  return { accessToken, refreshToken };
};

/**
 * Verifica la validez de un token JWT.
 * --- BUENA PRACTICA: manejar siempre los errores con try...catch ---
 *  La funcion `verify` de jsonwebtoken LANZA UN ERROR si el token no es valido.
 *
 *  @param token - El token JWT a validar.
 *  @returns El payload decodificado si el token es valido, o null si no lo es.
 */
export const validateToken = (token: string): TokenPayload | null => {
  try {
    const decoded = verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Token invalido o expirado: ${error.message}`);
    } else {
      console.error('Ocurrió un error inesperado al validar el token:', error);
    }
    return null;
  }
};
