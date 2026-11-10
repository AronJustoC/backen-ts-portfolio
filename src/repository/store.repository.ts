import { PrismaClient } from '@prisma/client';
import type { Prisma, StoreCategory, StoreProduct } from '@prisma/client';
import type {
  StoreCategoryCreateDto,
  StoreCategoryUpdateDto,
  StoreProductCreateDto,
  StoreProductUpdateDto,
} from '../schemas/storeSchema';

export class StoreRepository {
  private readonly prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async listPublicProducts() {
    return await this.prisma.storeProduct.findMany({
      where: { active: true },
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  async listAllProducts() {
    return await this.prisma.storeProduct.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProductBySlug(slug: string, includeInactive = false) {
    return await this.prisma.storeProduct.findFirst({
      where: {
        slug,
        ...(includeInactive ? {} : { active: true }),
      },
      include: { category: true },
    });
  }

  async createProduct(data: StoreProductCreateDto): Promise<StoreProduct> {
    return await this.prisma.storeProduct.create({
      data: {
        slug: data.slug,
        name: data.name,
        description: data.description,
        priceCents: data.priceCents,
        categoryId: data.categoryId,
        images: data.images,
        variants: data.variants as unknown as Prisma.InputJsonValue,
        soldOut: data.soldOut,
        active: data.active,
      },
      include: { category: true },
    });
  }

  async updateProductById(
    id: number,
    data: StoreProductUpdateDto,
  ): Promise<StoreProduct> {
    const updateData: Prisma.StoreProductUpdateInput = {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.priceCents !== undefined && { priceCents: data.priceCents }),
      ...(data.categoryId !== undefined && {
        category: { connect: { id: data.categoryId } },
      }),
      ...(data.images !== undefined && { images: data.images }),
      ...(data.variants !== undefined && {
        variants: data.variants as unknown as Prisma.InputJsonValue,
      }),
      ...(data.soldOut !== undefined && { soldOut: data.soldOut }),
      ...(data.active !== undefined && { active: data.active }),
    };

    return await this.prisma.storeProduct.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });
  }

  async setSoldOut(id: number, soldOut: boolean): Promise<StoreProduct> {
    return await this.prisma.storeProduct.update({
      where: { id },
      data: { soldOut },
      include: { category: true },
    });
  }

  async deleteProductById(id: number): Promise<StoreProduct> {
    return await this.prisma.storeProduct.delete({
      where: { id },
    });
  }

  async listCategories(): Promise<StoreCategory[]> {
    return await this.prisma.storeCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async getCategoryById(id: number): Promise<StoreCategory | null> {
    return await this.prisma.storeCategory.findUnique({
      where: { id },
    });
  }

  async getCategoryBySlug(slug: string): Promise<StoreCategory | null> {
    return await this.prisma.storeCategory.findUnique({
      where: { slug },
    });
  }

  async createCategory(data: StoreCategoryCreateDto): Promise<StoreCategory> {
    return await this.prisma.storeCategory.create({
      data,
    });
  }

  async updateCategoryById(
    id: number,
    data: StoreCategoryUpdateDto,
  ): Promise<StoreCategory> {
    return await this.prisma.storeCategory.update({
      where: { id },
      data,
    });
  }

  async deleteCategoryById(id: number): Promise<StoreCategory> {
    return await this.prisma.storeCategory.delete({
      where: { id },
    });
  }

  async countProductsByCategory(categoryId: number): Promise<number> {
    return await this.prisma.storeProduct.count({
      where: { categoryId },
    });
  }
}
