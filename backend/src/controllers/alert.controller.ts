import { Request, Response } from 'express';
import { AlertService } from '../services/alert.service';
import { prisma } from '../utils/prisma';

export class AlertController {
  public static async getAlerts(req: Request, res: Response) {
    try {
      const alerts = await AlertService.syncAlerts();
      return res.json(alerts);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async resolveAlert(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await prisma.systemAlert.update({
        where: { id },
        data: { resolved: true }
      });
      return res.json({ message: 'Alert resolved successfully', alert: updated });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
