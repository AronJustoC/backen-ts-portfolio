import type { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';
import type { UserRepository } from '../repository/user.repository';
import { hashPassword } from '../utils/bcrypt.utils';

export class UserService {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async getAll() {
    return this.userRepository.getAll();
  }

  async getById(id: number) {
    return this.userRepository.getById(id);
  }

  async getByEmail(email: string) {
    return this.userRepository.getByEmail(email);
  }

  async createUser(data: CreateUserDto) {
    const hashedPassword = await hashPassword(data.password);
    return this.userRepository.create({ ...data, password: hashedPassword });
  }

  async updateUser(id: number, data: UpdateUserDto) {
    await this.getById(id);
    return this.userRepository.update(id, data);
  }

  async remove(id: number) {
    await this.getById(id);
    await this.userRepository.delete(id);
  }
}
