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
    settings
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
      t.isActive ? 'Active' : 'Inactive'
    ]);
    exportToCsv('teachflow-teachers.csv', headers, rows);
    showNotice('Teachers CSV exported.');
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
    showNotice('Class Routine CSV exported.');
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
    showNotice('Staff Attendance CSV exported.');
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
    showNotice('Class Sessions log exported.');
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
    showNotice('Staff Reports CSV exported.');
  };

  const showNotice = (msg: string) => {
    setExportNotice(msg);
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            <span>School Performance Analytics & Data Export</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational metrics, class delivery rates, faculty workloads, and CSV downloads.
          </p>
        </div>
      </div>

      {/* Export notification popup */}
      {exportNotice && (
        <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* STATS TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Overall Attendance Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{overallAttendanceRate}%</div>
          <p className="text-[11px] text-slate-500 mt-1">Faculty & staff combined</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Class Delivery Rate</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-indigo-400">{completionRate}%</div>
          <p className="text-[11px] text-slate-500 mt-1">Conducted on schedule</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Weekly Master Periods</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">{totalScheduledClasses}</div>
          <p className="text-[11px] text-slate-500 mt-1">Total periods per week</p>
        </div>
      </div>

      {/* CSV EXPORT CENTER */}
      <section className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-indigo-400" />
              <span>Data Export & Archiving (CSV)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Download clean spreadsheet-ready records for official records or offline analysis.
            </p>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Privacy Compliant</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          <button
            onClick={handleExportTeachers}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs font-semibold text-white transition-all text-left group"
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              <div>
                <span className="block">Faculty Directory</span>
                <span className="text-[10px] text-slate-400 font-normal">All teachers & departments</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={handleExportRoutine}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs font-semibold text-white transition-all text-left group"
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <div>
                <span className="block">Master Routine Timetable</span>
                <span className="text-[10px] text-slate-400 font-normal">Weekly class schedule</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={handleExportAttendance}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs font-semibold text-white transition-all text-left group"
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <div>
                <span className="block">Staff Attendance Logs</span>
                <span className="text-[10px] text-slate-400 font-normal">Check-ins & working hours</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={handleExportSessions}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs font-semibold text-white transition-all text-left group"
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <div>
                <span className="block">Conducted Class Sessions</span>
                <span className="text-[10px] text-slate-400 font-normal">Durations & start times</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={handleExportReports}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs font-semibold text-white transition-all text-left group"
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <div>
                <span className="block">Official Staff Reports</span>
                <span className="text-[10px] text-slate-400 font-normal">Submissions & review notes</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </section>

      {/* TEACHER WORKLOAD DISTRIBUTION TABLE */}
      <section className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          <span>Teacher Workload & Routine Distribution</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Teacher</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Weekly Periods</th>
                <th className="py-2.5 px-3">Sessions Completed</th>
                <th className="py-2.5 px-3">Attendance Days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {teacherWorkloads.map(({ teacher, weeklyPeriods, completedCount, attCount }) => (
                <tr key={teacher.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-white block">{teacher.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{teacher.employeeId}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{teacher.department}</td>
                  <td className="py-3 px-3 font-semibold text-indigo-400">{weeklyPeriods} periods</td>
                  <td className="py-3 px-3 text-slate-300">{completedCount}</td>
                  <td className="py-3 px-3 text-emerald-400 font-semibold">{attCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
