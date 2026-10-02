/**
 * TeachFlow Admin Employee Management
 * Directory of non-teaching school staff and support personnel.
 */

import React, { useState } from 'react';
import { UserCheck, Plus, Search, Mail, Phone, Calendar, Clock, X, Trash2, XCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';

export const AdminEmployees: React.FC = () => {
  const { allUsers, approveUser, deleteUser } = useAuth();
  const { attendanceRecords, leaveRequests, language } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [employeeToDelete, setEmployeeToDelete] = useState<User | null>(null);

  const activeEmployees = allUsers.filter(u => u.role === 'EMPLOYEE' && u.status === 'ACTIVE');
  const pendingEmployees = allUsers.filter(u => u.role === 'EMPLOYEE' && u.status === 'PENDING');

  const filteredEmployees = activeEmployees.filter(e => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.employeeId.toLowerCase().includes(q) ||
      e.department?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-emerald-950 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-amber-500" />
            <span>{language === 'bn' ? 'কর্মচারী ও স্টাফ ডিরেক্টরি' : 'Staff & Employees Directory'}</span>
          </h1>
          <p className="text-xs text-emerald-700 mt-0.5">
            {language === 'bn' ? 'প্রশাসনিক, অপারেশনাল এবং অফিস সাপোর্ট স্টাফদের তথ্য পরিচালনা করুন।' : 'Manage administrative, operational, and office support staff.'}
          </p>
        </div>
      </div>

      {/* PENDING APPROVALS SECTION */}
      {pendingEmployees.length > 0 && (
        <section className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-200 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 text-amber-800">
            <UserCheck className="w-5 h-5 text-amber-600" />
            <h2 className="font-black text-sm uppercase tracking-wider">
              {language === 'bn' ? 'অনুমোদনের অপেক্ষায় কর্মচারী' : 'Staff Awaiting Approval'} ({pendingEmployees.length})
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingEmployees.map(user => (
              <div key={user.id} className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-xs">{user.name}</h4>
                    <p className="text-[10px] text-emerald-700">{user.designation} • {user.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Reject"
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                  </button>
                  <button
                    onClick={() => approveUser(user.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-md transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'অনুমোদন করুন' : 'Approve'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={language === 'bn' ? 'নাম, আইডি বা বিভাগ দিয়ে খুঁজুন...' : 'Search employees by name, ID, or department...'}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-emerald-200 text-xs text-emerald-950 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
        />
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map(emp => {
          const presentDays = attendanceRecords.filter(a => a.userId === emp.id && a.status === 'PRESENT').length;
          const pendingLeavesCount = leaveRequests.filter(l => l.userId === emp.id && l.status === 'PENDING').length;

          return (
            <div
              key={emp.id}
              className="p-5 rounded-3xl bg-white border border-emerald-200 hover:border-amber-300 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-black text-amber-600 text-lg">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-950 text-sm leading-tight">{emp.name}</h3>
                      <span className="text-[11px] text-emerald-600 block mt-0.5">{emp.designation}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 my-4 text-[11px] text-emerald-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold">
                      {emp.employeeId}
                    </span>
                    <span className="font-medium text-emerald-700">{emp.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  {emp.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{emp.phone}</span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-[11px] space-y-2">
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>{language === 'bn' ? 'হাজিরা রেকর্ড' : 'Attendance Logged'}</span>
                    <span className="font-black text-emerald-950">{presentDays} {language === 'bn' ? 'দিন' : 'days'}</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>{language === 'bn' ? 'অপেক্ষমাণ ছুটি' : 'Pending Leaves'}</span>
                    <span className="font-black text-rose-600">{pendingLeavesCount}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-emerald-100 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-tight">{language === 'bn' ? 'স্টাফ অ্যাকাউন্ট' : 'Staff Account'}</span>
                  <button
                    onClick={() => setEmployeeToDelete(emp)}
                    className="p-2 rounded-xl text-emerald-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1.5 text-[11px] font-bold"
                    title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete employee'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'ডিলিট' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* NO DATA STATE */}
      {filteredEmployees.length === 0 && (
        <div className="text-center py-20 bg-white border border-emerald-200 rounded-3xl">
          <UserCheck className="w-12 h-12 text-emerald-200 mx-auto mb-3" />
          <p className="text-emerald-900 font-bold">{language === 'bn' ? 'কোনো কর্মচারী খুঁজে পাওয়া যায়নি।' : 'No employees found.'}</p>
        </div>
      )}

      {/* CONFIRM DELETE EMPLOYEE MODAL */}
      {employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm">
          <div className="bg-white border-2 border-rose-500 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0 border border-rose-200">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-emerald-950 text-sm">{language === 'bn' ? 'অ্যাকাউন্ট মুছে ফেলবেন?' : 'Delete Employee Account?'}</h3>
                <p className="text-xs text-emerald-700 mt-1">{language === 'bn' ? `আপনি কি নিশ্চিত যে ${employeeToDelete.name}-কে ডিরেক্টরি থেকে মুছে ফেলতে চান?` : `Remove ${employeeToDelete.name} from school staff directory?`}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-xs">
              <span className="font-black block text-emerald-950">{employeeToDelete.name}</span>
              <span className="text-emerald-700 block font-mono text-[11px] mt-0.5">{employeeToDelete.employeeId} • {employeeToDelete.designation}</span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setEmployeeToDelete(null)}
                className="flex-1 py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200 cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  deleteUser(employeeToDelete.id);
                  setEmployeeToDelete(null);
                }}
                className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-900/40 cursor-pointer"
              >
                {language === 'bn' ? 'মুছে ফেলুন' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
