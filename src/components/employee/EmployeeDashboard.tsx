/**
 * TeachFlow Employee Dashboard
 * Dedicated interface for administrative and support employees:
 * Check-in, Check-out, working hours calculation, attendance log, and notices in Red & Green theme with Bengali support.
 */

import React from 'react';
import { Clock, LogIn, LogOut, CheckCircle2, Calendar, Briefcase, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

interface EmployeeDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ onNavigateTab }) => {
  const { currentUser } = useAuth();
  const {
    getTodayAttendanceForUser,
    checkInStaff,
    checkOutStaff,
    attendanceRecords,
    language
  } = useApp();

  if (!currentUser) return null;

  const todayAtt = getTodayAttendanceForUser(currentUser.id);
  const myRecords = attendanceRecords
    .filter(a => a.userId === currentUser.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
            {language === 'bn' ? 'কর্মচারী কর্মক্ষেত্র' : 'EMPLOYEE WORKSPACE'} • {currentUser.department}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight mt-0.5">
            {language === 'bn' ? `স্বাগতম, ${currentUser.name}` : `Welcome, ${currentUser.name}`}
          </h1>
          <p className="text-xs text-emerald-700 mt-0.5">
            {currentUser.designation} • {language === 'bn' ? 'আইডি' : 'ID'}: {currentUser.employeeId}
          </p>
        </div>
      </div>

      {/* CHECK-IN / CHECK-OUT HERO CARD */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-emerald-500 shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              {language === 'bn' ? 'আজকের কর্মস্থল উপস্থিতি অবস্থা' : "Today's Duty Status"}
            </span>

            {todayAtt?.checkInTime ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-2xl font-black text-emerald-950">
                    {language === 'bn' ? 'চেক-ইন সম্পন্ন' : 'CHECKED IN'}
                  </span>
                  <p className="text-xs text-emerald-700">
                    {language === 'bn' ? 'উপস্থিতি রেকর্ড করা হয়েছে: ' : 'Arrival recorded at '}
                    <strong className="text-emerald-800 font-mono">{todayAtt.checkInTime}</strong>
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <span className="text-2xl font-black text-emerald-800">
                  {language === 'bn' ? 'হাজিরা দেওয়া হয়নি' : 'NOT CHECKED IN'}
                </span>
                <p className="text-xs text-emerald-700">
                  {language === 'bn'
                    ? 'আপনার আজকের কার্যদিবস শুরু করতে নিচের বোতামে চাপুন।'
                    : 'Tap below to record your daily work arrival.'}
                </p>
              </div>
            )}

            {todayAtt?.checkOutTime && (
              <p className="text-xs text-rose-700 font-mono mt-2 bg-rose-50 px-3.5 py-1.5 rounded-xl border border-rose-200 inline-block font-bold">
                {language === 'bn'
                  ? `শিফট সম্পন্ন: চেক-আউট ${todayAtt.checkOutTime} (${todayAtt.workingHours} ঘণ্টা কাজ)`
                  : `Shift completed: Check-out at ${todayAtt.checkOutTime} (${todayAtt.workingHours} hrs worked)`}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="sm:max-w-xs w-full flex flex-col gap-2">
            {!todayAtt?.checkInTime ? (
              <button
                onClick={checkInStaff}
                className="w-full py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-black text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-5 h-5" />
                <span>{language === 'bn' ? 'এখন চেক-ইন করুন' : 'CHECK IN NOW'}</span>
              </button>
            ) : !todayAtt?.checkOutTime ? (
              <button
                onClick={checkOutStaff}
                className="w-full py-4 px-6 rounded-2xl bg-rose-50 hover:bg-rose-100 active:scale-[0.98] text-rose-700 border-2 border-rose-600 font-bold text-base transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                <span>{language === 'bn' ? 'চেক-আউট (শিফট শেষ)' : 'CHECK OUT (END SHIFT)'}</span>
              </button>
            ) : (
              <div className="text-center py-3 text-xs text-emerald-800 font-bold bg-emerald-100 rounded-2xl border border-emerald-300">
                ✓ {language === 'bn' ? 'পুরো দিনের লগ সম্পন্ন' : 'Full Day Logged'}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <button
          onClick={() => onNavigateTab('leaves')}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white hover:bg-emerald-50 border border-emerald-200 text-center transition-all group cursor-pointer shadow-sm"
        >
          <div className="p-3 rounded-xl bg-rose-100 text-rose-600 group-hover:scale-110 transition-transform mb-2">
            <Briefcase className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-emerald-950">
            {language === 'bn' ? 'ছুটির আবেদন' : 'Apply for Leave'}
          </span>
          <span className="text-[10px] text-emerald-700 mt-0.5">
            {language === 'bn' ? 'নৈমিত্তিক / অসুস্থতা / জরুরি' : 'Casual / Medical / Emergency'}
          </span>
        </button>

        <button
          onClick={() => onNavigateTab('notices')}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white hover:bg-emerald-50 border border-emerald-200 text-center transition-all group cursor-pointer shadow-sm"
        >
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700 group-hover:scale-110 transition-transform mb-2">
            <Bell className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-emerald-950">
            {language === 'bn' ? 'বিদ্যালয় নোটিশ' : 'School Notices'}
          </span>
          <span className="text-[10px] text-emerald-700 mt-0.5">
            {language === 'bn' ? 'ঘোষণা ও বুলেটিন' : 'Announcements & Bulletins'}
          </span>
        </button>

        <button
          onClick={() => onNavigateTab('attendance')}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white hover:bg-emerald-50 border border-emerald-200 text-center transition-all group col-span-2 sm:col-span-1 cursor-pointer shadow-sm"
        >
          <div className="p-3 rounded-xl bg-rose-100 text-rose-600 group-hover:scale-110 transition-transform mb-2">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-emerald-950">
            {language === 'bn' ? 'হাজিরা ইতিহাস' : 'Attendance Log'}
          </span>
          <span className="text-[10px] text-emerald-700 mt-0.5">
            {language === 'bn' ? 'পূর্ববর্তী হাজিরার রেকর্ড' : 'View historical time logs'}
          </span>
        </button>
      </section>

      {/* RECENT ATTENDANCE TABLE */}
      <section className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-sm">
        <h3 className="text-sm font-bold text-emerald-950 mb-4">
          {language === 'bn' ? 'আমার সাম্প্রতিক হাজিরার রেকর্ড' : 'My Recent Attendance Records'}
        </h3>
        {myRecords.length === 0 ? (
          <p className="text-xs text-emerald-700 text-center py-6">
            {language === 'bn' ? 'কোনো পূর্ববর্তী রেকর্ড সংরক্ষিত নেই।' : 'No historical records logged yet.'}
          </p>
        ) : (
          <div className="divide-y divide-emerald-100">
            {myRecords.slice(0, 5).map(rec => (
              <div key={rec.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-950 block">{rec.date}</span>
                  <span className="text-[11px] text-emerald-700">
                    {language === 'bn' ? 'চেক-ইন' : 'Check-in'}: {rec.checkInTime || '--:--'} • {language === 'bn' ? 'চেক-আউট' : 'Check-out'}: {rec.checkOutTime || '--:--'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {rec.workingHours && (
                    <span className="text-emerald-800 font-mono font-bold">
                      {rec.workingHours} {language === 'bn' ? 'ঘণ্টা' : 'hrs'}
                    </span>
                  )}
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      rec.status === 'PRESENT'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {rec.status === 'PRESENT' && language === 'bn'
                      ? 'উপস্থিত'
                      : rec.status === 'ABSENT' && language === 'bn'
                      ? 'অনুপস্থিত'
                      : rec.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
