import { prisma } from '../utils/prisma';

export class StaffingService {
  /**
   * Computes staffing demand, teacher shortages, and workload distribution.
   */
  public static async getStaffingInsights() {
    const subjects = await prisma.subject.findMany();
    const teachers = await prisma.teacher.findMany();
    const classes = await prisma.class.findMany();

    const totalClasses = classes.length;

    const departmentStats = await Promise.all(
      subjects.map(async (subject) => {
        const matchingTeachers = teachers.filter(t =>
          t.subjects.toLowerCase().includes(subject.name.toLowerCase()) ||
          t.subjects.toLowerCase().includes(subject.code.toLowerCase())
        );

        const requiredWeeklyPeriods = subject.weeklyPeriods * totalClasses;
        const currentTeacherCapacity = matchingTeachers.length * 25; // 25 periods max load per teacher
        const shortageCount = Math.max(0, Math.ceil((requiredWeeklyPeriods - currentTeacherCapacity) / 25));

        return {
          subjectId: subject.id,
          subjectName: subject.name,
          currentTeachers: matchingTeachers.length,
          requiredTeachers: matchingTeachers.length + shortageCount,
          weeklyPeriodsNeeded: requiredWeeklyPeriods,
          currentCapacity: currentTeacherCapacity,
          shortage: shortageCount,
          status: shortageCount > 0 ? 'SHORTAGE' : 'ADEQUATE'
        };
      })
    );

    const teacherWorkloads = await Promise.all(
      teachers.map(async (teacher) => {
        const assignedSlots = await prisma.timetableEntry.count({
          where: { teacherId: teacher.id }
        });

        return {
          teacherId: teacher.id,
          name: teacher.name,
          department: teacher.department,
          assignedPeriods: assignedSlots,
          maxCapacity: 25,
          utilizationPercentage: Math.round((assignedSlots / 25) * 100)
        };
      })
    );

    return {
      summary: {
        totalTeachers: teachers.length,
        departmentsWithShortage: departmentStats.filter(d => d.shortage > 0).length,
        averageWorkload: Math.round(
          teacherWorkloads.reduce((acc, t) => acc + t.utilizationPercentage, 0) / (teachers.length || 1)
        )
      },
      departmentAnalysis: departmentStats,
      teacherWorkloads
    };
  }
}
