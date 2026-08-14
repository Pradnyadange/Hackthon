import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export class AttendanceController {
  public static async getByClassAndDate(req: Request, res: Response) {
    try {
      const { classId, date } = req.query;
      if (!classId || !date) {
        return res.status(400).json({ message: 'Class ID and Date (YYYY-MM-DD) are required.' });
      }

      const students = await prisma.student.findMany({
        where: { classId: String(classId), status: 'ACTIVE' },
        orderBy: { rollNumber: 'asc' }
      });

      const existingRecords = await prisma.attendance.findMany({
        where: { classId: String(classId), date: String(date) }
      });

      const recordMap = new Map(existingRecords.map(r => [r.studentId, r]));

      const data = students.map(s => {
        const rec = recordMap.get(s.id);
        return {
          studentId: s.id,
          studentName: `${s.firstName} ${s.lastName}`,
          rollNumber: s.rollNumber,
          studentCode: s.studentId,
          status: rec ? rec.status : 'PRESENT',
          attendanceId: rec ? rec.id : null
        };
      });

      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async saveBulk(req: Request, res: Response) {
    try {
      const { classId, date, records } = req.body; // records: [{ studentId, status }]

      if (!classId || !date || !Array.isArray(records)) {
        return res.status(400).json({ message: 'Class ID, Date, and records array are required.' });
      }

      for (const rec of records) {
        const existing = await prisma.attendance.findFirst({
          where: { studentId: rec.studentId, classId, date }
        });

        if (existing) {
          await prisma.attendance.update({
            where: { id: existing.id },
            data: { status: rec.status }
          });
        } else {
          await prisma.attendance.create({
            data: {
              studentId: rec.studentId,
              classId,
              date,
              status: rec.status
            }
          });
        }
      }

      // Check low attendance for class
      const totalLogs = await prisma.attendance.count({ where: { classId } });
      const presentLogs = await prisma.attendance.count({
        where: { classId, status: { in: ['PRESENT', 'LATE'] } }
      });

      if (totalLogs > 0) {
        const rate = (presentLogs / totalLogs) * 100;
        if (rate < 75) {
          const cls = await prisma.class.findUnique({ where: { id: classId } });
          const className = cls ? `${cls.grade}-${cls.division}` : 'Class';

          await prisma.systemAlert.create({
            data: {
              type: 'LOW_ATTENDANCE',
              severity: 'HIGH',
              title: `Low Attendance Warning (${className})`,
              description: `Class ${className} attendance has dropped to ${rate.toFixed(1)}% (below 75% threshold).`,
              relatedEntity: 'attendance',
              actionLabel: 'Review Attendance',
              actionUrl: '/attendance'
            }
          });
        }
      }

      return res.json({ message: 'Attendance records saved successfully' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Simulated RFID / Auto-Attendance Scanner Endpoint
   */
  public static async scanRfid(req: Request, res: Response) {
    try {
      const { rfidCode, studentId, status = 'PRESENT' } = req.body;

      const student = await prisma.student.findFirst({
        where: {
          OR: [
            { studentId: rfidCode || studentId },
            { id: studentId }
          ]
        },
        include: { class: true }
      });

      if (!student) {
        return res.status(404).json({ message: 'No student found matching scanned RFID credentials.' });
      }

      const today = new Date().toISOString().split('T')[0];

      const existing = await prisma.attendance.findFirst({
        where: { studentId: student.id, date: today }
      });

      let record;
      if (existing) {
        record = await prisma.attendance.update({
          where: { id: existing.id },
          data: { status }
        });
      } else {
        record = await prisma.attendance.create({
          data: {
            studentId: student.id,
            classId: student.classId,
            date: today,
            status
          }
        });
      }

      return res.json({
        message: `Auto-Attendance scan logged: ${student.firstName} ${student.lastName} (${status})`,
        student,
        record
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
