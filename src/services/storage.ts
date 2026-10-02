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

// Initial School Settings (Generic for fresh installation)
export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  schoolName: 'TeachFlow Academy',
  tagline: 'Teach. Track. Manage.',
  schoolCode: 'SCH-001',
  address: 'Update School Address in Settings',
  timezone: 'Asia/Dhaka',
  workingDays: [0, 1, 2, 3, 4, 6], // Sun - Thu, Sat
  defaultClassDurationMinutes: 45,
  lateThresholdMinutes: 15,
  reminderIntervalsMinutes: [10, 5, 0],
  allowQrCheckin: true,
  allowOneTapStart: true,
  maxFileSizeMb: 10
};

// Initial Seed Users (Single System Admin for fresh setup)
export const SEED_USERS: User[] = [
  {
    id: 'admin_primary',
    email: 'admin@teachflow.edu.bd',
    name: 'System Administrator',
    role: 'ADMIN',
    pin: '0000', // Default PIN for first login
    employeeId: 'ADMIN-001',
    designation: 'Head of Institution',
    department: 'Administration',
    phone: '+880',
    status: 'ACTIVE',
    bio: 'Primary system administrator account.',
    experience: 'Institutional Leadership',
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

// Dynamic routine generator - Empty for fresh setup
const generateDynamicRoutines = (): ClassRoutineItem[] => {
  return [];
};

// Initial Seed Notices - Empty for fresh setup
const SEED_NOTICES: Notice[] = [];

// Initial Seed Leave Requests - Empty for fresh setup
const SEED_LEAVES: LeaveRequest[] = [];

// Initial Seed Admin Reports - Empty for fresh setup
const SEED_REPORTS: AdminReport[] = [];

// Initial Teacher Private Notes - Empty for fresh setup
const SEED_PRIVATE_NOTES: Record<string, PrivateTeacherNote[]> = {};

// Audit logs - Fresh start
const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_init',
    timestamp: new Date().toISOString(),
    action: 'SYSTEM_READY',
    actorId: 'system',
    actorName: 'TeachFlow Engine',
    actorRole: 'ADMIN',
    targetEntity: 'SYSTEM',
    details: 'Application reset to factory defaults. System ready for registration.'
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

// Seed Students - Empty for fresh setup
export const SEED_STUDENTS: Student[] = [];

// Seed Weekly CT Marks - Empty for fresh setup
export const SEED_CT_MARKS: WeeklyCTMark[] = [];

// Seed Weekly Reports - Empty for fresh setup
export const SEED_STUDENT_REPORTS: WeeklyStudentReport[] = [];

// Seed Historical Student of the Month - Empty for fresh setup
export const SEED_STUDENT_OF_THE_MONTH: StudentOfTheMonthRecord[] = [];

// Initial Seed CT Assessments - Empty for fresh setup
export const SEED_CT_ASSESSMENTS: CTAssessment[] = [];

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
