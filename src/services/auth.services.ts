import { compare } from 'bcryptjs';
import { UserService } from './user.services';
import { Sign } from '../utils/jwt.utils';

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
    });
    return token;
  }
  async refreshToken(user: { id: number; email: string }) {
    try {
      const token = await Sign(user);
      console.log(token);
      return token;
    } catch (error) {
      console.log(error);
    }
  }
}
