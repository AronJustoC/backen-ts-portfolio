import type { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';
import type { UserRepository } from '../repository/user.repository';
import { hashPassword, comparePassword } from '../utils/bcrypt.utils';
import { generateTokenPair } from '../utils/jwt.utils';

export class UserService {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async getAll() {
    return this.userRepository.findAll();
  }

  async getById(id: number) {
    return this.userRepository.findById(id);
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

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Password invalida');
    }
    const token = generateTokenPair({ id: user.id, email: user.email });
    return token;
  }
}
