import jwt from 'jsonwebtoken';
import process from 'process';
import { AppError } from './error.utils';

interface User {
  email: string;
  id: number;
  role: string;
}

interface TokenResponse {
  token: string;
  refresh_token: string;
}

// Sin secretos por defecto: si falta una variable, no se firma ni valida ningun token.
function requireEnv(name: 'JWT_SECRET' | 'REFRESH_TOKEN_SECRET'): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} no configurado`);
  return value;
}

export function assertJwtSecrets(): void {
  requireEnv('JWT_SECRET');
  requireEnv('REFRESH_TOKEN_SECRET');
}

export async function Sign(value: User): Promise<TokenResponse> {
  const token = jwt.sign(value, requireEnv('JWT_SECRET'), {
    expiresIn: 60 * 60, // 1 hora
  });
  const refresh_token = jwt.sign({ token }, requireEnv('REFRESH_TOKEN_SECRET'), {
    expiresIn: 60 * 60 * 24 * 30, // 30 dias
  });
  return { token, refresh_token };
}

export async function ValidateToken(token: string) {
  try {
    return jwt.verify(token, requireEnv('JWT_SECRET'));
  } catch (error) {
    throw toAppError(error);
  }
}

export async function ValidateRefreshToken(token: string) {
  try {
    return jwt.verify(token, requireEnv('REFRESH_TOKEN_SECRET'));
  } catch (error) {
    throw toAppError(error);
  }
}

function toAppError(error: unknown): unknown {
  if (error instanceof Error && error.name === 'TokenExpiredError') {
    return new AppError(401, 'Token expirado');
  }
  if (error instanceof Error && error.name === 'JsonWebTokenError') {
    return new AppError(401, 'Token invalido');
  }
  return error;
}
