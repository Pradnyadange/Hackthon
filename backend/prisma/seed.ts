import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting EduMatrix database seed script...');

  // Clean existing tables
  await prisma.systemAlert.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.document.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.timetableEntry.deleteMany();
  await prisma.student.deleteMany();
  await prisma.class.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.user.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.room.deleteMany();

  // 1. Create Default Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const teacherPassword = await bcrypt.hash('teacher123', 10);

  const superAdmin = await prisma.user.create({
    data: {
      name: 'Dr. Evelyn Carter',
      email: 'admin@school.com',
      passwordHash: adminPassword,
      securityPasscode: 'SA-994812',
      role: 'SUPER_ADMIN'
    }
  });

  const schoolAdmin = await prisma.user.create({
    data: {
      name: 'Principal Ramesh Verma',
      email: 'schooladmin@school.com',
      passwordHash: adminPassword,
      securityPasscode: 'ADM-448102',
      role: 'SCHOOL_ADMIN'
    }
  });

  console.log('✅ Created administrative accounts');

  // 2. Create Rooms (10 Rooms)
  const roomsData = [
    { roomNumber: '101', roomName: 'Classroom 101', capacity: 45, type: 'Classroom', availableEquipment: 'Smartboard, Whiteboard' },
    { roomNumber: '102', roomName: 'Classroom 102', capacity: 45, type: 'Classroom', availableEquipment: 'Projector, Whiteboard' },
    { roomNumber: '103', roomName: 'Classroom 103', capacity: 45, type: 'Classroom', availableEquipment: 'Smartboard, AC' },
    { roomNumber: '104', roomName: 'Classroom 104', capacity: 40, type: 'Classroom', availableEquipment: 'Whiteboard' },
    { roomNumber: '201', roomName: 'Physics Laboratory', capacity: 35, type: 'Laboratory', availableEquipment: 'Lab Equipment, Oscilloscopes, Projector' },
    { roomNumber: '202', roomName: 'Chemistry Laboratory', capacity: 35, type: 'Laboratory', availableEquipment: 'Fume Hoods, Chemical Cabinets' },
    { roomNumber: '301', roomName: 'Advanced Computer Center', capacity: 50, type: 'Computer Lab', availableEquipment: '50 PCs, Fiber Internet, Dual Monitors' },
    { roomNumber: 'LIB-01', roomName: 'Central Library', capacity: 100, type: 'Library', availableEquipment: 'E-Readers, Quiet Study Pods' },
    { roomNumber: 'AUD-01', roomName: 'Grand Auditorium', capacity: 300, type: 'Auditorium', availableEquipment: 'Surround Sound, Dual Projectors' },
    { roomNumber: 'GYM-01', roomName: 'Sports Arena', capacity: 200, type: 'Sports Room', availableEquipment: 'Indoor Basketball, Gym Gear' }
  ];

  const rooms = [];
  for (const r of roomsData) {
    rooms.push(await prisma.room.create({ data: r }));
  }
  console.log('✅ Created 10 Rooms');

  // 3. Create Subjects (8 Subjects)
  const subjectsData = [
    { name: 'Mathematics', code: 'MATH-10', weeklyPeriods: 6 },
    { name: 'Physics', code: 'PHYS-10', weeklyPeriods: 5 },
    { name: 'Chemistry', code: 'CHEM-10', weeklyPeriods: 4 },
    { name: 'English Literature', code: 'ENG-10', weeklyPeriods: 5 },
    { name: 'Computer Science', code: 'CS-10', weeklyPeriods: 5 },
    { name: 'Biology', code: 'BIO-10', weeklyPeriods: 4 },
    { name: 'World History', code: 'HIST-10', weeklyPeriods: 3 },
    { name: 'Physical Education', code: 'PE-10', weeklyPeriods: 2 }
  ];

  const subjects = [];
  for (const s of subjectsData) {
    subjects.push(await prisma.subject.create({ data: s }));
  }
  console.log('✅ Created 8 Subjects');

  // 4. Create Teachers (15 Teachers)
  const teacherNames = [
    { name: 'Rahul Sharma', dept: 'Mathematics', sub: 'Mathematics', email: 'teacher@school.com' },
    { name: 'Sunita Verma', dept: 'Physics', sub: 'Physics, Mathematics', email: 'sunita.verma@school.com' },
    { name: 'Dr. Rajesh Gupta', dept: 'Chemistry', sub: 'Chemistry', email: 'rajesh.gupta@school.com' },
    { name: 'Anita Roy', dept: 'English', sub: 'English Literature', email: 'anita.roy@school.com' },
    { name: 'Vikramaditya Rao', dept: 'Computer Science', sub: 'Computer Science', email: 'vikram.rao@school.com' },
    { name: 'Priya Nair', dept: 'Biology', sub: 'Biology', email: 'priya.nair@school.com' },
    { name: 'Amitabh Joshi', dept: 'Social Studies', sub: 'World History', email: 'amitabh.joshi@school.com' },
    { name: 'Captain Devraj Singh', dept: 'Sports', sub: 'Physical Education', email: 'devraj.singh@school.com' },
    { name: 'Meenakshi Iyer', dept: 'Mathematics', sub: 'Mathematics', email: 'meenakshi.iyer@school.com' },
    { name: 'Sanjay Patel', dept: 'Physics', sub: 'Physics', email: 'sanjay.patel@school.com' },
    { name: 'Kavita Menon', dept: 'English', sub: 'English Literature', email: 'kavita.menon@school.com' },
    { name: 'Rohan Deshmukh', dept: 'Computer Science', sub: 'Computer Science', email: 'rohan.deshmukh@school.com' },
    { name: 'Dr. Shalini Saxena', dept: 'Chemistry', sub: 'Chemistry', email: 'shalini.saxena@school.com' },
    { name: 'Arun Kulkarni', dept: 'Mathematics', sub: 'Mathematics', email: 'arun.kulkarni@school.com' },
    { name: 'Deepa Hegde', dept: 'Biology', sub: 'Biology', email: 'deepa.hegde@school.com' }
  ];

  const teachers = [];
  for (let i = 0; i < teacherNames.length; i++) {
    const tInfo = teacherNames[i];
    const u = await prisma.user.create({
      data: {
        name: tInfo.name,
        email: tInfo.email,
        passwordHash: teacherPassword,
        securityPasscode: `TCH-7731${(i + 1).toString().padStart(2, '0')}`,
        role: 'TEACHER'
      }
    });

    const teacher = await prisma.teacher.create({
      data: {
        teacherId: `TCH-10${i + 1}`,
        name: tInfo.name,
        email: tInfo.email,
        phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
        department: tInfo.dept,
        subjects: tInfo.sub,
        qualifications: 'M.Sc, B.Ed (10+ Yrs Exp)',
        joiningDate: '2021-06-01',
        availability: JSON.stringify(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']),
        userId: u.id
      }
    });
    teachers.push(teacher);
  }
  console.log('✅ Created 15 Teachers with linked User logins');

  // 5. Create Classes (5 Classes: 10-A, 10-B, 9-A, 9-B, 11-A)
  const classesData = [
    { grade: '10', division: 'A', academicYear: '2026-2027', classTeacherId: teachers[0].id, roomId: rooms[0].id },
    { grade: '10', division: 'B', academicYear: '2026-2027', classTeacherId: teachers[1].id, roomId: rooms[1].id },
    { grade: '9', division: 'A', academicYear: '2026-2027', classTeacherId: teachers[2].id, roomId: rooms[2].id },
    { grade: '9', division: 'B', academicYear: '2026-2027', classTeacherId: teachers[3].id, roomId: rooms[3].id },
    { grade: '11', division: 'A', academicYear: '2026-2027', classTeacherId: teachers[4].id, roomId: rooms[4].id }
  ];

  const classes = [];
  for (const c of classesData) {
    classes.push(await prisma.class.create({ data: c }));
  }
  console.log('✅ Created 5 Classes');

  // 6. Create 50 Realistic Students
  const firstNames = ['Aarav', 'Ananya', 'Vihaan', 'Isha', 'Reyansh', 'Diya', 'Arjun', 'Sanya', 'Kabir', 'Riya', 'Ishaan', 'Tara', 'Aditya', 'Avani', 'Dev', 'Kiara', 'Karan', 'Meera', 'Rohan', 'Sneha', 'Yash', 'Zoya', 'Dhruv', 'Kavya', 'Manav', 'Nisha', 'Pranav', 'Pooja', 'Rahul', 'Shreya', 'Siddharth', 'Tanvi', 'Utkarsh', 'Varun', 'Vidhya', 'Aakash', 'Bhavna', 'Chetan', 'Deepika', 'Gaurav', 'Harini', 'Jatin', 'Komal', 'Lokesh', 'Mohit', 'Neha', 'Om', 'Payal', 'Rajesh', 'Shruti'];
  const lastNames = ['Sharma', 'Verma', 'Patel', 'Deshmukh', 'Gupta', 'Iyer', 'Nair', 'Kulkarni', 'Joshi', 'Chowdhury', 'Reddy', 'Singhania', 'Bhat', 'Mehta', 'Rao', 'Kapoor', 'Malhotra', 'Sinha', 'Chawla', 'Saxena', 'Pillai', 'Hegde', 'Kaushik', 'Trivedi', 'Agarwal'];

  for (let i = 0; i < 50; i++) {
    const fn = firstNames[i];
    const ln = lastNames[i % lastNames.length];
    const cls = classes[i % classes.length];
    const roll = Math.floor(i / classes.length) + 1;

    await prisma.student.create({
      data: {
        studentId: `STU-2026-${1000 + i}`,
        firstName: fn,
        lastName: ln,
        dateOfBirth: `2011-${(i % 12 + 1).toString().padStart(2, '0')}-${(i % 28 + 1).toString().padStart(2, '0')}`,
        gender: i % 2 === 0 ? 'Male' : 'Female',
        classId: cls.id,
        division: cls.division,
        rollNumber: roll.toString(),
        parentName: `${fn}'s Guardian (${ln})`,
        parentPhone: `+91 98765 ${Math.floor(10005 + i)}`,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@student.school.com`,
        address: `${i + 10}, Sapphire Palms, Sector ${i % 15 + 1}, Metro City`,
        admissionDate: '2024-04-10',
        emergencyContact: `+91 98765 ${Math.floor(20005 + i)}`,
        status: 'ACTIVE'
      }
    });
  }
  console.log('✅ Created 50 Students distributed across classes');

  // 7. Generate Sample Timetable Entries
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  let ttCount = 0;
  for (const cls of classes) {
    for (let d = 0; d < days.length; d++) {
      for (let p = 1; p <= 5; p++) {
        const sub = subjects[(d + p) % subjects.length];
        const tch = teachers[(d + p) % teachers.length];
        const rm = rooms[(d + p) % rooms.length];

        await prisma.timetableEntry.create({
          data: {
            classId: cls.id,
            subjectId: sub.id,
            teacherId: tch.id,
            roomId: rm.id,
            day: days[d],
            period: p
          }
        });
        ttCount++;
      }
    }
  }
  console.log(`✅ Created ${ttCount} Timetable entries`);

  // 8. Generate Sample Attendance Logs
  const students = await prisma.student.findMany();
  const pastDates = ['2026-08-11', '2026-08-12', '2026-08-13', '2026-08-14'];

  for (const dt of pastDates) {
    for (const st of students) {
      // Make a couple students have consistently low attendance to trigger low-attendance alert
      const isLowStudent = st.rollNumber === '1' && st.classId === classes[0].id;
      const isAbsent = isLowStudent ? true : Math.random() < 0.08;
      const isLate = !isAbsent && Math.random() < 0.05;
      const status = isAbsent ? 'ABSENT' : isLate ? 'LATE' : 'PRESENT';

      await prisma.attendance.create({
        data: {
          studentId: st.id,
          classId: st.classId,
          date: dt,
          status
        }
      });
    }
  }
  console.log('✅ Created attendance records for historical school days');

  // 9. Create Sample Uploaded OCR Documents
  await prisma.document.create({
    data: {
      fileName: 'Admission_Form_Rahul_Sharma.pdf',
      fileUrl: '/uploads/sample_admission_1.pdf',
      type: 'STUDENT_ADMISSION',
      uploadedById: superAdmin.id,
      processingStatus: 'PROCESSED',
      extractedData: JSON.stringify({
        firstName: 'Rahul',
        lastName: 'Sharma',
        dateOfBirth: '2011-03-12',
        gender: 'Male',
        class: '10-A',
        parentName: 'Amit Sharma',
        parentPhone: '+91 98765 43210',
        address: '22 Park Street, Mumbai'
      }),
      confidence: 0.97,
      verificationStatus: 'PENDING'
    }
  });

  await prisma.document.create({
    data: {
      fileName: 'Teacher_Registration_Dr_Malhotra.pdf',
      fileUrl: '/uploads/sample_teacher_1.pdf',
      type: 'TEACHER_FORM',
      uploadedById: superAdmin.id,
      processingStatus: 'PROCESSED',
      extractedData: JSON.stringify({
        name: 'Dr. Vikram Malhotra',
        email: 'vikram.malhotra@school.com',
        phone: '+91 98230 11223',
        department: 'Chemistry',
        qualifications: 'Ph.D. Organic Chemistry'
      }),
      confidence: 0.98,
      verificationStatus: 'PENDING'
    }
  });
  console.log('✅ Created sample OCR documents awaiting review');

  // 10. Create Initial Proactive Alerts
  await prisma.systemAlert.create({
    data: {
      type: 'PENDING_DOCUMENT',
      severity: 'MEDIUM',
      title: 'Pending Document Verification',
      description: '2 scanned paper forms are waiting for AI OCR verification & admin approval.',
      relatedEntity: 'documents',
      actionLabel: 'Verify Documents',
      actionUrl: '/documents'
    }
  });

  await prisma.systemAlert.create({
    data: {
      type: 'LOW_ATTENDANCE',
      severity: 'HIGH',
      title: 'Low Attendance Alert',
      description: 'Class 10-A student attendance has dropped below 75% threshold.',
      relatedEntity: 'attendance',
      actionLabel: 'View Attendance',
      actionUrl: '/attendance'
    }
  });

  await prisma.systemAlert.create({
    data: {
      type: 'TIMETABLE_ISSUE',
      severity: 'HIGH',
      title: 'Timetable Optimization Suggested',
      description: 'Weekly period coverage for Mathematics & Physics can be auto-optimized.',
      relatedEntity: 'timetable',
      actionLabel: 'Generate Timetable',
      actionUrl: '/timetable'
    }
  });

  // Create notifications
  await prisma.notification.create({
    data: {
      userId: superAdmin.id,
      title: 'New Student Document Uploaded',
      message: 'Admission form for Rahul Sharma uploaded and processed with 97% confidence.',
      type: 'DOCUMENT_VERIFICATION',
      severity: 'MEDIUM',
      read: false,
      relatedEntity: 'document'
    }
  });

  await prisma.notification.create({
    data: {
      userId: superAdmin.id,
      title: 'Attendance Alert Triggered',
      message: 'Class 10-A has 3 absent students today.',
      type: 'ATTENDANCE_WARNING',
      severity: 'HIGH',
      read: false,
      relatedEntity: 'attendance'
    }
  });

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
