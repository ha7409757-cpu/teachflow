/**
 * TeachFlow Admin Analytics & Data Export
 * School performance indicators, class completion rates, teacher workloads,
 * and comprehensive CSV export engine (Strictly excluding private notes).
 */

import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  FileSpreadsheet,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { exportToCsv } from '../../services/storage';

export const AdminAnalytics: React.FC = () => {
  const { allUsers } = useAuth();
  const {
    routines,
    classSessions,
    attendanceRecords,
    adminReports,
    settings,
    language
  } = useApp();

  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const teachers = allUsers.filter(u => u.role === 'TEACHER');
  const employees = allUsers.filter(u => u.role === 'EMPLOYEE');

  // Overall calculations
  const totalScheduledClasses = routines.length;
  const completedSessions = classSessions.filter(s => s.status === 'COMPLETED');
  const completionRate = totalScheduledClasses > 0
    ? Math.min(100, Math.round((completedSessions.length / Math.max(1, totalScheduledClasses)) * 100))
    : 100;

  const totalPresentLogs = attendanceRecords.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
  const totalLogs = attendanceRecords.length;
  const overallAttendanceRate = totalLogs > 0 ? Math.round((totalPresentLogs / totalLogs) * 100) : 94;

  // Teacher Workload Breakdown
  const teacherWorkloads = teachers.map(t => {
    const weeklyPeriods = routines.filter(r => r.teacherId === t.id).length;
    const completedCount = classSessions.filter(s => s.teacherId === t.id && s.status === 'COMPLETED').length;
    const attCount = attendanceRecords.filter(a => a.userId === t.id && (a.status === 'PRESENT' || a.status === 'LATE')).length;

    return {
      teacher: t,
      weeklyPeriods,
      completedCount,
      attCount
    };
  });

  // Export handlers
  const handleExportTeachers = () => {
    const headers = ['ID', 'Name', 'Email', 'Role', 'Designation', 'Department', 'Phone', 'Status'];
    const rows = teachers.map(t => [
      t.employeeId,
      t.name,
      t.email,
      t.role,
      t.designation || '',
      t.department || '',
      t.phone || '',
      t.status
    ]);
    exportToCsv('teachflow-teachers.csv', headers, rows);
    showNotice(language === 'bn' ? 'শিক্ষক তালিকা এক্সপোর্ট সম্পন্ন হয়েছে।' : 'Teachers CSV exported.');
  };

  const handleExportRoutine = () => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const headers = ['Day', 'Start Time', 'End Time', 'Class', 'Section', 'Subject', 'Room', 'Teacher', 'Substitute'];
    const rows = routines.map(r => [
      dayNames[r.dayOfWeek],
      r.startTime,
      r.endTime,
      r.classId,
      r.section || '',
      r.subjectId,
      r.roomId,
      r.teacherName,
      r.substituteTeacherName || ''
    ]);
    exportToCsv('teachflow-routine.csv', headers, rows);
    showNotice(language === 'bn' ? 'রুটিন এক্সপোর্ট সম্পন্ন হয়েছে।' : 'Class Routine CSV exported.');
  };

  const handleExportAttendance = () => {
    const headers = ['Date', 'User Name', 'Role', 'Employee ID', 'Status', 'Check In', 'Check Out', 'Working Hours'];
    const rows = attendanceRecords.map(a => {
      const u = allUsers.find(user => user.id === a.userId);
      return [
        a.date,
        u?.name || 'Staff',
        u?.role || '',
        u?.employeeId || '',
        a.status,
        a.checkInTime || '',
        a.checkOutTime || '',
        a.workingHours?.toString() || ''
      ];
    });
    exportToCsv('teachflow-attendance.csv', headers, rows);
    showNotice(language === 'bn' ? 'হাজিরা রিপোর্ট এক্সপোর্ট সম্পন্ন হয়েছে।' : 'Staff Attendance CSV exported.');
  };

  const handleExportSessions = () => {
    const headers = ['Date', 'Class', 'Section', 'Subject', 'Room', 'Teacher', 'Scheduled', 'Actual Start', 'Actual End', 'Status', 'Duration (min)'];
    const rows = classSessions.map(s => [
      s.date,
      s.classId,
      s.section || '',
      s.subjectId,
      s.roomId,
      s.teacherName,
      `${s.scheduledStart} - ${s.scheduledEnd}`,
      s.actualStart || '',
      s.actualEnd || '',
      s.status,
      s.durationMinutes?.toString() || ''
    ]);
    exportToCsv('teachflow-class-sessions.csv', headers, rows);
    showNotice(language === 'bn' ? 'ক্লাস সেশন লগ এক্সপোর্ট সম্পন্ন হয়েছে।' : 'Class Sessions log exported.');
  };

  const handleExportReports = () => {
    const headers = ['Date', 'Title', 'Category', 'Teacher', 'Student', 'Class', 'Priority', 'Status', 'Feedback'];
    const rows = adminReports.map(r => [
      r.submittedAt,
      r.title,
      r.reportType,
      r.teacherName,
      r.studentName || '',
      r.className || '',
      r.priority,
      r.status,
      r.adminFeedback || ''
    ]);
    exportToCsv('teachflow-admin-reports.csv', headers, rows);
    showNotice(language === 'bn' ? 'রিপোর্ট এক্সপোর্ট সম্পন্ন হয়েছে।' : 'Staff Reports CSV exported.');
  };

  const showNotice = (msg: string) => {
    setExportNotice(msg);
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-emerald-950 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-rose-600" />
            <span>{language === 'bn' ? 'বিদ্যালয় পারফরম্যান্স ও ডাটা এক্সপোর্ট' : 'School Performance Analytics & Data Export'}</span>
          </h1>
          <p className="text-xs text-emerald-700 mt-0.5">
            {language === 'bn' ? 'প্রতিষ্ঠানিক পারফরম্যান্স ইন্ডিকেটর, ক্লাস সম্পন্ন হওয়ার হার এবং সিএসভি ডাউনলোড।' : 'Operational metrics, class delivery rates, faculty workloads, and CSV downloads.'}
          </p>
        </div>
      </div>

      {/* Export notification popup */}
      {exportNotice && (
        <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in zoom-in duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* STATS TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-emerald-700 font-bold mb-2">
            <span>{language === 'bn' ? 'মোট উপস্থিতি হার' : 'Overall Attendance Rate'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-700">{overallAttendanceRate}%</div>
          <p className="text-[11px] text-emerald-600 mt-1 opacity-80">{language === 'bn' ? 'শিক্ষক ও কর্মচারী মিলিয়ে' : 'Faculty & staff combined'}</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-emerald-700 font-bold mb-2">
            <span>{language === 'bn' ? 'ক্লাস ডেলিভারি হার' : 'Class Delivery Rate'}</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-black text-rose-600">{completionRate}%</div>
          <p className="text-[11px] text-emerald-600 mt-1 opacity-80">{language === 'bn' ? 'নির্ধারিত সময়ে সম্পন্ন' : 'Conducted on schedule'}</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-emerald-700 font-bold mb-2">
            <span>{language === 'bn' ? 'সাপ্তাহিক পিরিয়ড' : 'Weekly Master Periods'}</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-emerald-950">{totalScheduledClasses}</div>
          <p className="text-[11px] text-emerald-600 mt-1 opacity-80">{language === 'bn' ? 'মোট ক্লাস সংখ্যা' : 'Total periods per week'}</p>
        </div>
      </div>

      {/* CSV EXPORT CENTER */}
      <section className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-emerald-950 flex items-center gap-2 uppercase tracking-tight">
              <Download className="w-4 h-4 text-rose-600" />
              <span>{language === 'bn' ? 'ডাটা এক্সপোর্ট ও সংরক্ষণ (CSV)' : 'Data Export & Archiving (CSV)'}</span>
            </h3>
            <p className="text-xs text-emerald-700 mt-1">
              {language === 'bn' ? 'অফিশিয়াল রেকর্ড বা অফলাইন বিশ্লেষণের জন্য স্প্রেডশিট ডাউনলোড করুন।' : 'Download clean spreadsheet-ready records for official records or offline analysis.'}
            </p>
          </div>
          <span className="hidden sm:flex text-[10px] font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 items-center gap-1.5 shadow-inner">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'গোপনীয়তা সুরক্ষিত' : 'Privacy Compliant'}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          <button
            onClick={handleExportTeachers}
            className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-xs font-black text-emerald-950 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-rose-600 group-hover:scale-110 transition-transform" />
              <div>
                <span className="block">{language === 'bn' ? 'শিক্ষক ডিরেক্টরি' : 'Faculty Directory'}</span>
                <span className="text-[10px] text-emerald-700 font-bold opacity-70">{language === 'bn' ? 'সকল শিক্ষক ও বিভাগ' : 'All teachers & depts'}</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-emerald-400 group-hover:text-rose-600" />
          </button>

          <button
            onClick={handleExportRoutine}
            className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-xs font-black text-emerald-950 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
              <div>
                <span className="block">{language === 'bn' ? 'মাস্টার রুটিন' : 'Master Routine'}</span>
                <span className="text-[10px] text-emerald-700 font-bold opacity-70">{language === 'bn' ? 'সাপ্তাহিক ক্লাস শিডিউল' : 'Weekly schedule'}</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-emerald-400 group-hover:text-rose-600" />
          </button>

          <button
            onClick={handleExportAttendance}
            className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-xs font-black text-emerald-950 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
              <div>
                <span className="block">{language === 'bn' ? 'স্টাফ হাজিরা লগ' : 'Staff Attendance Logs'}</span>
                <span className="text-[10px] text-emerald-700 font-bold opacity-70">{language === 'bn' ? 'চেক-ইন ও কাজের সময়' : 'Daily check-ins'}</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-emerald-400 group-hover:text-rose-600" />
          </button>

          <button
            onClick={handleExportSessions}
            className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-xs font-black text-emerald-950 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-cyan-600 group-hover:scale-110 transition-transform" />
              <div>
                <span className="block">{language === 'bn' ? 'ক্লাস সেশন রেকর্ড' : 'Class Session Records'}</span>
                <span className="text-[10px] text-emerald-700 font-bold opacity-70">{language === 'bn' ? 'শুরুর সময় ও ডিউরেশন' : 'Historical sessions'}</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-emerald-400 group-hover:text-rose-600" />
          </button>

          <button
            onClick={handleExportReports}
            className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-xs font-black text-emerald-950 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
              <div>
                <span className="block">{language === 'bn' ? 'অফিশিয়াল রিপোর্ট' : 'Official Staff Reports'}</span>
                <span className="text-[10px] text-emerald-700 font-bold opacity-70">{language === 'bn' ? 'সকল টিচার রিপোর্ট' : 'Submissions & review'}</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-emerald-400 group-hover:text-rose-600" />
          </button>
        </div>
      </section>

      {/* TEACHER WORKLOAD DISTRIBUTION TABLE */}
      <section className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-sm space-y-5">
        <h3 className="text-sm font-black text-emerald-950 flex items-center gap-2 uppercase tracking-tight">
          <Users className="w-4 h-4 text-rose-600" />
          <span>{language === 'bn' ? 'শিক্ষক কাজের চাপ ও রুটিন ডিস্ট্রিবিউশন' : 'Teacher Workload & Routine Distribution'}</span>
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-emerald-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-emerald-50 text-emerald-800 text-[10px] uppercase font-black tracking-wider">
              <tr>
                <th className="py-3.5 px-4">{language === 'bn' ? 'শিক্ষক' : 'Teacher'}</th>
                <th className="py-3.5 px-4">{language === 'bn' ? 'বিভাগ' : 'Department'}</th>
                <th className="py-3.5 px-4">{language === 'bn' ? 'সাপ্তাহিক পিরিয়ড' : 'Weekly Periods'}</th>
                <th className="py-3.5 px-4">{language === 'bn' ? 'সম্পন্ন সেশন' : 'Sessions Done'}</th>
                <th className="py-3.5 px-4">{language === 'bn' ? 'হাজিরা দিন' : 'Attendance'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {teacherWorkloads.map(({ teacher, weeklyPeriods, completedCount, attCount }) => (
                <tr key={teacher.id} className="hover:bg-emerald-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <span className="font-black text-emerald-950 block leading-tight">{teacher.name}</span>
                    <span className="text-[10px] text-emerald-600 font-mono font-bold">{teacher.employeeId}</span>
                  </td>
                  <td className="py-4 px-4 text-emerald-700 font-bold">{teacher.department}</td>
                  <td className="py-4 px-4 font-black text-emerald-950">{weeklyPeriods} {language === 'bn' ? 'টি' : 'periods'}</td>
                  <td className="py-4 px-4 text-emerald-800 font-bold">{completedCount}</td>
                  <td className="py-4 px-4 text-rose-600 font-black">{attCount} {language === 'bn' ? 'দিন' : 'days'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
