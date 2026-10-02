/**
 * TeachFlow Admin Overview Dashboard
 * Executive view with top metric cards, real-time live classes summary,
 * pending leaves & reports, attendance breakdown, and quick actions in Red & Green theme with Bengali support.
 */

import React from 'react';
import {
  Users,
  UserCheck,
  Radio,
  Calendar,
  Clock,
  Briefcase,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Plus,
  ShieldAlert,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getTodayDateString } from '../../services/storage';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { allUsers } = useAuth();
  const {
    routines,
    classSessions,
    attendanceRecords,
    leaveRequests,
    adminReports,
    settings,
    language
  } = useApp();

  const todayStr = getTodayDateString();
  const todayDay = new Date().getDay();

  // Metrics
  const teachers = allUsers.filter(u => u.role === 'TEACHER');
  const employees = allUsers.filter(u => u.role === 'EMPLOYEE');

  const todayAttendance = attendanceRecords.filter(a => a.date === todayStr);
  const presentToday = todayAttendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
  const absentToday = Math.max(0, (teachers.length + employees.length) - presentToday);

  const todayRoutines = routines.filter(r => r.dayOfWeek === todayDay);
  const todaySessions = classSessions.filter(s => s.date === todayStr);
  const runningSessions = todaySessions.filter(s => s.status === 'RUNNING');
  const completedSessions = todaySessions.filter(s => s.status === 'COMPLETED');

  const pendingLeaves = leaveRequests.filter(l => l.status === 'PENDING');
  const pendingReports = adminReports.filter(r => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW');
  const pendingUsers = allUsers.filter(u => u.status === 'PENDING');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
            {language === 'bn' ? 'প্রশাসনিক কন্ট্রোল সেন্টার' : 'ADMINISTRATION CONTROL CENTER'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight mt-0.5">
            {settings.schoolName}
          </h1>
          <p className="text-xs text-emerald-700 mt-0.5">
            {language === 'bn'
              ? 'লাইভ ক্লাস, শিক্ষক-কর্মচারী উপস্থিতি, রুটিন এবং অফিশিয়াল রিপোর্ট পর্যবেক্ষণ।'
              : 'Real-time monitoring of classes, staff attendance, schedules, and official reports.'}
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => onNavigateTab('evaluation')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-emerald-950 font-black text-xs shadow-md transition-all cursor-pointer"
          >
            <Award className="w-4 h-4 text-emerald-950" />
            <span>{language === 'bn' ? 'স্টুডেন্ট অফ দ্যা মান্থ' : 'Student of Month'}</span>
          </button>
          <button
            onClick={() => onNavigateTab('routine')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>{language === 'bn' ? 'রুটিন পরিচালনা' : 'Manage Routine'}</span>
          </button>
          <button
            onClick={() => onNavigateTab('notices')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-200 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-rose-600" />
            <span>{language === 'bn' ? 'নোটিশ' : 'Notice'}</span>
          </button>
        </div>
      </div>

      {/* TOP METRIC CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {/* Total Teachers */}
        <div
          onClick={() => onNavigateTab('teachers')}
          className="p-4 rounded-3xl bg-white border border-emerald-200 hover:border-emerald-300 shadow-sm cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-emerald-700 text-xs mb-2">
            <span>{language === 'bn' ? 'মোট শিক্ষক' : 'Total Teachers'}</span>
            <Users className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-emerald-950">{teachers.length}</div>
          <p className="text-[10px] text-emerald-700 mt-1">{language === 'bn' ? 'সক্রিয় শিক্ষক মণ্ডলী' : 'Active faculty staff'}</p>
        </div>

        {/* Total Employees */}
        <div
          onClick={() => onNavigateTab('employees')}
          className="p-4 rounded-3xl bg-white border border-emerald-200 hover:border-emerald-300 shadow-sm cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-emerald-700 text-xs mb-2">
            <span>{language === 'bn' ? 'মোট কর্মচারী' : 'Total Employees'}</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-950">{employees.length}</div>
          <p className="text-[10px] text-emerald-700 mt-1">{language === 'bn' ? 'প্রশাসনিক ও ল্যাব সহকারী' : 'Admin & Lab assistants'}</p>
        </div>

        {/* Present Today */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="p-4 rounded-3xl bg-white border border-emerald-200 hover:border-emerald-300 shadow-sm cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-emerald-700 text-xs mb-2">
            <span>{language === 'bn' ? 'আজ উপস্থিত স্টাফ' : 'Staff Present Today'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{presentToday}</div>
          <p className="text-[10px] text-emerald-700 mt-1">
            {language === 'bn' ? `${absentToday} জন অনুপস্থিত/ছুটি` : `${absentToday} absent or off-duty`}
          </p>
        </div>

        {/* Classes Scheduled Today */}
        <div
          onClick={() => onNavigateTab('live')}
          className="p-4 rounded-3xl bg-white border border-emerald-200 hover:border-emerald-300 shadow-sm cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-emerald-700 text-xs mb-2">
            <span>{language === 'bn' ? 'আজকের মোট ক্লাস' : "Today's Classes"}</span>
            <Calendar className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-emerald-950">{todayRoutines.length}</div>
          <p className="text-[10px] text-emerald-700 mt-1">{language === 'bn' ? 'নির্ধারিত পিরিয়ড' : 'Periods scheduled'}</p>
        </div>

        {/* Classes Running */}
        <div
          onClick={() => onNavigateTab('live')}
          className="p-4 rounded-3xl bg-rose-50 border border-rose-300 hover:border-rose-400 shadow-sm cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-rose-800 text-xs mb-2">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              <span>{language === 'bn' ? 'চলমান ক্লাস' : 'Running Classes'}</span>
            </span>
            <Radio className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700">{runningSessions.length}</div>
          <p className="text-[10px] text-rose-600 mt-1">{language === 'bn' ? 'শ্রেণিকক্ষে সরাসরি লাইভ' : 'Live in classrooms'}</p>
        </div>

        {/* Classes Completed */}
        <div
          onClick={() => onNavigateTab('live')}
          className="p-4 rounded-3xl bg-white border border-emerald-200 hover:border-emerald-300 shadow-sm cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-emerald-700 text-xs mb-2">
            <span>{language === 'bn' ? 'সম্পন্ন ক্লাস' : 'Completed Classes'}</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-950">{completedSessions.length}</div>
          <p className="text-[10px] text-emerald-700 mt-1">{language === 'bn' ? 'সমাপ্ত ক্লাস সেশন' : 'Finished sessions'}</p>
        </div>

        {/* Pending Reports */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="p-4 rounded-3xl bg-white border border-emerald-200 hover:border-emerald-300 shadow-sm cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-emerald-700 text-xs mb-2">
            <span>{language === 'bn' ? 'অপেক্ষমাণ রিপোর্ট' : 'Pending Reports'}</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">{pendingReports.length}</div>
          <p className="text-[10px] text-emerald-700 mt-1">{language === 'bn' ? 'পর্যালোচনার অপেক্ষায়' : 'Awaiting admin review'}</p>
        </div>

        {/* Pending Leaves */}
        <div
          onClick={() => onNavigateTab('leaves')}
          className="p-4 rounded-3xl bg-white border border-emerald-200 hover:border-emerald-300 shadow-sm cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-emerald-700 text-xs mb-2">
            <span>{language === 'bn' ? 'ছুটির আবেদন' : 'Pending Leaves'}</span>
            <Briefcase className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600">{pendingLeaves.length}</div>
          <p className="text-[10px] text-emerald-700 mt-1">{language === 'bn' ? 'অনুমোদন প্রয়োজন' : 'Requires approval'}</p>
        </div>

        {/* Pending User Approvals (NEW) */}
        {pendingUsers.length > 0 && (
          <div
            onClick={() => onNavigateTab('teachers')}
            className="p-4 rounded-3xl bg-amber-50 border-2 border-amber-400 hover:border-amber-500 shadow-md cursor-pointer transition-all animate-pulse"
          >
            <div className="flex items-center justify-between text-amber-900 text-xs mb-2">
              <span className="font-black">{language === 'bn' ? 'নতুন আইডি অনুমোদন' : 'New ID Approvals'}</span>
              <ShieldAlert className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-700">{pendingUsers.length}</div>
            <p className="text-[10px] text-amber-800 font-bold mt-1">
              {language === 'bn' ? 'অপেক্ষা করছে' : 'Waiting for you'}
            </p>
          </div>
        )}
      </div>

      {/* LIVE CLASSES MONITOR SNAPSHOT */}
      <section className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
            <h2 className="text-base font-extrabold text-emerald-950 tracking-tight">
              {language === 'bn' ? 'লাইভ ক্লাসরুম মনিটর' : 'Live Classroom Monitor'}
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('live')}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{language === 'bn' ? 'সম্পূর্ণ মনিটর দেখুন' : 'Full Monitor'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {runningSessions.length === 0 ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-xs text-emerald-800">
            {language === 'bn'
              ? 'বর্তমানে কোনো ক্লাস সক্রিয় নেই। শিক্ষকরা এক ক্লিকে বা কিউআর স্ক্যান করে ক্লাস শুরু করলে এখানে সরাসরি দেখা যাবে।'
              : 'No classes are actively running right now. As teachers start classes with One-Tap or QR, they appear here live.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {runningSessions.map(session => (
              <div
                key={session.id}
                className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-950 text-sm">
                      {session.classId} • {session.subjectId}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                      {language === 'bn' ? 'লাইভ চলছে' : 'RUNNING'}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 mt-1">
                    {language === 'bn' ? 'শিক্ষক' : 'Teacher'}: <strong className="text-emerald-950">{session.teacherName}</strong> • {session.roomId}
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-0.5 font-mono">
                    {language === 'bn' ? 'শুরু হয়েছে' : 'Started at'} {session.actualStart} ({session.scheduledStart} - {session.scheduledEnd})
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* RECENT SUBMISSIONS & ACTIONABLE ITEMS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Leave Requests */}
        <section className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-600" />
              <span>
                {language === 'bn' ? 'ছুটির আবেদন যাচাই' : 'Pending Leave Approvals'} ({pendingLeaves.length})
              </span>
            </h3>
            <button
              onClick={() => onNavigateTab('leaves')}
              className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
            >
              {language === 'bn' ? 'সবগুলো দেখুন' : 'View All'}
            </button>
          </div>

          {pendingLeaves.length === 0 ? (
            <p className="text-xs text-emerald-700 text-center py-6">
              {language === 'bn' ? 'সব ছুটির আবেদন প্রক্রিয়াকরণ সম্পন্ন।' : 'All leave applications processed.'}
            </p>
          ) : (
            <div className="space-y-2">
              {pendingLeaves.slice(0, 3).map(l => (
                <div
                  key={l.id}
                  className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-emerald-950 block">{l.userName}</span>
                    <span className="text-[11px] text-emerald-700">
                      {l.leaveType} • {l.daysCount} {language === 'bn' ? 'দিন' : 'days'} ({l.startDate} - {l.endDate})
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigateTab('leaves')}
                    className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] cursor-pointer shadow-sm"
                  >
                    {language === 'bn' ? 'যাচাই করুন' : 'Review'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pending Teacher Reports */}
        <section className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-600" />
              <span>
                {language === 'bn' ? 'শিক্ষকদের রিপোর্ট পর্যালোচনা' : 'Pending Teacher Reports'} ({pendingReports.length})
              </span>
            </h3>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
            >
              {language === 'bn' ? 'সবগুলো দেখুন' : 'View All'}
            </button>
          </div>

          {pendingReports.length === 0 ? (
            <p className="text-xs text-emerald-700 text-center py-6">
              {language === 'bn' ? 'পর্যালোচনার জন্য কোনো রিপোর্ট নেই।' : 'No pending reports for review.'}
            </p>
          ) : (
            <div className="space-y-2">
              {pendingReports.slice(0, 3).map(r => (
                <div
                  key={r.id}
                  className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs"
                >
                  <div className="truncate max-w-[240px]">
                    <span className="font-bold text-emerald-950 truncate block">{r.title}</span>
                    <span className="text-[11px] text-emerald-700">
                      {r.teacherName} • {r.reportType.replace('_', ' ')}
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigateTab('reports')}
                    className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shrink-0 cursor-pointer shadow-sm"
                  >
                    {language === 'bn' ? 'দেখুন' : 'View'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
