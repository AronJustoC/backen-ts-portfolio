import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { StoreConflictError, StoreService } from '../services/store.service';
import { AppError } from '../utils/error.utils';
import {
  storeCategoryCreateSchema,
  storeCategoryUpdateSchema,
  storeProductCreateSchema,
  storeProductUpdateSchema,
  storeSoldOutSchema,
} from '../schemas/storeSchema';

function handleError(
  error: unknown,
  res: Response,
  conflictMessage = 'Conflicto con recurso existente.',
) {
  if (error instanceof StoreConflictError) {
    return res.status(error.statusCode).json({ message: error.message });
  }
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

export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  async listPublicProducts(_req: Request, res: Response) {
    try {
      const products = await this.storeService.listPublicProducts();
      res.status(200).json({ products });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  async getPublicProduct(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      if (typeof slug !== 'string') {
        return res.status(400).json({ message: 'Invalid slug' });
      }
      const product = await this.storeService.getProductBySlug(slug, false);
      if (!product || !product.active) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json({ product });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  async listPublicCategories(_req: Request, res: Response) {
    try {
      const categories = await this.storeService.listCategories();
      res.status(200).json({ categories });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  async listAdminProducts(_req: Request, res: Response) {
    try {
      const products = await this.storeService.listAllProducts();
      res.status(200).json({ products });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  async createCategory(req: Request, res: Response) {
    try {
      const parsed = storeCategoryCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: parsed.error.issues,
        });
      }
      const category = await this.storeService.createCategory(parsed.data);
      res.status(201).json({ category });
    } catch (error) {
      handleError(error, res, 'Ya existe una categoría con ese slug.');
    }
  }

  async updateCategory(req: Request, res: Response) {
    try {
      const id = parseId(req.params.id);
      if (id === null) return res.status(400).json({ message: 'Invalid id' });
      const parsed = storeCategoryUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: parsed.error.issues,
        });
      }
      const category = await this.storeService.updateCategoryById(
        id,
        parsed.data,
      );
      res.status(200).json({ category });
    } catch (error) {
      handleError(error, res, 'Ya existe una categoría con ese slug.');
    }
  }

  async deleteCategory(req: Request, res: Response) {
    try {
      const id = parseId(req.params.id);
      if (id === null) return res.status(400).json({ message: 'Invalid id' });
      await this.storeService.deleteCategoryById(id);
      res.status(204).send();
    } catch (error) {
      handleError(error, res, 'Conflicto al borrar la categoría.');
    }
  }

  async createProduct(req: Request, res: Response) {
    try {
      const parsed = storeProductCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: parsed.error.issues,
        });
      }
      const product = await this.storeService.createProduct(parsed.data);
      res.status(201).json({ product });
    } catch (error) {
      handleError(error, res, 'Ya existe un producto con ese slug.');
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const id = parseId(req.params.id);
      if (id === null) return res.status(400).json({ message: 'Invalid id' });
      const parsed = storeProductUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: parsed.error.issues,
        });
      }
      const product = await this.storeService.updateProductById(
        id,
        parsed.data,
      );
      res.status(200).json({ product });
    } catch (error) {
      handleError(error, res, 'Conflicto al actualizar el producto.');
    }
  }

  async setSoldOut(req: Request, res: Response) {
    try {
      const id = parseId(req.params.id);
      if (id === null) return res.status(400).json({ message: 'Invalid id' });
      const parsed = storeSoldOutSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: parsed.error.issues,
        });
      }
      const product = await this.storeService.setSoldOut(
        id,
        parsed.data.soldOut,
      );
      res.status(200).json({ product });
    } catch (error) {
      handleError(error, res, 'Error al actualizar estado de stock.');
    }
  }

  async deleteProduct(req: Request, res: Response) {
    try {
      const id = parseId(req.params.id);
      if (id === null) return res.status(400).json({ message: 'Invalid id' });
      await this.storeService.deleteProductById(id);
      res.status(204).send();
    } catch (error) {
      handleError(error, res, 'Conflicto al borrar el producto.');
    }
  }
}
