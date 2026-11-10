import type { Request, Response } from 'express';
import { SettingsService } from '../services/settings.service';
import { updateNavSchema } from '../schemas/settingsSchema';

export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  async getNav(_req: Request, res: Response) {
    try {
      const { tabs } = await this.settingsService.getNav();
      res.status(200).json({ tabs });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  async updateNav(req: Request, res: Response) {
    try {
      const parsed = updateNavSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: parsed.error.issues,
        });
      }
      const { tabs } = await this.settingsService.updateNav(parsed.data);
      res.status(200).json({ tabs });
    } catch (error) {
      res.status(500).json({ error });
    }
  }
}
