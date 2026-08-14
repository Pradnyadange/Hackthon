import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { TimetableGeneratorService } from '../services/timetable-generator.service';

export class TimetableController {
  public static async getAll(req: Request, res: Response) {
    try {
      const { classId, teacherId, day } = req.query;
      const where: any = {};

      if (classId) where.classId = String(classId);
      if (teacherId) where.teacherId = String(teacherId);
      if (day) where.day = String(day);

      const entries = await prisma.timetableEntry.findMany({
        where,
        include: {
          class: true,
          subject: true,
          teacher: true,
          room: true
        },
        orderBy: [{ day: 'asc' }, { period: 'asc' }]
      });

      // Run global conflict validation across ALL classes in the school database
      const allConflicts = await TimetableGeneratorService.validateTimetable();

      // Include conflicts relevant to the current class/view
      const conflicts = classId
        ? allConflicts.filter(c => !c.relatedEntities?.classId || c.relatedEntities.classId === String(classId))
        : allConflicts;

      return res.json({ entries, conflicts });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async generate(req: Request, res: Response) {
    try {
      const result = await TimetableGeneratorService.generateTimetable();
      return res.json({
        message: `Successfully generated ${result.count} timetable slots across classes.`,
        generatedCount: result.count,
        conflicts: result.conflicts || []
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async simulateConflict(req: Request, res: Response) {
    try {
      const cls = await prisma.class.findFirst();
      const teacher = await prisma.teacher.findFirst();
      const room = await prisma.room.findFirst();
      const subject = await prisma.subject.findFirst();

      if (cls && teacher && room && subject) {
        // Create simulated double-booking conflict
        await prisma.timetableEntry.create({
          data: {
            classId: cls.id,
            subjectId: subject.id,
            teacherId: teacher.id,
            roomId: room.id,
            day: 'MONDAY',
            period: 1
          }
        });
      }

      return res.json({
        message: 'Simulated timetable double-booking conflict injected successfully.',
        conflicts: [
          {
            id: 'conf-1',
            type: 'TEACHER_DOUBLE_BOOKING',
            severity: 'HIGH',
            description: `Teacher ${teacher?.name || 'Sunita Verma'} is double-booked on MONDAY Period 1 (9:00 AM) in multiple classrooms.`,
            day: 'MONDAY',
            period: 1,
            relatedEntities: { teacherId: teacher?.id }
          },
          {
            id: 'conf-2',
            type: 'ROOM_DOUBLE_BOOKING',
            severity: 'HIGH',
            description: `Room ${room?.roomName || '201'} is double-booked on WEDNESDAY Period 3 (11:00 AM) for Physics and Chemistry.`,
            day: 'WEDNESDAY',
            period: 3,
            relatedEntities: { roomId: room?.id }
          }
        ]
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async validate(req: Request, res: Response) {
    try {
      const conflicts = await TimetableGeneratorService.validateTimetable();
      return res.json({
        conflictCount: conflicts.length,
        hasConflicts: conflicts.length > 0,
        conflicts
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await prisma.timetableEntry.update({
        where: { id },
        data: req.body,
        include: { class: true, subject: true, teacher: true, room: true }
      });
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.timetableEntry.delete({ where: { id } });
      return res.json({ message: 'Timetable entry deleted successfully', id });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
