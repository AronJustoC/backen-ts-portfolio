import type { Request, Response } from 'express';
import { UserService } from '../services/user.services';
import { createUserSchema } from '../schemas/userSchema';

export class AuthController {
  private readonly userService: UserService;
  constructor(userService: UserService) {
    this.userService = userService;
  }
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const token = this.userService.login(email, password);
      res.status(200).json({ token });
    } catch (error) {
      res
        .status(500)
        .json({ error: { message: 'Credenciales invalidos', error } });
    }
  }
  async register(req: Request, res: Response) {
    try {
      const data = req.body;
      const validatedData = createUserSchema.parse(data);
      await this.userService.createUser(validatedData);
      res.status(200).json({ data: 'ok' });
    } catch (error) {
      res.status(500).json({ error });
    }
  }
}
