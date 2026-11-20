import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { hashSync } from 'bcryptjs';
import { AuthService } from './auth.services';
import type { UserService } from './user.services';
import { assertJwtSecrets, Sign, ValidateRefreshToken, ValidateToken } from '../utils/jwt.utils';

const saved = {
  JWT_SECRET: process.env.JWT_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
};

beforeAll(() => {
  process.env.JWT_SECRET = 'test-access-secret';
  process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
});

afterAll(() => {
  process.env.JWT_SECRET = saved.JWT_SECRET;
  process.env.REFRESH_TOKEN_SECRET = saved.REFRESH_TOKEN_SECRET;
});

describe('secretos JWT', () => {
  test('sin JWT_SECRET no arranca', () => {
    const prev = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    expect(() => assertJwtSecrets()).toThrow('JWT_SECRET no configurado');
    process.env.JWT_SECRET = prev;
  });

  test('sin REFRESH_TOKEN_SECRET no firma', async () => {
    const prev = process.env.REFRESH_TOKEN_SECRET;
    delete process.env.REFRESH_TOKEN_SECRET;
    await expect(Sign({ id: 1, email: 'a@b.c', role: 'USER' })).rejects.toThrow(
      'REFRESH_TOKEN_SECRET no configurado',
    );
    process.env.REFRESH_TOKEN_SECRET = prev;
  });

  test('un access token no sirve como refresh token', async () => {
    const { token } = await Sign({ id: 1, email: 'a@b.c', role: 'USER' });
    await expect(ValidateRefreshToken(token)).rejects.toMatchObject({ statusCode: 401 });
  });

  test('token invalido responde 401 controlado', async () => {
    await expect(ValidateToken('no.es.jwt')).rejects.toMatchObject({ statusCode: 401 });
  });
});

describe('AuthService.login', () => {
  const user = {
    id: 7,
    email: 'admin@test.dev',
    role: 'ADMIN',
    password: hashSync('correcta', 4),
  };
  const fakeUsers = {
    getByEmail: async (email: string) => (email === user.email ? user : null),
  } as unknown as UserService;
  const service = new AuthService(fakeUsers);

  test('contrasenia incorrecta responde 401 (no 500)', async () => {
    await expect(service.login(user.email, 'mala')).rejects.toMatchObject({
      statusCode: 401,
      message: 'credenciales invalidas',
    });
  });

  test('usuario inexistente responde el mismo 401', async () => {
    await expect(service.login('nadie@test.dev', 'x')).rejects.toMatchObject({
      statusCode: 401,
      message: 'credenciales invalidas',
    });
  });

  test('credenciales correctas devuelven par de tokens', async () => {
    const tokens = await service.login(user.email, 'correcta');
    expect(tokens.token).toBeString();
    expect(tokens.refresh_token).toBeString();
  });
});
