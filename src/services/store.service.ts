import { StoreRepository } from '../repository/store.repository';
import type {
  StoreCategoryCreateDto,
  StoreCategoryUpdateDto,
  StoreProductCreateDto,
  StoreProductUpdateDto,
} from '../schemas/storeSchema';
import { AppError } from '../utils/error.utils';

export class StoreConflictError extends AppError {
  constructor(message: string) {
    super(409, message);
    this.name = 'StoreConflictError';
  }
}

export class StoreService {
  constructor(private readonly storeRepository: StoreRepository) {}

  async listPublicProducts() {
    return this.storeRepository.listPublicProducts();
  }

  async listAllProducts() {
    return this.storeRepository.listAllProducts();
  }

  async getProductBySlug(slug: string, includeInactive = false) {
    return this.storeRepository.getProductBySlug(slug, includeInactive);
  }

  async createProduct(data: StoreProductCreateDto) {
    const existing = await this.storeRepository.getProductBySlug(data.slug, true);
    if (existing) {
      throw new StoreConflictError('Ya existe un producto con ese slug.');
    }
    return this.storeRepository.createProduct(data);
  }

  async updateProductById(id: number, data: StoreProductUpdateDto) {
    return this.storeRepository.updateProductById(id, data);
  }

  async setSoldOut(id: number, soldOut: boolean) {
    return this.storeRepository.setSoldOut(id, soldOut);
  }

  async deleteProductById(id: number) {
    return this.storeRepository.deleteProductById(id);
  }

  async listCategories() {
    return this.storeRepository.listCategories();
  }

  async getCategoryById(id: number) {
    return this.storeRepository.getCategoryById(id);
  }

  async getCategoryBySlug(slug: string) {
    return this.storeRepository.getCategoryBySlug(slug);
  }

  async createCategory(data: StoreCategoryCreateDto) {
    const existing = await this.storeRepository.getCategoryBySlug(data.slug);
    if (existing) {
      throw new StoreConflictError('Ya existe una categoría con ese slug.');
    }
    return this.storeRepository.createCategory(data);
  }

  async updateCategoryById(id: number, data: StoreCategoryUpdateDto) {
    return this.storeRepository.updateCategoryById(id, data);
  }

  async deleteCategoryById(id: number) {
    const count = await this.storeRepository.countProductsByCategory(id);
    if (count > 0) {
      throw new StoreConflictError(
        'No se puede eliminar una categoría con productos asociados.',
      );
    }
    return this.storeRepository.deleteCategoryById(id);
  }

  async countProductsByCategory(categoryId: number) {
    return this.storeRepository.countProductsByCategory(categoryId);
  }
}
