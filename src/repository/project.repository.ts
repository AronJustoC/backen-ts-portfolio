import { PrismaClient } from '@prisma/client';
import type { CreateProjectDto, UpdateProjectDto } from '../dtos/project.dto';
import type { Project } from '@prisma/client';

export class ProjectRepository {
  private readonly prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(
    userId: number,
    projectData: CreateProjectDto,
  ): Promise<Project> {
    return this.prisma.project.create({
      data: {
        ...projectData,
        owner: {
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
    updateData: UpdateProjectDto,
  ): Promise<Project | null> {
    return await this.prisma.project.update({
      where: { id: id, userId: userId },
      data: updateData,
    });
  }

  async getAll(): Promise<Project[]> {
    return await this.prisma.project.findMany({
      include: {
        owner: {
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

  async gerById(id: number): Promise<Project | null> {
    return await this.prisma.project.findUnique({ where: { id } });
  }

  async delete(id: number, userId: number): Promise<Project | null> {
    const deletedProject = await this.prisma.project.findUnique({
      where: { id },
    });
    if (!deletedProject || deletedProject.userId !== userId) {
      return null;
    }
    return this.prisma.project.delete({ where: { id } });
  }
}
