/**
 * TeachFlow Data Storage & Offline Engine
 * Handles persistent storage, initial seed data, offline action queue,
 * and strict privacy enforcement for Teacher Private Notes.
 */

import {
  User,
  SchoolSettings,
  ClassRoutineItem,
  ClassSession,
  AttendanceRecord,
  PrivateTeacherNote,
  AdminReport,
  LeaveRequest,
  Notice,
  AuditLog,
  OfflineAction,
  SyncState,
  Student,
  WeeklyCTMark,
  WeeklyStudentReport,
  EvaluationSettings,
  StudentOfTheMonthRecord,
  CTAssessment,
  CTEditHistoryItem,
  SOMStatus,
  StudentDailyAttendance
} from '../types';

const STORAGE_PREFIX = 'teachflow_v1_';

// Initial School Settings (Dhaka, Bangladesh context, scalable globally)
export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  schoolName: 'Dhaka Model Academy & College',
  tagline: 'Teach. Track. Manage.',
  schoolCode: 'DMA-10928',
  address: 'Plot 14, Mirpur Road, Dhaka-1205, Bangladesh',
  timezone: 'Asia/Dhaka',
  workingDays: [0, 1, 2, 3, 4], // Sunday = 0, Thursday = 4
  defaultClassDurationMinutes: 45,
  lateThresholdMinutes: 10,
  reminderIntervalsMinutes: [30, 10, 0],
  allowQrCheckin: true,
  allowOneTapStart: true,
  maxFileSizeMb: 10
};

// Initial Seed Users (Exactly 2 Admins, plus Teachers and Employees)
export const SEED_USERS: User[] = [
  {
    id: 'admin_1',
    email: 'admin1@teachflow.edu.bd',
    name: 'Dr. A. K. M. Shamsuddin',
    role: 'ADMIN',
    pin: '1234',
    employeeId: 'EMP-ADM-01',
    designation: 'Principal & Executive Head',
    department: 'Administration',
    phone: '+880 1711-000001',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'admin_2',
    email: 'admin2@teachflow.edu.bd',
    name: 'Begum Rokeya Sultana',
    role: 'ADMIN',
    pin: '1234',
    employeeId: 'EMP-ADM-02',
    designation: 'Vice-Principal & Academic Coordinator',
    department: 'Academic Supervision',
    phone: '+880 1711-000002',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'teacher_1',
    email: 'teacher1@teachflow.edu.bd',
    name: 'Mr. Rafiqul Islam',
    role: 'TEACHER',
    pin: '1234',
    employeeId: 'EMP-TCH-101',
    designation: 'Senior Teacher',
    department: 'English & Humanities',
    phone: '+880 1819-123456',
    status: 'ACTIVE',
    assignedClasses: ['Class 8', 'Class 9', 'Class 10'],
    assignedSubjects: ['English 1st Paper', 'English Grammar'],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'teacher_2',
    email: 'teacher2@teachflow.edu.bd',
    name: 'Ms. Nusrat Jahan',
    role: 'TEACHER',
    pin: '1234',
    employeeId: 'EMP-TCH-102',
    designation: 'Assistant Teacher',
    department: 'Mathematics',
    phone: '+880 1912-789012',
    status: 'ACTIVE',
    assignedClasses: ['Class 5', 'Class 7', 'Class 8'],
    assignedSubjects: ['Mathematics', 'General Mathematics', 'Higher Mathematics'],
    avatarUrl: 'https://images.unsplash.com/photo-1580894732415-46705dfba735?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'teacher_3',
    email: 'teacher3@teachflow.edu.bd',
    name: 'Mr. Minhaj Ahmed',
    role: 'TEACHER',
    pin: '1234',
    employeeId: 'EMP-TCH-103',
    designation: 'Lecturer & ICT Head',
    department: 'Science & ICT',
    phone: '+880 1622-456789',
    status: 'ACTIVE',
    assignedClasses: ['Class 6', 'Class 7', 'Class 8'],
    assignedSubjects: ['General Science', 'ICT'],
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'employee_1',
    email: 'employee1@teachflow.edu.bd',
    name: 'Mr. Kabir Hossain',
    role: 'EMPLOYEE',
    pin: '1234',
    employeeId: 'EMP-STF-201',
    designation: 'Head Office Executive',
    department: 'Accounts & Staff Support',
    phone: '+880 1515-334455',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'employee_2',
    email: 'employee2@teachflow.edu.bd',
    name: 'Mr. Alamgir Sheikh',
    role: 'EMPLOYEE',
    pin: '1234',
    employeeId: 'EMP-STF-202',
    designation: 'Computer & Science Lab Assistant',
    department: 'ICT & Laboratories',
    phone: '+880 1718-998877',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  }
];

// Helper to get formatted current time in HH:mm
export const getCurrentTimeString = (): string => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// Helper to get formatted date YYYY-MM-DD
export const getTodayDateString = (): string => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

// Dynamic routine generator so there is ALWAYS an upcoming / active class for testing right now!
const generateDynamicRoutines = (): ClassRoutineItem[] => {
  const todayDay = new Date().getDay();
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();

  // Create scheduled times spanning the current hour and later hours today
  const slot1Start = `${String(Math.max(8, currentHour)).padStart(2, '0')}:00`;
  const slot1End = `${String(Math.max(8, currentHour)).padStart(2, '0')}:45`;

  const slot2Hour = (currentHour + 1) % 24;
  const slot2Start = `${String(slot2Hour).padStart(2, '0')}:00`;
  const slot2End = `${String(slot2Hour).padStart(2, '0')}:45`;

  const slot3Hour = (currentHour + 2) % 24;
  const slot3Start = `${String(slot3Hour).padStart(2, '0')}:00`;
  const slot3End = `${String(slot3Hour).padStart(2, '0')}:45`;

  const routines: ClassRoutineItem[] = [
    // Today's classes for Teacher 1 (Mr. Rafiqul Islam)
    {
      id: 'rout_t1_slot1',
      dayOfWeek: todayDay,
      startTime: slot1Start,
      endTime: slot1End,
      classId: 'Class 8',
      section: 'Section A',
      subjectId: 'English',
      roomId: 'Room 203',
      teacherId: 'teacher_1',
      teacherName: 'Mr. Rafiqul Islam',
      notes: 'Focus on comprehension Chapter 5 and vocabulary.'
    },
    {
      id: 'rout_t1_slot2',
      dayOfWeek: todayDay,
      startTime: slot2Start,
      endTime: slot2End,
      classId: 'Class 9',
      section: 'Padma',
      subjectId: 'English 1st Paper',
      roomId: 'Room 201',
      teacherId: 'teacher_1',
      teacherName: 'Mr. Rafiqul Islam',
      notes: 'Essay writing practice.'
    },
    // Today's classes for Teacher 2 (Ms. Nusrat Jahan)
    {
      id: 'rout_t2_slot1',
      dayOfWeek: todayDay,
      startTime: slot1Start,
      endTime: slot1End,
      classId: 'Class 7',
      section: 'Jamuna',
      subjectId: 'General Mathematics',
      roomId: 'Room 204',
      teacherId: 'teacher_2',
      teacherName: 'Ms. Nusrat Jahan',
      notes: 'Algebraic equations and fractions.'
    },
    {
      id: 'rout_t2_slot3',
      dayOfWeek: todayDay,
      startTime: slot3Start,
      endTime: slot3End,
      classId: 'Class 8',
      section: 'Section B',
      subjectId: 'Higher Mathematics',
      roomId: 'Room 102',
      teacherId: 'teacher_2',
      teacherName: 'Ms. Nusrat Jahan'
    },
    // Today's classes for Teacher 3 (Mr. Minhaj Ahmed)
    {
      id: 'rout_t3_slot2',
      dayOfWeek: todayDay,
      startTime: slot2Start,
      endTime: slot2End,
      classId: 'Class 6',
      section: 'Meghna',
      subjectId: 'ICT & Computing',
      roomId: 'ICT Lab',
      teacherId: 'teacher_3',
      teacherName: 'Mr. Minhaj Ahmed',
      notes: 'Computer Lab practical session.'
    },
    // Multi-day routines for Sunday through Thursday
    {
      id: 'rout_sun_1',
      dayOfWeek: 0,
      startTime: '08:30',
      endTime: '09:15',
      classId: 'Class 6',
      section: 'A',
      subjectId: 'Bangla',
      roomId: 'Room 101',
      teacherId: 'teacher_1',
      teacherName: 'Mr. Rafiqul Islam'
    },
    {
      id: 'rout_mon_1',
      dayOfWeek: 1,
      startTime: '09:30',
      endTime: '10:15',
      classId: 'Class 7',
      section: 'B',
      subjectId: 'Mathematics',
      roomId: 'Room 204',
      teacherId: 'teacher_2',
      teacherName: 'Ms. Nusrat Jahan'
    },
    {
      id: 'rout_tue_1',
      dayOfWeek: 2,
      startTime: '10:30',
      endTime: '11:15',
      classId: 'Class 8',
      section: 'A',
      subjectId: 'Science',
      roomId: 'Science Lab',
      teacherId: 'teacher_3',
      teacherName: 'Mr. Minhaj Ahmed'
    },
    {
      id: 'rout_wed_1',
      dayOfWeek: 3,
      startTime: '11:30',
      endTime: '12:15',
      classId: 'Class 9',
      section: 'Science',
      subjectId: 'English',
      roomId: 'Room 201',
      teacherId: 'teacher_1',
      teacherName: 'Mr. Rafiqul Islam'
    },
    {
      id: 'rout_thu_1',
      dayOfWeek: 4,
      startTime: '12:30',
      endTime: '13:15',
      classId: 'Class 10',
      section: 'Commerce',
      subjectId: 'ICT',
      roomId: 'ICT Lab',
      teacherId: 'teacher_3',
      teacherName: 'Mr. Minhaj Ahmed'
    },
    // Early childhood & primary routines
    {
      id: 'rout_play_1',
      dayOfWeek: todayDay,
      startTime: '08:00',
      endTime: '08:45',
      classId: 'Play',
      section: 'A',
      subjectId: 'Drawing & Rhymes',
      roomId: 'Play Room 01',
      teacherId: 'teacher_2',
      teacherName: 'Ms. Nusrat Jahan',
      notes: 'Interactive learning with songs and drawing blocks.'
    },
    {
      id: 'rout_nur_1',
      dayOfWeek: todayDay,
      startTime: '08:45',
      endTime: '09:30',
      classId: 'Nursery',
      section: 'A',
      subjectId: 'English Alphabet & Phonics',
      roomId: 'Room 101',
      teacherId: 'teacher_2',
      teacherName: 'Ms. Nusrat Jahan',
      notes: 'Letter recognition and phonetic sound practice.'
    },
    {
      id: 'rout_kg_1',
      dayOfWeek: todayDay,
      startTime: '09:30',
      endTime: '10:15',
      classId: 'KG',
      section: 'A',
      subjectId: 'Basic Math & Counting',
      roomId: 'Room 102',
      teacherId: 'teacher_1',
      teacherName: 'Mr. Rafiqul Islam',
      notes: 'Counting 1-50 with abacus.'
    },
    {
      id: 'rout_c1_1',
      dayOfWeek: todayDay,
      startTime: '10:15',
      endTime: '11:00',
      classId: 'Class 1',
      section: 'A',
      subjectId: 'Bangla Sahitto',
      roomId: 'Room 103',
      teacherId: 'teacher_1',
      teacherName: 'Mr. Rafiqul Islam',
      notes: 'Reading practice page 12-14.'
    },
    {
      id: 'rout_c2_1',
      dayOfWeek: todayDay,
      startTime: '11:00',
      endTime: '11:45',
      classId: 'Class 2',
      section: 'A',
      subjectId: 'General Mathematics',
      roomId: 'Room 104',
      teacherId: 'teacher_2',
      teacherName: 'Ms. Nusrat Jahan',
      notes: 'Addition and Subtraction.'
    },
    {
      id: 'rout_c3_1',
      dayOfWeek: todayDay,
      startTime: '11:45',
      endTime: '12:30',
      classId: 'Class 3',
      section: 'A',
      subjectId: 'Science & Environment',
      roomId: 'Room 105',
      teacherId: 'teacher_3',
      teacherName: 'Mr. Minhaj Ahmed',
      notes: 'Plants and Animals ecosystem.'
    },
    {
      id: 'rout_c4_1',
      dayOfWeek: todayDay,
      startTime: '12:30',
      endTime: '13:15',
      classId: 'Class 4',
      section: 'A',
      subjectId: 'English for Today',
      roomId: 'Room 106',
      teacherId: 'teacher_1',
      teacherName: 'Mr. Rafiqul Islam',
      notes: 'Comprehension Unit 4.'
    }
  ];

  return routines;
};

