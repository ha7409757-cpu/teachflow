/**
 * TeachFlow - Comprehensive TypeScript Types
 * "Teach. Track. Manage."
 */

export type UserRole = 'ADMIN' | 'TEACHER' | 'EMPLOYEE';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  pin?: string; // 4-digit security PIN for personal account access
  phone?: string;
  avatarUrl?: string;
  employeeId: string;
  designation: string;
  department?: string;
  joiningDate?: string;
  status: 'ACTIVE' | 'INACTIVE';
  assignedClasses?: string[];
  assignedSubjects?: string[];
}

export interface SchoolSettings {
  schoolName: string;
  tagline: string;
  schoolCode: string;
  address: string;
  timezone: string; // e.g., 'Asia/Dhaka'
  workingDays: number[]; // 0 = Sun, 1 = Mon, ..., 4 = Thu in BD standard
  defaultClassDurationMinutes: number;
  lateThresholdMinutes: number;
  reminderIntervalsMinutes: number[]; // [30, 10, 0]
  allowQrCheckin: boolean;
  allowOneTapStart: boolean;
  maxFileSizeMb: number;
}

export type ClassSessionStatus = 
  | 'SCHEDULED' 
  | 'STARTING_SOON' 
  | 'RUNNING' 
  | 'COMPLETED' 
  | 'ENDED_EARLY' 
  | 'MISSED' 
  | 'CANCELLED' 
  | 'SUBSTITUTE';

export interface ClassRoutineItem {
  id: string;
  dayOfWeek: number; // 0: Sunday, 1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday
  startTime: string; // "10:00"
  endTime: string; // "10:45"
  classId: string; // e.g. "Class 8"
  section?: string; // e.g. "A" / "Padma"
  subjectId: string; // e.g. "English"
  roomId: string; // e.g. "Room 203"
  teacherId: string; // userId of assigned teacher
  teacherName?: string;
  substituteTeacherId?: string;
  substituteTeacherName?: string;
  notes?: string;
}

export interface ClassSession {
  id: string;
  routineId: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  section?: string;
  subjectId: string;
  roomId: string;
  date: string; // "YYYY-MM-DD"
  scheduledStart: string; // "10:00"
  scheduledEnd: string; // "10:45"
  originalScheduledEnd?: string;
  extendedMinutes?: number;
  extendedAt?: string;
  extendedBy?: string;
  actualStart?: string; // "10:01:24"
  actualEnd?: string; // "10:46:12"
  durationMinutes?: number;
  status: ClassSessionStatus;
  startedVia: 'ONE_TAP' | 'QR_CODE' | 'MANUAL';
  synced: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  date: string; // "YYYY-MM-DD"
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'LEAVE' | 'EARLY_LEAVE';
  checkInTime?: string;
  checkOutTime?: string;
  firstClassSessionId?: string;
  workingHours?: number;
  notes?: string;
  synced: boolean;
}

export interface StudentDailyAttendance {
  id: string;
  studentId: string;
  studentName: string;
  studentRoll: number | string;
  classId: string;
  section: string;
  date: string; // "YYYY-MM-DD"
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  remarks?: string;
  markedByTeacherId?: string;
  markedByTeacherName?: string;
  updatedAt: string;
}

