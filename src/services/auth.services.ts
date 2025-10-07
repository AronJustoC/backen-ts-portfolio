import { compare } from 'bcryptjs';
import { UserService } from './user.services';
import { Sign, ValidateToken } from '../utils/jwt.utils';
import { AppError } from '../utils/error.utils';

interface DecodedToken {
  id: number;
  email: string;
  iat: number;
  exp: number;
}

export class AuthService {
  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async login(email: string, password: string) {
    const user = await this.userService.getByEmail(email);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    const correct = await compare(password, user.password ?? '');
    if (!correct) {
      throw new Error('Contrasenia incorrecta');
    }
    const token = await Sign({
      id: user.id,
      email: user.email ?? '',
      role: user.role,
    });
    return token;
  }
  async refreshToken(user: { id: number; email: string; role: string }) {
    try {
      const token = await Sign(user);
      console.log(token);
      return token;
    } catch (error) {
      console.log(error);
    }
  }
  async refreshSession(refreshToken: string) {
    console.log('refreshToken:', refreshToken);
    const decodedRefreshToken = (await ValidateToken(refreshToken)) as {
      token: string;
    };
    console.log('decodedRefreshToken:', decodedRefreshToken);
    const decodedAccessToken = (await ValidateToken(
      decodedRefreshToken.token,
    )) as DecodedToken;
    console.log('decodedAccessToken:', decodedAccessToken);
    const user = await this.userService.getById(decodedAccessToken.id);
    if (!user) {
      throw new AppError(404, 'Usuario del token ya no existe');
    }
    const tokenPayload = {
      id: user?.id,
      email: user.email ?? '',
      role: user.role,
    };
    return Sign(tokenPayload);
  }
}
