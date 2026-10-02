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
  const { allUsers, registerStaffUser, deleteUser } = useAuth();
  const { routines, attendanceRecords } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<User | null>(null);

  // Form fields for new teacher
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newEmpId, setNewEmpId] = useState('');
  const [newDesignation, setNewDesignation] = useState('Assistant Teacher');
  const [newDepartment, setNewDepartment] = useState('Science & Math');
  const [newPhone, setNewPhone] = useState('+880 1711-');

  const teachers = allUsers.filter(u => u.role === 'TEACHER');

  const filteredTeachers = teachers.filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.employeeId.toLowerCase().includes(q) ||
      t.department?.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q)
    );
  });

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    registerStaffUser({
      name: newName.trim(),
      email: newEmail.trim(),
      role: 'TEACHER',
      employeeId: newEmpId.trim() || `TCH-${Math.floor(100 + Math.random() * 900)}`,
      designation: newDesignation.trim(),
      department: newDepartment.trim(),
      phone: newPhone.trim()
    });

    setNewName('');
    setNewEmail('');
    setNewEmpId('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            <span>Faculty & Teachers Directory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage teacher profiles, weekly assigned periods, and administrative records.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Teacher</span>
        </button>
      </div>

      {/* Privacy Guarantee Notice (Rule 12 & 13) */}
      <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-300 flex items-center gap-2.5">
        <Lock className="w-4 h-4 text-indigo-400 shrink-0" />
        <div>
          <span className="font-bold text-white">Teacher Privacy Enforced</span>: Personal lesson
          notes and student observations in private teacher workspaces are mathematically isolated.
          School Administrators have zero access or visibility to private notes.
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search teachers by name, ID, or subject..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 text-sm">
                      {teacher.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{teacher.name}</h3>
                      <span className="text-[11px] text-slate-400 block">{teacher.designation}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      teacher.isActive
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {teacher.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-1.5 my-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="font-mono text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {teacher.employeeId}
                    </span>
                    <span>{teacher.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  {teacher.phone && (
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{teacher.phone}</span>
                    </div>
                  )}
                </div>

                {/* Assigned Routine periods */}
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Weekly Classes</span>
                    <span className="font-bold text-white">{teacherRoutines.length} periods</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Attendance Logged</span>
                    <span className="font-bold text-emerald-400">{attCount} days</span>
                  </div>
                </div>
              </div>

              {/* Strict Privacy Badge at bottom of card */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-indigo-400" />
                  <span>Private notes isolated</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTeacherToDelete(teacher)}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete teacher"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setSelectedTeacher(teacher)}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold text-xs"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD TEACHER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Add New Teacher</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTeacher} className="space-y-3 my-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nusrat Jahan"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="teacher@school.edu"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Employee ID</label>
                  <input
                    type="text"
                    placeholder="TCH-105"
                    value={newEmpId}
                    onChange={e => setNewEmpId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Designation</label>
                  <input
                    type="text"
                    value={newDesignation}
                    onChange={e => setNewDesignation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={e => setNewDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30"
                >
                  Create Teacher Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEACHER DETAILS POPUP */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Teacher Faculty Profile</h3>
              <button onClick={() => setSelectedTeacher(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 my-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-lg font-bold">
                  {selectedTeacher.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{selectedTeacher.name}</h4>
                  <span className="text-xs text-slate-400">
                    {selectedTeacher.designation} • {selectedTeacher.department}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[11px]">Employee ID</span>
                  <span className="font-mono text-slate-200">{selectedTeacher.employeeId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Email</span>
                  <span className="text-slate-200 truncate block">{selectedTeacher.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Assigned Classes</span>
                  <span className="text-slate-200">
                    {routines.filter(r => r.teacherId === selectedTeacher.id).length} periods / week
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Privacy Level</span>
                  <span className="text-indigo-400 font-semibold">Strict Note Isolation</span>
                </div>
              </div>

              {/* Routine list for this teacher */}
              <div>
                <h5 className="text-xs font-bold text-white mb-2">Weekly Class Timetable</h5>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {routines.filter(r => r.teacherId === selectedTeacher.id).map(r => (
                    <div key={r.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white">{r.classId} • {r.subjectId}</span>
                        <span className="text-slate-400 text-[11px] block">{r.roomId}</span>
                      </div>
                      <span className="font-mono text-indigo-400 text-[11px]">{r.startTime} - {r.endTime}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  const toDelete = selectedTeacher;
                  setSelectedTeacher(null);
                  setTeacherToDelete(toDelete);
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Teacher</span>
              </button>
              <button
                onClick={() => setSelectedTeacher(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE TEACHER MODAL */}
      {teacherToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Delete Teacher Account?</h3>
                <p className="text-xs text-slate-400">This will remove {teacherToDelete.name} from the school directory.</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <span className="font-semibold block text-white">{teacherToDelete.name}</span>
              <span className="text-slate-400 block font-mono text-[11px]">{teacherToDelete.employeeId} • {teacherToDelete.department}</span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setTeacherToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteUser(teacherToDelete.id);
                  setTeacherToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-900/40 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
