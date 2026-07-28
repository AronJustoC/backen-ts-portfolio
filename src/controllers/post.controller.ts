import type { Request, Response } from 'express';
import { PostService } from '../services/post.services';

export class PostController {
  constructor(private readonly postService: PostService) {}

  async create(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const post = await this.postService.create(req.user?.id, req.body);
      res.status(201).json({ post });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  async getAll(_req: Request, res: Response) {
    try {
      const posts = await this.postService.getAll();
      res.status(200).json({ posts });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const post = await this.postService.getById(Number(id));
      if (!post) return res.status(404).json({ message: 'Post not found' });
      res.status(200).json({ post });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  async getBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      if (typeof slug !== 'string') {
        return res.status(400).json({ message: 'Invalid slug' });
      }
      const post = await this.postService.getBySlug(slug);
      if (!post) return res.status(404).json({ message: 'Post not found' });
      res.status(200).json({ post });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  async update(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const { id } = req.params;
      const updatePost = await this.postService.update(
        Number(id),
        req.user?.id,
        req.body,
      );
      if (!updatePost)
        return res
          .status(404)
          .json({ message: 'Post not found or unauthorized' });
      res.status(200).json({ post: updatePost });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const { id } = req.params;
      const deleted = await this.postService.delete(Number(id), req.user.id);
      if (!deleted)
        return res
          .status(404)
          .json({ message: 'Post not found or unauthorized' });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error });
    }
  }
}
