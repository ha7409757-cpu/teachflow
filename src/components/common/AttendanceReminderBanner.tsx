/**
 * TeachFlow Attendance Reminder & Notification Banner
 * Triggers during official school attendance hours: 8:00 AM to 12:45 PM.
 * - Teacher View: Shows personal attendance notification & 1-tap Check-In.
 * - Admin View: Shows real-time attendance monitor of ALL teachers with quick status & manual mark action.
 */

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  LogIn,
  Users,
  ChevronDown,
  ChevronUp,
  UserCheck,
  ShieldCheck,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';

export const AttendanceReminderBanner: React.FC = () => {
  const { currentUser, allUsers } = useAuth();
  const {
    attendanceRecords,
    getTodayAttendanceForUser,
    checkInStaff,
    language,
    refreshAllData
  } = useApp();

  const [isDismissed, setIsDismissed] = useState(false);
  const [isAdminExpanded, setIsAdminExpanded] = useState(false);
  const [forceSimulateWindow, setForceSimulateWindow] = useState(true);

  if (!currentUser) return null;

  // Calculate if current time is within 8:00 AM to 12:45 PM (8:00 = 480 mins, 12:45 = 765 mins)
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isRealTimeInWindow = currentMinutes >= 480 && currentMinutes <= 765;
  const isWindowActive = isRealTimeInWindow || forceSimulateWindow;

  // Filter teachers
  const teachers = allUsers.filter(u => u.role === 'TEACHER');

  // Today's attendance for current user
  const myTodayAttendance = getTodayAttendanceForUser(currentUser.id);
  const isTeacherCheckedIn = !!myTodayAttendance?.checkInTime;

  // Admin view calculations
  const teachersWithAttendance = teachers.map(t => {
    const att = getTodayAttendanceForUser(t.id);
    return {
      teacher: t,
      attendance: att,
      isCheckedIn: !!att?.checkInTime
    };
  });

  const checkedInTeachersCount = teachersWithAttendance.filter(t => t.isCheckedIn).length;
  const pendingTeachersCount = teachers.length - checkedInTeachersCount;

  if (isDismissed) {
    return (
      <div className="bg-emerald-900/90 text-white px-4 py-1.5 flex items-center justify-between text-xs border-b border-emerald-800">
        <div className="flex items-center gap-2">
          <Bell className="w-3.5 h-3.5 text-rose-300 animate-pulse" />
          <span className="font-medium text-emerald-100">
            {language === 'bn'
              ? 'হাজিরা নোটিফিকেশন সময়: সকাল ৮:০০ – দুপুর ১২:৪৫'
              : 'Attendance Notice Active (8:00 AM - 12:45 PM)'}
          </span>
        </div>
        <button
          onClick={() => setIsDismissed(false)}
          className="text-xs font-bold text-rose-300 hover:text-white underline cursor-pointer"
        >
          {language === 'bn' ? 'নোটিফিকেশন দেখুন' : 'Show Notice'}
        </button>
      </div>
    );
  }

  // ----------------------------------------------------
  // 1. TEACHER VIEW (Strictly their own attendance notice)
  // ----------------------------------------------------
  if (currentUser.role === 'TEACHER') {
    return (
      <div className="w-full bg-gradient-to-r from-rose-900 via-emerald-950 to-emerald-900 text-white border-b-2 border-rose-500 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 sm:py-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-600/30 border border-rose-400 flex items-center justify-center shrink-0 shadow-inner">
                {isTeacherCheckedIn ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Bell className="w-5 h-5 text-rose-300 animate-bounce" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-extrabold text-[10px] tracking-wider uppercase">
                    {language === 'bn' ? 'হাজিরা সময় ৮:০০ - ১২:৪৫' : 'ATTENDANCE 8:00 - 12:45'}
                  </span>
                  <span className="text-xs text-rose-200 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{language === 'bn' ? 'সকাল ৮টা হতে দুপুর ১২টা ৪৫ মিনিট' : '8:00 AM - 12:45 PM'}</span>
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  {isTeacherCheckedIn ? (
                    language === 'bn'
                      ? `ধন্যবাদ ${currentUser.name}! আজকের হাজিরা সফলভাবে গ্রহণ করা হয়েছে (${myTodayAttendance.checkInTime})।`
                      : `Attendance Recorded for ${currentUser.name} (${myTodayAttendance.checkInTime})`
                  ) : (
                    language === 'bn'
                      ? `শ্রদ্ধেয় ${currentUser.name}, আপনার হাজিরার সময় হয়েছে! অনুগ্রহ করে এখনই হাজিরা দিন।`
                      : `Attendance Time Active: Please check in now, ${currentUser.name}!`
                  )}
                </h4>
                <p className="text-[11px] text-emerald-200/80">
                  {isTeacherCheckedIn
                    ? (language === 'bn' ? 'আপনার উপস্থিতি সিস্টেমে সংরক্ষিত আছে। প্রথম ক্লাসের সাথেও এটি স্বয়ংক্রিয়ভাবে সমন্বিত।' : 'Your attendance is safely recorded.')
                    : (language === 'bn' ? 'নির্ধারিত সময়ের মধ্যে হাজিরা সম্পন্ন করলে উপস্থিত (Present) হিসেবে গণ্য হবেন।' : 'Check in within the 8:00 AM - 12:45 PM window to be marked Present.')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {!isTeacherCheckedIn ? (
                <button
                  onClick={checkInStaff}
                  className="py-2 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold text-xs shadow-lg shadow-rose-900/50 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{language === 'bn' ? 'এখনই হাজিরা দিন' : 'Check In Now'}</span>
                </button>
              ) : (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-800/80 border border-emerald-500 text-emerald-200 font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'bn' ? 'উপস্থিত' : 'Marked Present'}</span>
                </div>
              )}

              <button
                onClick={() => setIsDismissed(true)}
                className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. ADMIN VIEW (Can monitor and see ALL teachers' attendance)
  // ----------------------------------------------------
  if (currentUser.role === 'ADMIN') {
    return (
      <div className="w-full bg-slate-900 text-white border-b-2 border-indigo-500 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 sm:py-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-extrabold text-[10px] tracking-wider uppercase">
                    {language === 'bn' ? 'অ্যাডমিন হাজিরা মনিটর' : 'ADMIN ATTENDANCE MONITOR'}
                  </span>
                  <span className="text-xs text-indigo-200 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{language === 'bn' ? 'সকাল ৮:০০ – দুপুর ১২:৪৫' : '8:00 AM - 12:45 PM'}</span>
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  {language === 'bn'
                    ? `শিক্ষক উপস্থিতি লাইভ ড্যাশবোর্ড (${checkedInTeachersCount}/${teachers.length} জন উপস্থিত)`
                    : `Live Teacher Attendance Monitoring (${checkedInTeachersCount}/${teachers.length} Present)`}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {language === 'bn'
                    ? 'প্রধান শিক্ষক হিসেবে আপনি সকল শিক্ষকের সকালের হাজিরার অবস্থা দেখতে ও নিয়ন্ত্রণ করতে পারেন।'
                    : 'As Admin, you can view and monitor attendance for all teachers in real-time.'}
                </p>
              </div>
            </div>

            {/* Admin Stats Badges & Toggle */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400">
                  {checkedInTeachersCount} {language === 'bn' ? 'উপস্থিত' : 'Present'}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-950 border border-rose-500/40 text-rose-400">
                  {pendingTeachersCount} {language === 'bn' ? 'বাকি' : 'Pending'}
                </span>
              </div>

              <button
                onClick={() => setIsAdminExpanded(!isAdminExpanded)}
                className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>{isAdminExpanded ? (language === 'bn' ? 'সংক্ষিপ্ত করুন' : 'Collapse') : (language === 'bn' ? 'সকল শিক্ষক দেখুন' : 'View All')}</span>
                {isAdminExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsDismissed(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expandable Table of ALL Teachers Attendance */}
          {isAdminExpanded && (
            <div className="mt-4 pt-4 border-t border-slate-800 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {teachersWithAttendance.map(({ teacher, attendance, isCheckedIn }) => (
                  <div
                    key={teacher.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                      isCheckedIn
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                        : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                    }`}
                  >
                    <div>
                      <span className="font-bold block text-white">{teacher.name}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {teacher.employeeId} • {teacher.department || 'General'}
                      </span>
                      <span className="text-[11px] mt-1 inline-block font-semibold">
                        {isCheckedIn
                          ? `✓ ${language === 'bn' ? 'চেক-ইন:' : 'In:'} ${attendance?.checkInTime}`
                          : (language === 'bn' ? 'হাজিরা দেননি (অনুপস্থিত)' : 'Not checked in yet')}
                      </span>
                    </div>

                    <div>
                      {isCheckedIn ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px]">
                          {language === 'bn' ? 'উপস্থিত' : 'PRESENT'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-[10px]">
                          {language === 'bn' ? 'বাকি' : 'PENDING'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};
