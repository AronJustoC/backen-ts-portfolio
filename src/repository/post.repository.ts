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

  async update(
    id: number,
    userId: number,
    updateData: UpdatePostDto,
  ): Promise<Post | null> {
    return this.prisma.post.update({
      where: { id: id, userId: userId },
      data: updateData,
    });
  }

  async getAll(): Promise<Post[]> {
    return await this.prisma.post.findMany({
      include: {
        author: true,
      },
    });
  }

  async getById(id: number): Promise<Post | null> {
    return await this.prisma.post.findUnique({ where: { id } });
  }

  async getBySlug(slug: string): Promise<Post | null> {
    return await this.prisma.post.findUnique({
      where: { slug },
      include: { author: true },
    });
  }

  async delete(id: number, userId: number): Promise<Post | null> {
    const deletedPost = await this.prisma.post.findUnique({
      where: { id },
    });
    if (!deletedPost || deletedPost.userId !== userId) return null;
    return this.prisma.post.delete({ where: { id } });
  }
}