// Initial Seed Notices
const SEED_NOTICES: Notice[] = [
  {
    id: 'notice_1',
    title: 'Mid-Term Examination Syllabus & Question Paper Submission',
    content: 'All subject teachers are requested to submit draft question papers for the upcoming Mid-Term examinations by next Thursday. Please ensure curriculum guidelines are strictly followed.',
    targetAudience: 'ALL',
    priority: 'IMPORTANT',
    authorName: 'Dr. A. K. M. Shamsuddin (Principal)',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    readByUserIds: []
  },
  {
    id: 'notice_2',
    title: 'Class Routine Adjustment for Teachers',
    content: 'Please check your updated weekly routine. English Class 8 Room 203 has been aligned with new lab hours.',
    targetAudience: 'TEACHERS',
    priority: 'ROUTINE_CHANGE',
    authorName: 'Begum Rokeya Sultana (Academic Coordinator)',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    readByUserIds: []
  },
  {
    id: 'notice_3',
    title: 'Staff Monthly Coordination Meeting',
    content: 'A general meeting for all administrative and lab staff will be held in Conference Room 1 at 3:30 PM this Wednesday.',
    targetAudience: 'EMPLOYEES',
    priority: 'MEETING',
    authorName: 'Dr. A. K. M. Shamsuddin',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    readByUserIds: []
  }
];

// Initial Seed Leave Requests
const SEED_LEAVES: LeaveRequest[] = [
  {
    id: 'leave_1',
    userId: 'teacher_2',
    userName: 'Ms. Nusrat Jahan',
    userRole: 'TEACHER',
    leaveType: 'CASUAL',
    startDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    daysCount: 2,
    reason: 'Family event and personal commitment.',
    status: 'PENDING',
    submittedAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'leave_2',
    userId: 'employee_1',
    userName: 'Mr. Kabir Hossain',
    userRole: 'EMPLOYEE',
    leaveType: 'SICK',
    startDate: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    endDate: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
    daysCount: 2,
    reason: 'Viral fever rest as advised by physician.',
    status: 'APPROVED',
    adminNotes: 'Approved with medical slip verified.',
    submittedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    decidedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    decidedBy: 'Dr. A. K. M. Shamsuddin'
  }
];

// Initial Seed Admin Reports (strictly separate from private notes)
const SEED_REPORTS: AdminReport[] = [
  {
    id: 'rep_1',
    teacherId: 'teacher_1',
    teacherName: 'Mr. Rafiqul Islam',
    reportType: 'STUDENT_OBSERVATION',
    studentName: 'Tanvir Hossain (Roll 14)',
    className: 'Class 8 - Section A',
    title: 'Outstanding Progress in English Reading & Spoken Recitation',
    description: 'Student showed remarkable improvement in phonetic pronunciation and completed all grammar workbook exercises ahead of schedule.',
    priority: 'LOW',
    attachmentName: 'reading_assessment_sheet.pdf',
    attachmentSize: '340 KB',
    attachmentType: 'application/pdf',
    status: 'REVIEWED',
    adminFeedback: 'Excellent observation. Noted for parent-teacher review.',
    submittedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    reviewedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    reviewedBy: 'Begum Rokeya Sultana',
    synced: true
  },
  {
    id: 'rep_2',
    teacherId: 'teacher_3',
    teacherName: 'Mr. Minhaj Ahmed',
    reportType: 'INCIDENT_REPORT',
    studentName: 'Laboratory Equipment Issue',
    className: 'ICT Lab',
    title: 'Monitor Display Malfunction on PC Station #04',
    description: 'During Class 7 practical period, PC 4 HDMI cable port showed loose connection. Requested lab technician inspection.',
    priority: 'MEDIUM',
    attachmentName: 'pc4_port_photo.jpg',
    attachmentSize: '1.2 MB',
    attachmentType: 'image/jpeg',
    status: 'UNDER_REVIEW',
    submittedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    synced: true
  }
];

// Initial Teacher Private Notes (Stored with teacher ownership isolation)
const SEED_PRIVATE_NOTES: Record<string, PrivateTeacherNote[]> = {
  teacher_1: [
    {
      id: 'pnote_t1_1',
      ownerId: 'teacher_1',
      title: 'Class 8 English Comprehension Strategy',
      content: 'Break Chapter 5 into 3 reading groups. Group A focuses on vocabulary, Group B summarizes main themes, Group C answers inferential questions.',
      tags: ['Lesson Plan', 'Class 8', 'Ideas'],
      isPinned: true,
      isArchived: false,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 10).toISOString()
    },
    {
      id: 'pnote_t1_2',
      ownerId: 'teacher_1',
      title: 'Personal Reminder: Board Exam Question Bank',
      content: 'Collect model test papers from 2024 and 2025 for Class 10 candidates. Prepare practice sets for weekend revision.',
      tags: ['Exam Prep', 'Personal'],
      isPinned: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString()
    }
  ],
  teacher_2: [
    {
      id: 'pnote_t2_1',
      ownerId: 'teacher_2',
      title: 'Math Formula Sheet for Class 7',
      content: 'Create a mnemonic chart for algebraic identities (a+b)^2 and (a-b)^2 to help students who struggle with signs.',
      tags: ['Mathematics', 'Formulas'],
      isPinned: true,
      isArchived: false,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
    }
  ]
};

// Audit logs
const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_1',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    action: 'SYSTEM_INITIALIZED',
    actorId: 'admin_1',
    actorName: 'Dr. A. K. M. Shamsuddin',
    actorRole: 'ADMIN',
    targetEntity: 'SYSTEM',
    details: 'TeachFlow system deployed for Dhaka Model Academy & College.'
  },
  {
    id: 'log_2',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    action: 'ROUTINE_UPDATED',
    actorId: 'admin_2',
    actorName: 'Begum Rokeya Sultana',
    actorRole: 'ADMIN',
    targetEntity: 'ROUTINE',
    details: 'Updated weekly routine for English and Mathematics.'
  },
  {
    id: 'log_3',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    action: 'REPORT_REVIEWED',
    actorId: 'admin_2',
    actorName: 'Begum Rokeya Sultana',
    actorRole: 'ADMIN',
    targetEntity: 'ADMIN_REPORT',
    details: 'Reviewed student observation report by Mr. Rafiqul Islam.'
  }
];

// Default Evaluation Settings
export const DEFAULT_EVALUATION_SETTINGS: EvaluationSettings = {
  defaultMaxCtMark: 20,
  weights: {
    ctPerformance: 40,
    attendance: 20,
    behavior: 15,
    classParticipation: 10,
    homework: 10,
    teacherEvaluation: 5
  }
};

