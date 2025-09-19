import z from 'zod';
import { createPostSchema, updatePostSchema } from '../schemas/postSchema';

export type CreateProjectDto = z.infer<typeof createPostSchema>;
export type UpdateProjectDto = z.infer<typeof updatePostSchema>;
