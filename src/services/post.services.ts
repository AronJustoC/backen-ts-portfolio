import type { Post } from '@prisma/client';
import { PostRepository } from '../repository/post.repository';
import { CreatePostDto, UpdatePostDto } from '../dtos/post.dto';

export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async create(authorId: number, postData: CreatePostDto): Promise<Post> {
    return this.postRepository.create(authorId, postData);
  }

  async getAll(onlyPublic?: boolean): Promise<Post[]> {
    return this.postRepository.getAll(onlyPublic);
  }

  async getById(id: number): Promise<Post | null> {
    return this.postRepository.getById(id);
  }

  async getBySlug(slug: string, onlyPublic?: boolean): Promise<Post | null> {
    return this.postRepository.getBySlug(slug, onlyPublic);
  }

  async update(
    id: number,
    userId: number,
    updateData: UpdatePostDto,
  ): Promise<Post | null> {
    return this.postRepository.update(id, userId, updateData);
  }

  async delete(id: number, userId: number): Promise<Post | null> {
    return this.postRepository.delete(id, userId);
  }
}
