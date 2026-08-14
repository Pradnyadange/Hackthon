import { Response } from 'express';
import { prisma } from '../utils/prisma';

export class NotificationController {
  public static async getAll(req: any, res: Response) {
    try {
      const userId = req.user ? req.user.id : null;
      const where = userId ? { userId } : {};

      const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      const unreadCount = await prisma.notification.count({
        where: { ...where, read: false }
      });

      return res.json({ notifications, unreadCount });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async markAsRead(req: any, res: Response) {
    try {
      const { id } = req.params;
      const updated = await prisma.notification.update({
        where: { id },
        data: { read: true }
      });
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async markAllAsRead(req: any, res: Response) {
    try {
      const userId = req.user ? req.user.id : null;
      const where = userId ? { userId } : {};

      await prisma.notification.updateMany({
        where: { ...where, read: false },
        data: { read: true }
      });
      return res.json({ message: 'All notifications marked as read' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
