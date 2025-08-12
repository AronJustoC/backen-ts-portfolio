import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';
import { PrismaClient } from '@prisma/client';

export class UserRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Busca y devuelve todos los usuarios de la base de datos.
   */
  async findAll() {
    return await this.prisma.user.findMany();
  }
  /**
   * Busca usuario por su ID.
   * @param id - El ID del usuario a buscar.
   */
  async findById(id: number) {
    return await this.prisma.user.findUnique({ where: { id } });
  }
  /**
   * Busca usuario por su Email
   * @param email - El Email del usuario a buscar.
   */
  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }
  /**
   * Crear un usuario en la base de datos.
   * @param data - Los datos del usuario a crear.
   */
  async create(data: CreateUserDto) {
    return await this.prisma.user.create({
      data,
    });
  }
  /**
   * Actualizar datos del usuario por ID.
   * @param id - El ID del usuario a actualizar.
   * @param data - Los datos a actualizar.
   */
  async update(id: number, data: UpdateUserDto) {
    return await this.prisma.user.update({
      where: {
        id: id,
      },
      data: data,
    });
  }
  /**
   * Elimina un usuario de la base de datos por su ID.
   * @param id - El ID del usuario que se elimina.
   */
  async delete(id: number) {
    return await this.prisma.user.delete({ where: { id } });
  }
}
