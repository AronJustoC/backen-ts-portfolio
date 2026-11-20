import { compare } from 'bcryptjs';
import { UserService } from './user.services';
import { Sign, ValidateRefreshToken, ValidateToken } from '../utils/jwt.utils';
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

  // Usuario inexistente y contraseña incorrecta responden igual: no revela qué correos existen.
  async login(email: string, password: string) {
    const user = await this.userService.getByEmail(email);
    const correct = await compare(password, user?.password ?? '');
    if (!user || !correct) {
      throw new AppError(401, 'credenciales invalidas');
    }
    return Sign({
      id: user.id,
      email: user.email ?? '',
      role: user.role,
    });
  }

  async refreshSession(refreshToken: string) {
    const decodedRefreshToken = (await ValidateRefreshToken(refreshToken)) as {
      token: string;
    };
    const decodedAccessToken = (await ValidateToken(
      decodedRefreshToken.token,
    )) as DecodedToken;
    const user = await this.userService.getById(decodedAccessToken.id);
    if (!user) {
      throw new AppError(404, 'Usuario del token ya no existe');
    }
    return Sign({
      id: user.id,
      email: user.email ?? '',
      role: user.role,
    });
  }
}
