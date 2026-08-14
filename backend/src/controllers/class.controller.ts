import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export class ClassController {
  public static async getAll(req: Request, res: Response) {
    try {
      const classes = await prisma.class.findMany({
        include: {
          classTeacher: true,
          room: true,
          _count: { select: { students: true } }
        },
        orderBy: [{ grade: 'asc' }, { division: 'asc' }]
      });
      return res.json(classes);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const cls = await prisma.class.findUnique({
        where: { id },
        include: {
          classTeacher: true,
          room: true,
          students: true,
          timetableEntries: { include: { subject: true, teacher: true, room: true } }
        }
      });
      if (!cls) return res.status(404).json({ message: 'Class not found' });
      return res.json(cls);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async create(req: Request, res: Response) {
    try {
      const { grade, division, academicYear, classTeacherId, roomId } = req.body;
      if (!grade || !division) {
        return res.status(400).json({ message: 'Grade and division are required.' });
      }

      const newClass = await prisma.class.create({
        data: {
          grade,
          division,
          academicYear: academicYear || '2026-2027',
          classTeacherId: classTeacherId || null,
          roomId: roomId || null
        },
        include: { classTeacher: true, room: true }
      });
      return res.status(201).json(newClass);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await prisma.class.update({
        where: { id },
        data: req.body,
        include: { classTeacher: true, room: true }
      });
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.class.delete({ where: { id } });
      return res.json({ message: 'Class deleted successfully', id });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
