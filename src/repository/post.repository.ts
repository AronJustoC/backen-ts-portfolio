import { PrismaClient } from '@prisma/client';
import type { CreatePostDto, UpdatePostDto } from '../dtos/post.dto';
import type { Post } from '@prisma/client';

export class PostRepository {
  private readonly prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(userId: number, postData: CreatePostDto): Promise<Post> {
    return this.prisma.post.create({
      data: {
        ...postData,
        author: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  // Solo ADMIN llega aquí (checkRole en la ruta): cualquier admin puede editar cualquier post.
  async update(
    id: number,
    _userId: number,
    updateData: UpdatePostDto,
  ): Promise<Post | null> {
    return this.prisma.post.update({
      where: { id },
      data: updateData,
    });
  }

  async getAll(onlyPublic = false): Promise<Post[]> {
    return await this.prisma.post.findMany({
      where: onlyPublic ? { publicado: true } : {},
      include: {
        author: {
          select: {
            id: true,
            username: true,
            bio: true,
            imageUrl: true,
          },
        },
      },
    });
  }

  async getById(id: number): Promise<Post | null> {
    return await this.prisma.post.findUnique({ where: { id } });
  }

  async getBySlug(slug: string, onlyPublic = false): Promise<Post | null> {
    return await this.prisma.post.findFirst({
      where: { slug, ...(onlyPublic ? { publicado: true } : {}) },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            bio: true,
            imageUrl: true,
          },
        },
      },
    });
  }

  // Solo ADMIN llega aquí: cualquier admin puede borrar cualquier post.
  async delete(id: number, _userId: number): Promise<Post | null> {
    const deletedPost = await this.prisma.post.findUnique({
      where: { id },
    });
    if (!deletedPost) return null;
    return this.prisma.post.delete({ where: { id } });
  }
}
