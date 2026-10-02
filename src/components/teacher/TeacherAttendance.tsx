/**
 * TeachFlow Attendance Management System
 * Features:
 * 1. Teacher & Staff automated / manual attendance tracking with check-in/out & hours
 * 2. Student Daily Attendance Ledger (হাজিরা খাতা) supporting Play through Class 10
 *    with Present, Absent, Late statuses, remarks, "Mark All Present", and persistent storage.
 */

import React, { useState, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  LogIn,
  LogOut,
  User,
  Users,
  Check,
  X,
  Save,
  ChevronDown,
  Sparkles,
  Search,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { ALL_CLASSES, StudentDailyAttendance } from '../../types';
import { getTodayDateString } from '../../services/storage';

export const TeacherAttendance: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    attendanceRecords,
    getTodayAttendanceForUser,
    checkInStaff,
    checkOutStaff,
    language,
    students,
    getStudentDailyAttendance,
    saveStudentDailyAttendance
  } = useApp();

  // Active view tab
  const [activeTab, setActiveTab] = useState<'STAFF' | 'STUDENT'>('STAFF');

  // Student Attendance Form State
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [selectedClass, setSelectedClass] = useState<string>('Class 5');
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Student status map in current view: studentId -> { status: 'PRESENT' | 'ABSENT' | 'LATE', remarks: string }
  const [studentStatuses, setStudentStatuses] = useState<Record<string, { status: 'PRESENT' | 'ABSENT' | 'LATE'; remarks: string }>>({});

  // Filter students for the selected class & section
  const enrolledStudents = useMemo(() => {
    return (students || [])
      .filter(s => s.classId === selectedClass && s.section === selectedSection && s.status === 'ACTIVE')
      .sort((a, b) => a.roll - b.roll);
  }, [students, selectedClass, selectedSection]);

  // Load existing student attendance records whenever class, section, or date changes
  React.useEffect(() => {
    const existing = getStudentDailyAttendance(selectedClass, selectedSection, selectedDate);
    const map: Record<string, { status: 'PRESENT' | 'ABSENT' | 'LATE'; remarks: string }> = {};

    // Initialize with existing saved records
    existing.forEach(r => {
      map[r.studentId] = {
        status: r.status,
        remarks: r.remarks || ''
      };
    });

    // For students without saved records yet on this date, default to 'PRESENT'
    enrolledStudents.forEach(std => {
      if (!map[std.id]) {
        map[std.id] = {
          status: 'PRESENT',
          remarks: ''
        };
      }
    });

    setStudentStatuses(map);
    setSaveSuccessMsg(null);
  }, [selectedClass, selectedSection, selectedDate, enrolledStudents.length]);

  if (!currentUser) return null;

  // Staff attendance calculations
  const todayAtt = getTodayAttendanceForUser(currentUser.id);
  const myRecords = (attendanceRecords || [])
    .filter(a => a.userId === currentUser.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const presentCount = myRecords.filter(r => r.status === 'PRESENT').length;
  const lateCount = myRecords.filter(r => r.status === 'LATE').length;
  const leaveCount = myRecords.filter(r => r.status === 'LEAVE').length;

  // Student ledger metrics
  const totalEnrolled = enrolledStudents.length;
  const studentPresentCount = enrolledStudents.filter(s => studentStatuses[s.id]?.status === 'PRESENT').length;
  const studentAbsentCount = enrolledStudents.filter(s => studentStatuses[s.id]?.status === 'ABSENT').length;
  const studentLateCount = enrolledStudents.filter(s => studentStatuses[s.id]?.status === 'LATE').length;
  const studentAttendanceRate = totalEnrolled > 0 ? Math.round((studentPresentCount / totalEnrolled) * 100) : 0;

  // Handler: Set single student status
  const handleSetStatus = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setStudentStatuses(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  // Handler: Set single student remark
  const handleSetRemark = (studentId: string, remarks: string) => {
    setStudentStatuses(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  // Handler: Mark all students present
  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: 'PRESENT' | 'ABSENT' | 'LATE'; remarks: string }> = {};
    enrolledStudents.forEach(s => {
      updated[s.id] = {
        status: 'PRESENT',
        remarks: studentStatuses[s.id]?.remarks || ''
      };
    });
    setStudentStatuses(updated);
  };

  // Handler: Save attendance
  const handleSaveStudentAttendance = () => {
    const records: StudentDailyAttendance[] = enrolledStudents.map(std => ({
      id: `att_${std.id}_${selectedDate}`,
      studentId: std.id,
      studentName: std.name,
      roll: std.roll,
      classId: selectedClass,
      section: selectedSection,
      date: selectedDate,
      status: studentStatuses[std.id]?.status || 'PRESENT',
      remarks: studentStatuses[std.id]?.remarks || '',
      recordedBy: currentUser.name,
      recordedAt: new Date().toISOString()
    }));

    saveStudentDailyAttendance(records);
    setSaveSuccessMsg(
      language === 'bn'
        ? `${selectedClass} (${selectedSection}) এর ${records.length} জন শিক্ষার্থীর আজকের হাজিরা সফলভাবে সংরক্ষিত হয়েছে।`
        : `Successfully saved attendance for ${records.length} students in ${selectedClass}-${selectedSection}.`
    );

    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header with Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-emerald-950 tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-rose-600" />
            <span>{language === 'bn' ? 'হাজিরা ও উপস্থিতি ব্যবস্থাপনা' : 'Attendance & Work Logs'}</span>
          </h1>
          <p className="text-xs text-emerald-700 mt-0.5">
            {language === 'bn'
              ? 'শিক্ষক ও কর্মচারী হাজিরা এবং প্লে থেকে ১০ম শ্রেণির শিক্ষার্থী দৈনিক হাজিরা খাতা'
              : 'Staff attendance records & student daily attendance ledger (Play - Class 10)'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-emerald-100/70 p-1 rounded-2xl border border-emerald-200 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('STAFF')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'STAFF'
                ? 'bg-white text-emerald-950 shadow-sm border border-emerald-200'
                : 'text-emerald-800 hover:text-emerald-950'
            }`}
          >
            <User className="w-4 h-4 text-rose-600" />
            <span>{language === 'bn' ? 'আমার হাজিরা' : 'My Attendance'}</span>
          </button>
          <button
            onClick={() => setActiveTab('STUDENT')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'STUDENT'
                ? 'bg-white text-emerald-950 shadow-sm border border-emerald-200'
                : 'text-emerald-800 hover:text-emerald-950'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-700" />
            <span>{language === 'bn' ? 'শিক্ষার্থী হাজিরা খাতা' : 'Student Ledger'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: TEACHER & STAFF ATTENDANCE */}
      {activeTab === 'STAFF' && (
        <div className="space-y-6">
          {/* TODAY'S ATTENDANCE STATUS CARD */}
          <div className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  {language === 'bn' ? 'আজকের হাজিরার অবস্থা' : "Today's Attendance Status"}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {todayAtt?.status === 'PRESENT' ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      <span className="text-2xl font-black text-emerald-800">
                        {language === 'bn' ? 'উপস্থিত (PRESENT)' : 'PRESENT'}
                      </span>
                    </>
                  ) : todayAtt?.status === 'LATE' ? (
                    <>
                      <AlertCircle className="w-6 h-6 text-amber-600" />
                      <span className="text-2xl font-black text-amber-700">
                        {language === 'bn' ? 'বিলম্বিত (LATE)' : 'MARKED LATE'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="w-3 h-3 rounded-full bg-rose-600 animate-pulse" />
                      <span className="text-2xl font-black text-rose-700">
                        {language === 'bn' ? 'এখনও হাজিরা দেওয়া হয়নি' : 'NOT CHECKED IN'}
                      </span>
                    </>
                  )}
                </div>

                <p className="text-xs text-emerald-700 mt-2">
                  {todayAtt?.firstClassSessionId ? (
                    <span className="text-emerald-800 font-medium">
                      {language === 'bn'
                        ? `✓ প্রথম ক্লাস শুরু করার সাথে সাথে ${todayAtt.checkInTime} টায় স্বয়ংক্রিয়ভাবে উপস্থিত চিহ্নিত হয়েছে।`
                        : `✓ Automatically marked Present upon starting your first class today at ${todayAtt.checkInTime}.`}
                    </span>
                  ) : todayAtt?.checkInTime ? (
                    <span>
                      {language === 'bn' ? `চেক-ইন সময়: ${todayAtt.checkInTime}` : `Checked in at ${todayAtt.checkInTime}`}
                    </span>
                  ) : (
                    <span>
                      {language === 'bn'
                        ? 'আপনার প্রথম ক্লাসে "ক্লাস শুরু ও হাজিরা দিন" বাটনে চাপ দিলে স্বয়ংক্রিয়ভাবে হাজিরা সম্পন্ন হবে।'
                        : 'Tap Start & Attend on your next class to automatically mark attendance.'}
                    </span>
                  )}
                </p>
              </div>

              {/* Manual Check-in / Check-out controls */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {!todayAtt?.checkInTime && (
                  <button
                    onClick={checkInStaff}
                    className="flex items-center gap-2 py-3 px-5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{language === 'bn' ? 'এখনই চেক-ইন করুন' : 'Check In Now'}</span>
                  </button>
                )}
                {todayAtt?.checkInTime && !todayAtt?.checkOutTime && (
                  <button
                    onClick={checkOutStaff}
                    className="flex items-center gap-2 py-3 px-5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-300 transition-all cursor-pointer shadow-sm"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>{language === 'bn' ? 'চেক-আউট করুন' : 'Check Out'}</span>
                  </button>
                )}
                {todayAtt?.checkOutTime && (
                  <span className="text-xs text-emerald-800 font-mono font-bold">
                    {language === 'bn'
                      ? `চেক-আউট: ${todayAtt.checkOutTime} (${todayAtt.workingHours} ঘণ্টা)`
                      : `Checked out at: ${todayAtt.checkOutTime} (${todayAtt.workingHours} hrs)`}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SUMMARY STATS TILES */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-emerald-200 text-center shadow-sm">
              <span className="text-xs text-emerald-700 font-medium block">
                {language === 'bn' ? 'মোট উপস্থিতি' : 'Total Present'}
              </span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">
                {presentCount}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-emerald-200 text-center shadow-sm">
              <span className="text-xs text-emerald-700 font-medium block">
                {language === 'bn' ? 'বিলম্বিত দিন' : 'Late Marks'}
              </span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">
                {lateCount}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-emerald-200 text-center shadow-sm">
              <span className="text-xs text-emerald-700 font-medium block">
                {language === 'bn' ? 'অনুমোদিত ছুটি' : 'Approved Leaves'}
              </span>
              <span className="text-2xl font-black text-rose-600 mt-1 block">
                {leaveCount}
              </span>
            </div>
          </div>

          {/* ATTENDANCE LOG TABLE */}
          <div className="bg-white border border-emerald-200 rounded-3xl p-6 overflow-hidden shadow-sm">
            <h3 className="text-sm font-bold text-emerald-950 mb-4">
              {language === 'bn' ? 'পূর্ববর্তী হাজিরার রেকর্ড' : 'Past Attendance Records'}
            </h3>
            {myRecords.length === 0 ? (
              <p className="text-xs text-emerald-700 text-center py-6">
                {language === 'bn' ? 'এখনও কোনো রেকর্ড পাওয়া যায়নি।' : 'No historical records logged yet.'}
              </p>
            ) : (
              <div className="divide-y divide-emerald-100">
                {myRecords.map(rec => (
                  <div key={rec.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-emerald-950 block">{rec.date}</span>
                      <span className="text-[11px] text-emerald-700">
                        {language === 'bn' ? 'প্রবেশ' : 'In'}: {rec.checkInTime || '--:--'} • {language === 'bn' ? 'প্রস্থান' : 'Out'}: {rec.checkOutTime || '--:--'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {rec.workingHours && (
                        <span className="text-emerald-800 font-mono font-medium">{rec.workingHours} hrs</span>
                      )}
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          rec.status === 'PRESENT'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {rec.status === 'PRESENT' && language === 'bn' ? 'উপস্থিত' : rec.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT DAILY ATTENDANCE LEDGER (হাজিরা খাতা) */}
      {activeTab === 'STUDENT' && (
        <div className="space-y-6">
          {/* Controls Bar: Class, Section, Date */}
          <div className="p-5 rounded-3xl bg-white border border-emerald-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Date Picker */}
                <div>
                  <label className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">
                    {language === 'bn' ? 'তারিখ' : 'Date'}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      className="px-3 py-2 text-xs rounded-xl bg-emerald-50/50 border border-emerald-200 text-emerald-950 font-bold focus:outline-none focus:border-rose-500"
                    />
                    <button
                      onClick={() => setSelectedDate(getTodayDateString())}
                      className="px-2.5 py-2 text-xs rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold cursor-pointer"
                    >
                      {language === 'bn' ? 'আজকে' : 'Today'}
                    </button>
                  </div>
                </div>

                {/* Class Selector */}
                <div>
                  <label className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">
                    {language === 'bn' ? 'শ্রেণি (Class)' : 'Class'}
                  </label>
                  <select
                    value={selectedClass}
                    onChange={e => setSelectedClass(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl bg-emerald-50/50 border border-emerald-200 text-emerald-950 font-bold focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    {ALL_CLASSES.map(cls => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Section Selector */}
                <div>
                  <label className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">
                    {language === 'bn' ? 'শাখা (Section)' : 'Section'}
                  </label>
                  <select
                    value={selectedSection}
                    onChange={e => setSelectedSection(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl bg-emerald-50/50 border border-emerald-200 text-emerald-950 font-bold focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="Science">Science</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Humanities">Humanities</option>
                  </select>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 pt-2 sm:pt-0">
                <button
                  onClick={handleMarkAllPresent}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  <CheckCheck className="w-4 h-4 text-emerald-700" />
                  <span>{language === 'bn' ? 'সবাইকে উপস্থিত করুন' : 'Mark All Present'}</span>
                </button>
                <button
                  onClick={handleSaveStudentAttendance}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>{language === 'bn' ? 'হাজিরা সংরক্ষণ করুন' : 'Save Attendance'}</span>
                </button>
              </div>
            </div>

            {/* Success message banner */}
            {saveSuccessMsg && (
              <div className="p-3 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}
          </div>

          {/* Quick Metrics Bar for Selected Class */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 text-center shadow-sm">
              <span className="text-[10px] font-bold text-emerald-700 uppercase block">
                {language === 'bn' ? 'মোট শিক্ষার্থী' : 'Enrolled'}
              </span>
              <span className="text-xl font-black text-emerald-950 mt-0.5 block">{totalEnrolled}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 text-center shadow-sm">
              <span className="text-[10px] font-bold text-emerald-700 uppercase block">
                {language === 'bn' ? 'উপস্থিত' : 'Present'}
              </span>
              <span className="text-xl font-black text-emerald-700 mt-0.5 block">{studentPresentCount}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 text-center shadow-sm">
              <span className="text-[10px] font-bold text-rose-700 uppercase block">
                {language === 'bn' ? 'অনুপস্থিত' : 'Absent'}
              </span>
              <span className="text-xl font-black text-rose-600 mt-0.5 block">{studentAbsentCount}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 text-center shadow-sm">
              <span className="text-[10px] font-bold text-amber-700 uppercase block">
                {language === 'bn' ? 'বিলম্বিত' : 'Late'}
              </span>
              <span className="text-xl font-black text-amber-600 mt-0.5 block">{studentLateCount}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 text-center shadow-sm col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                {language === 'bn' ? 'উপস্থিতির হার' : 'Rate'}
              </span>
              <span className="text-xl font-black text-emerald-800 mt-0.5 block">{studentAttendanceRate}%</span>
            </div>
          </div>

          {/* Student Roster & Ledger */}
          <div className="bg-white border border-emerald-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-emerald-950 text-sm">
                  {language === 'bn'
                    ? `${selectedClass} (${selectedSection}) শিক্ষার্থী তালিকা ও হাজিরা`
                    : `Student Roster & Attendance: ${selectedClass} (${selectedSection})`}
                </h3>
                <p className="text-[11px] text-emerald-700">
                  {language === 'bn'
                    ? 'প্রতিটি শিক্ষার্থীর উপস্থিতি বা অনুপস্থিতি নিশ্চিত করুন এবং প্রয়োজনে মন্তব্য যোগ করুন।'
                    : 'Select Present, Absent, or Late for each student and add remarks if necessary.'}
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {selectedDate}
              </span>
            </div>

            {enrolledStudents.length === 0 ? (
              <div className="p-8 text-center bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <Users className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-emerald-900">
                  {language === 'bn'
                    ? `${selectedClass} (${selectedSection}) এ কোনো শিক্ষার্থী নথিভুক্ত নেই।`
                    : `No students enrolled in ${selectedClass} (${selectedSection}).`}
                </p>
                <p className="text-[11px] text-emerald-700 mt-1">
                  {language === 'bn'
                    ? 'শিক্ষার্থী মূল্যায়ন ট্যাবে গিয়ে নতুন শিক্ষার্থী যোগ করুন।'
                    : 'You can add students from the Student Directory tab.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-emerald-100">
                {enrolledStudents.map(std => {
                  const currStatus = studentStatuses[std.id]?.status || 'PRESENT';
                  const currRemark = studentStatuses[std.id]?.remarks || '';

                  return (
                    <div
                      key={std.id}
                      className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-emerald-50/30 px-2 rounded-2xl transition-colors"
                    >
                      {/* Student Info */}
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center font-bold text-xs text-emerald-900 shrink-0">
                          {std.roll}
                        </div>
                        <div>
                          <span className="font-bold text-emerald-950 text-xs block">{std.name}</span>
                          <span className="text-[10px] text-emerald-700 font-mono">
                            {std.studentId} • Roll: {std.roll}
                          </span>
                        </div>
                      </div>

                      {/* Status Selector Pills */}
                      <div className="flex items-center gap-1.5 self-start md:self-auto">
                        <button
                          type="button"
                          onClick={() => handleSetStatus(std.id, 'PRESENT')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            currStatus === 'PRESENT'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {language === 'bn' ? 'উপস্থিত' : 'Present'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetStatus(std.id, 'ABSENT')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            currStatus === 'ABSENT'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                          }`}
                        >
                          {language === 'bn' ? 'অনুপস্থিত' : 'Absent'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetStatus(std.id, 'LATE')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            currStatus === 'LATE'
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                          }`}
                        >
                          {language === 'bn' ? 'বিলম্ব' : 'Late'}
                        </button>
                      </div>

                      {/* Optional Remark / Note */}
                      <div className="w-full md:w-56 shrink-0">
                        <input
                          type="text"
                          placeholder={language === 'bn' ? 'মন্তব্য (ঐচ্ছিক)...' : 'Remarks (optional)...'}
                          value={currRemark}
                          onChange={e => handleSetRemark(std.id, e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white border border-emerald-200 text-emerald-950 placeholder:text-emerald-600 focus:outline-none focus:border-rose-500 shadow-sm"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Save Bar */}
            {enrolledStudents.length > 0 && (
              <div className="mt-6 pt-4 border-t border-emerald-100 flex items-center justify-between">
                <span className="text-xs text-emerald-700">
                  {language === 'bn'
                    ? `মোট ${enrolledStudents.length} জন শিক্ষার্থীর তথ্য প্রস্তুত।`
                    : `Ready to submit records for ${enrolledStudents.length} students.`}
                </span>
                <button
                  onClick={handleSaveStudentAttendance}
                  className="flex items-center gap-2 py-2.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{language === 'bn' ? 'হাজিরা নিশ্চিত করুন' : 'Save Attendance Ledger'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
