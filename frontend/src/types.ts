export type UserRole = 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  classId: string;
  division: string;
  rollNumber: string;
  parentName: string;
  parentPhone: string;
  email?: string;
  address: string;
  admissionDate: string;
  emergencyContact: string;
  profilePhoto?: string;
  status: 'ACTIVE' | 'INACTIVE';
  class?: Class;
  attendancePercentage?: number;
}

export interface Teacher {
  id: string;
  teacherId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  subjects: string;
  qualifications: string;
  joiningDate: string;
  availability: string;
  status: 'ACTIVE' | 'INACTIVE';
  classes?: Class[];
}

export interface Class {
  id: string;
  grade: string;
  division: string;
  academicYear: string;
  classTeacherId?: string;
  roomId?: string;
  classTeacher?: Teacher;
  room?: Room;
  _count?: { students: number };
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  weeklyPeriods: number;
}

export interface Room {
  id: string;
  roomNumber: string;
  roomName: string;
  capacity: number;
  type: string;
  availableEquipment: string;
  availability: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
}

export interface TimetableEntry {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  roomId: string;
  day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';
  period: number;
  class?: Class;
  subject?: Subject;
  teacher?: Teacher;
  room?: Room;
}

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

export interface AttendanceRecord {
  id?: string;
  studentId: string;
  studentName?: string;
  rollNumber?: string;
  studentCode?: string;
  classId?: string;
  date?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
}

export interface DocumentRecord {
  id: string;
  fileName: string;
  fileUrl: string;
  type: 'STUDENT_ADMISSION' | 'TEACHER_FORM' | 'ATTENDANCE_SHEET' | 'REGISTRATION';
  uploadedById: string;
  uploadDate: string;
  processingStatus: 'PENDING' | 'PROCESSED' | 'FAILED';
  extractedData: string;
  confidence: number;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  uploadedBy?: { name: string; email: string };
}

export interface SystemNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'TIMETABLE_CONFLICT' | 'ATTENDANCE_WARNING' | 'DOCUMENT_VERIFICATION' | 'STAFF_SHORTAGE' | 'SYSTEM';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  read: boolean;
  relatedEntity?: string;
  createdAt: string;
}

export interface SystemAlert {
  id: string;
  type: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  relatedEntity?: string;
  actionLabel: string;
  actionUrl: string;
  resolved: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
  attendanceTodayPercentage: number;
  activeRooms: number;
  pendingDocuments: number;
  unreadNotifications: number;
}
