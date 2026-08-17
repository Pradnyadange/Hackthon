// Client-side mock data adapter for standalone static deployment (e.g. GitHub Pages)

const subjectsList = [
  { id: 'sub-math', name: 'Mathematics', code: 'MATH-101', weeklyPeriods: 6 },
  { id: 'sub-phy', name: 'Physics', code: 'PHY-101', weeklyPeriods: 5 },
  { id: 'sub-chem', name: 'Chemistry', code: 'CHEM-101', weeklyPeriods: 5 },
  { id: 'sub-eng', name: 'English Literature', code: 'ENG-101', weeklyPeriods: 4 },
  { id: 'sub-cs', name: 'Computer Science', code: 'CS-101', weeklyPeriods: 4 },
  { id: 'sub-bio', name: 'Biology', code: 'BIO-101', weeklyPeriods: 4 }
];

const teachersList = [
  { id: 'tch-1', name: 'Rahul Sharma', email: 'rahul.sharma@school.com', department: 'Mathematics', subjects: 'Mathematics' },
  { id: 'tch-2', name: 'Sunita Verma', email: 'sunita.verma@school.com', department: 'Physics', subjects: 'Physics' },
  { id: 'tch-3', name: 'Dr. Rajesh Gupta', email: 'rajesh.gupta@school.com', department: 'Chemistry', subjects: 'Chemistry' },
  { id: 'tch-4', name: 'Anita Roy', email: 'anita.roy@school.com', department: 'English', subjects: 'English' },
  { id: 'tch-5', name: 'Vikramaditya Rao', email: 'vikram.rao@school.com', department: 'Computer Science', subjects: 'Computer Science' },
  { id: 'tch-6', name: 'Priya Nair', email: 'priya.nair@school.com', department: 'Biology', subjects: 'Biology' }
];

const roomsList = [
  { id: 'rm-101', roomNumber: '101', roomName: 'Classroom 101', capacity: 40, type: 'Classroom', availableEquipment: 'Projector, Whiteboard' },
  { id: 'rm-102', roomNumber: '102', roomName: 'Classroom 102', capacity: 40, type: 'Classroom', availableEquipment: 'Whiteboard' },
  { id: 'rm-201', roomNumber: '201', roomName: 'Physics Lab', capacity: 35, type: 'Laboratory', availableEquipment: 'Lab Benches, Optics Equipment' },
  { id: 'rm-202', roomNumber: '202', roomName: 'Computer Lab', capacity: 45, type: 'Computer Lab', availableEquipment: '50 Computers, Smart Board' }
];

const classesList = [
  { id: 'cls-10a', grade: '10', division: 'A', academicYear: '2026-2027', roomId: 'rm-101' },
  { id: 'cls-10b', grade: '10', division: 'B', academicYear: '2026-2027', roomId: 'rm-102' },
  { id: 'cls-9a', grade: '9', division: 'A', academicYear: '2026-2027', roomId: 'rm-103' },
  { id: 'cls-9b', grade: '9', division: 'B', academicYear: '2026-2027', roomId: 'rm-104' },
  { id: 'cls-11a', grade: '11', division: 'A', academicYear: '2026-2027', roomId: 'rm-105' }
];

const generateDefaultTimetables = () => {
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const periods = [1, 2, 3, 4, 5, 6];
  const entries: any[] = [];
  let idCount = 1;

  classesList.forEach((cls, classIdx) => {
    days.forEach((day, dayIdx) => {
      periods.forEach((period) => {
        const subIdx = (classIdx * 2 + dayIdx + period) % subjectsList.length;
        const tchIdx = (classIdx * 2 + dayIdx + period) % teachersList.length;
        const rmIdx = (classIdx + period) % roomsList.length;

        entries.push({
          id: `tt-${idCount++}`,
          classId: cls.id,
          subjectId: subjectsList[subIdx].id,
          teacherId: teachersList[tchIdx].id,
          roomId: roomsList[rmIdx].id,
          day,
          period,
          subject: subjectsList[subIdx],
          teacher: teachersList[tchIdx],
          room: roomsList[rmIdx]
        });
      });
    });
  });

  return entries;
};

const getStoredTimetable = () => {
  const stored = localStorage.getItem('edumatrix_mock_timetable');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // fallback
    }
  }
  const initial = generateDefaultTimetables();
  localStorage.setItem('edumatrix_mock_timetable', JSON.stringify(initial));
  return initial;
};

const saveStoredTimetable = (entries: any[]) => {
  localStorage.setItem('edumatrix_mock_timetable', JSON.stringify(entries));
};

