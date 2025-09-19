import { z } from 'zod';
import { createPostSchema, updatePostSchema } from '../schemas/postSchema';

export type CreatePostDto = z.infer<typeof createPostSchema>;
export type UpdatePostDto = z.infer<typeof updatePostSchema>;
