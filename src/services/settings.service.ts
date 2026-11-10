import type { Prisma } from '@prisma/client';
import { SettingsRepository } from '../repository/settings.repository';
import type { UpdateNavDto } from '../schemas/settingsSchema';

export type NavTabKey = 'proyectos' | 'tienda' | 'blog' | 'cursos';
export type NavTabs = Record<NavTabKey, boolean>;

const NAV_KEY = 'nav';
const DEFAULT_NAV_TABS: NavTabs = {
  proyectos: true,
  tienda: true,
  blog: true,
  cursos: true,
};

function normalizeTabs(value: Prisma.JsonValue | null | undefined): NavTabs {
  const tabs: NavTabs = { ...DEFAULT_NAV_TABS };
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const key of Object.keys(DEFAULT_NAV_TABS) as NavTabKey[]) {
      const stored = (value as Record<string, unknown>)[key];
      if (typeof stored === 'boolean') {
        tabs[key] = stored;
      }
    }
  }
  return tabs;
}

export class SettingsService {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  async getNav(): Promise<{ tabs: NavTabs }> {
    const row = await this.settingsRepository.findByKey(NAV_KEY);
    return { tabs: normalizeTabs(row?.value) };
  }

  async updateNav(patch: UpdateNavDto): Promise<{ tabs: NavTabs }> {
    const current = await this.getNav();
    const tabs: NavTabs = { ...current.tabs, ...patch.tabs };
    await this.settingsRepository.upsert(
      NAV_KEY,
      tabs as unknown as Prisma.InputJsonValue,
    );
    return { tabs };
  }
}
