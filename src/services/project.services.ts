import { CreateProjectDto } from '../dtos/project.dto';
import { Project } from '@prisma/client';
import { ProjectRepository } from '../repository/project.repository';
import { UpdatePostDto } from '../dtos/post.dto';

export class ProjectService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async create(
    userId: number,
    projectData: CreateProjectDto,
  ): Promise<Project> {
    return this.projectRepository.create(userId, projectData);
  }

  async getAll(): Promise<Project[]> {
    return this.projectRepository.getAll();
  }

  async getById(id: number): Promise<Project | null> {
    return this.projectRepository.gerById(id);
  }

  async update(
    id: number,
    userId: number,
    updateData: UpdatePostDto,
  ): Promise<Project | null> {
    return this.projectRepository.update(id, userId, updateData);
  }

  async delete(id: number, userId: number): Promise<Project | null> {
    return this.projectRepository.delete(id, userId);
  }
}
