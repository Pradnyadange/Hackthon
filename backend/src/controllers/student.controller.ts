import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export class StudentController {
  public static async getAll(req: Request, res: Response) {
    try {
      const { search, classId, status, page = 1, limit = 50 } = req.query;

      const where: any = {};
      if (status) where.status = String(status);
      if (classId) where.classId = String(classId);
      if (search) {
        where.OR = [
          { firstName: { contains: String(search) } },
          { lastName: { contains: String(search) } },
          { studentId: { contains: String(search) } },
          { email: { contains: String(search) } }
        ];
      }

      const take = Number(limit);
      const skip = (Number(page) - 1) * take;

      const [students, total] = await Promise.all([
        prisma.student.findMany({
          where,
          include: { class: true },
          orderBy: { createdAt: 'desc' },
          take,
          skip
        }),
        prisma.student.count({ where })
      ]);

      return res.json({
        data: students,
        meta: {
          total,
          page: Number(page),
          limit: take,
          totalPages: Math.ceil(total / take)
        }
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const student = await prisma.student.findUnique({
        where: { id },
        include: {
          class: true,
          attendances: {
            take: 30,
            orderBy: { date: 'desc' }
          }
        }
      });

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Calculate student attendance percentage
      const totalAtt = student.attendances.length;
      const presentAtt = student.attendances.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
      const attendancePercentage = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 100;

      return res.json({ ...student, attendancePercentage });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async create(req: Request, res: Response, next: any) {
    try {
      const {
        firstName,
        lastName,
        dateOfBirth,
        gender,
        classId,
        division,
        rollNumber,
        parentName,
        parentPhone,
        email,
        address,
        admissionDate,
        emergencyContact,
        profilePhoto
      } = req.body;

      if (!firstName || !lastName || !classId || !parentPhone) {
        return res.status(400).json({ message: 'First name, last name, class, and parent phone are required.' });
      }

      // Verify classId exists in database
      let targetClass = await prisma.class.findUnique({ where: { id: classId } });
      if (!targetClass) {
        // Fallback to first available class if frontend passed a stale ID
        targetClass = await prisma.class.findFirst();
        if (!targetClass) {
          return res.status(400).json({ message: 'Selected class does not exist. Please select a valid class.' });
        }
      }

      const validClassId = targetClass.id;

      // Check for existing roll numbers in the selected class
      let finalRollNumber = rollNumber ? String(rollNumber).trim() : '';

      if (finalRollNumber) {
        const numericRoll = parseInt(finalRollNumber, 10);

        const existingStudentsInClass = await prisma.student.findMany({
          where: { classId: validClassId },
          select: { rollNumber: true, firstName: true, lastName: true }
        });

        const duplicate = existingStudentsInClass.find(s => {
          if (s.rollNumber === finalRollNumber) return true;
          const existingNum = parseInt(s.rollNumber, 10);
          return !isNaN(numericRoll) && !isNaN(existingNum) && numericRoll === existingNum;
        });

        if (duplicate) {
          return res.status(400).json({
            message: `Roll number ${finalRollNumber} is already used in this class (assigned to ${duplicate.firstName} ${duplicate.lastName}).`
          });
        }
      } else {
        // Auto-assign next unique roll number in the class
        const existingStudents = await prisma.student.findMany({
          where: { classId: validClassId },
          select: { rollNumber: true }
        });
        const maxRoll = existingStudents.reduce((max, s) => {
          const num = parseInt(s.rollNumber, 10);
          return !isNaN(num) && num > max ? num : max;
        }, 0);
        finalRollNumber = String(maxRoll + 1);
      }

      const generatedId = `STU-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const newStudent = await prisma.student.create({
        data: {
          studentId: req.body.studentId || generatedId,
          firstName,
          lastName,
          dateOfBirth: dateOfBirth || '2011-01-01',
          gender: gender || 'Male',
          classId: validClassId,
          division: targetClass.division || division || 'A',
          rollNumber: finalRollNumber,
          parentName: parentName || 'Parent',
          parentPhone,
          email: email || null,
          address: address || 'Default Address',
          admissionDate: admissionDate || new Date().toISOString().split('T')[0],
          emergencyContact: emergencyContact || parentPhone,
          profilePhoto: profilePhoto || null,
          status: 'ACTIVE'
        },
        include: { class: true }
      });

      return res.status(201).json(newStudent);
    } catch (error: any) {
      if (error.code === 'P2002' || (error.message && error.message.includes('rollNumber'))) {
        return res.status(400).json({
          message: 'Roll number is already used in this class. Please choose a different roll number.'
        });
      }
      return res.status(400).json({
        message: error.message && !error.message.includes('Invocation')
          ? error.message
          : 'Failed to create student. Please verify that the roll number is not already used.'
      });
    }
  }

  public static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { classId, rollNumber } = req.body;

      const currentStudent = await prisma.student.findUnique({ where: { id } });
      if (!currentStudent) {
        return res.status(404).json({ message: 'Student not found.' });
      }

      const targetClassId = classId || currentStudent.classId;
      const targetRollNumber = rollNumber !== undefined ? String(rollNumber).trim() : currentStudent.rollNumber;

      if (targetRollNumber && (targetClassId !== currentStudent.classId || targetRollNumber !== currentStudent.rollNumber)) {
        const duplicate = await prisma.student.findFirst({
          where: {
            classId: targetClassId,
            rollNumber: targetRollNumber,
            NOT: { id }
          }
        });

        if (duplicate) {
          return res.status(400).json({
            message: `Roll number ${targetRollNumber} is already assigned to student ${duplicate.firstName} ${duplicate.lastName} in this class.`
          });
        }
      }

      const updated = await prisma.student.update({
        where: { id },
        data: req.body,
        include: { class: true }
      });
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.student.delete({ where: { id } });
      return res.json({ message: 'Student deleted successfully', id });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