// Seed Students (Class 7-A Class Teacher: Ms. Nusrat Jahan teacher_2, Class 8-A: Mr. Rafiqul Islam teacher_1)
export const SEED_STUDENTS: Student[] = [
  // Class 5 - Section A (Smart C.T. Management Seed Students)
  {
    id: 'std_5_1',
    studentId: 'STD-2026-0501',
    name: 'Rahim',
    classId: 'Class 5',
    section: 'A',
    roll: 1,
    classTeacherId: 'teacher_2',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Md. Abdur Rahim',
    guardianPhone: '+880 1711-112233',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  {
    id: 'std_5_2',
    studentId: 'STD-2026-0502',
    name: 'Karim',
    classId: 'Class 5',
    section: 'A',
    roll: 2,
    classTeacherId: 'teacher_2',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Md. Rezaul Karim',
    guardianPhone: '+880 1712-223344',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  {
    id: 'std_5_3',
    studentId: 'STD-2026-0503',
    name: 'Sakib',
    classId: 'Class 5',
    section: 'A',
    roll: 3,
    classTeacherId: 'teacher_2',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Md. Nazmul Sakib',
    guardianPhone: '+880 1713-334455',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  {
    id: 'std_5_4',
    studentId: 'STD-2026-0504',
    name: 'Nabila',
    classId: 'Class 5',
    section: 'A',
    roll: 4,
    classTeacherId: 'teacher_2',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Md. Anwar Hossain',
    guardianPhone: '+880 1714-445566',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  {
    id: 'std_5_5',
    studentId: 'STD-2026-0505',
    name: 'Fahim',
    classId: 'Class 5',
    section: 'A',
    roll: 5,
    classTeacherId: 'teacher_2',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Md. Kamrul Hasan',
    guardianPhone: '+880 1715-556677',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  {
    id: 'std_5_6',
    studentId: 'STD-2026-0506',
    name: 'Sumaiya',
    classId: 'Class 5',
    section: 'A',
    roll: 6,
    classTeacherId: 'teacher_2',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Kazi Nazrul Islam',
    guardianPhone: '+880 1716-667788',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  {
    id: 'std_7_1',
    studentId: 'STD-2026-0701',
    name: 'Ahsan Habib',
    classId: 'Class 7',
    section: 'A',
    roll: 1,
    classTeacherId: 'teacher_2',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Dr. Md. Habibur Rahman',
    guardianPhone: '+880 1711-234567',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  {
    id: 'std_7_2',
    studentId: 'STD-2026-0702',
    name: 'Sadia Akter',
    classId: 'Class 7',
    section: 'A',
    roll: 2,
    classTeacherId: 'teacher_2',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Md. Anisur Rahman',
    guardianPhone: '+880 1712-345678',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  {
    id: 'std_7_3',
    studentId: 'STD-2026-0703',
    name: 'Fahim Muntakim',
    classId: 'Class 7',
    section: 'A',
    roll: 3,
    classTeacherId: 'teacher_2',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Engr. Kamal Hossain',
    guardianPhone: '+880 1713-456789',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  {
    id: 'std_7_4',
    studentId: 'STD-2026-0704',
    name: 'Joyita Roy',
    classId: 'Class 7',
    section: 'A',
    roll: 4,
    classTeacherId: 'teacher_2',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Prof. Subir Roy',
    guardianPhone: '+880 1714-567890',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  {
    id: 'std_7_5',
    studentId: 'STD-2026-0705',
    name: 'Tanvir Rahman',
    classId: 'Class 7',
    section: 'A',
    roll: 5,
    classTeacherId: 'teacher_2',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Md. Tariqul Islam',
    guardianPhone: '+880 1715-678901',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  {
    id: 'std_7_6',
    studentId: 'STD-2026-0706',
    name: 'Nabila Hossain',
    classId: 'Class 7',
    section: 'A',
    roll: 6,
    classTeacherId: 'teacher_2',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Md. Delwar Hossain',
    guardianPhone: '+880 1716-789012',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  {
    id: 'std_7_7',
    studentId: 'STD-2026-0707',
    name: 'Mehedi Hasan',
    classId: 'Class 7',
    section: 'A',
    roll: 7,
    classTeacherId: 'teacher_2',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Md. Shah Alam',
    guardianPhone: '+880 1717-890123',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  {
    id: 'std_7_8',
    studentId: 'STD-2026-0708',
    name: 'Sumaiya Islam',
    classId: 'Class 7',
    section: 'A',
    roll: 8,
    classTeacherId: 'teacher_2',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Kazi Nazrul Islam',
    guardianPhone: '+880 1718-901234',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  // Class 8 - Section A
  {
    id: 'std_8_1',
    studentId: 'STD-2026-0801',
    name: 'Sazzad Hossain',
    classId: 'Class 8',
    section: 'A',
    roll: 1,
    classTeacherId: 'teacher_1',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Md. Moniruzzaman',
    guardianPhone: '+880 1811-112233',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  {
    id: 'std_8_2',
    studentId: 'STD-2026-0802',
    name: 'Tasnim Sultana',
    classId: 'Class 8',
    section: 'A',
    roll: 2,
    classTeacherId: 'teacher_1',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Adv. Faruk Ahmed',
    guardianPhone: '+880 1812-223344',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  {
    id: 'std_8_3',
    studentId: 'STD-2026-0803',
    name: 'Ariful Islam',
    classId: 'Class 8',
    section: 'A',
    roll: 3,
    classTeacherId: 'teacher_1',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Md. Abul Kashem',
    guardianPhone: '+880 1813-334455',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  {
    id: 'std_8_4',
    studentId: 'STD-2026-0804',
    name: 'Farzana Yeasmin',
    classId: 'Class 8',
    section: 'A',
    roll: 4,
    classTeacherId: 'teacher_1',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Dr. Yeasin Ali',
    guardianPhone: '+880 1814-445566',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  {
    id: 'std_8_5',
    studentId: 'STD-2026-0805',
    name: 'Rashedul Karim',
    classId: 'Class 8',
    section: 'A',
    roll: 5,
    classTeacherId: 'teacher_1',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Md. Rezaul Karim',
    guardianPhone: '+880 1815-556677',
    attendancePercentage: 92,
    teacherRemarks: 'Analytical thinker with high potential in physical sciences.',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  // Play - Section A
  {
    id: 'std_play_1',
    studentId: 'STD-2026-0001',
    name: 'Arafat Ali',
    classId: 'Play',
    section: 'A',
    roll: 1,
    classTeacherId: 'teacher_2',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Md. Ali Hossain',
    guardianPhone: '+880 1711-100101',
    attendancePercentage: 98,
    teacherRemarks: 'অত্যন্ত চটপটে ও হাসিখুশি শিশু, রঙের খেলায় খুব আগ্রহী।',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  {
    id: 'std_play_2',
    studentId: 'STD-2026-0002',
    name: 'Ananya Sen',
    classId: 'Play',
    section: 'A',
    roll: 2,
    classTeacherId: 'teacher_2',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Dr. Debashis Sen',
    guardianPhone: '+880 1711-100102',
    attendancePercentage: 96,
    teacherRemarks: 'খুব মনোযোগী ও শান্ত স্বভাবের। সহপাঠীদের সাথে মিলেমিশে থাকে।',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  // Nursery - Section A
  {
    id: 'std_nur_1',
    studentId: 'STD-2026-0011',
    name: 'Samiul Islam',
    classId: 'Nursery',
    section: 'A',
    roll: 1,
    classTeacherId: 'teacher_2',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Md. Shafiqul Islam',
    guardianPhone: '+880 1711-100103',
    attendancePercentage: 95,
    teacherRemarks: 'ছড়া আবৃত্তিতে দারুণ পারদর্শী ও প্রাণবন্ত।',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  {
    id: 'std_nur_2',
    studentId: 'STD-2026-0012',
    name: 'Mariam Akter',
    classId: 'Nursery',
    section: 'A',
    roll: 2,
    classTeacherId: 'teacher_2',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Md. Mahmudul Hasan',
    guardianPhone: '+880 1711-100104',
    attendancePercentage: 94,
    teacherRemarks: 'নিয়মিত ক্লাসে উপস্থিত থাকে এবং গান ও ছড়ায় উৎসাহী।',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  // KG - Section A
  {
    id: 'std_kg_1',
    studentId: 'STD-2026-0021',
    name: 'Rohan Chowdhury',
    classId: 'KG',
    section: 'A',
    roll: 1,
    classTeacherId: 'teacher_1',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Md. Asaduzzaman Chowdhury',
    guardianPhone: '+880 1711-100105',
    attendancePercentage: 97,
    teacherRemarks: 'বর্ণমালা ও সংখ্যা চেনার দক্ষতা চমৎকার।',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  {
    id: 'std_kg_2',
    studentId: 'STD-2026-0022',
    name: 'Jannatul Ferdous',
    classId: 'KG',
    section: 'A',
    roll: 2,
    classTeacherId: 'teacher_1',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Engr. Mizanur Rahman',
    guardianPhone: '+880 1711-100106',
    attendancePercentage: 96,
    teacherRemarks: 'হাতের লেখার চর্চা নিয়মিত করে এবং পরিচ্ছন্ন খাতা বজায় রাখে।',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  // Class 1 - Section A
  {
    id: 'std_1_1',
    studentId: 'STD-2026-0101',
    name: 'Tahmid Hasan',
    classId: 'Class 1',
    section: 'A',
    roll: 1,
    classTeacherId: 'teacher_1',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Dr. Hasan Mahmud',
    guardianPhone: '+880 1711-100107',
    attendancePercentage: 95,
    teacherRemarks: 'পড়ার প্রতি গভীর আগ্রহ রয়েছে ও দ্রুত শিখতে পারে।',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  // Class 2 - Section A
  {
    id: 'std_2_1',
    studentId: 'STD-2026-0201',
    name: 'Rayan Ahmed',
    classId: 'Class 2',
    section: 'A',
    roll: 1,
    classTeacherId: 'teacher_2',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Md. Zahir Ahmed',
    guardianPhone: '+880 1711-100108',
    attendancePercentage: 94,
    teacherRemarks: 'প্রাথমিক গণিত ও নামতা চর্চায় খুব পারদর্শী।',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  // Class 3 - Section A
  {
    id: 'std_3_1',
    studentId: 'STD-2026-0301',
    name: 'Mahir Faysal',
    classId: 'Class 3',
    section: 'A',
    roll: 1,
    classTeacherId: 'teacher_3',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Faysal Kabir',
    guardianPhone: '+880 1711-100109',
    attendancePercentage: 96,
    teacherRemarks: 'বিজ্ঞান প্রজেক্ট ও সাধারণ জ্ঞানে খুব আগ্রহী।',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  // Class 4 - Section A
  {
    id: 'std_4_1',
    studentId: 'STD-2026-0401',
    name: 'Adnan Sami',
    classId: 'Class 4',
    section: 'A',
    roll: 1,
    classTeacherId: 'teacher_3',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Samiullah Khan',
    guardianPhone: '+880 1711-100110',
    attendancePercentage: 95,
    teacherRemarks: 'নিয়মিত হোমওয়ার্ক জমা দেয় ও ক্লাসে সক্রিয় অংশগ্রহণ করে।',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  // Class 6 - Section A
  {
    id: 'std_6_1',
    studentId: 'STD-2026-0601',
    name: 'Tanvir Hossain',
    classId: 'Class 6',
    section: 'A',
    roll: 1,
    classTeacherId: 'teacher_3',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Md. Delwar Hossain',
    guardianPhone: '+880 1711-100111',
    attendancePercentage: 93,
    teacherRemarks: 'কম্পিউটার ক্লাসে খুব ভালো পারফর্ম করছে।',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  // Class 9 - Section A
  {
    id: 'std_9_1',
    studentId: 'STD-2026-0901',
    name: 'Shakib Al Hasan',
    classId: 'Class 9',
    section: 'A',
    roll: 1,
    classTeacherId: 'teacher_1',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Md. Mashrafe Mortaza',
    guardianPhone: '+880 1711-100112',
    attendancePercentage: 97,
    teacherRemarks: 'ইংরেজিতে সাবলীল বক্তব্য ও ভালো ফলাফল।',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  // Class 10 - Section A
  {
    id: 'std_10_1',
    studentId: 'STD-2026-1001',
    name: 'Salman Farsi',
    classId: 'Class 10',
    section: 'A',
    roll: 1,
    classTeacherId: 'teacher_1',
    academicYear: '2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    guardianName: 'Md. Golam Faruk',
    guardianPhone: '+880 1711-100113',
    attendancePercentage: 99,
    teacherRemarks: 'এসএসসি পরীক্ষার প্রস্তুতিতে নিয়মিত ও নিবেদিতপ্রাণ।',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  }
];

// Seed Weekly CT Marks for September 2026 (Weeks 1, 2, 3)
export const SEED_CT_MARKS: WeeklyCTMark[] = [
  // Class 5-A Mathematics (Smart C.T. Workflow)
  {
    id: 'ct_5_1_cta1',
    studentId: 'std_5_1',
    studentName: 'Rahim',
    studentRoll: 1,
    teacherId: 'teacher_2',
    classId: 'Class 5',
    section: 'A',
    subjectId: 'Mathematics',
    academicYear: '2026',
    month: 'September',
    week: 1,
    weekNumber: 1,
    ctNumber: 'C.T. 01',
    ctAssessmentId: 'cta_5a_math_ct1',
    mark: 18,
    maxMark: 20,
    obtainedMarks: 18,
    totalMarks: 20,
    percentage: 90,
    isAbsent: false,
    status: 'PRESENT',
    teacherComment: 'Excellent performance in fractions',
    evaluatedByTeacherId: 'teacher_2',
    evaluatedByTeacherName: 'Ms. Nusrat Jahan',
    updatedAt: new Date().toISOString(),
    synced: true
  },
  {
    id: 'ct_5_2_cta1',
    studentId: 'std_5_2',
    studentName: 'Karim',
    studentRoll: 2,
    teacherId: 'teacher_2',
    classId: 'Class 5',
    section: 'A',
    subjectId: 'Mathematics',
    academicYear: '2026',
    month: 'September',
    week: 1,
    weekNumber: 1,
    ctNumber: 'C.T. 01',
    ctAssessmentId: 'cta_5a_math_ct1',
    mark: 15,
    maxMark: 20,
    obtainedMarks: 15,
    totalMarks: 20,
    percentage: 75,
    isAbsent: false,
    status: 'PRESENT',
    teacherComment: 'Good effort, revise decimal conversions',
    evaluatedByTeacherId: 'teacher_2',
    evaluatedByTeacherName: 'Ms. Nusrat Jahan',
    updatedAt: new Date().toISOString(),
    synced: true
  },
  {
    id: 'ct_5_4_cta1',
    studentId: 'std_5_4',
    studentName: 'Nabila',
    studentRoll: 4,
    teacherId: 'teacher_2',
    classId: 'Class 5',
    section: 'A',
    subjectId: 'Mathematics',
    academicYear: '2026',
    month: 'September',
    week: 1,
    weekNumber: 1,
    ctNumber: 'C.T. 01',
    ctAssessmentId: 'cta_5a_math_ct1',
    mark: 20,
    maxMark: 20,
    obtainedMarks: 20,
    totalMarks: 20,
    percentage: 100,
    isAbsent: false,
    status: 'PRESENT',
    teacherComment: 'Outstanding! Full marks achieved',
    evaluatedByTeacherId: 'teacher_2',
    evaluatedByTeacherName: 'Ms. Nusrat Jahan',
    updatedAt: new Date().toISOString(),
    synced: true
  },
  {
    id: 'ct_5_5_cta1',
    studentId: 'std_5_5',
    studentName: 'Fahim',
    studentRoll: 5,
    teacherId: 'teacher_2',
    classId: 'Class 5',
    section: 'A',
    subjectId: 'Mathematics',
    academicYear: '2026',
    month: 'September',
    week: 1,
    weekNumber: 1,
    ctNumber: 'C.T. 01',
    ctAssessmentId: 'cta_5a_math_ct1',
    mark: 16,
    maxMark: 20,
    obtainedMarks: 16,
    totalMarks: 20,
    percentage: 80,
    isAbsent: false,
    status: 'PRESENT',
    teacherComment: 'Keep up the good analytical work',
    evaluatedByTeacherId: 'teacher_2',
    evaluatedByTeacherName: 'Ms. Nusrat Jahan',
    updatedAt: new Date().toISOString(),
    synced: true
  },
  {
    id: 'ct_5_6_cta1',
    studentId: 'std_5_6',
    studentName: 'Sumaiya',
    studentRoll: 6,
    teacherId: 'teacher_2',
    classId: 'Class 5',
    section: 'A',
    subjectId: 'Mathematics',
    academicYear: '2026',
    month: 'September',
    week: 1,
    weekNumber: 1,
    ctNumber: 'C.T. 01',
    ctAssessmentId: 'cta_5a_math_ct1',
    mark: 0,
    maxMark: 20,
    obtainedMarks: 0,
    totalMarks: 20,
    percentage: 0,
    isAbsent: true,
    status: 'ABSENT',
    teacherComment: 'Approved medical leave',
    evaluatedByTeacherId: 'teacher_2',
    evaluatedByTeacherName: 'Ms. Nusrat Jahan',
    updatedAt: new Date().toISOString(),
    synced: true
  },

  // Class 7-A (Max 20)
  { id: 'ct_7_1_w1', studentId: 'std_7_1', teacherId: 'teacher_2', classId: 'Class 7', section: 'A', academicYear: '2026', month: 'September 2026', week: 1, mark: 19.5, maxMark: 20, updatedAt: new Date().toISOString(), synced: true },
  { id: 'ct_7_1_w2', studentId: 'std_7_1', teacherId: 'teacher_2', classId: 'Class 7', section: 'A', academicYear: '2026', month: 'September 2026', week: 2, mark: 20, maxMark: 20, updatedAt: new Date().toISOString(), synced: true },
  { id: 'ct_7_1_w3', studentId: 'std_7_1', teacherId: 'teacher_2', classId: 'Class 7', section: 'A', academicYear: '2026', month: 'September 2026', week: 3, mark: 19, maxMark: 20, updatedAt: new Date().toISOString(), synced: true },

  { id: 'ct_7_2_w1', studentId: 'std_7_2', teacherId: 'teacher_2', classId: 'Class 7', section: 'A', academicYear: '2026', month: 'September 2026', week: 1, mark: 18.5, maxMark: 20, updatedAt: new Date().toISOString(), synced: true },
  { id: 'ct_7_2_w2', studentId: 'std_7_2', teacherId: 'teacher_2', classId: 'Class 7', section: 'A', academicYear: '2026', month: 'September 2026', week: 2, mark: 18, maxMark: 20, updatedAt: new Date().toISOString(), synced: true },
  { id: 'ct_7_2_w3', studentId: 'std_7_2', teacherId: 'teacher_2', classId: 'Class 7', section: 'A', academicYear: '2026', month: 'September 2026', week: 3, mark: 19, maxMark: 20, updatedAt: new Date().toISOString(), synced: true },

  { id: 'ct_7_3_w1', studentId: 'std_7_3', teacherId: 'teacher_2', classId: 'Class 7', section: 'A', academicYear: '2026', month: 'September 2026', week: 1, mark: 17, maxMark: 20, updatedAt: new Date().toISOString(), synced: true },
  { id: 'ct_7_3_w2', studentId: 'std_7_3', teacherId: 'teacher_2', classId: 'Class 7', section: 'A', academicYear: '2026', month: 'September 2026', week: 2, mark: 17.5, maxMark: 20, updatedAt: new Date().toISOString(), synced: true },
  { id: 'ct_7_3_w3', studentId: 'std_7_3', teacherId: 'teacher_2', classId: 'Class 7', section: 'A', academicYear: '2026', month: 'September 2026', week: 3, mark: 18, maxMark: 20, updatedAt: new Date().toISOString(), synced: true },

  { id: 'ct_7_4_w1', studentId: 'std_7_4', teacherId: 'teacher_2', classId: 'Class 7', section: 'A', academicYear: '2026', month: 'September 2026', week: 1, mark: 16.5, maxMark: 20, updatedAt: new Date().toISOString(), synced: true },
  { id: 'ct_7_4_w2', studentId: 'std_7_4', teacherId: 'teacher_2', classId: 'Class 7', section: 'A', academicYear: '2026', month: 'September 2026', week: 2, mark: 17, maxMark: 20, updatedAt: new Date().toISOString(), synced: true },
  { id: 'ct_7_4_w3', studentId: 'std_7_4', teacherId: 'teacher_2', classId: 'Class 7', section: 'A', academicYear: '2026', month: 'September 2026', week: 3, mark: 17.5, maxMark: 20, updatedAt: new Date().toISOString(), synced: true },

  { id: 'ct_7_5_w1', studentId: 'std_7_5', teacherId: 'teacher_2', classId: 'Class 7', section: 'A', academicYear: '2026', month: 'September 2026', week: 1, mark: 15, maxMark: 20, updatedAt: new Date().toISOString(), synced: true },
  { id: 'ct_7_5_w2', studentId: 'std_7_5', teacherId: 'teacher_2', classId: 'Class 7', section: 'A', academicYear: '2026', month: 'September 2026', week: 2, mark: 16, maxMark: 20, updatedAt: new Date().toISOString(), synced: true },
  { id: 'ct_7_5_w3', studentId: 'std_7_5', teacherId: 'teacher_2', classId: 'Class 7', section: 'A', academicYear: '2026', month: 'September 2026', week: 3, mark: 16, maxMark: 20, updatedAt: new Date().toISOString(), synced: true },

  // Class 8-A (Max 20)
  { id: 'ct_8_1_w1', studentId: 'std_8_1', teacherId: 'teacher_1', classId: 'Class 8', section: 'A', academicYear: '2026', month: 'September 2026', week: 1, mark: 19, maxMark: 20, updatedAt: new Date().toISOString(), synced: true },
  { id: 'ct_8_1_w2', studentId: 'std_8_1', teacherId: 'teacher_1', classId: 'Class 8', section: 'A', academicYear: '2026', month: 'September 2026', week: 2, mark: 19.5, maxMark: 20, updatedAt: new Date().toISOString(), synced: true },
  { id: 'ct_8_1_w3', studentId: 'std_8_1', teacherId: 'teacher_1', classId: 'Class 8', section: 'A', academicYear: '2026', month: 'September 2026', week: 3, mark: 19, maxMark: 20, updatedAt: new Date().toISOString(), synced: true },

  { id: 'ct_8_2_w1', studentId: 'std_8_2', teacherId: 'teacher_1', classId: 'Class 8', section: 'A', academicYear: '2026', month: 'September 2026', week: 1, mark: 18, maxMark: 20, updatedAt: new Date().toISOString(), synced: true },
  { id: 'ct_8_2_w2', studentId: 'std_8_2', teacherId: 'teacher_1', classId: 'Class 8', section: 'A', academicYear: '2026', month: 'September 2026', week: 2, mark: 18.5, maxMark: 20, updatedAt: new Date().toISOString(), synced: true },
  { id: 'ct_8_2_w3', studentId: 'std_8_2', teacherId: 'teacher_1', classId: 'Class 8', section: 'A', academicYear: '2026', month: 'September 2026', week: 3, mark: 18, maxMark: 20, updatedAt: new Date().toISOString(), synced: true }
];

// Seed Weekly Reports for September 2026
export const SEED_STUDENT_REPORTS: WeeklyStudentReport[] = [
  {
    id: 'rep_7_1_w1',
    studentId: 'std_7_1',
    teacherId: 'teacher_2',
    classId: 'Class 7',
    section: 'A',
    academicYear: '2026',
    month: 'September 2026',
    week: 1,
    academicPerformance: 'EXCELLENT',
    behavior: 'EXCELLENT',
    attendanceRating: 'EXCELLENT',
    classParticipation: 'EXCELLENT',
    homework: 'EXCELLENT',
    discipline: 'EXCELLENT',
    generalComment: 'Outstanding problem solving in algebra and very polite manner.',
    updatedAt: new Date().toISOString(),
    synced: true
  },
  {
    id: 'rep_7_1_w2',
    studentId: 'std_7_1',
    teacherId: 'teacher_2',
    classId: 'Class 7',
    section: 'A',
    academicYear: '2026',
    month: 'September 2026',
    week: 2,
    academicPerformance: 'EXCELLENT',
    behavior: 'EXCELLENT',
    attendanceRating: 'EXCELLENT',
    classParticipation: 'EXCELLENT',
    homework: 'EXCELLENT',
    discipline: 'EXCELLENT',
    generalComment: 'Perfect score in geometry test. Actively helps peers.',
    updatedAt: new Date().toISOString(),
    synced: true
  },
  {
    id: 'rep_7_1_w3',
    studentId: 'std_7_1',
    teacherId: 'teacher_2',
    classId: 'Class 7',
    section: 'A',
    academicYear: '2026',
    month: 'September 2026',
    week: 3,
    academicPerformance: 'EXCELLENT',
    behavior: 'EXCELLENT',
    attendanceRating: 'EXCELLENT',
    classParticipation: 'EXCELLENT',
    homework: 'EXCELLENT',
    discipline: 'EXCELLENT',
    generalComment: 'Consistently completes all advanced math problems.',
    updatedAt: new Date().toISOString(),
    synced: true
  },
  {
    id: 'rep_7_2_w1',
    studentId: 'std_7_2',
    teacherId: 'teacher_2',
    classId: 'Class 7',
    section: 'A',
    academicYear: '2026',
    month: 'September 2026',
    week: 1,
    academicPerformance: 'EXCELLENT',
    behavior: 'EXCELLENT',
    attendanceRating: 'EXCELLENT',
    classParticipation: 'GOOD',
    homework: 'EXCELLENT',
    discipline: 'EXCELLENT',
    generalComment: 'Regular and attentive in class.',
    updatedAt: new Date().toISOString(),
    synced: true
  },
  {
    id: 'rep_8_1_w1',
    studentId: 'std_8_1',
    teacherId: 'teacher_1',
    classId: 'Class 8',
    section: 'A',
    academicYear: '2026',
    month: 'September 2026',
    week: 1,
    academicPerformance: 'EXCELLENT',
    behavior: 'EXCELLENT',
    attendanceRating: 'EXCELLENT',
    classParticipation: 'EXCELLENT',
    homework: 'EXCELLENT',
    discipline: 'EXCELLENT',
    generalComment: 'Excellent command over spoken English and active debater.',
    updatedAt: new Date().toISOString(),
    synced: true
  }
];

// Seed Historical Student of the Month records
export const SEED_STUDENT_OF_THE_MONTH: StudentOfTheMonthRecord[] = [
  {
    id: 'som_2026_08_7a',
    academicYear: '2026',
    month: 'August 2026',
    studentId: 'std_7_1',
    studentName: 'Ahsan Habib',
    classId: 'Class 7',
    section: 'A',
    roll: 1,
    classTeacherId: 'teacher_2',
    classTeacherName: 'Ms. Nusrat Jahan',
    ctScore: 97.5,
    attendanceScore: 100,
    behaviorScore: 98,
    participationScore: 95,
    homeworkScore: 100,
    teacherEvalScore: 96,
    finalScore: 98.1,
    teacherComment: 'Exceptional dedication to academic excellence, exemplary conduct, and 100% attendance.',
    publishedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    publishedBy: 'Dr. A. K. M. Shamsuddin',
    isPublished: true
  },
  {
    id: 'som_2026_08_8a',
    academicYear: '2026',
    month: 'August 2026',
    studentId: 'std_8_1',
    studentName: 'Sazzad Hossain',
    classId: 'Class 8',
    section: 'A',
    roll: 1,
    classTeacherId: 'teacher_1',
    classTeacherName: 'Mr. Rafiqul Islam',
    ctScore: 95.0,
    attendanceScore: 98,
    behaviorScore: 96,
    participationScore: 94,
    homeworkScore: 98,
    teacherEvalScore: 95,
    finalScore: 96.0,
    teacherComment: 'Top ranker in English and General Science. Displayed remarkable team leadership.',
    publishedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    publishedBy: 'Begum Rokeya Sultana',
    isPublished: true
  }
];

// Initial Seed CT Assessments (Initially CT-1 to CT-10, dynamically extensible by Admin to CT-11, CT-12, Model Tests)
export const SEED_CT_ASSESSMENTS: CTAssessment[] = [
  // Class 5-A Mathematics (Smart C.T. Workflow)
  {
    id: 'cta_5a_math_ct1',
    ctNumber: 'C.T. 01',
    name: 'C.T. 01 — Fractions & Decimals',
    title: 'Fractions & Decimals',
    classId: 'Class 5',
    section: 'A',
    subjectId: 'Mathematics',
    maxMark: 20,
    date: '2026-09-18',
    duration: '30 Minutes',
    status: 'PUBLISHED',
    teacherId: 'teacher_2',
    teacherName: 'Ms. Nusrat Jahan',
    academicYear: '2026',
    month: 'September',
    isEnabled: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cta_5a_math_ct2',
    ctNumber: 'C.T. 02',
    name: 'C.T. 02 — Geometry & Angles',
    title: 'Geometry & Angles',
    classId: 'Class 5',
    section: 'A',
    subjectId: 'Mathematics',
    maxMark: 20,
    date: '2026-09-25',
    duration: '30 Minutes',
    status: 'PUBLISHED',
    teacherId: 'teacher_2',
    teacherName: 'Ms. Nusrat Jahan',
    academicYear: '2026',
    month: 'September',
    isEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Class 7-A Bangla CTs
  { id: 'cta_7a_bng_ct1', ctNumber: 'C.T. 01', name: 'C.T. 01 — কবিতা ও ভাবসম্প্রসারণ', title: 'কবিতা ও ভাবসম্প্রসারণ', classId: 'Class 7', section: 'A', subjectId: 'Bangla', maxMark: 20, date: '2026-09-02', duration: '30 Minutes', status: 'PUBLISHED', teacherId: 'teacher_2', teacherName: 'Ms. Nusrat Jahan', academicYear: '2026', month: 'September', isEnabled: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cta_7a_bng_ct2', ctNumber: 'C.T. 02', name: 'C.T. 02 — ব্যাকরণ ও পরিচ্ছেদ', title: 'ব্যাকরণ ও পরিচ্ছেদ', classId: 'Class 7', section: 'A', subjectId: 'Bangla', maxMark: 20, date: '2026-09-09', duration: '30 Minutes', status: 'PUBLISHED', teacherId: 'teacher_2', teacherName: 'Ms. Nusrat Jahan', academicYear: '2026', month: 'September', isEnabled: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cta_7a_bng_ct3', ctNumber: 'C.T. 03', name: 'C.T. 03 — গদ্য ও ব্যাকরণ', title: 'গদ্য ও ব্যাকরণ', classId: 'Class 7', section: 'A', subjectId: 'Bangla', maxMark: 20, date: '2026-09-17', duration: '30 Minutes', status: 'PUBLISHED', teacherId: 'teacher_2', teacherName: 'Ms. Nusrat Jahan', academicYear: '2026', month: 'September', isEnabled: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

  // Class 8-A English & Science CTs
  { id: 'cta_8a_eng_ct1', ctNumber: 'C.T. 01', name: 'C.T. 01 — Tenses & Prepositions', title: 'Tenses & Prepositions', classId: 'Class 8', section: 'A', subjectId: 'English', maxMark: 20, date: '2026-09-03', duration: '30 Minutes', status: 'PUBLISHED', teacherId: 'teacher_1', teacherName: 'Mr. Rafiqul Islam', academicYear: '2026', month: 'September', isEnabled: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cta_8a_eng_ct2', ctNumber: 'C.T. 02', name: 'C.T. 02 — Paragraph & Vocabulary', title: 'Paragraph & Vocabulary', classId: 'Class 8', section: 'A', subjectId: 'English', maxMark: 20, date: '2026-09-10', duration: '30 Minutes', status: 'PUBLISHED', teacherId: 'teacher_1', teacherName: 'Mr. Rafiqul Islam', academicYear: '2026', month: 'September', isEnabled: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cta_8a_sci_ct1', ctNumber: 'C.T. 01', name: 'C.T. 01 — Atoms & Molecules', title: 'Atoms & Molecules', classId: 'Class 8', section: 'A', subjectId: 'General Science', maxMark: 20, date: '2026-09-05', duration: '30 Minutes', status: 'PUBLISHED', teacherId: 'teacher_3', teacherName: 'Mr. Minhaj Ahmed', academicYear: '2026', month: 'September', isEnabled: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

class StorageService {
  private memoryCache: Map<string, any> = new Map();

  constructor() {
    this.initStorage();
  }

  private getKey(key: string): string {
    return `${STORAGE_PREFIX}${key}`;
  }

  private getItem<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const raw = localStorage.getItem(this.getKey(key));
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(value));
    } catch (e) {
      console.error('Storage write error:', e);
    }
  }

  public initStorage() {
    if (typeof window === 'undefined') return;

    // Check if initialized
    if (!localStorage.getItem(this.getKey('initialized'))) {
      this.setItem('settings', DEFAULT_SCHOOL_SETTINGS);
      this.setItem('users', SEED_USERS);
      this.setItem('routines', generateDynamicRoutines());
      this.setItem('notices', SEED_NOTICES);
      this.setItem('leaves', SEED_LEAVES);
      this.setItem('reports', SEED_REPORTS);
      this.setItem('audit_logs', SEED_AUDIT_LOGS);
      this.setItem('class_sessions', []);
      this.setItem('attendance', []);
      this.setItem('offline_actions', []);

      // Seed teacher private notes per teacher
      Object.entries(SEED_PRIVATE_NOTES).forEach(([teacherId, notes]) => {
        this.setItem(`private_notes_${teacherId}`, notes);
      });

      this.setItem('initialized', 'true');
    }

    // Always ensure new schema tables are initialized even if initialized before
    if (!localStorage.getItem(this.getKey('students'))) {
      this.setItem('students', SEED_STUDENTS);
    }
    if (!localStorage.getItem(this.getKey('evaluation_settings'))) {
      this.setItem('evaluation_settings', DEFAULT_EVALUATION_SETTINGS);
    }
    if (!localStorage.getItem(this.getKey('weekly_ct_marks'))) {
      this.setItem('weekly_ct_marks', SEED_CT_MARKS);
    }
    if (!localStorage.getItem(this.getKey('weekly_student_reports'))) {
      this.setItem('weekly_student_reports', SEED_STUDENT_REPORTS);
    }
    if (!localStorage.getItem(this.getKey('student_of_the_month'))) {
      this.setItem('student_of_the_month', SEED_STUDENT_OF_THE_MONTH);
    }
  }

  // School Settings
  getSettings(): SchoolSettings {
    return this.getItem<SchoolSettings>('settings', DEFAULT_SCHOOL_SETTINGS);
  }

  saveSettings(settings: SchoolSettings, actor: User): void {
    this.setItem('settings', settings);
    this.addAuditLog(actor, 'SETTINGS_UPDATED', 'SCHOOL_SETTINGS', 'School settings and policies updated.');
  }

  // Users (Teachers, Employees, Admins)
  getUsers(): User[] {
    const rawUsers = this.getItem<User[]>('users', SEED_USERS);
    // Ensure every user has a pin (default '1234' for backwards compatibility)
    return rawUsers.map(u => ({
      ...u,
      pin: u.pin || '1234'
    }));
  }

  saveUsers(users: User[]): void {
    this.setItem('users', users);
  }

  addUser(user: User, actor?: User): void {
    const users = this.getUsers();
    users.push(user);
    this.saveUsers(users);
    if (actor) {
      this.addAuditLog(actor, 'USER_CREATED', 'USER', `Added new ${user.role.toLowerCase()}: ${user.name} (${user.employeeId}).`);
    }
  }

  updateUser(user: User, actor?: User): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = user;
      this.saveUsers(users);
      if (actor) {
        this.addAuditLog(actor, 'USER_UPDATED', 'USER', `Updated profile of ${user.name} (${user.employeeId}).`);
      }
    }
  }

  deleteUser(userId: string, actor?: User): void {
    const users = this.getUsers();
    const target = users.find(u => u.id === userId);
    const remaining = users.filter(u => u.id !== userId);
    this.saveUsers(remaining);
    if (actor && target) {
      this.addAuditLog(actor, 'USER_DELETED', 'USER', `Deleted user account: ${target.name} (${target.employeeId}, ${target.role}).`);
    }
  }

  // Routines
  getRoutines(): ClassRoutineItem[] {
    const routines = this.getItem<ClassRoutineItem[]>('routines', []);
    if (!routines || routines.length === 0) {
      const generated = generateDynamicRoutines();
      this.setItem('routines', generated);
      return generated;
    }
    return routines;
  }

  saveRoutines(routines: ClassRoutineItem[], actor?: User): void {
    this.setItem('routines', routines);
    if (actor) {
      this.addAuditLog(actor, 'ROUTINE_UPDATED', 'ROUTINE', 'Master class routine updated.');
    }
  }

  addRoutineItem(item: ClassRoutineItem, actor: User): void {
    const routines = this.getRoutines();
    routines.push(item);
    this.saveRoutines(routines, actor);
  }

  updateRoutineItem(item: ClassRoutineItem, actor: User): void {
    const routines = this.getRoutines();
    const idx = routines.findIndex(r => r.id === item.id);
    if (idx !== -1) {
      routines[idx] = item;
      this.saveRoutines(routines, actor);
    }
  }

  deleteRoutineItem(id: string, actor: User): void {
    const routines = this.getRoutines().filter(r => r.id !== id);
    this.saveRoutines(routines, actor);
  }

  // Class Sessions (Active, Running, Completed)
  getClassSessions(): ClassSession[] {
    return this.getItem<ClassSession[]>('class_sessions', []);
  }

  saveClassSessions(sessions: ClassSession[]): void {
    this.setItem('class_sessions', sessions);
  }

  createClassSession(session: ClassSession): void {
    const sessions = this.getClassSessions();
    // Idempotent: don't duplicate if already started for same routine & date
    const existing = sessions.find(s => s.id === session.id || (s.routineId === session.routineId && s.date === session.date && s.status === 'RUNNING'));
    if (!existing) {
      sessions.unshift(session);
      this.saveClassSessions(sessions);
    }
  }

  updateClassSession(session: ClassSession): void {
    const sessions = this.getClassSessions();
    const idx = sessions.findIndex(s => s.id === session.id);
    if (idx !== -1) {
      sessions[idx] = session;
      this.saveClassSessions(sessions);
    }
  }

  // Extend class duration (+5, +10, +15, custom)
  extendClassSession(sessionId: string, additionalMinutes: number, teacherName: string): ClassSession | null {
    const sessions = this.getClassSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return null;

    // Calculate new end time
    const [h, m] = session.scheduledEnd.split(':').map(Number);
    const totalMinutes = h * 60 + m + additionalMinutes;
    const newH = Math.floor(totalMinutes / 60) % 24;
    const newM = totalMinutes % 60;
    const newEndStr = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;

    const originalEnd = session.originalScheduledEnd || session.scheduledEnd;
    const prevExtended = session.extendedMinutes || 0;

    session.originalScheduledEnd = originalEnd;
    session.scheduledEnd = newEndStr;
    session.extendedMinutes = prevExtended + additionalMinutes;
    session.extendedAt = new Date().toISOString();
    session.extendedBy = teacherName;
    session.updatedAt = new Date().toISOString();

    this.saveClassSessions(sessions);
    return session;
  }

  // Attendance Records
  getAttendanceRecords(): AttendanceRecord[] {
    return this.getItem<AttendanceRecord[]>('attendance', []);
  }

  saveAttendanceRecords(records: AttendanceRecord[]): void {
    this.setItem('attendance', records);
  }

  recordAttendance(record: AttendanceRecord): void {
    const list = this.getAttendanceRecords();
    const existingIdx = list.findIndex(r => r.userId === record.userId && r.date === record.date);
    if (existingIdx !== -1) {
      list[existingIdx] = { ...list[existingIdx], ...record };
    } else {
      list.unshift(record);
    }
    this.saveAttendanceRecords(list);
  }

  // STUDENT DAILY ATTENDANCE (LEDGER / খাতা)
  getStudentDailyAttendance(classId?: string, section?: string, date?: string): StudentDailyAttendance[] {
    const all = this.getItem<StudentDailyAttendance[]>('student_daily_attendance', []);
    if (!Array.isArray(all)) return [];
    return all.filter(r => {
      if (classId && r.classId !== classId) return false;
      if (section && r.section !== section) return false;
      if (date && r.date !== date) return false;
      return true;
    });
  }

  saveStudentDailyAttendance(records: StudentDailyAttendance[], actor?: User): void {
    const all = this.getItem<StudentDailyAttendance[]>('student_daily_attendance', []);
    const recordMap = new Map<string, StudentDailyAttendance>();
    if (Array.isArray(all)) {
      all.forEach(r => recordMap.set(`${r.studentId}_${r.date}`, r));
    }
    records.forEach(r => recordMap.set(`${r.studentId}_${r.date}`, r));
    const merged = Array.from(recordMap.values());
    this.setItem('student_daily_attendance', merged);

    if (actor && records.length > 0) {
      this.addAuditLog(actor, 'ATTENDANCE_MARKED', 'STUDENT', `Recorded daily attendance for ${records.length} students in ${records[0].classId}-${records[0].section} on ${records[0].date}.`);
    }
  }

  // STRICT TEACHER PRIVATE NOTES ISOLATION
  // Admin or other users CANNOT retrieve these notes.
  getPrivateTeacherNotes(requestingTeacherId: string, includeDeleted: boolean = false): PrivateTeacherNote[] {
    if (!requestingTeacherId) return [];
    const notes = this.getItem<PrivateTeacherNote[]>(`private_notes_${requestingTeacherId}`, []);
    if (includeDeleted) return notes;
    return notes.filter(n => !n.isDeleted);
  }

  savePrivateTeacherNote(note: PrivateTeacherNote, requestingTeacherId: string): void {
    if (note.ownerId !== requestingTeacherId) {
      throw new Error('Unauthorized: You can only save notes owned by yourself.');
    }
    const notes = this.getPrivateTeacherNotes(requestingTeacherId);
    const idx = notes.findIndex(n => n.id === note.id);
    if (idx !== -1) {
      notes[idx] = note;
    } else {
      notes.unshift(note);
    }
    this.setItem(`private_notes_${requestingTeacherId}`, notes);
  }

  deletePrivateTeacherNote(noteId: string, requestingTeacherId: string, permanent: boolean = false): void {
    const notes = this.getPrivateTeacherNotes(requestingTeacherId);
    if (permanent) {
      // Hard delete from private key
      const filtered = notes.filter(n => n.id !== noteId);
      this.setItem(`private_notes_${requestingTeacherId}`, filtered);
    } else {
      // Soft delete: move to Recently Deleted / Trash
      const note = notes.find(n => n.id === noteId);
      if (note) {
        note.isDeleted = true;
        note.deletedAt = new Date().toISOString();
        this.setItem(`private_notes_${requestingTeacherId}`, notes);
      }
    }
  }

  restorePrivateTeacherNote(noteId: string, requestingTeacherId: string): void {
    const notes = this.getPrivateTeacherNotes(requestingTeacherId);
    const note = notes.find(n => n.id === noteId);
    if (note) {
      note.isDeleted = false;
      delete note.deletedAt;
      this.setItem(`private_notes_${requestingTeacherId}`, notes);
    }
  }

  emptyTrashPrivateTeacherNotes(requestingTeacherId: string): void {
    const notes = this.getPrivateTeacherNotes(requestingTeacherId);
    const activeOnly = notes.filter(n => !n.isDeleted);
    this.setItem(`private_notes_${requestingTeacherId}`, activeOnly);
  }

  // STUDENT MANAGEMENT
  getStudents(): Student[] {
    const students = this.getItem<Student[]>('students', SEED_STUDENTS);
    if (!Array.isArray(students)) return SEED_STUDENTS;
    const existingClasses = new Set(students.map(s => s.classId));
    const missingSeed = SEED_STUDENTS.filter(s => !existingClasses.has(s.classId));
    if (missingSeed.length > 0) {
      const merged = [...students, ...missingSeed];
      this.saveStudents(merged);
      return merged;
    }
    return students;
  }

  saveStudents(students: Student[]): void {
    this.setItem('students', students);
  }

  addStudent(student: Student, actor?: User): void {
    const students = this.getStudents();
    students.push(student);
    this.saveStudents(students);
    if (actor) {
      this.addAuditLog(actor, 'STUDENT_ADDED', 'STUDENT', `Enrolled student: ${student.name} (Roll ${student.roll}, ${student.classId}-${student.section}).`);
    }
  }

  updateStudent(student: Student, actor?: User): void {
    const students = this.getStudents();
    const idx = students.findIndex(s => s.id === student.id);
    if (idx !== -1) {
      students[idx] = student;
      this.saveStudents(students);
      if (actor) {
        this.addAuditLog(actor, 'STUDENT_UPDATED', 'STUDENT', `Updated student profile: ${student.name} (${student.studentId}).`);
      }
    }
  }

  archiveStudent(studentId: string, actor?: User): void {
    const students = this.getStudents();
    const std = students.find(s => s.id === studentId);
    if (std) {
      std.status = 'ARCHIVED';
      this.saveStudents(students);
      if (actor) {
        this.addAuditLog(actor, 'STUDENT_ARCHIVED', 'STUDENT', `Archived student ${std.name} (${std.studentId}).`);
      }
    }
  }

  deleteStudent(studentId: string, actor?: User): void {
    const students = this.getStudents();
    const target = students.find(s => s.id === studentId);
    const remaining = students.filter(s => s.id !== studentId);
    this.saveStudents(remaining);
    if (actor && target) {
      this.addAuditLog(actor, 'STUDENT_DELETED', 'STUDENT', `Deleted student: ${target.name} (Roll ${target.roll}, ${target.classId}-${target.section}).`);
    }
  }

  // CT ASSESSMENTS CONFIGURATION (Initially CT-1 to CT-10, extensible to CT-11, Model Tests, etc.)
  getCTAssessments(): CTAssessment[] {
    return this.getItem<CTAssessment[]>('ct_assessments', SEED_CT_ASSESSMENTS);
  }

  saveCTAssessments(assessments: CTAssessment[]): void {
    this.setItem('ct_assessments', assessments);
  }

  saveCTAssessment(assessment: CTAssessment, actor?: User): void {
    const list = this.getCTAssessments();
    const idx = list.findIndex(a => a.id === assessment.id);
    if (idx !== -1) {
      list[idx] = { ...assessment, updatedAt: new Date().toISOString() };
    } else {
      list.push({ ...assessment, updatedAt: new Date().toISOString() });
    }
    this.saveCTAssessments(list);
    if (actor) {
      this.addAuditLog(actor, 'CT_ASSESSMENT_CONFIGURED', 'EVALUATION', `Configured assessment ${assessment.ctNumber} (${assessment.name}) for ${assessment.classId}-${assessment.section} ${assessment.subjectId}.`);
    }
  }

  deleteCTAssessment(id: string, actor?: User): void {
    const list = this.getCTAssessments().filter(a => a.id !== id);
    this.saveCTAssessments(list);
    if (actor) {
      this.addAuditLog(actor, 'CT_ASSESSMENT_DELETED', 'EVALUATION', `Deleted CT Assessment #${id}.`);
    }
  }

  // STUDENT ATTENDANCE STATS HELPER
  getStudentAttendanceStats(student: Student, _month?: string): { totalDays: number; presentDays: number; absentDays: number; percentage: number } {
    const totalDays = 25; // Standard total class days in the academic month
    const basePct = typeof student.attendancePercentage === 'number' && student.attendancePercentage > 0
      ? student.attendancePercentage
      : (90 + (Number(student.roll) % 8));
    const presentDays = Math.min(totalDays, Math.max(0, Math.round((basePct / 100) * totalDays)));
    const absentDays = totalDays - presentDays;
    const percentage = Math.round((presentDays / totalDays) * 100);
    return { totalDays, presentDays, absentDays, percentage };
  }

  // WEEKLY C.T. MARKS
  getWeeklyCTMarks(): WeeklyCTMark[] {
    return this.getItem<WeeklyCTMark[]>('weekly_ct_marks', SEED_CT_MARKS);
  }

  saveWeeklyCTMarks(marks: WeeklyCTMark[]): void {
    this.setItem('weekly_ct_marks', marks);
  }

  saveCTMark(mark: WeeklyCTMark, actor?: User, changeReason?: string): WeeklyCTMark {
    const marks = this.getWeeklyCTMarks();
    
    // Deterministic ID preventing duplicates
    const ctIdentifier = mark.ctNumber || `CT-${mark.week || 1}`;
    const cleanSubject = (mark.subjectId || 'general').replace(/\s+/g, '_').toLowerCase();
    const deterministicId = mark.id || `ct_${mark.studentId}_${mark.academicYear || '2026'}_${mark.classId}_${mark.section}_${cleanSubject}_${ctIdentifier}`;

    const obtainedMarks = mark.obtainedMarks !== undefined ? mark.obtainedMarks : mark.mark;
    const totalMarks = mark.totalMarks !== undefined ? mark.totalMarks : mark.maxMark;
    const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;

    const existingIdx = marks.findIndex(
      m => (m.id === deterministicId) || 
           (m.studentId === mark.studentId && 
            m.classId === mark.classId && 
            m.section === mark.section && 
            (m.subjectId === mark.subjectId || (!m.subjectId && !mark.subjectId)) &&
            (m.ctNumber ? m.ctNumber === mark.ctNumber : m.week === mark.week))
    );

    let finalMark: WeeklyCTMark;

    if (existingIdx !== -1) {
      const existing = marks[existingIdx];
      const history = existing.editHistory ? [...existing.editHistory] : [];
      
      // Track edit history if mark changed
      if (existing.mark !== obtainedMarks) {
        history.push({
          oldMark: existing.mark,
          newMark: obtainedMarks,
          changedBy: actor?.name || mark.evaluatedByTeacherName || 'Teacher',
          changedAt: new Date().toISOString(),
          reason: changeReason || 'Mark update'
        });

        if (actor) {
          this.addAuditLog(
            actor, 
            'CT_MARK_UPDATED', 
            'EVALUATION', 
            `Changed mark for ${mark.studentName || mark.studentId} (${mark.classId}-${mark.section}, ${mark.ctNumber || 'CT'}) from ${existing.mark} to ${obtainedMarks}/${totalMarks}.`
          );
        }
      }

      finalMark = {
        ...existing,
        ...mark,
        id: existing.id || deterministicId,
        mark: obtainedMarks,
        maxMark: totalMarks,
        obtainedMarks,
        totalMarks,
        percentage,
        editHistory: history,
        updatedAt: new Date().toISOString(),
        synced: true
      };
      marks[existingIdx] = finalMark;
    } else {
      finalMark = {
        ...mark,
        id: deterministicId,
        mark: obtainedMarks,
        maxMark: totalMarks,
        obtainedMarks,
        totalMarks,
        percentage,
        editHistory: [],
        updatedAt: new Date().toISOString(),
        synced: true
      };
      marks.push(finalMark);
      
      if (actor) {
        this.addAuditLog(
          actor, 
          'CT_MARK_SAVED', 
          'EVALUATION', 
          `Entered mark for ${mark.studentName || mark.studentId} (${mark.classId}-${mark.section}, ${mark.ctNumber || 'CT'}): ${obtainedMarks}/${totalMarks}.`
        );
      }
    }

    this.saveWeeklyCTMarks(marks);
    return finalMark;
  }

  deleteCTMark(markId: string, actor?: User): void {
    const marks = this.getWeeklyCTMarks();
    const target = marks.find(m => m.id === markId);
    const remaining = marks.filter(m => m.id !== markId);
    this.saveWeeklyCTMarks(remaining);
    if (actor && target) {
      this.addAuditLog(actor, 'CT_MARK_DELETED', 'EVALUATION', `Deleted CT mark for ${target.studentName || target.studentId} (${target.subjectId || 'Subject'}).`);
    }
  }

  // WEEKLY STUDENT EVALUATION REPORTS
  getWeeklyStudentReports(): WeeklyStudentReport[] {
    return this.getItem<WeeklyStudentReport[]>('weekly_student_reports', SEED_STUDENT_REPORTS);
  }

  saveWeeklyStudentReports(reports: WeeklyStudentReport[]): void {
    this.setItem('weekly_student_reports', reports);
  }

  saveStudentReport(report: WeeklyStudentReport, actor?: User): void {
    const reports = this.getWeeklyStudentReports();
    const idx = reports.findIndex(
      r => r.studentId === report.studentId && r.month === report.month && r.week === report.week
    );
    if (idx !== -1) {
      reports[idx] = { ...report, updatedAt: new Date().toISOString() };
    } else {
      reports.push({ ...report, updatedAt: new Date().toISOString() });
    }
    this.saveWeeklyStudentReports(reports);
    if (actor) {
      this.addAuditLog(actor, 'STUDENT_REPORT_SAVED', 'EVALUATION', `Saved weekly evaluation for student ${report.studentName || report.studentId} (Week ${report.weekNumber || report.week}, ${report.month}).`);
    }
  }

  // EVALUATION SETTINGS & WEIGHTS
  getEvaluationSettings(): EvaluationSettings {
    return this.getItem<EvaluationSettings>('evaluation_settings', DEFAULT_EVALUATION_SETTINGS);
  }

  saveEvaluationSettings(settings: EvaluationSettings, actor?: User): void {
    this.setItem('evaluation_settings', settings);
    if (actor) {
      this.addAuditLog(actor, 'EVALUATION_SETTINGS_UPDATED', 'SETTINGS', `Updated C.T. max mark to ${settings.defaultMaxCtMark} and scoring weights.`);
    }
  }

  // STUDENT OF THE MONTH RECORDS & WORKFLOW
  getStudentOfTheMonthRecords(): StudentOfTheMonthRecord[] {
    return this.getItem<StudentOfTheMonthRecord[]>('student_of_the_month', SEED_STUDENT_OF_THE_MONTH);
  }

  saveStudentOfTheMonthRecords(records: StudentOfTheMonthRecord[]): void {
    this.setItem('student_of_the_month', records);
  }

  // Class Teacher recommends a student for Student of the Month
  recommendStudentOfTheMonth(record: StudentOfTheMonthRecord, teacher: User): StudentOfTheMonthRecord {
    const records = this.getStudentOfTheMonthRecords();
    const existingIdx = records.findIndex(r => r.academicYear === record.academicYear && r.month === record.month && r.classId === record.classId && r.section === record.section);
    
    const updatedRecord: StudentOfTheMonthRecord = {
      ...record,
      status: 'RECOMMENDED',
      classTeacherId: teacher.id,
      classTeacherName: teacher.name,
      nominatedByTeacherName: teacher.name,
      adminDecision: 'PENDING',
      isPublished: false
    };

    if (existingIdx !== -1) {
      records[existingIdx] = updatedRecord;
    } else {
      records.unshift(updatedRecord);
    }

    this.saveStudentOfTheMonthRecords(records);
    this.addAuditLog(
      teacher, 
      'SOM_RECOMMENDED', 
      'EVALUATION', 
      `Recommended ${record.studentName} (Roll ${record.roll || record.studentRoll}) as Student of the Month for ${record.classId}-${record.section} (${record.month}).`
    );
    return updatedRecord;
  }

  // Admin reviews recommendation
  reviewStudentOfTheMonth(recordId: string, decision: 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED', adminComment: string, admin: User): StudentOfTheMonthRecord | null {
    const records = this.getStudentOfTheMonthRecords();
    const idx = records.findIndex(r => r.id === recordId);
    if (idx === -1) return null;

    const record = records[idx];
    record.adminDecision = decision;
    record.adminComment = adminComment;
    record.reviewedByAdminId = admin.id;
    record.reviewedByAdminName = admin.name;
    record.reviewedAt = new Date().toISOString();
    record.status = decision === 'APPROVED' ? 'APPROVED' : decision === 'REVISION_REQUESTED' ? 'REVISION_REQUESTED' : 'DRAFT';

    this.saveStudentOfTheMonthRecords(records);
    this.addAuditLog(admin, 'SOM_REVIEWED', 'EVALUATION', `Admin ${decision} SOM nomination for ${record.studentName} (${record.classId}-${record.section}). Notes: ${adminComment}`);
    return record;
  }

  // Admin officially publishes Student of the Month & broadcasts school notice
  publishStudentOfTheMonth(record: StudentOfTheMonthRecord, actor?: User): void {
    const records = this.getStudentOfTheMonthRecords();
    const existingIdx = records.findIndex(r => r.academicYear === record.academicYear && r.month === record.month && r.classId === record.classId && r.section === record.section);
    
    const publishedRecord: StudentOfTheMonthRecord = {
      ...record,
      status: 'PUBLISHED',
      isPublished: true,
      publishedAt: new Date().toISOString(),
      publishedBy: actor?.name || 'School Principal',
      announcedAt: new Date().toISOString()
    };

    if (existingIdx !== -1) {
      records[existingIdx] = publishedRecord;
    } else {
      records.unshift(publishedRecord);
    }
    this.saveStudentOfTheMonthRecords(records);

    // Broadcast School-wide Announcement Notice automatically
    const notices = this.getNotices();
    const somNotice: Notice = {
      id: `notice_som_${publishedRecord.classId}_${publishedRecord.section}_${Date.now()}`,
      title: `🏆 Announcement: Student of the Month (${publishedRecord.month}) - ${publishedRecord.classId} (${publishedRecord.section})`,
      content: `Congratulations to ${publishedRecord.studentName} (Roll: ${publishedRecord.roll || publishedRecord.studentRoll}) for being officially awarded the prestigious Student of the Month for ${publishedRecord.month}! With an overall score of ${publishedRecord.finalScore || publishedRecord.totalScore}%, continuous academic diligence, and exemplary discipline, ${publishedRecord.studentName} exemplifies the core values of our academy.`,
      targetAudience: 'ALL',
      priority: 'ACHIEVEMENT',
      authorName: actor?.name || 'Office of the Principal',
      createdAt: new Date().toISOString(),
      readByUserIds: []
    };
    notices.unshift(somNotice);
    this.saveNotices(notices);

    if (actor) {
      this.addAuditLog(actor, 'STUDENT_OF_THE_MONTH_PUBLISHED', 'EVALUATION', `Officially published Student of the Month (${record.month}, ${record.classId}-${record.section}): ${record.studentName} with score ${record.finalScore || record.totalScore}%.`);
    }
  }

  // Admin Reports (Teacher submissions to Admin)
  getAdminReports(): AdminReport[] {
    return this.getItem<AdminReport[]>('reports', SEED_REPORTS);
  }

  saveAdminReports(reports: AdminReport[]): void {
    this.setItem('reports', reports);
  }

  submitAdminReport(report: AdminReport): void {
    const reports = this.getAdminReports();
    reports.unshift(report);
    this.saveAdminReports(reports);
  }

  updateAdminReport(report: AdminReport, actor: User): void {
    const reports = this.getAdminReports();
    const idx = reports.findIndex(r => r.id === report.id);
    if (idx !== -1) {
      reports[idx] = report;
      this.saveAdminReports(reports);
      this.addAuditLog(actor, 'REPORT_STATUS_UPDATED', 'ADMIN_REPORT', `Updated review status of report #${report.id.slice(-4)} to ${report.status}.`);
    }
  }

  deleteAdminReport(reportId: string, actor?: User): void {
    const reports = this.getAdminReports();
    const target = reports.find(r => r.id === reportId);
    this.saveAdminReports(reports.filter(r => r.id !== reportId));
    if (actor && target) {
      this.addAuditLog(actor, 'REPORT_DELETED', 'ADMIN_REPORT', `Deleted report #${reportId.slice(-4)} (${target.title}).`);
    }
  }

  // Leaves
  getLeaveRequests(): LeaveRequest[] {
    return this.getItem<LeaveRequest[]>('leaves', SEED_LEAVES);
  }

  saveLeaveRequests(leaves: LeaveRequest[]): void {
    this.setItem('leaves', leaves);
  }

  submitLeaveRequest(leave: LeaveRequest): void {
    const leaves = this.getLeaveRequests();
    leaves.unshift(leave);
    this.saveLeaveRequests(leaves);
  }

  updateLeaveRequest(leave: LeaveRequest, actor: User): void {
    const leaves = this.getLeaveRequests();
    const idx = leaves.findIndex(l => l.id === leave.id);
    if (idx !== -1) {
      leaves[idx] = leave;
      this.saveLeaveRequests(leaves);
      this.addAuditLog(actor, 'LEAVE_DECIDED', 'LEAVE_REQUEST', `${leave.status} leave for ${leave.userName} (${leave.daysCount} days).`);
    }
  }

  deleteLeaveRequest(leaveId: string, actor?: User): void {
    const leaves = this.getLeaveRequests();
    const target = leaves.find(l => l.id === leaveId);
    const remaining = leaves.filter(l => l.id !== leaveId);
    this.saveLeaveRequests(remaining);
    if (actor && target) {
      this.addAuditLog(actor, 'LEAVE_DELETED', 'LEAVE_REQUEST', `Deleted leave request for ${target.userName}.`);
    }
  }

  // Notices
  getNotices(): Notice[] {
    const list = this.getItem<Notice[]>('notices', SEED_NOTICES);
    return list.map(n => ({
      ...n,
      readByUserIds: Array.isArray(n.readByUserIds) ? n.readByUserIds : []
    }));
  }

  saveNotices(notices: Notice[]): void {
    this.setItem('notices', notices);
  }

  createNotice(notice: Notice, actor: User): void {
    const notices = this.getNotices();
    notices.unshift(notice);
    this.saveNotices(notices);
    this.addAuditLog(actor, 'NOTICE_PUBLISHED', 'NOTICE', `Published notice: "${notice.title}".`);
  }

  updateNotice(notice: Notice, actor?: User): void {
    const notices = this.getNotices();
    const idx = notices.findIndex(n => n.id === notice.id);
    if (idx !== -1) {
      notices[idx] = {
        ...notices[idx],
        ...notice,
        readByUserIds: Array.isArray(notice.readByUserIds) ? notice.readByUserIds : (notices[idx].readByUserIds || [])
      };
      this.saveNotices(notices);
      if (actor) {
        this.addAuditLog(actor, 'NOTICE_PUBLISHED', 'NOTICE', `Updated notice: "${notice.title}".`);
      }
    }
  }

  deleteNotice(noticeId: string, actor?: User): void {
    const notices = this.getNotices();
    const target = notices.find(n => n.id === noticeId);
    const remaining = notices.filter(n => n.id !== noticeId);
    this.saveNotices(remaining);
    if (actor && target) {
      this.addAuditLog(actor, 'NOTICE_DELETED', 'NOTICE', `Deleted notice: "${target.title}".`);
    }
  }

  markNoticeRead(noticeId: string, userId: string): void {
    const notices = this.getNotices();
    const notice = notices.find(n => n.id === noticeId);
    if (notice) {
      if (!Array.isArray(notice.readByUserIds)) {
        notice.readByUserIds = [];
      }
      if (!notice.readByUserIds.includes(userId)) {
        notice.readByUserIds.push(userId);
        this.saveNotices(notices);
      }
    }
  }

  // Audit Logs (Guaranteed: NO private note content is ever logged)
  getAuditLogs(): AuditLog[] {
    return this.getItem<AuditLog[]>('audit_logs', SEED_AUDIT_LOGS);
  }

  addAuditLog(actor: User, action: string, targetEntity: string, details: string): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      action,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      targetEntity,
      details
    };
    logs.unshift(newLog);
    if (logs.length > 300) logs.pop(); // Keep top 300
    this.setItem('audit_logs', logs);
  }

  // OFFLINE ACTION QUEUE & SYNC
  getOfflineActions(): OfflineAction[] {
    return this.getItem<OfflineAction[]>('offline_actions', []);
  }

  saveOfflineActions(actions: OfflineAction[]): void {
    this.setItem('offline_actions', actions);
  }

  queueOfflineAction(action: Omit<OfflineAction, 'actionId' | 'createdAt' | 'syncStatus' | 'retryCount'>): OfflineAction {
    const actions = this.getOfflineActions();
    const newAction: OfflineAction = {
      ...action,
      actionId: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      syncStatus: 'WAITING_TO_SYNC',
      retryCount: 0
    };
    actions.push(newAction);
    this.saveOfflineActions(actions);
    return newAction;
  }

  // Drain & sync the offline queue
  processSyncQueue(): { processed: number; errors: number } {
    const actions = this.getOfflineActions();
    let processed = 0;
    let errors = 0;

    const remainingActions: OfflineAction[] = [];

    for (const act of actions) {
      try {
        // Execute idempotent synchronization based on action type
        if (act.type === 'CLASS_START') {
          const session = act.payload as ClassSession;
          this.createClassSession({ ...session, synced: true });
        } else if (act.type === 'CLASS_END') {
          const session = act.payload as ClassSession;
          this.updateClassSession({ ...session, synced: true });
        } else if (act.type === 'ATTENDANCE_RECORD') {
          const rec = act.payload as AttendanceRecord;
          this.recordAttendance({ ...rec, synced: true });
        } else if (act.type === 'SUBMIT_REPORT') {
          const rep = act.payload as AdminReport;
          this.submitAdminReport({ ...rep, synced: true });
        } else if (act.type === 'SUBMIT_LEAVE') {
          const lve = act.payload as LeaveRequest;
          this.submitLeaveRequest(lve);
        } else if (act.type === 'SAVE_PRIVATE_NOTE') {
          const note = act.payload as PrivateTeacherNote;
          this.savePrivateTeacherNote(note, note.ownerId);
        } else if (act.type === 'DELETE_PRIVATE_NOTE') {
          const { noteId, ownerId, permanent } = act.payload;
          this.deletePrivateTeacherNote(noteId, ownerId, !!permanent);
        } else if (act.type === 'RESTORE_PRIVATE_NOTE') {
          const { noteId, ownerId } = act.payload;
          this.restorePrivateTeacherNote(noteId, ownerId);
        } else if (act.type === 'EXTEND_CLASS') {
          const { sessionId, additionalMinutes, teacherName } = act.payload;
          this.extendClassSession(sessionId, additionalMinutes, teacherName);
        } else if (act.type === 'SAVE_CT_MARK') {
          const mark = act.payload as WeeklyCTMark;
          this.saveCTMark({ ...mark, synced: true });
        } else if (act.type === 'SAVE_STUDENT_REPORT') {
          const report = act.payload as WeeklyStudentReport;
          this.saveStudentReport({ ...report, synced: true });
        }

        processed++;
      } catch (err: any) {
        errors++;
        act.retryCount += 1;
        act.syncStatus = 'ERROR';
        act.errorMessage = err?.message || 'Sync failed';
        remainingActions.push(act);
      }
    }

    this.saveOfflineActions(remainingActions);
    return { processed, errors };
  }
}

export const storageService = new StorageService();

/**
 * Clean CSV export utility
 */
export function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const sanitize = (val: string | number) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = [
    headers.map(sanitize).join(','),
    ...rows.map(row => row.map(sanitize).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
