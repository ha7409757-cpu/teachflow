/**
 * TeachFlow Teacher Home Dashboard
 * Upgraded, highly organized, and feature-rich:
 * - At-a-Glance Day Metrics & Attendance status
 * - Live Class-End Alarm Alert with quick extend (+5, +10 min) / end buttons
 * - Dominant Next Class Hero Card with instant Start & Attend in vibrant Ruby Red
 * - Dedicated "Student of the Month & Weekly Evaluation" spotlight card
 * - Clean 6-Action Quick Shortcuts Grid
 * - Today's Interactive Class Routine Timeline
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  QrCode,
  Calendar,
  Lock,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Radio,
  ArrowRight,
  Sparkles,
  Zap,
  Award,
  Trophy,
  Users,
  Bell,
  VolumeX,
  Plus,
  BookOpen,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { ActiveClassModal } from './ActiveClassModal';
import { QRScannerModal } from './QRScannerModal';

interface TeacherHomeProps {
  onNavigateTab?: (tab: string) => void;
  onOpenRoutine?: () => void;
}

export const TeacherHome: React.FC<TeacherHomeProps> = ({ onNavigateTab, onOpenRoutine }) => {
  const { currentUser } = useAuth();
  const {
    getNextScheduledClassForTeacher,
    getTodayRoutinesForTeacher,
    activeClassSession,
    startClassOneTap,
    endClassSession,
    extendClassSession,
    isClassEndAlarmActive,
    dismissClassEndAlarm,
    classSessions,
    attendanceRecords,
    studentOfTheMonthRecords,
    getTeacherPrivateNotes,
    isOnline,
    language
  } = useApp();

  const [isStarting, setIsStarting] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState<{
    show: boolean;
    classId: string;
    subject: string;
    time: string;
  } | null>(null);

  const navigate = (tab: string) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    } else if (tab === 'routine' && onOpenRoutine) {
      onOpenRoutine();
    }
  };

  if (!currentUser) return null;

  const nextClassData = getNextScheduledClassForTeacher(currentUser.id);
  const todayRoutines = getTodayRoutinesForTeacher(currentUser.id);

  // Today formatted string
  const todayFormatted = new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Calculate day metrics
  const todaySessions = classSessions.filter(
    s => s.teacherId === currentUser.id && s.date === new Date().toISOString().split('T')[0]
  );
  const completedClassesCount = todaySessions.filter(s => s.status === 'COMPLETED').length;
  const runningClass = todaySessions.find(s => s.status === 'RUNNING') || activeClassSession;

  // Teacher today's attendance check
  const todayAttendance = attendanceRecords.find(
    a => a.userId === currentUser.id && a.date === new Date().toISOString().split('T')[0]
  );

  // Private notes count
  const myNotes = getTeacherPrivateNotes(false);

  // Student of the month leading record for this month
  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' });
  const recentSOM = studentOfTheMonthRecords.find(r => r.month === currentMonthName) || studentOfTheMonthRecords[0];

  const handleStartClass = async (routineId: string) => {
    setIsStarting(true);
    const result = await startClassOneTap(routineId);
    setIsStarting(false);

    if (result.success && result.session) {
      setSuccessAnimation({
        show: true,
        classId: result.session.classId,
        subject: result.session.subjectId,
        time: result.session.actualStart || 'Now'
      });
      setTimeout(() => {
        setSuccessAnimation(null);
        navigate('active_class');
      }, 1200);
    }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-20">
      {/* Date & Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            {language === 'bn' ? 'আজকের তারিখ' : 'TODAY'} • {todayFormatted}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight mt-0.5">
            {language === 'bn' ? 'স্বাগতম' : 'Welcome'}, {currentUser.name}
          </h1>
          <p className="text-xs text-emerald-700 mt-0.5">
            {currentUser.designation || 'Class Teacher'} • {language === 'bn' ? 'শাখা শিক্ষক' : 'Academic Faculty'}
          </p>
        </div>

        {/* Offline indicator if working disconnected */}
        {!isOnline && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs self-start sm:self-auto font-medium shadow-sm">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            <span>{language === 'bn' ? 'অফলাইন মোড: ডাটা নিরাপদে লোকাল মেমরিতে জমা হচ্ছে' : 'Offline Mode: Actions will auto-sync'}</span>
          </div>
        )}
      </div>

      {/* SUCCESS ANIMATION TOAST */}
      <AnimatePresence>
        {successAnimation && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl bg-emerald-700 text-white shadow-2xl border-2 border-white"
          >
            <CheckCircle2 className="w-7 h-7 shrink-0 text-white animate-bounce" />
            <div>
              <p className="font-extrabold text-base leading-tight">
                {language === 'bn' ? '✓ ক্লাস শুরু ও হাজিরা সফল!' : '✓ Class Started & Attended'}
              </p>
              <p className="text-xs text-emerald-100 mt-0.5">
                {successAnimation.classId} • {successAnimation.subject} at {successAnimation.time}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CLASS END ALARM NOTIFICATION BANNER (When alarm rings) */}
      <AnimatePresence>
        {isClassEndAlarmActive && runningClass && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-3xl bg-gradient-to-r from-rose-600 via-rose-500 to-rose-700 text-white shadow-xl border-2 border-rose-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-2xl animate-bounce">
                  <Bell className="w-6 h-6 text-amber-200 fill-amber-300" />
                </div>
                <div>
                  <h3 className="font-black text-base flex items-center gap-2">
                    <span>{language === 'bn' ? '🔔 ক্লাস সমাপ্তির নির্ধারিত সময় হয়ে গেছে!' : '🔔 Class Time Ended!'}</span>
                  </h3>
                  <p className="text-xs text-rose-100 mt-0.5">
                    {runningClass.classId} ({runningClass.subjectId}) • Room: {runningClass.roomId} • {language === 'bn' ? 'নির্ধারিত সমাপ্তি ছিল:' : 'Scheduled end:'} {runningClass.scheduledEnd}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => extendClassSession(runningClass.id, 5)}
                  className="py-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  +5 {language === 'bn' ? 'মি. বাড়ান' : 'min'}
                </button>
                <button
                  onClick={() => extendClassSession(runningClass.id, 10)}
                  className="py-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  +10 {language === 'bn' ? 'মি. বাড়ান' : 'min'}
                </button>
                <button
                  onClick={() => navigate('active_class')}
                  className="py-2 px-4 rounded-xl bg-white text-rose-700 hover:bg-rose-50 font-black text-xs shadow-md transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'ক্লাস সমাপ্ত করুন' : 'End Class'}
                </button>
                <button
                  onClick={dismissClassEndAlarm}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Dismiss alert"
                >
                  <VolumeX className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QUICK OVERVIEW METRICS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Today's Classes */}
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
            {language === 'bn' ? 'আজকের ক্লাস' : "Today's Classes"}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-emerald-950 font-mono">
              {completedClassesCount}
            </span>
            <span className="text-xs text-emerald-700 font-bold font-mono">
              / {todayRoutines.length} {language === 'bn' ? 'সম্পন্ন' : 'done'}
            </span>
          </div>
        </div>

        {/* Metric 2: Today's Attendance */}
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
            {language === 'bn' ? 'আমার হাজিরা' : 'My Attendance'}
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-950">
              {todayAttendance ? (todayAttendance.checkInTime || 'উপস্থিত') : 'উপস্থিত'}
            </span>
          </div>
        </div>

        {/* Metric 3: Private Notes */}
        <div
          onClick={() => navigate('notes')}
          className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-sm hover:border-emerald-400 transition-colors cursor-pointer"
        >
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
            {language === 'bn' ? 'ব্যক্তিগত নোট' : 'Private Notes'}
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-emerald-950 font-mono">
              {myNotes.length}
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
              {language === 'bn' ? 'গোপন' : 'Private'}
            </span>
          </div>
        </div>

        {/* Metric 4: Student of Month */}
        <div
          onClick={() => navigate('evaluation')}
          className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-rose-50 border border-amber-200 shadow-sm hover:border-amber-400 transition-colors cursor-pointer"
        >
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>{language === 'bn' ? 'সেরা শিক্ষার্থী' : 'Student of Month'}</span>
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs font-black text-emerald-950 truncate max-w-[120px]">
              {recentSOM ? recentSOM.studentName : 'চলমান মূল্যায়ন'}
            </span>
            <span className="text-[10px] text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full font-bold">
              {language === 'bn' ? 'রেজাল্ট' : 'View'}
            </span>
          </div>
        </div>
      </div>

      {/* ACTIVE CLASS BANNER OR NEXT CLASS HERO CARD */}
      {runningClass ? (
        <section className="relative overflow-hidden rounded-3xl bg-rose-50 border-2 border-rose-500 p-6 sm:p-7 shadow-lg">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-600 text-white text-xs font-bold shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span>{language === 'bn' ? 'লাইভ ক্লাস চলছে' : 'LIVE CLASS RUNNING'}</span>
            </div>
            <span className="text-xs text-rose-950 font-mono">
              {language === 'bn' ? 'রুম নম্বর:' : 'Room:'} <strong className="text-rose-950">{runningClass.roomId}</strong>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase text-rose-700 tracking-wider">
                {runningClass.classId} {runningClass.section ? `(${runningClass.section})` : ''}
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-rose-950 mt-1">
                {runningClass.subjectId}
              </h2>
              <p className="text-xs text-rose-800 mt-1">
                {language === 'bn' ? 'শুরুর সময়:' : 'Started at:'} <span className="text-rose-950 font-mono font-bold">{runningClass.actualStart}</span> • {language === 'bn' ? 'নির্ধারিত শেষ:' : 'End:'} <span className="font-mono font-bold text-rose-950">{runningClass.scheduledEnd}</span>
              </p>
            </div>

            {/* Direct Active Class Controller */}
            <div className="sm:max-w-xs w-full">
              <button
                id="btn-active-class-enter"
                onClick={() => navigate('active_class')}
                className="w-full py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Radio className="w-4 h-4" />
                <span>{language === 'bn' ? 'লাইভ ক্লাসরুম টাইমার খুলুন' : 'Open Active Class Timer'}</span>
              </button>
            </div>
          </div>
        </section>
      ) : nextClassData.routine ? (
        /* HERO CARD: NEXT CLASS WITH GIANT "START & ATTEND" BUTTON IN RUBY RED */
        <section className="relative overflow-hidden rounded-3xl bg-white border-2 border-emerald-600 p-6 sm:p-8 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold tracking-wider uppercase">
              <Zap className="w-3.5 h-3.5 text-rose-600" />
              <span>{language === 'bn' ? 'পরবর্তী ক্লাস' : 'NEXT CLASS'}</span>
            </span>

            <span className="text-xs font-medium font-mono">
              {nextClassData.minutesUntil > 0 ? (
                <span className="text-rose-600 font-bold">
                  {language === 'bn' ? `~${nextClassData.minutesUntil} মিনিটের মধ্যে শুরু` : `Starts in ~${nextClassData.minutesUntil} min`}
                </span>
              ) : (
                <span className="text-emerald-700 font-bold">{language === 'bn' ? 'শুরুর জন্য প্রস্তুত' : 'Ready to start'}</span>
              )}
            </span>
          </div>

          {/* Class Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs font-bold uppercase text-emerald-700 tracking-wider">
                {nextClassData.routine.classId} {nextClassData.routine.section ? `• ${nextClassData.routine.section}` : ''}
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-emerald-950 tracking-tight mt-1">
                {nextClassData.routine.subjectId}
              </h2>
            </div>

            <div className="flex flex-col sm:items-end justify-center">
              <div className="text-sm font-bold text-emerald-900">
                {nextClassData.routine.roomId}
              </div>
              <div className="text-xs text-rose-600 font-mono font-bold mt-0.5">
                {nextClassData.routine.startTime} – {nextClassData.routine.endTime}
              </div>
            </div>
          </div>

          {/* THE DOMINANT ONE-TAP BUTTON: START & ATTEND IN RUBY RED */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              id="btn-hero-start-attend"
              onClick={() => handleStartClass(nextClassData.routine!.id)}
              disabled={isStarting}
              className="flex-1 py-4 sm:py-5 px-8 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-black text-lg sm:text-xl tracking-wide shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <Play className="w-6 h-6 fill-white" />
              <span>
                {isStarting
                  ? (language === 'bn' ? 'ক্লাস শুরু হচ্ছে...' : 'Starting Session...')
                  : (language === 'bn' ? 'ক্লাস শুরু ও হাজিরা দিন' : 'START & ATTEND')}
              </span>
            </button>

            {/* Quick QR Scan alternative */}
            <button
              id="btn-hero-scan-qr"
              onClick={() => setShowQRScanner(true)}
              className="py-4 px-5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              title={language === 'bn' ? 'শ্রেণিকক্ষের কিউআর কোড স্ক্যান করুন' : 'Scan Classroom QR Code'}
            >
              <QrCode className="w-5 h-5 text-rose-300" />
              <span className="hidden sm:inline">{language === 'bn' ? 'রুম কিউআর স্ক্যান' : 'Scan Classroom QR'}</span>
            </button>
          </div>
        </section>
      ) : (
        /* NO ACTIVE CLASS FALLBACK */
        <section className="rounded-3xl bg-white border border-emerald-200 p-8 text-center shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-emerald-950">
            {language === 'bn' ? 'এই মুহূর্তে কোনো ক্লাস নির্ধারিত নেই' : 'No active class right now'}
          </h3>
          <p className="text-xs text-emerald-700 mt-1 max-w-sm mx-auto">
            {language === 'bn'
              ? 'আজকের এই পিরিয়ডে আপনার কোনো নির্ধারিত ক্লাস নেই।'
              : 'You have no immediate upcoming classes scheduled for this period today.'}
          </p>
          <div className="mt-4">
            <button
              id="btn-no-class-open-routine"
              onClick={() => navigate('routine')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-xs font-bold text-white shadow-sm transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-rose-300" />
              <span>{language === 'bn' ? 'সম্পূর্ণ সাপ্তাহিক রুটিন দেখুন' : 'View Full Weekly Routine'}</span>
            </button>
          </div>
        </section>
      )}

      {/* DEDICATED SPOTLIGHT: STUDENT OF THE MONTH & WEEKLY EVALUATION (User Request 4) */}
      <section className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5 max-w-lg">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                <span>{language === 'bn' ? 'স্টুডেন্ট অফ দ্যা মান্থ প্রোগ্রাম' : 'Student of the Month Program'}</span>
              </span>
              <span className="text-xs text-emerald-300 font-mono">
                {currentMonthName} 2025
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white">
              {language === 'bn'
                ? 'শিক্ষার্থীদের সাপ্তাহিক সিটি মার্কস ও রিপোর্ট দিন'
                : 'Submit Weekly CT Marks & Student Reports'}
            </h3>

            <p className="text-xs text-emerald-100/90 leading-relaxed">
              {language === 'bn'
                ? 'প্রতিটি ক্লাসের ক্লাস টিচার শিক্ষার্থীদের সাপ্তাহিক মূল্যায়ন, সিটি পরীক্ষার নম্বর ও আচরণ রিপোর্ট প্রদান করুন। এর ভিত্তিতে প্রতি মাসে সেরা শিক্ষার্থী নির্বাচিত হবে।'
                : 'Enter weekly CT exam scores, behavior ratings, and teacher feedback to automatically nominate the monthly best student.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              onClick={() => navigate('evaluation')}
              className="py-3 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-emerald-950" />
              <span>{language === 'bn' ? 'মূল্যায়ন শুরু করুন' : 'Enter Evaluation'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* DASHBOARD QUICK SHORTCUTS (6-GRID) */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
          {language === 'bn' ? 'দ্রুত কাজের শর্টকাট' : 'Quick Actions'}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Scan QR */}
          <button
            id="btn-shortcut-scan-qr"
            onClick={() => setShowQRScanner(true)}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white hover:bg-emerald-50/60 active:scale-[0.97] border border-emerald-200 text-center transition-all hover:border-emerald-400 group cursor-pointer shadow-sm"
          >
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 group-hover:scale-110 transition-transform mb-1.5">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-950">{language === 'bn' ? 'রুম কিউআর' : 'Scan Room QR'}</span>
            <span className="text-[10px] text-emerald-700 mt-0.5">{language === 'bn' ? 'এক ক্লিকে হাজিরা' : 'One-scan attend'}</span>
          </button>

          {/* 2. Student Evaluation & SOM */}
          <button
            id="btn-shortcut-evaluation"
            onClick={() => navigate('evaluation')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white hover:bg-emerald-50/60 active:scale-[0.97] border border-amber-300 text-center transition-all hover:border-amber-500 group cursor-pointer shadow-sm"
          >
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 group-hover:scale-110 transition-transform mb-1.5">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-950">{language === 'bn' ? 'ছাত্র মূল্যায়ন' : 'Evaluation'}</span>
            <span className="text-[10px] text-amber-700 font-bold mt-0.5">{language === 'bn' ? 'সেরা ছাত্র ও সিটি' : 'CT & SOM'}</span>
          </button>

          {/* 3. My Routine */}
          <button
            id="btn-shortcut-routine"
            onClick={() => navigate('routine')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white hover:bg-emerald-50/60 active:scale-[0.97] border border-emerald-200 text-center transition-all hover:border-emerald-400 group cursor-pointer shadow-sm"
          >
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 group-hover:scale-110 transition-transform mb-1.5">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-950">{language === 'bn' ? 'আমার রুটিন' : 'My Routine'}</span>
            <span className="text-[10px] text-emerald-700 mt-0.5">{language === 'bn' ? 'সাপ্তাহিক সূচি' : 'Timetable'}</span>
          </button>

          {/* 4. My Private Notes (Strict privacy + Trash) */}
          <button
            id="btn-shortcut-notes"
            onClick={() => navigate('notes')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white hover:bg-emerald-50/60 active:scale-[0.97] border border-emerald-200 text-center transition-all hover:border-emerald-400 group relative cursor-pointer shadow-sm"
          >
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 group-hover:scale-110 transition-transform mb-1.5">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-950">{language === 'bn' ? 'ব্যক্তিগত নোট' : 'My Notes'}</span>
            <span className="text-[10px] text-rose-600 font-semibold mt-0.5">{language === 'bn' ? 'রিসাইকেল বিন সহ' : 'With Trash'}</span>
          </button>

          {/* 5. Quick Report to Admin */}
          <button
            id="btn-shortcut-reports"
            onClick={() => navigate('reports')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white hover:bg-emerald-50/60 active:scale-[0.97] border border-emerald-200 text-center transition-all hover:border-emerald-400 group cursor-pointer shadow-sm"
          >
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 group-hover:scale-110 transition-transform mb-1.5">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-950">{language === 'bn' ? 'এডমিন রিপোর্ট' : 'Admin Report'}</span>
            <span className="text-[10px] text-emerald-700 mt-0.5">{language === 'bn' ? 'প্রতিবেদন পাঠান' : 'File Report'}</span>
          </button>

          {/* 6. Leave Request */}
          <button
            id="btn-shortcut-leaves"
            onClick={() => navigate('leaves')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white hover:bg-emerald-50/60 active:scale-[0.97] border border-emerald-200 text-center transition-all hover:border-emerald-400 group cursor-pointer shadow-sm"
          >
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 group-hover:scale-110 transition-transform mb-1.5">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-950">{language === 'bn' ? 'ছুটির আবেদন' : 'Leave Request'}</span>
            <span className="text-[10px] text-emerald-700 mt-0.5">{language === 'bn' ? 'অনলাইন ছুটি' : 'Apply Online'}</span>
          </button>
        </div>
      </section>

      {/* TODAY'S ROUTINE TIMELINE */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            {language === 'bn' ? 'আজকের ক্লাস তালিকা' : "Today's Scheduled Classes"} ({todayRoutines.length})
          </h3>
          <button
            id="btn-routine-full-schedule"
            onClick={() => navigate('routine')}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
          >
            <span>{language === 'bn' ? 'সকল রুটিন' : 'Full Schedule'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {todayRoutines.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-emerald-200 text-center text-xs text-emerald-700 shadow-sm">
            {language === 'bn' ? 'আজকে কোনো ক্লাস নির্ধারিত নেই।' : 'No classes scheduled for today. Enjoy your day!'}
          </div>
        ) : (
          <div className="space-y-2.5">
            {todayRoutines.map(routine => {
              // Check if session for this routine happened or is active today
              const session = classSessions.find(
                s => s.routineId === routine.id && s.date === new Date().toISOString().split('T')[0]
              );

              let statusLabel = language === 'bn' ? 'আসন্ন' : 'Upcoming';
              let statusStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';

              if (session?.status === 'RUNNING') {
                statusLabel = language === 'bn' ? 'চলমান' : 'Running';
                statusStyle = 'bg-rose-600 text-white border-rose-600 font-bold';
              } else if (session?.status === 'COMPLETED') {
                statusLabel = language === 'bn' ? 'সম্পন্ন' : 'Completed';
                statusStyle = 'bg-emerald-100 text-emerald-800 border-emerald-200 line-through';
              } else if (routine.substituteTeacherId === currentUser.id) {
                statusLabel = language === 'bn' ? 'সাবস্টিটিউট' : 'Substitute';
                statusStyle = 'bg-rose-50 text-rose-700 border-rose-200';
              }

              return (
                <div
                  key={routine.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white border border-emerald-200 hover:border-emerald-400 shadow-sm transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-mono font-bold text-rose-600 w-12 text-left shrink-0">
                      {routine.startTime}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-950 text-sm">
                          {routine.classId} • {routine.subjectId}
                        </span>
                        {routine.section && (
                          <span className="text-[11px] text-emerald-700">({routine.section})</span>
                        )}
                      </div>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        {routine.roomId} • {routine.startTime} – {routine.endTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusStyle}`}>
                      {statusLabel}
                    </span>

                    {session?.status !== 'RUNNING' && session?.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleStartClass(routine.id)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 transition-all text-xs font-medium cursor-pointer"
                        title={language === 'bn' ? 'এই ক্লাসটি শুরু করুন' : 'Start this class'}
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScannerModal
          onClose={() => setShowQRScanner(false)}
          onSuccess={() => {
            setShowQRScanner(false);
            navigate('active_class');
          }}
        />
      )}
    </div>
  );
};
