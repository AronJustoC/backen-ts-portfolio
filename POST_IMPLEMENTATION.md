## Guía para Implementar la Funcionalidad de Posts

A continuación se detallan los pasos para implementar la gestión de posts en el proyecto.

### 1. Migración de la Base de Datos

Primero, asegúrate de que tu archivo `prisma/schema.prisma` contenga el modelo `Post`. Si ya está ahí, puedes crear la migración con el siguiente comando:

```bash
bun run prisma:migrate:dev --name add_post_model
```

### 2. Crear el Esquema de Validación (`postSchema.ts`)

Crea el archivo `src/schemas/postSchema.ts` con el siguiente contenido:

```typescript
import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres.'),
  content: z.string().min(10, 'El contenido debe tener al menos 10 caracteres.'),
  slug: z.string().min(3, 'El slug debe tener al menos 3 caracteres.'),
});

export const updatePostSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres.').optional(),
  content: z.string().min(10, 'El contenido debe tener al menos 10 caracteres.').optional(),
  slug: z.string().min(3, 'El slug debe tener al menos 3 caracteres.').optional(),
});
```

### 3. Crear el Repositorio (`post.repository.ts`)

Crea el archivo `src/repository/post.repository.ts` con el siguiente contenido:

```typescript
import { prisma } from '../utils/prisma.utils';
import type { Post } from '@prisma/client';

export class PostRepository {
  async create(data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    return prisma.post.create({ data });
  }

  async getAll(): Promise<Post[]> {
    return prisma.post.findMany();
  }

  async getById(id: number): Promise<Post | null> {
    return prisma.post.findUnique({ where: { id } });
  }

  async update(id: number, data: Partial<Omit<Post, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Post | null> {
    return prisma.post.update({ where: { id }, data });
  }

  async remove(id: number): Promise<Post | null> {
    return prisma.post.delete({ where: { id } });
  }
}
```

### 4. Crear el Servicio (`post.service.ts`)

Crea el archivo `src/services/post.service.ts` con el siguiente contenido:

```typescript
import type { Post } from '@prisma/client';
import { PostRepository } from '../repository/post.repository';

export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async create(data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    return this.postRepository.create(data);
  }

  async getAll(): Promise<Post[]> {
    return this.postRepository.getAll();
  }

  async getById(id: number): Promise<Post | null> {
    return this.postRepository.getById(id);
  }

  async update(id: number, data: Partial<Omit<Post, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Post | null> {
    return this.postRepository.update(id, data);
  }

  async remove(id: number): Promise<Post | null> {
    return this.postRepository.remove(id);
  }
}
```

### 5. Crear el Controlador (`post.controller.ts`)

Crea el archivo `src/controllers/post.controller.ts` con el siguiente contenido:

```typescript
import type { Request, Response } from 'express';
import { PostService } from '../services/post.service';

export class PostController {
  constructor(private readonly postService: PostService) {}

  async create(req: Request, res: Response) {
    try {
      const post = await this.postService.create({ ...req.body, userId: req.user.id });
      res.status(201).json({ data: post });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  async getAll(_req: Request, res: Response) {
    try {
      const posts = await this.postService.getAll();
      res.status(200).json({ data: posts });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const post = await this.postService.getById(id);
      if (!post) {
        return res.status(404).json({ message: 'Post no encontrado' });
      }
      res.status(200).json({ data: post });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const post = await this.postService.update(id, req.body);
      if (!post) {
        return res.status(404).json({ message: 'Post no encontrado' });
      }
      res.status(200).json({ data: post });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const post = await this.postService.remove(id);
      if (!post) {
        return res.status(404).json({ message: 'Post no encontrado' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error });
    }
  }
}
```

### 6. Crear las Rutas (`post.routes.ts`)

Crea el archivo `src/routes/post.routes.ts` con el siguiente contenido:

```typescript
import { Router } from 'express';
import { PostController } from '../controllers/post.controller';
import { PostService } from '../services/post.service';
import { PostRepository } from '../repository/post.repository';
import { ValidateBody } from '../middleware/validateBody.middleware';
import { createPostSchema, updatePostSchema } from '../schemas/postSchema';

const router = Router();
const postRepository = new PostRepository();
const postService = new PostService(postRepository);
const postController = new PostController(postService);

router.post('/', ValidateBody(createPostSchema), (req, res) => postController.create(req, res));
router.get('/', (req, res) => postController.getAll(req, res));
router.get('/:id', (req, res) => postController.getById(req, res));
router.patch('/:id', ValidateBody(updatePostSchema), (req, res) => postController.update(req, res));
router.delete('/:id', (req, res) => postController.remove(req, res));

export default router;
```

### 7. Actualizar el Enrutador Principal (`index.ts`)

Finalmente, actualiza el archivo `src/routes/index.ts` para incluir las rutas de los posts:

```typescript
import { Router } from 'express';
import authRouter from './auth.routes';
import userRouter from './user.routes';
import postRouter from './post.routes'; // Importar las rutas de posts
import { validateToken } from '../middleware/auth.middleware';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', validateToken, userRouter);
router.use('/posts', validateToken, postRouter); // Añadir las rutas de posts

export default router;
```
