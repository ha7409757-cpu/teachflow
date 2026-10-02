/**
 * TeachFlow Main Application State Context
 * Orchestrates offline-first sync engine, routines, active class sessions,
 * one-tap start, QR classroom verification, attendance, leaves, and audit logs.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import {
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
  StudentDailyAttendance
} from '../types';
import { storageService, getCurrentTimeString, getTodayDateString, DEFAULT_EVALUATION_SETTINGS } from '../services/storage';
import { audioService } from '../services/audio';
import { useAuth } from './AuthContext';
import { Language, translations } from '../services/language';

interface AppContextType {
  // Localization
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['bn']) => string;

  // Mobile App View Configuration
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  isQrScannerOpen: boolean;
  setIsQrScannerOpen: (val: boolean) => void;
  toggleOnlineSimulation: () => void;
  syncQueue: any[];
  updateSchoolSettings: (newSettings: SchoolSettings) => void;
  updateLeaveStatus: (leaveId: string, status: 'APPROVED' | 'REJECTED', adminNotes?: string) => void;

  // Connectivity & Sync
  isOnline: boolean;
  toggleOnlineStatus: () => void;
  syncState: SyncState;
  pendingSyncCount: number;
  lastSyncTime: string;
  triggerManualSync: () => Promise<void>;

  // Data Collections
  settings: SchoolSettings;
  updateSettings: (newSettings: SchoolSettings) => void;
  routines: ClassRoutineItem[];
  classSessions: ClassSession[];
  activeClassSession: ClassSession | null;
  attendanceRecords: AttendanceRecord[];
  notices: Notice[];
  adminReports: AdminReport[];
  leaveRequests: LeaveRequest[];
  auditLogs: AuditLog[];

  // Teacher-Specific Core UX
  getNextScheduledClassForTeacher: (teacherId: string) => {
    routine: ClassRoutineItem | null;
    isCurrentOrUpcoming: boolean;
    minutesUntil: number;
    status: 'STARTING_SOON' | 'SCHEDULED' | 'RUNNING' | 'NONE';
  };
  getTodayRoutinesForTeacher: (teacherId: string) => ClassRoutineItem[];
  startClassOneTap: (routineId: string) => Promise<{ success: boolean; session?: ClassSession; error?: string }>;
  startClassByQr: (roomCodeOrQr: string) => Promise<{ success: boolean; session?: ClassSession; error?: string }>;
  endClassSession: (sessionId: string) => Promise<{ success: boolean; error?: string }>;
  extendClassSession: (sessionId: string, additionalMinutes: number) => Promise<{ success: boolean; session?: ClassSession }>;
  
  // Automatic Class-End Alarm
  isClassEndAlarmActive: boolean;
  classEndAlarmSession: ClassSession | null;
  dismissClassEndAlarm: () => void;
  triggerClassEndAlarmTest: () => void;

  // Teacher Private Notes (Strict privacy)
  getTeacherPrivateNotes: (includeDeleted?: boolean) => PrivateTeacherNote[];
  saveTeacherPrivateNote: (note: Omit<PrivateTeacherNote, 'ownerId' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  deleteTeacherPrivateNote: (noteId: string, permanent?: boolean) => void;
  restoreTeacherPrivateNote: (noteId: string) => void;
  emptyTeacherNotesTrash: () => void;

  // Student Evaluation & Student of the Month
  students: Student[];
  ctAssessments: CTAssessment[];
  weeklyCTMarks: WeeklyCTMark[];
  weeklyStudentReports: WeeklyStudentReport[];
  evaluationSettings: EvaluationSettings;
  studentOfTheMonthRecords: StudentOfTheMonthRecord[];
  addStudent: (student: Omit<Student, 'id' | 'createdAt'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;
  archiveStudent: (studentId: string) => void;
  saveCTAssessment: (assessment: CTAssessment) => void;
  deleteCTAssessment: (id: string) => void;
  saveCTMark: (mark: Omit<WeeklyCTMark, 'id' | 'updatedAt' | 'synced'> & { id?: string }, changeReason?: string) => void;
  deleteCTMark: (markId: string) => void;
  saveStudentReport: (report: Omit<WeeklyStudentReport, 'id' | 'updatedAt' | 'synced'> & { id?: string }) => void;
  updateEvaluationSettings: (settings: EvaluationSettings) => void;
  recommendStudentOfTheMonth: (record: StudentOfTheMonthRecord) => void;
  reviewStudentOfTheMonth: (recordId: string, decision: 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED', adminComment: string) => void;
  publishStudentOfTheMonth: (record: StudentOfTheMonthRecord) => void;
  getStudentAttendanceStats: (student: Student, month?: string) => { totalDays: number; presentDays: number; absentDays: number; percentage: number };

  // Teacher & Employee Reports
  submitReportToAdmin: (report: Omit<AdminReport, 'id' | 'teacherId' | 'teacherName' | 'status' | 'submittedAt' | 'synced'>) => Promise<{ success: boolean }>;
  updateReportReview: (reportId: string, status: AdminReport['status'], feedback?: string) => void;
  updateReportStatus: (reportId: string, status: AdminReport['status'], feedback?: string) => void;
  deleteAdminReport: (reportId: string) => void;

  // Staff Attendance & Check-in
  checkInStaff: () => void;
  checkOutStaff: () => void;
  getTodayAttendanceForUser: (userId: string) => AttendanceRecord | null;

  // Student Daily Attendance
  getStudentDailyAttendance: (classId?: string, section?: string, date?: string) => StudentDailyAttendance[];
  saveStudentDailyAttendance: (records: StudentDailyAttendance[]) => void;

  // Leave Management
  submitLeaveRequest: (leave: Omit<LeaveRequest, 'id' | 'userId' | 'userName' | 'userRole' | 'status' | 'submittedAt'>) => void;
  deleteLeaveRequest: (leaveId: string) => void;
  reviewLeaveRequest: (leaveId: string, status: 'APPROVED' | 'REJECTED', adminNotes?: string) => void;

  // Admin Routine Management
  addRoutine: (routine: Omit<ClassRoutineItem, 'id'>) => { success: boolean; conflictError?: string };
  updateRoutine: (routine: ClassRoutineItem) => { success: boolean; conflictError?: string };
  deleteRoutine: (routineId: string) => void;
  assignSubstituteTeacher: (routineId: string, substituteTeacherId: string, substituteTeacherName: string) => void;

  // Notices
  createNotice: (notice: Omit<Notice, 'id' | 'authorName' | 'createdAt' | 'readByUserIds'>) => void;
  updateNotice: (notice: Notice) => void;
  deleteNotice: (noticeId: string) => void;
  markNoticeAsRead: (noticeId: string) => void;

  // Active Alert / Reminder Popup
  activeReminder: { title: string; message: string; routineId?: string } | null;
  dismissReminder: () => void;

  // Force Refresh
  refreshAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  // Localization (Default to Bengali)
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('teachflow_lang') as Language) || 'bn';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('teachflow_lang', lang);
  };

  const t = useCallback((key: keyof typeof translations['bn']): string => {
    return translations[language][key] || translations['en'][key] || key;
  }, [language]);

  // Mobile Frame preview toggle on desktop (default true for authentic mobile app view)
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState<boolean>(false);

  // Network & Sync State
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncState, setSyncState] = useState<SyncState>('SYNCED');
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [syncQueue, setSyncQueue] = useState<any[]>([]);

  // School Data Collections
  const [settings, setSettings] = useState<SchoolSettings>(storageService.getSettings());
  const [routines, setRoutines] = useState<ClassRoutineItem[]>([]);
  const [classSessions, setClassSessions] = useState<ClassSession[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [adminReports, setAdminReports] = useState<AdminReport[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  // Student Evaluation & Student of the Month Data
  const [students, setStudents] = useState<Student[]>(storageService.getStudents());
  const [ctAssessments, setCTAssessments] = useState<CTAssessment[]>(storageService.getCTAssessments());
  const [weeklyCTMarks, setWeeklyCTMarks] = useState<WeeklyCTMark[]>(storageService.getWeeklyCTMarks());
  const [weeklyStudentReports, setWeeklyStudentReports] = useState<WeeklyStudentReport[]>(storageService.getWeeklyStudentReports());
  const [evaluationSettings, setEvaluationSettings] = useState<EvaluationSettings>(storageService.getEvaluationSettings());
  const [studentOfTheMonthRecords, setStudentOfTheMonthRecords] = useState<StudentOfTheMonthRecord[]>(storageService.getStudentOfTheMonthRecords());

  // Automatic Class-End Alarm state
  const [isClassEndAlarmActive, setIsClassEndAlarmActive] = useState<boolean>(false);
  const [classEndAlarmSession, setClassEndAlarmSession] = useState<ClassSession | null>(null);
  const alarmTriggeredKeys = useRef<Set<string>>(new Set());

  // Active reminder toast/modal
  const [activeReminder, setActiveReminder] = useState<{ title: string; message: string; routineId?: string } | null>(null);

  // Private notes state (refreshed when currentUser changes)
  const [privateNotes, setPrivateNotes] = useState<PrivateTeacherNote[]>([]);

  const refreshAllData = useCallback(() => {
    setSettings(storageService.getSettings());
    setRoutines(storageService.getRoutines());
    setClassSessions(storageService.getClassSessions());
    setAttendanceRecords(storageService.getAttendanceRecords());
    setNotices(storageService.getNotices());
    setAdminReports(storageService.getAdminReports());
    setLeaveRequests(storageService.getLeaveRequests());
    setAuditLogs(storageService.getAuditLogs());
    setStudents(storageService.getStudents());
    setCTAssessments(storageService.getCTAssessments());
    setWeeklyCTMarks(storageService.getWeeklyCTMarks());
    setWeeklyStudentReports(storageService.getWeeklyStudentReports());
    setEvaluationSettings(storageService.getEvaluationSettings());
    setStudentOfTheMonthRecords(storageService.getStudentOfTheMonthRecords());
    
    const offlineActs = storageService.getOfflineActions();
    setPendingSyncCount(offlineActs.length);
    if (offlineActs.length > 0) {
      setSyncState('WAITING_TO_SYNC');
    } else {
      setSyncState('SYNCED');
    }

    if (currentUser && currentUser.role === 'TEACHER') {
      setPrivateNotes(storageService.getPrivateTeacherNotes(currentUser.id, true));
    } else {
      setPrivateNotes([]);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshAllData();

    // Browser network events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshAllData]);

  // Network toggle switch (for testing offline capabilities easily in the UI)
  const toggleOnlineStatus = () => {
    const nextStatus = !isOnline;
    setIsOnline(nextStatus);
    if (nextStatus) {
      triggerManualSync();
    }
  };

  // Sync execution
  const triggerManualSync = async () => {
    if (!isOnline) return;
    setSyncState('SYNCING');
    
    // Simulate brief network latency for crisp UI feedback
    await new Promise(res => setTimeout(res, 600));

    const res = storageService.processSyncQueue();
    const remaining = storageService.getOfflineActions().length;
    setPendingSyncCount(remaining);

    if (res.errors > 0 && remaining > 0) {
      setSyncState('ERROR');
    } else {
      setSyncState('SYNCED');
      const now = new Date();
      setLastSyncTime(`Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      audioService.playFeedback('qr_success');
    }
    refreshAllData();
  };

  // Auto-sync when online and items are queued
  useEffect(() => {
    if (isOnline && pendingSyncCount > 0 && syncState === 'WAITING_TO_SYNC') {
      const timer = setTimeout(() => {
        triggerManualSync();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingSyncCount, syncState]);

  // Find running session for currently logged-in teacher
  const activeClassSession = currentUser?.role === 'TEACHER'
    ? classSessions.find(s => s.teacherId === currentUser.id && s.status === 'RUNNING' && s.date === getTodayDateString()) || null
    : null;

  // Routine & Next Class calculation
  const getTodayRoutinesForTeacher = useCallback((teacherId: string): ClassRoutineItem[] => {
    const todayDay = new Date().getDay();
    return routines
      .filter(r => (r.teacherId === teacherId || r.substituteTeacherId === teacherId) && r.dayOfWeek === todayDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [routines]);

  const getNextScheduledClassForTeacher = useCallback((teacherId: string) => {
    const todayRoutines = getTodayRoutinesForTeacher(teacherId);
    if (todayRoutines.length === 0) {
      return { routine: null, isCurrentOrUpcoming: false, minutesUntil: 0, status: 'NONE' as const };
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Check if any class is currently in progress
    const active = classSessions.find(s => s.teacherId === teacherId && s.status === 'RUNNING' && s.date === getTodayDateString());
    if (active) {
      const runningRoutine = todayRoutines.find(r => r.id === active.routineId);
      return { routine: runningRoutine || null, isCurrentOrUpcoming: true, minutesUntil: 0, status: 'RUNNING' as const };
    }

    // Look for routine that spans now, or next closest upcoming
    for (const r of todayRoutines) {
      const [sh, sm] = r.startTime.split(':').map(Number);
      const [eh, em] = r.endTime.split(':').map(Number);
      const startMinutes = sh * 60 + sm;
      const endMinutes = eh * 60 + em;

      // Class is ongoing right now or starting in <= 15 min
      if (currentMinutes >= startMinutes - 15 && currentMinutes <= endMinutes) {
        return {
          routine: r,
          isCurrentOrUpcoming: true,
          minutesUntil: Math.max(0, startMinutes - currentMinutes),
          status: currentMinutes >= startMinutes ? 'STARTING_SOON' : 'STARTING_SOON'
        };
      }

      // Next future class today
      if (startMinutes > currentMinutes) {
        return {
          routine: r,
          isCurrentOrUpcoming: true,
          minutesUntil: startMinutes - currentMinutes,
          status: 'SCHEDULED'
        };
      }
    }

    // If all classes today passed, show the first class of today as completed/reference
    return {
      routine: todayRoutines[0],
      isCurrentOrUpcoming: false,
      minutesUntil: 0,
      status: 'NONE'
    };
  }, [getTodayRoutinesForTeacher, classSessions]);

  // AUTOMATIC CLASS-END ALARM MONITOR
  // Sounds alarm and displays End / Extend class alert as soon as scheduled end time is reached
  useEffect(() => {
    if (!activeClassSession || activeClassSession.status !== 'RUNNING') {
      setIsClassEndAlarmActive(false);
      setClassEndAlarmSession(null);
      return;
    }

    const checkAlarm = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const currentSeconds = now.getSeconds();
      const totalCurrentSec = currentMinutes * 60 + currentSeconds;

      let isOvertime = false;

      // Check scheduledEnd time (e.g. "10:45")
      if (activeClassSession.scheduledEnd) {
        const [eh, em] = activeClassSession.scheduledEnd.split(':').map(Number);
        if (!isNaN(eh) && !isNaN(em)) {
          const scheduledEndSec = (eh * 60 + em) * 60;
          if (totalCurrentSec >= scheduledEndSec) {
            isOvertime = true;
          }
        }
      }

      // Also check elapsed duration against durationMinutes
      if (!isOvertime && activeClassSession.actualStart) {
        const [sh, sm] = activeClassSession.actualStart.split(':').map(Number);
        if (!isNaN(sh) && !isNaN(sm)) {
          const startSec = (sh * 60 + sm) * 60;
          const elapsedSec = totalCurrentSec - startSec;
          const maxSec = (activeClassSession.durationMinutes || 45) * 60;
          if (elapsedSec >= maxSec) {
            isOvertime = true;
          }
        }
      }

      const alarmKey = `${activeClassSession.id}_${activeClassSession.scheduledEnd}`;
      if (isOvertime && !alarmTriggeredKeys.current.has(alarmKey)) {
        alarmTriggeredKeys.current.add(alarmKey);
        setIsClassEndAlarmActive(true);
        setClassEndAlarmSession(activeClassSession);
        audioService.playClassEndAlarm();
      }
    };

    checkAlarm();
    const interval = setInterval(checkAlarm, 1000);
    return () => clearInterval(interval);
  }, [activeClassSession]);

  const dismissClassEndAlarm = () => {
    setIsClassEndAlarmActive(false);
    audioService.playFeedback('click');
  };

  const triggerClassEndAlarmTest = () => {
    audioService.playClassEndAlarm();
    if (activeClassSession) {
      setClassEndAlarmSession(activeClassSession);
    } else {
      setClassEndAlarmSession({
        id: 'sess_test_demo',
        routineId: 'rout_1',
        teacherId: currentUser?.id || 't1',
        teacherName: currentUser?.name || 'Class Teacher',
        classId: 'Class 8',
        section: 'A',
        subjectId: 'General Science',
        roomId: 'Room 201',
        date: getTodayDateString(),
        scheduledStart: '10:00',
        scheduledEnd: getCurrentTimeString(),
        actualStart: '09:15',
        status: 'RUNNING',
        synced: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    setIsClassEndAlarmActive(true);
  };

  // Periodic Reminder / Alert Checker
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'TEACHER') return;

    const checkReminders = () => {
      const next = getNextScheduledClassForTeacher(currentUser.id);
      if (next.routine && next.isCurrentOrUpcoming && next.status === 'STARTING_SOON') {
        if (next.minutesUntil <= 10 && next.minutesUntil > 0) {
          // Play audio and vibration
          audioService.triggerReminder();
          setActiveReminder({
            title: `Class Starts in ${next.minutesUntil} Minutes`,
            message: `${next.routine.classId} ${next.routine.subjectId} in ${next.routine.roomId}.`,
            routineId: next.routine.id
          });
        }
      }
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [currentUser, getNextScheduledClassForTeacher]);

  const dismissReminder = () => setActiveReminder(null);

  // CORE UX: ONE-TAP CLASS START
  const startClassOneTap = async (routineId: string): Promise<{ success: boolean; session?: ClassSession; error?: string }> => {
    if (!currentUser || currentUser.role !== 'TEACHER') {
      return { success: false, error: 'Only teachers can start classes.' };
    }

    const routine = routines.find(r => r.id === routineId);
    if (!routine) {
      return { success: false, error: 'Class routine schedule not found.' };
    }

    const todayStr = getTodayDateString();
    const timeStr = getCurrentTimeString();

    // Check if class is already running
    const existing = classSessions.find(
      s => s.teacherId === currentUser.id && s.routineId === routineId && s.date === todayStr && s.status === 'RUNNING'
    );
    if (existing) {
      return { success: true, session: existing };
    }

    // Physical & auditory feedback
    audioService.triggerClassStart();

    const newSession: ClassSession = {
      id: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      routineId: routine.id,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      classId: routine.classId,
      section: routine.section,
      subjectId: routine.subjectId,
      roomId: routine.roomId,
      date: todayStr,
      scheduledStart: routine.startTime,
      scheduledEnd: routine.endTime,
      actualStart: timeStr,
      status: 'RUNNING',
      startedVia: 'ONE_TAP',
      synced: isOnline,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Auto-mark Teacher Attendance for today (Rule 17)
    const existingAtt = attendanceRecords.find(a => a.userId === currentUser.id && a.date === todayStr);
    const newAtt: AttendanceRecord = {
      id: existingAtt ? existingAtt.id : `att_${Date.now()}_${currentUser.id}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'TEACHER',
      date: todayStr,
      status: 'PRESENT',
      checkInTime: existingAtt?.checkInTime || timeStr,
      firstClassSessionId: newSession.id,
      synced: isOnline
    };

    if (isOnline) {
      storageService.createClassSession(newSession);
      storageService.recordAttendance(newAtt);
      storageService.addAuditLog(
        currentUser,
        'CLASS_STARTED',
        'CLASS_SESSION',
        `${currentUser.name} started ${routine.classId} (${routine.subjectId}) in ${routine.roomId} via One-Tap.`
      );
    } else {
      // Offline mode: queue actions locally
      storageService.queueOfflineAction({
        type: 'CLASS_START',
        entityId: newSession.id,
        payload: newSession
      });
      storageService.queueOfflineAction({
        type: 'ATTENDANCE_RECORD',
        entityId: newAtt.id,
        payload: newAtt
      });
      // Apply immediately to local state for seamless offline UX
      storageService.createClassSession(newSession);
      storageService.recordAttendance(newAtt);
      setSyncState('WAITING_TO_SYNC');
    }

    refreshAllData();
    return { success: true, session: newSession };
  };

  // CORE UX: QR CODE CLASS START
  const startClassByQr = async (roomCodeOrQr: string): Promise<{ success: boolean; session?: ClassSession; error?: string }> => {
    if (!currentUser || currentUser.role !== 'TEACHER') {
      audioService.playFeedback('error');
      return { success: false, error: 'Only teachers can scan classroom QR codes.' };
    }

    // Clean scanned code (e.g. "ROOM_203" or "Room 203" or JSON format)
    let parsedRoom = roomCodeOrQr.trim();
    try {
      if (parsedRoom.startsWith('{')) {
        const parsed = JSON.parse(parsedRoom);
        parsedRoom = parsed.room || parsed.roomId || parsedRoom;
      }
    } catch {
      // Plain text
    }

    const todayDay = new Date().getDay();
    const todayRoutines = routines.filter(
      r => (r.teacherId === currentUser.id || r.substituteTeacherId === currentUser.id) && r.dayOfWeek === todayDay
    );

    // Verify if teacher has any scheduled class in this room today
    const normalizedTarget = parsedRoom.toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchedRoutine = todayRoutines.find(r => {
      const normalizedRoom = r.roomId.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normalizedRoom.includes(normalizedTarget) || normalizedTarget.includes(normalizedRoom);
    });

    if (!matchedRoutine) {
      audioService.playFeedback('error');
      return {
        success: false,
        error: `No scheduled class found for ${currentUser.name} in "${parsedRoom}" at this time.`
      };
    }

    // Auditory feedback for valid QR
    audioService.triggerQrSuccess();

    // Start class
    const res = await startClassOneTap(matchedRoutine.id);
    return res;
  };

  // END CLASS SESSION
  const endClassSession = async (sessionId: string): Promise<{ success: boolean; error?: string }> => {
    const session = classSessions.find(s => s.id === sessionId);
    if (!session) return { success: false, error: 'Session not found.' };

    audioService.playFeedback('class_end');
    const endTimeStr = getCurrentTimeString();

    // Calculate duration in minutes
    let duration = 45;
    if (session.actualStart) {
      const [sh, sm] = session.actualStart.split(':').map(Number);
      const [eh, em] = endTimeStr.split(':').map(Number);
      duration = Math.max(1, (eh * 60 + em) - (sh * 60 + sm));
    }

    const updatedSession: ClassSession = {
      ...session,
      actualEnd: endTimeStr,
      durationMinutes: duration,
      status: 'COMPLETED',
      updatedAt: new Date().toISOString(),
      synced: isOnline
    };

    if (isOnline) {
      storageService.updateClassSession(updatedSession);
      if (currentUser) {
        storageService.addAuditLog(
          currentUser,
          'CLASS_COMPLETED',
          'CLASS_SESSION',
          `${session.teacherName} completed ${session.classId} (${session.subjectId}). Duration: ${duration} mins.`
        );
      }
    } else {
      storageService.queueOfflineAction({
        type: 'CLASS_END',
        entityId: updatedSession.id,
        payload: updatedSession
      });
      storageService.updateClassSession(updatedSession);
      setSyncState('WAITING_TO_SYNC');
    }

    refreshAllData();
    return { success: true };
  };

  // EXTEND CLASS DURATION
  const extendClassSession = async (sessionId: string, additionalMinutes: number): Promise<{ success: boolean; session?: ClassSession }> => {
    const session = classSessions.find(s => s.id === sessionId) || activeClassSession;
    if (!session) return { success: false };

    const teacherName = currentUser?.name || session.teacherName;
    const updatedSession = storageService.extendClassSession(sessionId, additionalMinutes, teacherName);

    if (updatedSession) {
      // Clear active class alarm since time has been successfully extended
      setIsClassEndAlarmActive(false);
      audioService.playFeedback('qr_success');

      if (!isOnline) {
        storageService.queueOfflineAction({
          type: 'EXTEND_CLASS',
          entityId: sessionId,
          payload: { sessionId, additionalMinutes, teacherName }
        });
        setSyncState('WAITING_TO_SYNC');
      }

      if (currentUser) {
        storageService.addAuditLog(
          currentUser,
          'CLASS_EXTENDED',
          'CLASS_SESSION',
          `${teacherName} extended class ${session.classId} (${session.subjectId}) by +${additionalMinutes} mins. New scheduled end: ${updatedSession.scheduledEnd}`
        );
      }

      refreshAllData();
      return { success: true, session: updatedSession };
    }

    return { success: false };
  };

  // TEACHER PRIVATE NOTES (Strict database-level and client-level isolation)
  const getTeacherPrivateNotes = (includeDeleted: boolean = false): PrivateTeacherNote[] => {
    if (!currentUser || currentUser.role !== 'TEACHER') {
      return [];
    }
    return storageService.getPrivateTeacherNotes(currentUser.id, includeDeleted);
  };

  const saveTeacherPrivateNote = (noteData: Omit<PrivateTeacherNote, 'ownerId' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    if (!currentUser || currentUser.role !== 'TEACHER') {
      throw new Error('Unauthorized: Only teachers can maintain private notes.');
    }

    const now = new Date().toISOString();
    const noteId = noteData.id || `pnote_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    const fullNote: PrivateTeacherNote = {
      id: noteId,
      ownerId: currentUser.id,
      title: noteData.title,
      content: noteData.content,
      tags: noteData.tags || [],
      isPinned: !!noteData.isPinned,
      isArchived: !!noteData.isArchived,
      createdAt: now,
      updatedAt: now
    };

    if (isOnline) {
      storageService.savePrivateTeacherNote(fullNote, currentUser.id);
      // NOTE: Audit log specifically NEVER records private note title or text
      storageService.addAuditLog(currentUser, 'PRIVATE_NOTE_SAVED', 'PRIVATE_WORKSPACE', 'Teacher updated a private note.');
    } else {
      storageService.queueOfflineAction({
        type: 'SAVE_PRIVATE_NOTE',
        entityId: fullNote.id,
        payload: fullNote
      });
      storageService.savePrivateTeacherNote(fullNote, currentUser.id);
      setSyncState('WAITING_TO_SYNC');
    }

    setPrivateNotes(storageService.getPrivateTeacherNotes(currentUser.id, true));
    audioService.playFeedback('click');
  };

  const deleteTeacherPrivateNote = (noteId: string, permanent: boolean = false) => {
    if (!currentUser || currentUser.role !== 'TEACHER') return;

    if (isOnline) {
      storageService.deletePrivateTeacherNote(noteId, currentUser.id, permanent);
      storageService.addAuditLog(
        currentUser,
        permanent ? 'PRIVATE_NOTE_PERMANENT_DELETED' : 'PRIVATE_NOTE_TRASHED',
        'PRIVATE_WORKSPACE',
        permanent ? 'Teacher permanently deleted a private note.' : 'Teacher moved a private note to trash.'
      );
    } else {
      storageService.queueOfflineAction({
        type: 'DELETE_PRIVATE_NOTE',
        entityId: noteId,
        payload: { noteId, ownerId: currentUser.id, permanent }
      });
      storageService.deletePrivateTeacherNote(noteId, currentUser.id, permanent);
      setSyncState('WAITING_TO_SYNC');
    }

    setPrivateNotes(storageService.getPrivateTeacherNotes(currentUser.id, true));
    audioService.playFeedback('click');
  };

  const restoreTeacherPrivateNote = (noteId: string) => {
    if (!currentUser || currentUser.role !== 'TEACHER') return;

    if (isOnline) {
      storageService.restorePrivateTeacherNote(noteId, currentUser.id);
      storageService.addAuditLog(currentUser, 'PRIVATE_NOTE_RESTORED', 'PRIVATE_WORKSPACE', 'Teacher restored a note from trash.');
    } else {
      storageService.queueOfflineAction({
        type: 'RESTORE_PRIVATE_NOTE',
        entityId: noteId,
        payload: { noteId, ownerId: currentUser.id }
      });
      storageService.restorePrivateTeacherNote(noteId, currentUser.id);
      setSyncState('WAITING_TO_SYNC');
    }

    setPrivateNotes(storageService.getPrivateTeacherNotes(currentUser.id, true));
    audioService.playFeedback('qr_success');
  };

  const emptyTeacherNotesTrash = () => {
    if (!currentUser || currentUser.role !== 'TEACHER') return;

    storageService.emptyTrashPrivateTeacherNotes(currentUser.id);
    storageService.addAuditLog(currentUser, 'PRIVATE_NOTES_TRASH_EMPTIED', 'PRIVATE_WORKSPACE', 'Teacher emptied their notes trash.');
    setPrivateNotes(storageService.getPrivateTeacherNotes(currentUser.id, true));
    audioService.playFeedback('click');
  };

  // STUDENT EVALUATION & STUDENT OF THE MONTH
  const addStudent = (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    const student: Student = {
      ...studentData,
      id: `std_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      studentId: studentData.studentId || `STD-2025-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      academicYear: studentData.academicYear || '2025',
      status: studentData.status || 'ACTIVE',
      classTeacherId: studentData.classTeacherId || currentUser?.id || 'teacher_1'
    };
    storageService.addStudent(student, currentUser || undefined);
    if (currentUser) {
      storageService.addAuditLog(currentUser, 'STUDENT_ADDED', 'STUDENT_DATABASE', `Added student ${student.name} (Roll: ${student.roll}, ${student.classId})`);
    }
    refreshAllData();
    audioService.playFeedback('qr_success');
  };

  const updateStudent = (student: Student) => {
    storageService.updateStudent(student);
    if (currentUser) {
      storageService.addAuditLog(currentUser, 'STUDENT_UPDATED', 'STUDENT_DATABASE', `Updated student profile ${student.name}`);
    }
    refreshAllData();
    audioService.playFeedback('click');
  };

  const archiveStudent = (studentId: string) => {
    storageService.archiveStudent(studentId);
    if (currentUser) {
      storageService.addAuditLog(currentUser, 'STUDENT_ARCHIVED', 'STUDENT_DATABASE', `Archived student ${studentId}`);
    }
    refreshAllData();
    audioService.playFeedback('click');
  };

  const deleteStudent = (studentId: string) => {
    storageService.deleteStudent(studentId, currentUser || undefined);
    refreshAllData();
    audioService.playFeedback('click');
  };

  const saveCTAssessment = (assessment: CTAssessment) => {
    storageService.saveCTAssessment(assessment, currentUser || undefined);
    refreshAllData();
    audioService.playFeedback('click');
  };

  const deleteCTAssessment = (id: string) => {
    storageService.deleteCTAssessment(id, currentUser || undefined);
    refreshAllData();
    audioService.playFeedback('click');
  };

  const getStudentAttendanceStats = (student: Student, month?: string) => {
    return storageService.getStudentAttendanceStats(student, month);
  };

  const saveCTMark = (markData: Omit<WeeklyCTMark, 'id' | 'updatedAt' | 'synced'> & { id?: string }, changeReason?: string) => {
    // Role-based validation: Teachers can only add/modify CT marks for their assigned subject(s)
    if (currentUser && currentUser.role !== 'ADMIN') {
      const allowedSubjects = (currentUser.assignedSubjects && currentUser.assignedSubjects.length > 0)
        ? currentUser.assignedSubjects
        : (currentUser.department ? [currentUser.department] : []);
      if (allowedSubjects.length > 0 && markData.subjectId && !allowedSubjects.includes(markData.subjectId)) {
        console.warn(`[TeachFlow Access Control] Teacher ${currentUser.name} is not authorized to submit CT marks for ${markData.subjectId}`);
        return;
      }
    }

    const fullMark: WeeklyCTMark = {
      ...markData,
      id: markData.id || `ct_${markData.studentId}_${markData.academicYear || '2026'}_${markData.classId}_${markData.section}_${(markData.subjectId || 'general').replace(/\s+/g, '_').toLowerCase()}_${markData.ctNumber || `CT-${markData.weekNumber || markData.week || 1}`}`,
      mark: markData.obtainedMarks ?? markData.mark ?? 0,
      maxMark: markData.totalMarks ?? markData.maxMark ?? 20,
      obtainedMarks: markData.obtainedMarks ?? markData.mark ?? 0,
      totalMarks: markData.totalMarks ?? markData.maxMark ?? 20,
      percentage: (markData.totalMarks ?? markData.maxMark ?? 20) > 0 
        ? Math.round(((markData.obtainedMarks ?? markData.mark ?? 0) / (markData.totalMarks ?? markData.maxMark ?? 20)) * 100)
        : 0,
      week: markData.weekNumber ?? markData.week ?? 1,
      teacherId: markData.evaluatedByTeacherId || currentUser?.id || 'teacher_1',
      updatedAt: new Date().toISOString(),
      synced: isOnline
    };
    storageService.saveCTMark(fullMark, currentUser || undefined, changeReason);
    if (!isOnline) {
      storageService.queueOfflineAction({
        type: 'SAVE_CT_MARK',
        entityId: fullMark.id,
        payload: fullMark
      });
      setSyncState('WAITING_TO_SYNC');
    }
    refreshAllData();
    audioService.playFeedback('click');
  };

  const deleteCTMark = (markId: string) => {
    storageService.deleteCTMark(markId, currentUser || undefined);
    refreshAllData();
    audioService.playFeedback('click');
  };

  const saveStudentReport = (reportData: Omit<WeeklyStudentReport, 'id' | 'updatedAt' | 'synced'> & { id?: string }) => {
    const fullReport: WeeklyStudentReport = {
      ...reportData,
      id: reportData.id || `rep_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      week: reportData.weekNumber ?? reportData.week ?? 1,
      academicPerformance: 'GOOD',
      behavior: 'EXCELLENT',
      attendanceRating: 'EXCELLENT',
      classParticipation: 'GOOD',
      homework: 'GOOD',
      discipline: 'EXCELLENT',
      teacherId: reportData.evaluatedByTeacherId || currentUser?.id || 'teacher_1',
      updatedAt: new Date().toISOString(),
      synced: isOnline
    };
    storageService.saveStudentReport(fullReport, currentUser || undefined);
    if (!isOnline) {
      storageService.queueOfflineAction({
        type: 'SAVE_STUDENT_REPORT',
        entityId: fullReport.id,
        payload: fullReport
      });
      setSyncState('WAITING_TO_SYNC');
    }
    refreshAllData();
    audioService.playFeedback('click');
  };

  const updateEvaluationSettings = (newSettings: EvaluationSettings) => {
    storageService.saveEvaluationSettings(newSettings, currentUser || undefined);
    refreshAllData();
    audioService.playFeedback('qr_success');
  };

  const recommendStudentOfTheMonth = (record: StudentOfTheMonthRecord) => {
    if (!currentUser) return;
    storageService.recommendStudentOfTheMonth(record, currentUser);
    refreshAllData();
    audioService.playFeedback('qr_success');
  };

  const reviewStudentOfTheMonth = (recordId: string, decision: 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED', adminComment: string) => {
    if (!currentUser) return;
    storageService.reviewStudentOfTheMonth(recordId, decision, adminComment, currentUser);
    refreshAllData();
    audioService.playFeedback('click');
  };

  const publishStudentOfTheMonth = (record: StudentOfTheMonthRecord) => {
    storageService.publishStudentOfTheMonth(record, currentUser || undefined);
    refreshAllData();
    audioService.playFeedback('qr_success');
  };

  // TEACHER REPORTS TO ADMIN (Strictly separate from private notes)
  const submitReportToAdmin = async (reportData: Omit<AdminReport, 'id' | 'teacherId' | 'teacherName' | 'status' | 'submittedAt' | 'synced'>): Promise<{ success: boolean }> => {
    if (!currentUser) return { success: false };

    const newReport: AdminReport = {
      ...reportData,
      id: `rep_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
      synced: isOnline
    };

    if (isOnline) {
      storageService.submitAdminReport(newReport);
      storageService.addAuditLog(currentUser, 'REPORT_SUBMITTED', 'ADMIN_REPORT', `${currentUser.name} submitted official report: "${newReport.title}".`);
    } else {
      storageService.queueOfflineAction({
        type: 'SUBMIT_REPORT',
        entityId: newReport.id,
        payload: newReport
      });
      storageService.submitAdminReport(newReport);
      setSyncState('WAITING_TO_SYNC');
    }

    refreshAllData();
    audioService.playFeedback('qr_success');
    return { success: true };
  };

  const updateReportReview = (reportId: string, status: AdminReport['status'], feedback?: string) => {
    if (!currentUser || currentUser.role !== 'ADMIN') return;
    const report = adminReports.find(r => r.id === reportId);
    if (!report) return;

    const updated: AdminReport = {
      ...report,
      status,
      adminFeedback: feedback || report.adminFeedback,
      reviewedAt: new Date().toISOString(),
      reviewedBy: currentUser.name
    };

    storageService.updateAdminReport(updated, currentUser);
    refreshAllData();
  };

  const deleteAdminReport = (reportId: string) => {
    storageService.deleteAdminReport(reportId, currentUser || undefined);
    refreshAllData();
  };

  // STAFF ATTENDANCE
  const checkInStaff = () => {
    if (!currentUser) return;
    const todayStr = getTodayDateString();
    const timeStr = getCurrentTimeString();

    const record: AttendanceRecord = {
      id: `att_${Date.now()}_${currentUser.id}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      date: todayStr,
      status: 'PRESENT',
      checkInTime: timeStr,
      synced: isOnline
    };

    if (isOnline) {
      storageService.recordAttendance(record);
      storageService.addAuditLog(currentUser, 'CHECK_IN', 'ATTENDANCE', `${currentUser.name} checked in at ${timeStr}.`);
    } else {
      storageService.queueOfflineAction({
        type: 'ATTENDANCE_RECORD',
        entityId: record.id,
        payload: record
      });
      storageService.recordAttendance(record);
      setSyncState('WAITING_TO_SYNC');
    }

    audioService.playFeedback('qr_success');
    refreshAllData();
  };

  const checkOutStaff = () => {
    if (!currentUser) return;
    const todayStr = getTodayDateString();
    const timeStr = getCurrentTimeString();
    const existing = attendanceRecords.find(a => a.userId === currentUser.id && a.date === todayStr);

    let workingHours = 7.5;
    if (existing?.checkInTime) {
      const [inH, inM] = existing.checkInTime.split(':').map(Number);
      const [outH, outM] = timeStr.split(':').map(Number);
      workingHours = Number((Math.max(0.5, (outH * 60 + outM - (inH * 60 + inM)) / 60)).toFixed(1));
    }

    const record: AttendanceRecord = {
      id: existing ? existing.id : `att_${Date.now()}_${currentUser.id}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      date: todayStr,
      status: existing?.status || 'PRESENT',
      checkInTime: existing?.checkInTime || '08:30',
      checkOutTime: timeStr,
      workingHours,
      synced: isOnline
    };

    if (isOnline) {
      storageService.recordAttendance(record);
      storageService.addAuditLog(currentUser, 'CHECK_OUT', 'ATTENDANCE', `${currentUser.name} checked out at ${timeStr}. Total: ${workingHours} hrs.`);
    } else {
      storageService.queueOfflineAction({
        type: 'ATTENDANCE_RECORD',
        entityId: record.id,
        payload: record
      });
      storageService.recordAttendance(record);
      setSyncState('WAITING_TO_SYNC');
    }

    audioService.playFeedback('class_end');
    refreshAllData();
  };

  const getTodayAttendanceForUser = (userId: string): AttendanceRecord | null => {
    const todayStr = getTodayDateString();
    return attendanceRecords.find(a => a.userId === userId && a.date === todayStr) || null;
  };

  // LEAVE MANAGEMENT
  const submitLeaveRequest = (leaveData: Omit<LeaveRequest, 'id' | 'userId' | 'userName' | 'userRole' | 'status' | 'submittedAt'>) => {
    if (!currentUser) return;
    const newLeave: LeaveRequest = {
      ...leaveData,
      id: `lve_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      status: 'PENDING',
      submittedAt: new Date().toISOString()
    };

    if (isOnline) {
      storageService.submitLeaveRequest(newLeave);
      storageService.addAuditLog(currentUser, 'LEAVE_SUBMITTED', 'LEAVE_REQUEST', `${currentUser.name} applied for ${newLeave.leaveType} leave (${newLeave.daysCount} days).`);
    } else {
      storageService.queueOfflineAction({
        type: 'SUBMIT_LEAVE',
        entityId: newLeave.id,
        payload: newLeave
      });
      storageService.submitLeaveRequest(newLeave);
      setSyncState('WAITING_TO_SYNC');
    }

    audioService.playFeedback('qr_success');
    refreshAllData();
  };

  const reviewLeaveRequest = (leaveId: string, status: 'APPROVED' | 'REJECTED', adminNotes?: string) => {
    if (!currentUser || currentUser.role !== 'ADMIN') return;
    const leave = leaveRequests.find(l => l.id === leaveId);
    if (!leave) return;

    const updated: LeaveRequest = {
      ...leave,
      status,
      adminNotes,
      decidedAt: new Date().toISOString(),
      decidedBy: currentUser.name
    };

    storageService.updateLeaveRequest(updated, currentUser);
    refreshAllData();
  };

  const deleteLeaveRequest = (leaveId: string) => {
    storageService.deleteLeaveRequest(leaveId, currentUser || undefined);
    refreshAllData();
    audioService.playFeedback('click');
  };

  // ROUTINE MANAGEMENT & CONFLICT CHECKING
  const checkRoutineConflicts = (candidate: Partial<ClassRoutineItem>, ignoreId?: string): string | null => {
    for (const r of routines) {
      if (ignoreId && r.id === ignoreId) continue;
      if (r.dayOfWeek !== candidate.dayOfWeek) continue;

      // Time overlap check
      const [cStartH, cStartM] = (candidate.startTime || '00:00').split(':').map(Number);
      const [cEndH, cEndM] = (candidate.endTime || '00:00').split(':').map(Number);
      const [rStartH, rStartM] = r.startTime.split(':').map(Number);
      const [rEndH, rEndM] = r.endTime.split(':').map(Number);

      const candidateStart = cStartH * 60 + cStartM;
      const candidateEnd = cEndH * 60 + cEndM;
      const rStart = rStartH * 60 + rStartM;
      const rEnd = rEndH * 60 + rEndM;

      const isOverlapping = Math.max(candidateStart, rStart) < Math.min(candidateEnd, rEnd);
      if (isOverlapping) {
        // Teacher double-booking check
        if (candidate.teacherId && r.teacherId === candidate.teacherId) {
          return `Teacher Conflict: ${r.teacherName || 'Assigned teacher'} is already scheduled for ${r.classId} (${r.subjectId}) in ${r.roomId} at ${r.startTime} - ${r.endTime}.`;
        }
        // Room double-booking check
        if (candidate.roomId && r.roomId.toLowerCase() === candidate.roomId.toLowerCase()) {
          return `Room Conflict: ${r.roomId} is already occupied by ${r.classId} (${r.subjectId}) with ${r.teacherName} at ${r.startTime} - ${r.endTime}.`;
        }
        // Duplicate class check
        if (candidate.classId && candidate.section && r.classId === candidate.classId && r.section === candidate.section) {
          return `Class Conflict: ${r.classId} ${r.section} already has ${r.subjectId} scheduled at this time.`;
        }
      }
    }
    return null;
  };

  const addRoutine = (routineData: Omit<ClassRoutineItem, 'id'>): { success: boolean; conflictError?: string } => {
    if (!currentUser) {
      return { success: false, conflictError: 'Not logged in' };
    }

    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'TEACHER') {
      return { success: false, conflictError: 'Unauthorized' };
    }

    // If teacher, force teacherId and teacherName to current user
    const dataToAdd: Omit<ClassRoutineItem, 'id'> = currentUser.role === 'TEACHER'
      ? {
          ...routineData,
          teacherId: currentUser.id,
          teacherName: currentUser.name
        }
      : routineData;

    const conflict = checkRoutineConflicts(dataToAdd);
    if (conflict) {
      audioService.playFeedback('error');
      return { success: false, conflictError: conflict };
    }

    const newRoutine: ClassRoutineItem = {
      ...dataToAdd,
      id: `rout_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
    };

    storageService.addRoutineItem(newRoutine, currentUser);
    refreshAllData();
    audioService.playFeedback('qr_success');
    return { success: true };
  };

  const updateRoutine = (routine: ClassRoutineItem): { success: boolean; conflictError?: string } => {
    if (!currentUser) {
      return { success: false, conflictError: 'Not logged in' };
    }

    if (currentUser.role !== 'ADMIN' && (currentUser.role !== 'TEACHER' || routine.teacherId !== currentUser.id)) {
      return { success: false, conflictError: 'Unauthorized' };
    }

    const conflict = checkRoutineConflicts(routine, routine.id);
    if (conflict) {
      audioService.playFeedback('error');
      return { success: false, conflictError: conflict };
    }

    storageService.updateRoutineItem(routine, currentUser);
    refreshAllData();
    audioService.playFeedback('qr_success');
    return { success: true };
  };

  const deleteRoutine = (routineId: string) => {
    if (!currentUser) return;
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;

    if (currentUser.role !== 'ADMIN' && (currentUser.role !== 'TEACHER' || routine.teacherId !== currentUser.id)) {
      return;
    }

    storageService.deleteRoutineItem(routineId, currentUser);
    refreshAllData();
  };

  const assignSubstituteTeacher = (routineId: string, substituteTeacherId: string, substituteTeacherName: string) => {
    if (!currentUser || currentUser.role !== 'ADMIN') return;
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;

    const updated: ClassRoutineItem = {
      ...routine,
      substituteTeacherId,
      substituteTeacherName
    };

    storageService.updateRoutineItem(updated, currentUser);

    // Create automated routine change notice
    storageService.createNotice({
      id: `not_sub_${Date.now()}`,
      title: `Substitute Class Assignment: ${routine.classId} ${routine.subjectId}`,
      content: `${substituteTeacherName} has been assigned as substitute teacher for ${routine.classId} (${routine.subjectId}) in ${routine.roomId} at ${routine.startTime} - ${routine.endTime}.`,
      targetAudience: 'SPECIFIC',
      targetUserId: substituteTeacherId,
      priority: 'ROUTINE_CHANGE',
      authorName: currentUser.name,
      createdAt: new Date().toISOString(),
      readByUserIds: []
    }, currentUser);

    refreshAllData();
    audioService.playFeedback('qr_success');
  };

  // NOTICES
  const createNotice = (noticeData: Omit<Notice, 'id' | 'authorName' | 'createdAt' | 'readByUserIds'>) => {
    if (!currentUser || currentUser.role !== 'ADMIN') return;

    const newNotice: Notice = {
      ...noticeData,
      id: `not_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      authorName: currentUser.name,
      createdAt: new Date().toISOString(),
      readByUserIds: []
    };

    storageService.createNotice(newNotice, currentUser);
    refreshAllData();
    audioService.playFeedback('qr_success');
  };

  const updateNotice = (notice: Notice) => {
    if (!currentUser || currentUser.role !== 'ADMIN') return;
    storageService.updateNotice(notice, currentUser);
    refreshAllData();
    audioService.playFeedback('qr_success');
  };

  const getStudentDailyAttendance = (classId?: string, section?: string, date?: string): StudentDailyAttendance[] => {
    return storageService.getStudentDailyAttendance(classId, section, date);
  };

  const saveStudentDailyAttendance = (records: StudentDailyAttendance[]) => {
    storageService.saveStudentDailyAttendance(records, currentUser || undefined);
    refreshAllData();
    audioService.playFeedback('qr_success');
  };

  const deleteNotice = (noticeId: string) => {
    storageService.deleteNotice(noticeId, currentUser || undefined);
    refreshAllData();
    audioService.playFeedback('click');
  };

  const markNoticeAsRead = (noticeId: string) => {
    if (!currentUser) return;
    storageService.markNoticeRead(noticeId, currentUser.id);
    refreshAllData();
  };

  // SETTINGS
  const updateSettings = (newSettings: SchoolSettings) => {
    if (!currentUser || currentUser.role !== 'ADMIN') return;
    setSettings(newSettings);
    storageService.saveSettings(newSettings, currentUser);
    refreshAllData();
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isMobileFrame,
        setIsMobileFrame,
        isQrScannerOpen,
        setIsQrScannerOpen,
        toggleOnlineSimulation: toggleOnlineStatus,
        syncQueue,
        updateSchoolSettings: updateSettings,
        updateLeaveStatus: reviewLeaveRequest,
        isOnline,
        toggleOnlineStatus,
        syncState,
        pendingSyncCount,
        lastSyncTime,
        triggerManualSync,
        settings,
        updateSettings,
        routines,
        classSessions,
        activeClassSession,
        attendanceRecords,
        notices,
        adminReports,
        leaveRequests,
        auditLogs,
        getNextScheduledClassForTeacher,
        getTodayRoutinesForTeacher,
        startClassOneTap,
        startClassByQr,
        endClassSession,
        extendClassSession,
        isClassEndAlarmActive,
        classEndAlarmSession,
        dismissClassEndAlarm,
        triggerClassEndAlarmTest,
        getTeacherPrivateNotes,
        saveTeacherPrivateNote,
        deleteTeacherPrivateNote,
        restoreTeacherPrivateNote,
        emptyTeacherNotesTrash,
        students,
        ctAssessments,
        weeklyCTMarks,
        weeklyStudentReports,
        evaluationSettings,
        studentOfTheMonthRecords,
        addStudent,
        updateStudent,
        deleteStudent,
        archiveStudent,
        saveCTAssessment,
        deleteCTAssessment,
        saveCTMark,
        deleteCTMark,
        saveStudentReport,
        updateEvaluationSettings,
        recommendStudentOfTheMonth,
        reviewStudentOfTheMonth,
        publishStudentOfTheMonth,
        getStudentAttendanceStats,
        submitReportToAdmin,
        updateReportReview,
        updateReportStatus: updateReportReview,
        deleteAdminReport,
        checkInStaff,
        checkOutStaff,
        getTodayAttendanceForUser,
        getStudentDailyAttendance,
        saveStudentDailyAttendance,
        submitLeaveRequest,
        deleteLeaveRequest,
        reviewLeaveRequest,
        addRoutine,
        updateRoutine,
        deleteRoutine,
        assignSubstituteTeacher,
        createNotice,
        updateNotice,
        deleteNotice,
        markNoticeAsRead,
        activeReminder,
        dismissReminder,
        refreshAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
