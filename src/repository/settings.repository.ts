import { PrismaClient } from '@prisma/client';
import type { Prisma, SiteSetting } from '@prisma/client';

export class SettingsRepository {
  private readonly prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findByKey(key: string): Promise<SiteSetting | null> {
    return await this.prisma.siteSetting.findUnique({ where: { key } });
  }

  async upsert(key: string, value: Prisma.InputJsonValue): Promise<SiteSetting> {
    return await this.prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}
