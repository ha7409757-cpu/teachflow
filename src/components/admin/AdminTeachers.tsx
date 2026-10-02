/**
 * TeachFlow Admin Teacher Management
 * Roster of all teaching faculty, assigned classes, attendance stats,
 * and strict teacher private notes boundary indicator.
 */

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Lock,
  Calendar,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  ShieldCheck,
  Trash2,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';

export const AdminTeachers: React.FC = () => {
  const { allUsers, approveUser, deleteUser } = useAuth();
  const { routines, attendanceRecords, language } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<User | null>(null);

  const activeTeachers = allUsers.filter(u => u.role === 'TEACHER' && u.status === 'ACTIVE');
  const pendingTeachers = allUsers.filter(u => u.role === 'TEACHER' && u.status === 'PENDING');

  const filteredTeachers = activeTeachers.filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.employeeId.toLowerCase().includes(q) ||
      t.department?.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-emerald-950 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-rose-600" />
            <span>{language === 'bn' ? 'শিক্ষক ও ফ্যাকাল্টি ডিরেক্টরি' : 'Faculty & Teachers Directory'}</span>
          </h1>
          <p className="text-xs text-emerald-700 mt-0.5">
            {language === 'bn' ? 'শিক্ষক প্রোফাইল, সাপ্তাহিক ক্লাস পিরিয়ড এবং অফিশিয়াল রেকর্ড পরিচালনা করুন।' : 'Manage teacher profiles, weekly assigned periods, and administrative records.'}
          </p>
        </div>
      </div>

      {/* PENDING APPROVALS SECTION */}
      {pendingTeachers.length > 0 && (
        <section className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-200 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 text-amber-800">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <h2 className="font-black text-sm uppercase tracking-wider">
              {language === 'bn' ? 'অনুমোদনের অপেক্ষায় শিক্ষক' : 'Teachers Awaiting Approval'} ({pendingTeachers.length})
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingTeachers.map(user => (
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
                    <XCircle className="w-4 h-4" />
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

      {/* Privacy Guarantee Notice */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-3">
        <Lock className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-emerald-950">{language === 'bn' ? 'শিক্ষকের গোপনীয়তা নিশ্চিত' : 'Teacher Privacy Enforced'}</span>: {language === 'bn' ? 'ব্যক্তিগত নোট এবং পর্যবেক্ষণ সম্পূর্ণ আলাদা রাখা হয়। প্রশাসক বা অন্য কেউ শিক্ষকের ব্যক্তিগত নোট দেখতে পারবেন না।' : 'Personal lesson notes and observations are mathematically isolated. Administrators have zero visibility into private teacher notes.'}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={language === 'bn' ? 'নাম, আইডি বা বিভাগ দিয়ে খুঁজুন...' : 'Search teachers by name, ID, or subject...'}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-emerald-200 text-xs text-emerald-950 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
        />
      </div>

      {/* TEACHERS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map(teacher => {
          const teacherRoutines = routines.filter(r => r.teacherId === teacher.id);
          const attCount = attendanceRecords.filter(a => a.userId === teacher.id && a.status === 'PRESENT').length;

          return (
            <div
              key={teacher.id}
              className="p-5 rounded-3xl bg-white border border-emerald-200 hover:border-rose-300 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-black text-emerald-700 text-lg">
                      {teacher.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-950 text-sm leading-tight">{teacher.name}</h3>
                      <span className="text-[11px] text-emerald-600 block mt-0.5">{teacher.designation}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 my-4 text-[11px] text-emerald-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold">
                      {teacher.employeeId}
                    </span>
                    <span className="font-medium text-emerald-700">{teacher.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  {teacher.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{teacher.phone}</span>
                    </div>
                  )}
                </div>

                {/* Assigned Routine periods */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-[11px] space-y-2">
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>{language === 'bn' ? 'নিযুক্ত শ্রেণি' : 'Assigned Classes'}</span>
                    <span className="font-black text-emerald-950 truncate max-w-[120px]">
                      {teacher.assignedClasses && teacher.assignedClasses.length > 0 
                        ? teacher.assignedClasses.join(', ') 
                        : (language === 'bn' ? 'নেই' : 'None')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>{language === 'bn' ? 'সাপ্তাহিক ক্লাস' : 'Weekly Classes'}</span>
                    <span className="font-black text-emerald-950">{teacherRoutines.length} {language === 'bn' ? 'টি পিরিয়ড' : 'periods'}</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>{language === 'bn' ? 'হাজিরা রেকর্ড' : 'Attendance Logged'}</span>
                    <span className="font-black text-rose-600">{attCount} {language === 'bn' ? 'দিন' : 'days'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t border-emerald-100 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                  <Lock className="w-3 h-3 text-rose-500" />
                  <span>{language === 'bn' ? 'নোট গোপনীয়' : 'Notes Private'}</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTeacherToDelete(teacher)}
                    className="p-2 rounded-xl text-emerald-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete teacher'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedTeacher(teacher)}
                    className="px-4 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[10px] transition-all cursor-pointer"
                  >
                    {language === 'bn' ? 'বিস্তারিত দেখুন' : 'View Profile'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* NO DATA STATE */}
      {filteredTeachers.length === 0 && (
        <div className="text-center py-20 bg-white border border-emerald-200 rounded-3xl">
          <Users className="w-12 h-12 text-emerald-200 mx-auto mb-3" />
          <p className="text-emerald-900 font-bold">{language === 'bn' ? 'কোনো শিক্ষক খুঁজে পাওয়া যায়নি।' : 'No teachers found.'}</p>
        </div>
      )}

      {/* TEACHER DETAILS POPUP */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm">
          <div className="bg-white border border-emerald-200 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative animate-in zoom-in duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
              <h3 className="text-sm font-black text-emerald-950 uppercase tracking-tight">
                {language === 'bn' ? 'শিক্ষক প্রোফাইল বিস্তারিত' : 'Teacher Faculty Profile'}
              </h3>
              <button onClick={() => setSelectedTeacher(null)} className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5 my-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center text-2xl font-black shadow-inner">
                  {selectedTeacher.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-black text-emerald-950">{selectedTeacher.name}</h4>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 inline-block mt-1">
                    {selectedTeacher.designation} • {selectedTeacher.department}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                <div>
                  <span className="text-emerald-600 block text-[10px] font-bold uppercase mb-0.5">{language === 'bn' ? 'আইডি কার্ড' : 'Employee ID'}</span>
                  <span className="font-mono text-emerald-950 font-black">{selectedTeacher.employeeId}</span>
                </div>
                <div>
                  <span className="text-emerald-600 block text-[10px] font-bold uppercase mb-0.5">{language === 'bn' ? 'ইমেইল' : 'Email'}</span>
                  <span className="text-emerald-950 truncate block font-bold">{selectedTeacher.email}</span>
                </div>
                <div>
                  <span className="text-emerald-600 block text-[10px] font-bold uppercase mb-0.5">{language === 'bn' ? 'মোবাইল' : 'Mobile'}</span>
                  <span className="text-emerald-950 font-bold">{selectedTeacher.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-rose-600 block text-[10px] font-bold uppercase mb-0.5">{language === 'bn' ? 'গোপনীয়তা লেভেল' : 'Privacy Level'}</span>
                  <span className="text-emerald-950 font-black">{language === 'bn' ? '১০০% গোপনীয়' : 'Strict Isolation'}</span>
                </div>
              </div>

              {/* Bio & Experience */}
              <div className="space-y-4 p-5 rounded-2xl bg-white border border-emerald-200">
                <div>
                  <h5 className="text-[10px] uppercase font-black text-rose-600 tracking-wider mb-1.5">{language === 'bn' ? 'অভিজ্ঞতা ও দক্ষতা' : 'Experience & Expertise'}</h5>
                  <p className="text-xs text-emerald-900 leading-relaxed">
                    {selectedTeacher.experience || 'Experience details not provided.'}
                  </p>
                </div>
                <div>
                  <h5 className="text-[10px] uppercase font-black text-rose-600 tracking-wider mb-1.5">{language === 'bn' ? 'শিক্ষক সম্পর্কে' : 'Biography / About'}</h5>
                  <p className="text-xs text-emerald-900 italic leading-relaxed">
                    {selectedTeacher.bio || 'No personal bio provided.'}
                  </p>
                </div>
                <div>
                  <h5 className="text-[10px] uppercase font-black text-rose-600 tracking-wider mb-1.5">{language === 'bn' ? 'প্রধান বিষয়সমূহ' : 'Primary Subjects'}</h5>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTeacher.assignedSubjects && selectedTeacher.assignedSubjects.length > 0 ? (
                      selectedTeacher.assignedSubjects.map((s, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-[10px] text-emerald-800 font-bold">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-emerald-500 italic">No specific subjects listed</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-emerald-100">
              <button
                onClick={() => {
                  const toDelete = selectedTeacher;
                  setSelectedTeacher(null);
                  setTeacherToDelete(toDelete);
                }}
                className="py-2.5 px-5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{language === 'bn' ? 'ডিলিট করুন' : 'Delete'}</span>
              </button>
              <button
                onClick={() => setSelectedTeacher(null)}
                className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md cursor-pointer"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Close Details'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE TEACHER MODAL */}
      {teacherToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm">
          <div className="bg-white border-2 border-rose-500 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0 border border-rose-200">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-emerald-950 text-sm">{language === 'bn' ? 'শিক্ষক অ্যাকাউন্ট মুছে ফেলবেন?' : 'Delete Teacher Account?'}</h3>
                <p className="text-xs text-emerald-700 mt-1">{language === 'bn' ? `আপনি কি নিশ্চিত যে ${teacherToDelete.name}-কে ডিরেক্টরি থেকে মুছে ফেলতে চান?` : `Are you sure you want to delete ${teacherToDelete.name}?`}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-xs">
              <span className="font-black block text-emerald-950">{teacherToDelete.name}</span>
              <span className="text-emerald-700 block font-mono text-[11px] mt-0.5">{teacherToDelete.employeeId} • {teacherToDelete.department}</span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setTeacherToDelete(null)}
                className="flex-1 py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200 cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  deleteUser(teacherToDelete.id);
                  setTeacherToDelete(null);
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
