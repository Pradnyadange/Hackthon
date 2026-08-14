import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import bcrypt from 'bcryptjs';

export class TeacherController {
  public static async getAll(req: Request, res: Response) {
    try {
      const { search, department } = req.query;
      const where: any = {};

      if (department) where.department = String(department);
      if (search) {
        where.OR = [
          { name: { contains: String(search) } },
          { email: { contains: String(search) } },
          { department: { contains: String(search) } },
          { subjects: { contains: String(search) } }
        ];
      }

      const teachers = await prisma.teacher.findMany({
        where,
        include: {
          classes: true,
          timetableEntries: {
            include: { subject: true, room: true, class: true }
          }
        },
        orderBy: { name: 'asc' }
      });

      return res.json(teachers);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const teacher = await prisma.teacher.findUnique({
        where: { id },
        include: {
          classes: { include: { room: true } },
          timetableEntries: { include: { subject: true, room: true, class: true } }
        }
      });
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
      return res.json(teacher);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async create(req: Request, res: Response) {
    try {
      const { name, email, phone, department, subjects, qualifications, availability } = req.body;

      if (!name || !email || !department) {
        return res.status(400).json({ message: 'Name, email, and department are required.' });
      }

      // Create linked user login
      const passwordHash = await bcrypt.hash('teacher123', 10);
      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: 'TEACHER'
        }
      });

      const teacherId = `TCH-10${Math.floor(10 + Math.random() * 90)}`;

      const newTeacher = await prisma.teacher.create({
        data: {
          teacherId,
          name,
          email,
          phone: phone || '+91 98000 00000',
          department,
          subjects: subjects || department,
          qualifications: qualifications || 'B.Ed',
          joiningDate: new Date().toISOString().split('T')[0],
          availability: JSON.stringify(availability || ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']),
          userId: user.id
        }
      });

      return res.status(201).json(newTeacher);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await prisma.teacher.update({
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
      await prisma.teacher.delete({ where: { id } });
      return res.json({ message: 'Teacher deleted successfully', id });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
