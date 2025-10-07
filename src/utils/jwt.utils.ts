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

export async function Sign(value: User): Promise<TokenResponse> {
  const secret = process.env.JWT_SECRET || 'super_secret_key';
  const token = jwt.sign(value, secret, {
    expiresIn: 60 * 60, // 1 hora
  });
  const refresh_token = jwt.sign({ token }, secret, {
    expiresIn: 60 * 60 * 24 * 30, // 30 dias
  });
  return { token, refresh_token };
}

export async function ValidateToken(token: string) {
  const secret = process.env.JWT_SECRET || 'super_secret_key';
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      throw new AppError(401, 'Token expirado');
    }
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      throw new AppError(401, 'Token invalido');
    }
    throw error;
  }
}
