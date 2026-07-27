import { Request, Response } from 'express';
import { UserService } from '../services/user.services';

export class UserController {
  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }
  async get(_req: Request, res: Response) {
    try {
      const users = await this.userService.getAll();
      const usersWithoutPasswords = users.map((user) => {
        const { password: _password, ...userData } = user;
        return userData;
      });
      res.status(200).json({ data: usersWithoutPasswords });
    } catch (error) {
      res.status(500).json({ error });
    }
  }
  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res
          .status(400)
          .json({ message: 'Formato invalido de ID de usuario' });
      }
      const user = await this.userService.getById(id);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      const { password: _password, ...userData } = user;
      res.status(200).json({ data: userData });
    } catch (error) {
      res.status(500).json({ error });
    }
  }
  async create(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;
      const user = await this.userService.createUser({
        username,
        email,
        password,
      });
      res.status(201).json({ data: user });
    } catch (error) {
      res.status(500).json({ error });
    }
  }
  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res
          .status(400)
          .json({ message: 'Formato invalido de ID de usuario' });
      }
      const dataToUpdate = req.body;
      const updatedUser = await this.userService.updateUser(
        id as number,
        dataToUpdate,
      );
      if (!updatedUser) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      const { password: _password, ...userData } = updatedUser;
      res.status(200).json({ data: userData });
    } catch (error) {
      res.status(500).json({ error });
    }
  }
  async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await this.userService.remove(id);
      res.status(201).json({ data: 'ok' });
    } catch (error) {
      res.status(500).json({ error });
    }
  }
}
