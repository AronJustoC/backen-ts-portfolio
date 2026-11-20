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
      console.error(error);
      res.status(500).json({ message: 'Ha ocurrido un error interno en el servidor.' });
    }
  }
  async getAll(_req: Request, res: Response) {
    try {
      const projects = await this.projectService.getAll();
      res.status(200).json({ projects });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Ha ocurrido un error interno en el servidor.' });
    }
  }

  async getPortada(_req: Request, res: Response) {
    try {
      const projects = await this.projectService.getPortada();
      res.status(200).json({ projects });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Ha ocurrido un error interno en el servidor.' });
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
      console.error(error);
      res.status(500).json({ message: 'Ha ocurrido un error interno en el servidor.' });
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
      console.error(error);
      res.status(500).json({ message: 'Ha ocurrido un error interno en el servidor.' });
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
      console.error(error);
      res.status(500).json({ message: 'Ha ocurrido un error interno en el servidor.' });
    }
  }
}