export interface PrivateTeacherNote {
  id: string;
  ownerId: string; // strictly owned by teacher; Admin can NEVER view or access this
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  isDeleted?: boolean; // soft-delete for trash recovery
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Student Management & Evaluation Types
export interface Student {
  id: string;
  studentId: string; // e.g. "STD-2026-001"
  name: string;
  classId: string; // e.g. "Class 7"
  section: string; // e.g. "A"
  roll: number | string;
  classTeacherId: string; // Teacher responsible for evaluation
  academicYear: string; // "2026"
  status: 'ACTIVE' | 'ARCHIVED';
  photoUrl?: string;
  guardianName?: string;
  guardianPhone?: string;
  contactNumber?: string;
  gender?: 'MALE' | 'FEMALE';
  attendancePercentage?: number;
  isArchived?: boolean;
  teacherRemarks?: string;
  createdAt: string;
}

export interface CTEditHistoryItem {
  oldMark: number;
  newMark: number;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

export interface CTAssessment {
  id: string;
  ctNumber: string; // e.g. "CT-1", "CT-2", ... "CT-10", "CT-11", "Model Test"
  name: string;
  title?: string; // e.g. "Fractions & Decimals"
  classId: string;
  section: string;
  subjectId: string;
  maxMark: number;
  date: string;
  duration?: string; // e.g. "30 Minutes"
  status?: 'DRAFT' | 'PUBLISHED';
  teacherId?: string;
  teacherName?: string;
  academicYear: string;
  month: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyCTMark {
  id: string;
  studentId: string;
  teacherId: string;
  classId: string;
  section: string;
  academicYear: string;
  month: string; // e.g. "September 2026" or "2026-09"
  week: number; // 1, 2, 3, 4, 5
  mark: number;
  maxMark: number;
  // Alternative aliases & rich assessment fields
  ctNumber?: string;
  ctAssessmentId?: string;
  studentName?: string;
  studentRoll?: string | number;
  subjectId?: string;
  weekNumber?: number;
  obtainedMarks?: number;
  totalMarks?: number;
  percentage?: number;
  isAbsent?: boolean;
  status?: 'PRESENT' | 'ABSENT';
  attendancePresent?: number;
  attendanceTotal?: number;
  attendancePercentage?: number;
  teacherComment?: string;
  assessmentDate?: string;
  editHistory?: CTEditHistoryItem[];
  evaluatedByTeacherId?: string;
  evaluatedByTeacherName?: string;
  evaluatedDate?: string;
  updatedAt: string;
  synced: boolean;
}

export type EvaluationRating = 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT';

export interface WeeklyStudentReport {
  id: string;
  studentId: string;
  teacherId: string;
  classId: string;
  section: string;
  academicYear: string;
  month: string; // e.g. "September 2026"
  week: number; // 1, 2, 3, 4, 5
  academicPerformance: EvaluationRating;
  behavior: EvaluationRating;
  attendanceRating: EvaluationRating;
  classParticipation: EvaluationRating;
  homework: EvaluationRating;
  discipline: EvaluationRating;
  generalComment?: string;
  // Alternative aliases for view flexibility
  studentName?: string;
  studentRoll?: string | number;
  weekNumber?: number;
  disciplineScore?: number;
  homeworkCompletionScore?: number;
  punctualityScore?: number;
  classParticipationScore?: number;
  teacherRemarks?: string;
  evaluatedByTeacherId?: string;
  evaluatedByTeacherName?: string;
  evaluatedDate?: string;
  updatedAt: string;
  synced: boolean;
}

export interface EvaluationWeights {
  ctPerformance: number; // default 40 (%)
  attendance: number; // default 20 (%)
  behavior: number; // default 15 (%)
  classParticipation: number; // default 10 (%)
  homework: number; // default 10 (%)
  teacherEvaluation: number; // default 5 (%)
}

export interface EvaluationSettings {
  defaultMaxCtMark: number; // default 20
  weights: EvaluationWeights;
  ctWeight?: number;
  attendanceWeight?: number;
  disciplineWeight?: number;
  homeworkWeight?: number;
}

export type SOMStatus = 
  | 'DRAFT' 
  | 'IN_PROGRESS' 
  | 'RECOMMENDED' 
  | 'UNDER_ADMIN_REVIEW' 
  | 'APPROVED' 
  | 'PUBLISHED' 
  | 'REVISION_REQUESTED';

export interface StudentOfTheMonthRecord {
  id: string;
  academicYear: string;
  month: string; // e.g. "September 2026"
  studentId: string;
  studentName: string;
  studentRoll?: string | number;
  classId: string;
  section: string;
  roll?: number | string;
  classTeacherId?: string;
  classTeacherName?: string;
  ctScore?: number; // percentage
  attendanceScore?: number; // percentage
  behaviorScore?: number; // percentage
  participationScore?: number; // percentage
  homeworkScore?: number; // percentage
  teacherEvalScore?: number; // percentage
  finalScore?: number; // weighted total percentage
  totalScore?: number;
  ctAverage?: number;
  attendancePercentage?: number;
  disciplineScore?: number;
  // Multi-step nomination & approval workflow
  status?: SOMStatus;
  calculatedScore?: number;
  classTeacherRecommendation?: string;
  recommendationComment?: string;
  nominatedByTeacherName?: string;
  adminDecision?: 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED' | 'PENDING';
  adminComment?: string;
  reviewedByAdminId?: string;
  reviewedByAdminName?: string;
  reviewedAt?: string;
  teacherRemarks?: string;
  teacherComment?: string;
  principalRemarks?: string;
  announcedAt?: string;
  publishedAt?: string;
  publishedBy?: string;
  isPublished: boolean;
}

export type ReportType = 
  | 'STUDENT_OBSERVATION' 
  | 'INCIDENT_REPORT' 
  | 'LESSON_PLAN' 
  | 'ACADEMIC_PROGRESS' 
  | 'PARENT_COMMUNICATION' 
  | 'HOMEWORK_ISSUE' 
  | 'GENERAL_REPORT' 
  | 'SUGGESTION';

export type ReportReviewStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'REVIEWED';

export interface AdminReport {
  id: string;
  teacherId: string;
  teacherName: string;
  reportType: ReportType;
  studentName?: string;
  className?: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  attachmentName?: string;
  attachmentSize?: string;
  attachmentType?: string;
  status: ReportReviewStatus;
  adminFeedback?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  synced: boolean;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  leaveType: 'CASUAL' | 'SICK' | 'EMERGENCY' | 'MATERNITY' | 'OTHER';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  attachmentName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  submittedAt: string;
  decidedAt?: string;
  decidedBy?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  targetAudience: 'ALL' | 'TEACHERS' | 'EMPLOYEES' | 'SPECIFIC';
  targetUserId?: string;
  priority: 'GENERAL' | 'IMPORTANT' | 'EMERGENCY' | 'ROUTINE_CHANGE' | 'MEETING' | 'ACHIEVEMENT';
  authorName: string;
  createdAt: string;
  readByUserIds: string[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  targetEntity: string;
  details: string; // Strictly NO private note content
}

export interface OfflineAction {
  actionId: string;
  type: 
    | 'CLASS_START' 
    | 'CLASS_END' 
    | 'ATTENDANCE_RECORD' 
    | 'EMPLOYEE_CHECKIN' 
    | 'EMPLOYEE_CHECKOUT' 
    | 'SAVE_PRIVATE_NOTE' 
    | 'DELETE_PRIVATE_NOTE' 
    | 'RESTORE_PRIVATE_NOTE'
    | 'EXTEND_CLASS'
    | 'SAVE_CT_MARK'
    | 'SAVE_STUDENT_REPORT'
    | 'SUBMIT_REPORT' 
    | 'SUBMIT_LEAVE';
  entityId: string;
  payload: Record<string, any>;
  createdAt: string;
  syncStatus: 'WAITING_TO_SYNC' | 'SYNCING' | 'SYNCED' | 'ERROR';
  retryCount: number;
  errorMessage?: string;
}

export type SyncState = 'SYNCED' | 'WAITING_TO_SYNC' | 'SYNCING' | 'ERROR';

export const ALL_CLASSES = [
  'Play',
  'Nursery',
  'KG',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10'
] as const;

export type SchoolClass = typeof ALL_CLASSES[number];
