import { CourseRepository } from '../repository/course.repository';
import type {
  CreateCourseDto,
  UpdateCourseDto,
  CreateLessonDto,
  UpdateLessonDto,
  UpdateProgressDto,
} from '../dtos/course.dto';
import { AppError, NotFoundError } from '../utils/error.utils';

export class CourseService {
  constructor(private readonly courseRepository: CourseRepository) {}

  async listPublished() {
    const courses = await this.courseRepository.findPublished();
    return courses.map(({ _count, ...course }) => ({
      ...course,
      lessonCount: _count.lessons,
    }));
  }

  async getPublishedBySlug(slug: string) {
    return this.courseRepository.findPublishedBySlug(slug);
  }

  async listAll() {
    const courses = await this.courseRepository.findAll();
    return courses.map(({ _count, ...course }) => ({
      ...course,
      lessonCount: _count.lessons,
    }));
  }

  async getById(id: number) {
    return this.courseRepository.findById(id);
  }

  async create(authorId: number, data: CreateCourseDto) {
    return this.courseRepository.create(authorId, data);
  }

  async update(id: number, data: UpdateCourseDto) {
    return this.courseRepository.update(id, data);
  }

  async delete(id: number) {
    return this.courseRepository.delete(id);
  }

  async createLesson(courseId: number, data: CreateLessonDto) {
    return this.courseRepository.createLesson(courseId, data);
  }

  async updateLesson(
    lessonId: number,
    courseId: number,
    data: UpdateLessonDto,
  ) {
    return this.courseRepository.updateLesson(lessonId, courseId, data);
  }

  async deleteLesson(lessonId: number, courseId: number) {
    return this.courseRepository.deleteLesson(lessonId, courseId);
  }

  // Alumno

  async enroll(userId: number, courseId: number) {
    const course = await this.courseRepository.findPublishedById(courseId);
    if (!course) throw new NotFoundError('Curso no encontrado');
    return this.courseRepository.enroll(userId, courseId);
  }

  async listMyCourses(userId: number) {
    const enrollments = await this.courseRepository.listEnrolledCourses(userId);
    const courseIds = enrollments.map((e) => e.course.id);
    const completed = await this.courseRepository.countCompletedByCourse(
      userId,
      courseIds,
    );

    return enrollments.map(({ course }) => {
      const lessonCount = course._count.lessons;
      const completedCount = completed.get(course.id) ?? 0;
      const progressPercent =
        lessonCount === 0
          ? 0
          : Math.round((completedCount / lessonCount) * 100);
      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        imageUrl: course.imageUrl,
        lessonCount,
        completedCount,
        progressPercent,
      };
    });
  }

  async getMyCourseProgress(userId: number, slug: string) {
    const course = await this.courseRepository.findPublishedBySlug(slug);
    if (!course) throw new NotFoundError('Curso no encontrado');

    const enrollment = await this.courseRepository.findEnrollment(
      userId,
      course.id,
    );
    if (!enrollment) return { enrolled: false, lessons: [] };

    const rows = await this.courseRepository.findProgressForCourse(
      userId,
      course.id,
    );
    const byLesson = new Map(rows.map((row) => [row.lessonId, row]));

    return {
      enrolled: true,
      lessons: course.lessons.map((lesson) => {
        const row = byLesson.get(lesson.id);
        return {
          lessonId: lesson.id,
          completed: row?.completed ?? false,
          lastPosition: row?.lastPosition ?? 0,
        };
      }),
    };
  }

  async updateMyProgress(
    userId: number,
    courseId: number,
    lessonId: number,
    data: UpdateProgressDto,
  ) {
    const enrollment = await this.courseRepository.findEnrollment(
      userId,
      courseId,
    );
    if (!enrollment) {
      throw new AppError(403, 'Necesitas inscribirte para guardar tu avance.');
    }
    const lesson = await this.courseRepository.findLesson(lessonId, courseId);
    if (!lesson) throw new NotFoundError('Lección no encontrada');

    const progress = await this.courseRepository.upsertProgress(
      userId,
      lessonId,
      data,
    );
    return {
      lessonId: progress.lessonId,
      completed: progress.completed,
      lastPosition: progress.lastPosition,
    };
  }
}
