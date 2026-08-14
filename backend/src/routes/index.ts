import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { StudentController } from '../controllers/student.controller';
import { TeacherController } from '../controllers/teacher.controller';
import { ClassController } from '../controllers/class.controller';
import { SubjectController } from '../controllers/subject.controller';
import { RoomController } from '../controllers/room.controller';
import { TimetableController } from '../controllers/timetable.controller';
import { AttendanceController } from '../controllers/attendance.controller';
import { DocumentController } from '../controllers/document.controller';
import { NotificationController } from '../controllers/notification.controller';
import { StaffingController } from '../controllers/staffing.controller';
import { AlertController } from '../controllers/alert.controller';

import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { loginRateLimiter } from '../middleware/security.middleware';
import { prisma } from '../utils/prisma';

const router = Router();

// --- Auth Routes ---
router.post('/auth/login', loginRateLimiter, AuthController.login);
router.post('/auth/login-passcode', loginRateLimiter, AuthController.loginWithPasscode);
router.post('/auth/register', AuthController.register);
router.post('/auth/refresh', AuthController.refreshToken);
router.get('/auth/me', authenticateToken, AuthController.me);

// --- Dashboard Summary Stats Endpoint ---
router.get('/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      totalRooms,
      pendingDocs,
      unreadNotifs,
      todayAttTotal,
      todayAttPresent
    ] = await Promise.all([
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.teacher.count({ where: { status: 'ACTIVE' } }),
      prisma.class.count(),
      prisma.subject.count(),
      prisma.room.count(),
      prisma.document.count({ where: { verificationStatus: 'PENDING' } }),
      prisma.notification.count({ where: { read: false } }),
      prisma.attendance.count({ where: { date: today } }),
      prisma.attendance.count({ where: { date: today, status: { in: ['PRESENT', 'LATE'] } } })
    ]);

    const attendanceRate = todayAttTotal > 0 ? Math.round((todayAttPresent / todayAttTotal) * 100) : 94;

    return res.json({
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      attendanceTodayPercentage: attendanceRate,
      activeRooms: totalRooms,
      pendingDocuments: pendingDocs,
      unreadNotifications: unreadNotifs
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// --- Proactive Action Required Alerts ---
router.get('/alerts', authenticateToken, AlertController.getAlerts);
router.put('/alerts/:id/resolve', authenticateToken, AlertController.resolveAlert);

// --- Student Routes ---
router.get('/students', authenticateToken, StudentController.getAll);
router.get('/students/:id', authenticateToken, StudentController.getById);
router.post('/students', authenticateToken, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), StudentController.create);
router.put('/students/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), StudentController.update);
router.delete('/students/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), StudentController.delete);

// --- Teacher Routes ---
router.get('/teachers', authenticateToken, TeacherController.getAll);
router.get('/teachers/:id', authenticateToken, TeacherController.getById);
router.post('/teachers', authenticateToken, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), TeacherController.create);
router.put('/teachers/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), TeacherController.update);
router.delete('/teachers/:id', authenticateToken, authorizeRoles('SUPER_ADMIN'), TeacherController.delete);

// --- Class Routes ---
router.get('/classes', authenticateToken, ClassController.getAll);
router.get('/classes/:id', authenticateToken, ClassController.getById);
router.post('/classes', authenticateToken, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), ClassController.create);
router.put('/classes/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), ClassController.update);
router.delete('/classes/:id', authenticateToken, authorizeRoles('SUPER_ADMIN'), ClassController.delete);

// --- Subject Routes ---
router.get('/subjects', authenticateToken, SubjectController.getAll);
router.post('/subjects', authenticateToken, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), SubjectController.create);
router.put('/subjects/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), SubjectController.update);
router.delete('/subjects/:id', authenticateToken, authorizeRoles('SUPER_ADMIN'), SubjectController.delete);

// --- Room Routes ---
router.get('/rooms', authenticateToken, RoomController.getAll);
router.post('/rooms', authenticateToken, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), RoomController.create);
router.put('/rooms/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), RoomController.update);
router.delete('/rooms/:id', authenticateToken, authorizeRoles('SUPER_ADMIN'), RoomController.delete);

// --- Timetable Routes ---
router.get('/timetable', authenticateToken, TimetableController.getAll);
router.post('/timetable/generate', authenticateToken, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), TimetableController.generate);
router.post('/timetable/simulate-conflict', authenticateToken, TimetableController.simulateConflict);
router.post('/timetable/validate', authenticateToken, TimetableController.validate);
router.put('/timetable/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), TimetableController.update);
router.delete('/timetable/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), TimetableController.delete);

// --- Attendance Routes ---
router.get('/attendance', authenticateToken, AttendanceController.getByClassAndDate);
router.post('/attendance', authenticateToken, AttendanceController.saveBulk);
router.post('/attendance/rfid-scan', authenticateToken, AttendanceController.scanRfid);

// --- Document OCR Routes ---
router.get('/documents', authenticateToken, DocumentController.getAll);
router.post('/documents/upload', authenticateToken, upload.single('file'), DocumentController.upload);
router.post('/documents/:id/process', authenticateToken, DocumentController.process);
router.post('/documents/:id/approve', authenticateToken, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), DocumentController.approve);
router.post('/documents/:id/reject', authenticateToken, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), DocumentController.reject);

// --- Notification Routes ---
router.get('/notifications', authenticateToken, NotificationController.getAll);
router.put('/notifications/:id/read', authenticateToken, NotificationController.markAsRead);
router.put('/notifications/read-all', authenticateToken, NotificationController.markAllAsRead);

// --- Staffing Insights Routes ---
router.get('/staffing/insights', authenticateToken, StaffingController.getInsights);

export default router;
