import { PrismaClient } from '@prisma/client';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';

const prisma = new PrismaClient();

class UserRepository {
  /**
   * Busca y devuelve todos los usuarios de la base de datos.
   */
  async findAll() {
    return await prisma.user.findMany();
  }
  /**
   * Busca usuario por si ID.
   * @param id - El ID del usuario a buscar.
   */
  async findById(id: number) {
    return await prisma.user.findUnique({ where: { id } });
  }
  /**
   * Crear un usuario en la base de datos.
   * @param data - Los datos del usuario a crear.
   */
  async create(data: CreateUserDto) {
    return await prisma.user.create({
      data,
    });
  }
  /**
   * Actualizar datos del usuario por ID.
   * @param id - El ID del usuario a actualizar.
   * @param data - Los datos a actualizar.
   */
  async update(id: number, data: UpdateUserDto) {
    return await prisma.user.update({
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
    return await prisma.user.delete({ where: { id } });
  }
}

const userRepository = new UserRepository();

export default userRepository;
