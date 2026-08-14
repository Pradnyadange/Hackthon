import { prisma } from '../utils/prisma';

export interface ConflictItem {
  id: string;
  type: 'TEACHER_DOUBLE_BOOKING' | 'ROOM_DOUBLE_BOOKING' | 'CLASS_DOUBLE_BOOKING' | 'ROOM_CAPACITY_EXCEEDED';
  severity: 'HIGH' | 'MEDIUM';
  description: string;
  day: string;
  period: number;
  relatedEntities: {
    classId?: string;
    teacherId?: string;
    roomId?: string;
  };
}

export class TimetableGeneratorService {
  public static DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  public static PERIODS_PER_DAY = 6;

  public static async validateTimetable(entries?: any[]): Promise<ConflictItem[]> {
    const targetEntries = entries || await prisma.timetableEntry.findMany({
      include: { class: true, teacher: true, room: true, subject: true }
    });

    const conflicts: ConflictItem[] = [];
    const teacherSlots = new Map<string, any>();
    const roomSlots = new Map<string, any>();
    const classSlots = new Map<string, any>();

    for (const entry of targetEntries) {
      const teacherKey = `${entry.teacherId}-${entry.day}-${entry.period}`;
      const roomKey = `${entry.roomId}-${entry.day}-${entry.period}`;
      const classKey = `${entry.classId}-${entry.day}-${entry.period}`;

      const teacherName = entry.teacher?.name || 'Teacher';
      const roomName = entry.room?.roomName || entry.room?.roomNumber || 'Room';
      const className = entry.class ? `Class ${entry.class.grade}-${entry.class.division}` : 'Class';

      if (teacherSlots.has(teacherKey)) {
        const prevEntry = teacherSlots.get(teacherKey);
        const prevClassName = prevEntry.class ? `Class ${prevEntry.class.grade}-${prevEntry.class.division}` : 'Class';
        const desc = `Teacher ${teacherName} is double-booked on ${entry.day} during Period ${entry.period} in ${prevClassName} and ${className}.`;

        conflicts.push({
          id: `conflict-teacher-${entry.id}`,
          type: 'TEACHER_DOUBLE_BOOKING',
          severity: 'HIGH',
          description: desc,
          day: entry.day,
          period: entry.period,
          relatedEntities: { teacherId: entry.teacherId, classId: entry.classId }
        });

        // Also register conflict for previous class so both class views show the warning banner
        conflicts.push({
          id: `conflict-teacher-${prevEntry.id}`,
          type: 'TEACHER_DOUBLE_BOOKING',
          severity: 'HIGH',
          description: desc,
          day: prevEntry.day,
          period: prevEntry.period,
          relatedEntities: { teacherId: prevEntry.teacherId, classId: prevEntry.classId }
        });
      } else {
        teacherSlots.set(teacherKey, entry);
      }

      if (roomSlots.has(roomKey)) {
        const prevEntry = roomSlots.get(roomKey);
        const prevClassName = prevEntry.class ? `Class ${prevEntry.class.grade}-${prevEntry.class.division}` : 'Class';
        const desc = `Room ${roomName} is double-booked on ${entry.day} during Period ${entry.period} for ${prevClassName} and ${className}.`;

        conflicts.push({
          id: `conflict-room-${entry.id}`,
          type: 'ROOM_DOUBLE_BOOKING',
          severity: 'HIGH',
          description: desc,
          day: entry.day,
          period: entry.period,
          relatedEntities: { roomId: entry.roomId, classId: entry.classId }
        });

        conflicts.push({
          id: `conflict-room-${prevEntry.id}`,
          type: 'ROOM_DOUBLE_BOOKING',
          severity: 'HIGH',
          description: desc,
          day: prevEntry.day,
          period: prevEntry.period,
          relatedEntities: { roomId: prevEntry.roomId, classId: prevEntry.classId }
        });
      } else {
        roomSlots.set(roomKey, entry);
      }

      if (classSlots.has(classKey)) {
        conflicts.push({
          id: `conflict-class-${entry.id}`,
          type: 'CLASS_DOUBLE_BOOKING',
          severity: 'HIGH',
          description: `${className} has multiple subjects scheduled on ${entry.day} during Period ${entry.period}.`,
          day: entry.day,
          period: entry.period,
          relatedEntities: { classId: entry.classId }
        });
      } else {
        classSlots.set(classKey, entry);
      }

      if (entry.class && entry.room) {
        const studentCount = await prisma.student.count({ where: { classId: entry.classId } });
        if (studentCount > entry.room.capacity) {
          conflicts.push({
            id: `conflict-cap-${entry.id}`,
            type: 'ROOM_CAPACITY_EXCEEDED',
            severity: 'MEDIUM',
            description: `${className} (${studentCount} students) exceeds capacity of ${roomName} (${entry.room.capacity} seats).`,
            day: entry.day,
            period: entry.period,
            relatedEntities: { classId: entry.classId, roomId: entry.roomId }
          });
        }
      }
    }

    return conflicts;
  }

  public static async generateTimetable(): Promise<{ count: number; conflicts: ConflictItem[] }> {
    const classes = await prisma.class.findMany({ include: { room: true } });
    const teachers = await prisma.teacher.findMany();
    const subjects = await prisma.subject.findMany();
    const rooms = await prisma.room.findMany();

    if (classes.length === 0 || teachers.length === 0 || subjects.length === 0) {
      throw new Error('Insufficient data. Please ensure classes, teachers, and subjects exist before generating timetable.');
    }

    await prisma.timetableEntry.deleteMany({});

    const newEntries: Array<{
      classId: string;
      subjectId: string;
      teacherId: string;
      roomId: string;
      day: string;
      period: number;
    }> = [];

    const teacherBusy = new Set<string>();
    const roomBusy = new Set<string>();
    const classBusy = new Set<string>();

    for (const cls of classes) {
      const defaultRoom = rooms.find(r => r.id === cls.roomId) || rooms[0];
      if (!defaultRoom) continue;

      for (const subject of subjects) {
        const suitableTeacher = teachers.find(t =>
          t.subjects.toLowerCase().includes(subject.name.toLowerCase()) ||
          t.subjects.toLowerCase().includes(subject.code.toLowerCase())
        ) || teachers[Math.floor(Math.random() * teachers.length)];

        let scheduledPeriods = 0;
        const targetPeriods = Math.min(subject.weeklyPeriods, 6);

        for (const day of this.DAYS) {
          if (scheduledPeriods >= targetPeriods) break;

          for (let period = 1; period <= this.PERIODS_PER_DAY; period++) {
            if (scheduledPeriods >= targetPeriods) break;

            const tKey = `${suitableTeacher.id}-${day}-${period}`;
            const rKey = `${defaultRoom.id}-${day}-${period}`;
            const cKey = `${cls.id}-${day}-${period}`;

            if (!teacherBusy.has(tKey) && !roomBusy.has(rKey) && !classBusy.has(cKey)) {
              teacherBusy.add(tKey);
              roomBusy.add(rKey);
              classBusy.add(cKey);

              newEntries.push({
                classId: cls.id,
                subjectId: subject.id,
                teacherId: suitableTeacher.id,
                roomId: defaultRoom.id,
                day,
                period
              });

              scheduledPeriods++;
            }
          }
        }
      }
    }

    if (newEntries.length > 0) {
      await prisma.timetableEntry.createMany({
        data: newEntries
      });
    }

    const conflicts = await this.validateTimetable();
    return { count: newEntries.length, conflicts };
  }
}
