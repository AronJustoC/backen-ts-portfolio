import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { CourseService } from '../services/course.services';
import { AppError } from '../utils/error.utils';
import {
  destroyCloudinaryAsset,
  parseCloudinaryAsset,
} from '../services/upload.services';

// Devuelve 409 si Prisma reporta una violación de unicidad (slug u orden).
function handleError(error: unknown, res: Response, conflictMessage: string) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    return res.status(409).json({ message: conflictMessage });
  }
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2025'
  ) {
    return res.status(404).json({ message: 'Recurso no encontrado' });
  }
  return res.status(500).json({ error });
}

function parseId(raw: string | string[] | undefined): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  async listPublic(_req: Request, res: Response) {
    try {
      const courses = await this.courseService.listPublished();
      res.status(200).json({ courses });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  async getPublicBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      if (typeof slug !== 'string') {
        return res.status(400).json({ message: 'Invalid slug' });
      }
      const course = await this.courseService.getPublishedBySlug(slug);
      if (!course) return res.status(404).json({ message: 'Course not found' });
      res.status(200).json({ course });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  async listAdmin(_req: Request, res: Response) {
    try {
      const courses = await this.courseService.listAll();
      res.status(200).json({ courses });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseId(req.params.id);
      if (id === null) return res.status(400).json({ message: 'Invalid id' });
      const course = await this.courseService.getById(id);
      if (!course) return res.status(404).json({ message: 'Course not found' });
      res.status(200).json({ course });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  async create(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const course = await this.courseService.create(req.user.id, req.body);
      res.status(201).json({ course });
    } catch (error) {
      handleError(error, res, 'Ya existe un curso con ese slug.');
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseId(req.params.id);
      if (id === null) return res.status(400).json({ message: 'Invalid id' });
      const course = await this.courseService.update(id, req.body);
      res.status(200).json({ course });
    } catch (error) {
      handleError(error, res, 'Ya existe un curso con ese slug.');
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseId(req.params.id);
      if (id === null) return res.status(400).json({ message: 'Invalid id' });
      await this.courseService.delete(id);
      res.status(204).send();
    } catch (error) {
      handleError(error, res, 'Conflicto al borrar el curso.');
    }
  }

  async createLesson(req: Request, res: Response) {
    try {
      const courseId = parseId(req.params.id);
      if (courseId === null)
        return res.status(400).json({ message: 'Invalid id' });
      const lesson = await this.courseService.createLesson(courseId, req.body);
      res.status(201).json({ lesson });
    } catch (error) {
      handleError(
        error,
        res,
        'Ya existe una lección con ese orden en este curso.',
      );
    }
  }

  async updateLesson(req: Request, res: Response) {
    try {
      const courseId = parseId(req.params.id);
      const lessonId = parseId(req.params.lessonId);
      if (courseId === null || lessonId === null) {
        return res.status(400).json({ message: 'Invalid id' });
      }
      const lesson = await this.courseService.updateLesson(
        lessonId,
        courseId,
        req.body,
      );
      if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
      res.status(200).json({ lesson });
    } catch (error) {
      handleError(
        error,
        res,
        'Ya existe una lección con ese orden en este curso.',
      );
    }
  }

  async deleteLesson(req: Request, res: Response) {
    try {
      const courseId = parseId(req.params.id);
      const lessonId = parseId(req.params.lessonId);
      if (courseId === null || lessonId === null) {
        return res.status(400).json({ message: 'Invalid id' });
      }
      const lesson = await this.courseService.deleteLesson(lessonId, courseId);
      if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
      // La lección ya está borrada. Si Cloudinary falla, se registra y se responde 204
      // igual: el asset queda huérfano y se limpia a mano (decisión del plan).
      for (const url of [lesson.videoUrl, lesson.attachmentUrl]) {
        const asset = parseCloudinaryAsset(url);
        if (!asset) continue;
        try {
          await destroyCloudinaryAsset(asset.publicId, asset.resourceType);
        } catch (error) {
          console.error(
            'No se pudo borrar asset de Cloudinary:',
            asset.publicId,
            error,
          );
        }
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  // Alumno

  async enroll(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const courseId = parseId(req.params.id);
      if (courseId === null)
        return res.status(400).json({ message: 'Invalid id' });
      const { enrollment, created } = await this.courseService.enroll(
        req.user.id,
        courseId,
      );
      res.status(created ? 201 : 200).json({ enrollment });
    } catch (error) {
      handleError(error, res, '');
    }
  }

  async myCourses(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const courses = await this.courseService.listMyCourses(req.user.id);
      res.status(200).json({ courses });
    } catch (error) {
      handleError(error, res, '');
    }
  }

  async myCourseProgress(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const { slug } = req.params;
      if (typeof slug !== 'string') {
        return res.status(400).json({ message: 'Invalid slug' });
      }
      const result = await this.courseService.getMyCourseProgress(
        req.user.id,
        slug,
      );
      res.status(200).json(result);
    } catch (error) {
      handleError(error, res, '');
    }
  }

  async updateProgress(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const courseId = parseId(req.params.id);
      const lessonId = parseId(req.params.lessonId);
      if (courseId === null || lessonId === null) {
        return res.status(400).json({ message: 'Invalid id' });
      }
      const progress = await this.courseService.updateMyProgress(
        req.user.id,
        courseId,
        lessonId,
        req.body,
      );
      res.status(200).json({ progress });
    } catch (error) {
      handleError(error, res, '');
    }
  }
}
