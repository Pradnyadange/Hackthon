import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export class SubjectController {
  public static async getAll(req: Request, res: Response) {
    try {
      const subjects = await prisma.subject.findMany({
        orderBy: { name: 'asc' }
      });
      return res.json(subjects);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async create(req: Request, res: Response) {
    try {
      const { name, code, weeklyPeriods } = req.body;
      if (!name || !code) {
        return res.status(400).json({ message: 'Subject name and code are required.' });
      }
      const newSubject = await prisma.subject.create({
        data: {
          name,
          code,
          weeklyPeriods: Number(weeklyPeriods) || 5
        }
      });
      return res.status(201).json(newSubject);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await prisma.subject.update({
        where: { id },
        data: req.body
      });
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.subject.delete({ where: { id } });
      return res.json({ message: 'Subject deleted successfully', id });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