export const handleMockApiRequest = (url: string, method: string, data?: any): any => {
  const rawUrl = url.replace('/api', '');
  const urlParts = rawUrl.split('?');
  const normalizedUrl = urlParts[0];

  const queryParams = new URLSearchParams(urlParts[1] || '');

  // Auth Endpoints
  if (normalizedUrl === '/auth/login' || normalizedUrl === '/auth/login-passcode') {
    let role = 'SCHOOL_ADMIN';
    let name = 'Principal Ramesh Verma';
    if (data?.email === 'admin@school.com') {
      role = 'SUPER_ADMIN';
      name = 'Dr. Evelyn Carter';
    } else if (data?.email === 'teacher@school.com') {
      role = 'TEACHER';
      name = 'Rahul Sharma';
    }

    const userData = {
      id: 'u-demo',
      email: data?.email || 'schooladmin@school.com',
      name,
      role,
      securityPasscode: 'ADM-448102'
    };

    localStorage.setItem('edumatrix_mock_user', JSON.stringify(userData));

    return {
      token: 'mock_jwt_token_demo_2026',
      user: userData
    };
  }

  if (normalizedUrl === '/auth/me') {
    const savedUser = localStorage.getItem('edumatrix_mock_user');
    const user = savedUser ? JSON.parse(savedUser) : {
      id: 'u-admin',
      email: 'schooladmin@school.com',
      name: 'Principal Ramesh Verma',
      role: 'SCHOOL_ADMIN',
      securityPasscode: 'ADM-448102'
    };
    return { user };
  }

  // Dashboard Stats
  if (normalizedUrl === '/dashboard/stats') {
    return {
      totalStudents: 50,
      totalTeachers: 15,
      totalClasses: 5,
      totalSubjects: 8,
      activeRooms: 10,
      attendanceTodayPercentage: 94,
      pendingDocuments: 2,
      unreadNotifications: 2
    };
  }

  // Classes
  if (normalizedUrl === '/classes') {
    return classesList;
  }

  // Subjects
  if (normalizedUrl === '/subjects') {
    return subjectsList;
  }

  // Teachers
  if (normalizedUrl === '/teachers') {
    return teachersList;
  }

  // Rooms
  if (normalizedUrl === '/rooms') {
    return roomsList;
  }

  // Timetable Endpoints
  if (normalizedUrl === '/timetable') {
    let allEntries = getStoredTimetable();
    const classIdParam = queryParams.get('classId');

    if (method === 'POST') {
      const { classId, day, period, subjectId, teacherId, roomId } = data || {};
      const subject = subjectsList.find(s => s.id === subjectId) || subjectsList[0];
      const teacher = teachersList.find(t => t.id === teacherId) || teachersList[0];
      const room = roomsList.find(r => r.id === roomId) || roomsList[0];

      // Remove existing entry at same classId, day, period
      allEntries = allEntries.filter((e: any) => !(e.classId === classId && e.day === day && Number(e.period) === Number(period)));

      const newEntry = {
        id: `tt-user-${Date.now()}`,
        classId,
        subjectId,
        teacherId,
        roomId,
        day,
        period: Number(period),
        subject,
        teacher,
        room
      };

      allEntries.push(newEntry);
      saveStoredTimetable(allEntries);
      return newEntry;
    }

    if (classIdParam) {
      allEntries = allEntries.filter((e: any) => e.classId === classIdParam);
    }

    return {
      entries: allEntries,
      conflicts: []
    };
  }

  if (normalizedUrl.startsWith('/timetable/')) {
    const slotId = normalizedUrl.replace('/timetable/', '');

    if (normalizedUrl === '/timetable/generate') {
      const freshEntries = generateDefaultTimetables();
      saveStoredTimetable(freshEntries);
      return {
        message: 'Successfully generated 150 timetable slots across all classes.',
        generatedCount: freshEntries.length,
        conflicts: []
      };
    }

    if (method === 'PUT') {
      let allEntries = getStoredTimetable();
      const existingIdx = allEntries.findIndex((e: any) => e.id === slotId);
      const { classId, day, period, subjectId, teacherId, roomId } = data || {};

      const subject = subjectsList.find(s => s.id === subjectId) || subjectsList[0];
      const teacher = teachersList.find(t => t.id === teacherId) || teachersList[0];
      const room = roomsList.find(r => r.id === roomId) || roomsList[0];

      if (existingIdx !== -1) {
        allEntries[existingIdx] = {
          ...allEntries[existingIdx],
          ...(classId && { classId }),
          ...(day && { day }),
          ...(period && { period: Number(period) }),
          ...(subjectId && { subjectId, subject }),
          ...(teacherId && { teacherId, teacher }),
          ...(roomId && { roomId, room })
        };
        saveStoredTimetable(allEntries);
        return allEntries[existingIdx];
      }
    }
  }

  // Students
  if (normalizedUrl === '/students') {
    return [
      { id: 'st-1', studentId: 'STU-2026-1000', firstName: 'Aarav', lastName: 'Sharma', classId: 'cls-10a', division: 'A', rollNumber: '1', parentName: 'Ramesh Sharma', parentPhone: '+91 98112 00001', gender: 'Male', status: 'ACTIVE' },
      { id: 'st-2', studentId: 'STU-2026-1005', firstName: 'Diya', lastName: 'Iyer', classId: 'cls-10a', division: 'A', rollNumber: '2', parentName: 'Suresh Iyer', parentPhone: '+91 98112 00002', gender: 'Female', status: 'ACTIVE' },
      { id: 'st-3', studentId: 'STU-2026-1010', firstName: 'Ishaan', lastName: 'Reddy', classId: 'cls-10a', division: 'A', rollNumber: '3', parentName: 'Venkat Reddy', parentPhone: '+91 98112 00003', gender: 'Male', status: 'ACTIVE' },
      { id: 'st-4', studentId: 'STU-2026-1015', firstName: 'Kiara', lastName: 'Kapoor', classId: 'cls-10a', division: 'A', rollNumber: '4', parentName: 'Rajesh Kapoor', parentPhone: '+91 98112 00004', gender: 'Female', status: 'ACTIVE' }
    ];
  }

  // Attendance
  if (normalizedUrl === '/attendance') {
    return [
      { id: 'att-1', studentId: 'st-1', date: '2026-08-14', status: 'PRESENT', student: { studentId: 'STU-2026-1000', firstName: 'Aarav', lastName: 'Sharma', rollNumber: '1' } },
      { id: 'att-2', studentId: 'st-2', date: '2026-08-14', status: 'PRESENT', student: { studentId: 'STU-2026-1005', firstName: 'Diya', lastName: 'Iyer', rollNumber: '2' } },
      { id: 'att-3', studentId: 'st-3', date: '2026-08-14', status: 'ABSENT', student: { studentId: 'STU-2026-1010', firstName: 'Ishaan', lastName: 'Reddy', rollNumber: '3' } }
    ];
  }

  // Documents
  if (normalizedUrl === '/documents') {
    return [
      {
        id: 'doc-1',
        fileName: 'Attendance_Physical_Sheet.pdf',
        type: 'ATTENDANCE_SHEET',
        uploadDate: '2026-08-14T10:00:00Z',
        confidence: 0.97,
        verificationStatus: 'PENDING',
        extractedData: JSON.stringify({ className: '10-A', teacherName: 'Mrs. Sharma', month: 'August 2026' })
      },
      {
        id: 'doc-2',
        fileName: 'Student_Admission_Form.pdf',
        type: 'STUDENT_ADMISSION',
        uploadDate: '2026-08-14T11:30:00Z',
        confidence: 0.96,
        verificationStatus: 'PENDING',
        extractedData: JSON.stringify({ firstName: 'Aarav', lastName: 'Mehta', class: '10-A' })
      }
    ];
  }

  if (normalizedUrl === '/documents/upload') {
    return {
      document: {
        id: 'doc-new',
        fileName: 'Paper_Form_Scan.pdf',
        type: 'STUDENT_ADMISSION',
        uploadDate: new Date().toISOString(),
        confidence: 0.96,
        verificationStatus: 'PENDING',
        extractedData: JSON.stringify({ firstName: 'Aarav', lastName: 'Mehta', class: '10-A', parentName: 'Sanjay Mehta' })
      },
      fields: [
        { field: 'First Name', value: 'Aarav', confidence: 0.98 },
        { field: 'Last Name', value: 'Mehta', confidence: 0.97 },
        { field: 'Class', value: '10-A', confidence: 0.96 }
      ]
    };
  }

  if (normalizedUrl.includes('/documents/') && normalizedUrl.includes('/approve')) {
    return { message: 'Document verified and record created successfully in database!' };
  }

  // Alerts
  if (normalizedUrl === '/alerts') {
    return [
      {
        id: 'alert-1',
        type: 'PENDING_DOCUMENT',
        title: 'Pending Document Verification',
        description: '2 document forms are waiting for AI OCR review & approval.',
        severity: 'MEDIUM',
        actionUrl: '/documents',
        actionLabel: 'Verify Documents',
        createdAt: new Date().toISOString()
      }
    ];
  }

  // Notifications
  if (normalizedUrl === '/notifications') {
    return [
      { id: 'notif-1', title: 'OCR Form Extracted', message: 'Physical attendance sheet parsed successfully.', type: 'OCR', isRead: false, createdAt: new Date().toISOString() },
      { id: 'notif-2', title: 'Timetable Optimal', message: '0 double-booking conflicts detected across classes.', type: 'TIMETABLE', isRead: false, createdAt: new Date().toISOString() }
    ];
  }

  return { message: 'Operation executed successfully' };
};
