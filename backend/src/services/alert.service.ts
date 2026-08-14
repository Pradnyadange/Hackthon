import { prisma } from '../utils/prisma';

export class AlertService {
  /**
   * Scans system entities and updates proactive Action Required alerts.
   */
  public static async syncAlerts() {
    const alerts = [];

    // 1. Check Document Verifications Pending
    const pendingDocs = await prisma.document.count({
      where: { verificationStatus: 'PENDING' }
    });

    if (pendingDocs > 0) {
      alerts.push({
        type: 'PENDING_DOCUMENT',
        severity: pendingDocs > 5 ? 'HIGH' : 'MEDIUM',
        title: 'Pending Document Verification',
        description: `${pendingDocs} document form${pendingDocs > 1 ? 's are' : ' is'} waiting for AI OCR review & approval.`,
        relatedEntity: 'documents',
        actionLabel: 'Verify Documents',
        actionUrl: '/documents'
      });
    }

    // 2. Check Low Attendance Classes (<75%)
    const classes = await prisma.class.findMany({ include: { students: true } });

    for (const cls of classes) {
      if (cls.students.length === 0) continue;
      const totalLogs = await prisma.attendance.count({ where: { classId: cls.id } });
      const presentLogs = await prisma.attendance.count({
        where: { classId: cls.id, status: { in: ['PRESENT', 'LATE'] } }
      });

      if (totalLogs > 0) {
        const rate = (presentLogs / totalLogs) * 100;
        if (rate < 75) {
          alerts.push({
            type: 'LOW_ATTENDANCE',
            severity: 'HIGH',
            title: `Low Attendance Warning (${cls.grade}-${cls.division})`,
            description: `Class ${cls.grade}-${cls.division} attendance has dropped to ${rate.toFixed(1)}% (below 75% threshold).`,
            relatedEntity: 'attendance',
            actionLabel: 'Review Attendance',
            actionUrl: '/attendance'
          });
        }
      }
    }

    // 3. Check Unassigned Class Teachers or Rooms
    const unassignedClasses = await prisma.class.findMany({
      where: { OR: [{ classTeacherId: null }, { roomId: null }] }
    });

    if (unassignedClasses.length > 0) {
      alerts.push({
        type: 'MISSING_TEACHER',
        severity: 'MEDIUM',
        title: 'Class Allocation Alert',
        description: `${unassignedClasses.length} class(es) have missing teacher or room assignments.`,
        relatedEntity: 'classes',
        actionLabel: 'Assign Resources',
        actionUrl: '/classes'
      });
    }

    // Refresh system alerts table
    await prisma.systemAlert.deleteMany({ where: { resolved: false } });

    for (const alert of alerts) {
      await prisma.systemAlert.create({ data: alert });
    }

    return await prisma.systemAlert.findMany({
      where: { resolved: false },
      orderBy: { createdAt: 'desc' }
    });
  }
}
