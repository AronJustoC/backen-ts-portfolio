import { Request, Response } from 'express';
import { ProjectService } from '../services/project.services';

export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}
  async create(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const project = await this.projectService.create(req.user.id, req.body);
      res.status(200).json({ project });
    } catch (error) {
      res.status(500).json({ error });
    }
  }
  async getAll(_req: Request, res: Response) {
    try {
      const posts = await this.projectService.getAll();
      res.status(200).json({ posts });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  async gerById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const project = await this.projectService.getById(Number(id));
      if (!project)
        return res.status(404).json({ message: 'Project not found' });
      res.status(200).json({ project });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  async update(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const { id } = req.params;
      const updatedProject = await this.projectService.update(
        Number(id),
        req.user?.id,
        req.body,
      );
      if (!updatedProject)
        return res
          .status(404)
          .json({ message: 'Post not found or unauthorized' });
      res.status(200).json({ project: updatedProject });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const { id } = req.params;
      const deletedProject = await this.projectService.delete(
        Number(id),
        req.user.id,
      );
      if (!deletedProject)
        return res
          .status(404)
          .json({ message: 'Project not found or unauthorized' });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error });
    }
  }
}
