import type { NextFunction, Request, Response } from 'express';
import type { UserService } from '../services/user.services';
import { createUserSchema } from '../schemas/userSchema';
import type { AuthService } from '../services/auth.services';
import { AppError } from '../utils/error.utils';

export class AuthController {
  private readonly authService: AuthService;
  private readonly userService: UserService;

  constructor(authService: AuthService, userService: UserService) {
    this.authService = authService;
    this.userService = userService;
  }
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const token = await this.authService.login(email, password);
      return res.status(200).json({ token });
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const validatedData = createUserSchema.parse(data);
      await this.userService.createUser(validatedData);
      res.status(200).json({ data: 'ok' });
    } catch (error) {
      next(error);
    }
  }

  async refreshSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new AppError(400, 'Refresh token no poporcionado');
      }
      const newTokens = await this.authService.refreshSession(refreshToken);
      return res.status(200).json(newTokens);
    } catch (error) {
      next(error);
    }
  }
}
