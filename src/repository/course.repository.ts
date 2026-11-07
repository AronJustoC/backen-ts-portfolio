import { PrismaClient } from '@prisma/client';
import type { Course, Lesson, LessonProgress } from '@prisma/client';
import type {
  CreateCourseDto,
  UpdateCourseDto,
  CreateLessonDto,
  UpdateLessonDto,
  UpdateProgressDto,
} from '../dtos/course.dto';

type ChapterInput = { time: number; title: string }[];

export class CourseRepository {
  private readonly prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findPublished() {
    return await this.prisma.course.findMany({
      where: { publicado: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        imageUrl: true,
        createdAt: true,
        _count: { select: { lessons: true } },
      },
    });
  }

  async findAll() {
    return await this.prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { lessons: true } } },
    });
  }

  async findPublishedBySlug(slug: string) {
    return await this.prisma.course.findFirst({
      where: { slug, publicado: true },
      include: {
        lessons: { orderBy: { orden: 'asc' }, include: lessonInclude },
      },
    });
  }

  async findPublishedById(id: number) {
    return await this.prisma.course.findFirst({
      where: { id, publicado: true },
    });
  }

  async findById(id: number) {
    return await this.prisma.course.findUnique({
      where: { id },
      include: {
        lessons: { orderBy: { orden: 'asc' }, include: lessonInclude },
      },
    });
  }

  async create(userId: number, data: CreateCourseDto): Promise<Course> {
    return await this.prisma.course.create({
      data: {
        ...data,
        author: { connect: { id: userId } },
      },
    });
  }

  async update(id: number, data: UpdateCourseDto): Promise<Course> {
    return await this.prisma.course.update({ where: { id }, data });
  }

  async delete(id: number): Promise<Course> {
    return await this.prisma.course.delete({ where: { id } });
  }

  // Los capítulos se guardan en la misma transacción que la lección.
  async createLesson(courseId: number, data: CreateLessonDto): Promise<Lesson> {
    const { chapters, ...lessonData } = data;
    return await this.prisma.$transaction(async (tx) => {
      const lesson = await tx.lesson.create({
        data: { ...lessonData, course: { connect: { id: courseId } } },
      });
      if (chapters?.length) {
        await tx.chapter.createMany({
          data: toChapterRows(lesson.id, chapters),
        });
      }
      return lesson;
    });
  }

  // Filtra por courseId: una lección de otro curso no se puede tocar por URL.
  // Si viene `chapters`, reemplaza la lista completa.
  async updateLesson(
    lessonId: number,
    courseId: number,
    data: UpdateLessonDto,
  ): Promise<Lesson | null> {
    const { chapters, ...lessonData } = data;
    return await this.prisma.$transaction(async (tx) => {
      const result = await tx.lesson.updateMany({
        where: { id: lessonId, courseId },
        data: lessonData,
      });
      if (result.count === 0) return null;
      if (chapters !== undefined) {
        await tx.chapter.deleteMany({ where: { lessonId } });
        if (chapters.length) {
          await tx.chapter.createMany({
            data: toChapterRows(lessonId, chapters),
          });
        }
      }
      return await tx.lesson.findUnique({ where: { id: lessonId } });
    });
  }

  // Devuelve la lección borrada para poder limpiar sus assets en Cloudinary.
  async deleteLesson(
    lessonId: number,
    courseId: number,
  ): Promise<Lesson | null> {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId, courseId },
    });
    if (!lesson) return null;
    await this.prisma.lesson.delete({ where: { id: lesson.id } });
    return lesson;
  }

  async findLesson(lessonId: number, courseId: number): Promise<Lesson | null> {
    return await this.prisma.lesson.findFirst({
      where: { id: lessonId, courseId },
    });
  }

  // Inscripciones

  async findEnrollment(userId: number, courseId: number) {
    return await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
  }

  async enroll(userId: number, courseId: number) {
    const existing = await this.findEnrollment(userId, courseId);
    if (existing) return { enrollment: existing, created: false };
    const enrollment = await this.prisma.enrollment.create({
      data: { userId, courseId },
    });
    return { enrollment, created: true };
  }

  async listEnrolledCourses(userId: number) {
    return await this.prisma.enrollment.findMany({
      where: { userId, course: { publicado: true } },
      orderBy: { createdAt: 'desc' },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            imageUrl: true,
            _count: { select: { lessons: true } },
          },
        },
      },
    });
  }

  async countCompletedByCourse(userId: number, courseIds: number[]) {
    const rows = await this.prisma.lessonProgress.findMany({
      where: {
        userId,
        completed: true,
        lesson: { courseId: { in: courseIds } },
      },
      select: { lesson: { select: { courseId: true } } },
    });
    const counts = new Map<number, number>();
    for (const row of rows) {
      const courseId = row.lesson.courseId;
      counts.set(courseId, (counts.get(courseId) ?? 0) + 1);
    }
    return counts;
  }

  // Progreso

  async findProgressForCourse(
    userId: number,
    courseId: number,
  ): Promise<LessonProgress[]> {
    return await this.prisma.lessonProgress.findMany({
      where: { userId, lesson: { courseId } },
    });
  }

  async upsertProgress(
    userId: number,
    lessonId: number,
    data: UpdateProgressDto,
  ): Promise<LessonProgress> {
    return await this.prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        completed: data.completed ?? false,
        lastPosition: data.lastPosition ?? 0,
      },
      update: data,
    });
  }
}

const lessonInclude = {
  chapters: { orderBy: { time: 'asc' as const } },
};

function toChapterRows(lessonId: number, chapters: ChapterInput) {
  return chapters.map((chapter, index) => ({
    lessonId,
    time: chapter.time,
    title: chapter.title,
    orden: index + 1,
  }));
}
