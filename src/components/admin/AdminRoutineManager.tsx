/**
 * TeachFlow School Routine Management (Admin)
 * Creates and edits weekly routine schedules, validates conflicts
 * (teacher double-booking, room collisions), and manages substitute teacher assignments.
 * Styled in Emerald & Rose palette with Bengali/English support and custom confirmation dialogs.
 */

import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Filter,
  X,
  Clock,
  MapPin,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ClassRoutineItem, ALL_CLASSES } from '../../types';

export const AdminRoutineManager: React.FC = () => {
  const { currentUser, allUsers } = useAuth();
  const {
    routines,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    assignSubstituteTeacher,
    language
  } = useApp();

  const days = [
    { id: 0, name: language === 'bn' ? 'রবিবার' : 'Sunday' },
    { id: 1, name: language === 'bn' ? 'সোমবার' : 'Monday' },
    { id: 2, name: language === 'bn' ? 'মঙ্গলবার' : 'Tuesday' },
    { id: 3, name: language === 'bn' ? 'বুধবার' : 'Wednesday' },
    { id: 4, name: language === 'bn' ? 'বৃহস্পতিবার' : 'Thursday' },
    { id: 5, name: language === 'bn' ? 'শুক্রবার' : 'Friday' },
    { id: 6, name: language === 'bn' ? 'শনিবার' : 'Saturday' }
  ];

  const teachers = allUsers.filter(u => u.role === 'TEACHER');

  // Filters
  const [selectedDay, setSelectedDay] = useState<number | 'ALL'>(new Date().getDay());
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('ALL');
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');

  // Add / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClassRoutineItem | null>(null);
  const [formDay, setFormDay] = useState<number>(0);
  const [formStartTime, setFormStartTime] = useState('10:00');
  const [formEndTime, setFormEndTime] = useState('10:45');
  const [formClassId, setFormClassId] = useState('Class 5');
  const [formSection, setFormSection] = useState('A');
  const [formSubjectId, setFormSubjectId] = useState('English');
  const [formRoomId, setFormRoomId] = useState('Room 203');
  const [formTeacherId, setFormTeacherId] = useState(teachers[0]?.id || '');
  const [formNotes, setFormNotes] = useState('');
  const [conflictError, setConflictError] = useState<string | null>(null);

  // Substitute modal state
  const [isSubstituteModalOpen, setIsSubstituteModalOpen] = useState(false);
  const [substituteRoutine, setSubstituteRoutine] = useState<ClassRoutineItem | null>(null);
  const [substituteTeacherId, setSubstituteTeacherId] = useState(teachers[0]?.id || '');

  // Delete Confirmation Modal state (NO window.confirm)
  const [routineToDelete, setRoutineToDelete] = useState<ClassRoutineItem | null>(null);

  // Filtered routines
  const filteredRoutines = (routines || []).filter(r => {
    if (selectedDay !== 'ALL' && r.dayOfWeek !== selectedDay) return false;
    if (selectedTeacherId !== 'ALL' && r.teacherId !== selectedTeacherId) return false;
    if (selectedClassId !== 'ALL' && r.classId !== selectedClassId) return false;
    return true;
  }).sort((a, b) => {
    if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
    return a.startTime.localeCompare(b.startTime);
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormDay(selectedDay === 'ALL' ? 0 : selectedDay);
    setFormStartTime('10:00');
    setFormEndTime('10:45');
    setFormClassId('Class 5');
    setFormSection('A');
    setFormSubjectId('English');
    setFormRoomId('Room 203');
    setFormTeacherId(teachers[0]?.id || '');
    setFormNotes('');
    setConflictError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ClassRoutineItem) => {
    setEditingItem(item);
    setFormDay(item.dayOfWeek);
    setFormStartTime(item.startTime);
    setFormEndTime(item.endTime);
    setFormClassId(item.classId);
    setFormSection(item.section || '');
    setFormSubjectId(item.subjectId);
    setFormRoomId(item.roomId);
    setFormTeacherId(item.teacherId);
    setFormNotes(item.notes || '');
    setConflictError(null);
    setIsModalOpen(true);
  };

  const handleSaveRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);

    const teacher = teachers.find(t => t.id === formTeacherId);

    const routinePayload = {
      dayOfWeek: Number(formDay),
      startTime: formStartTime,
      endTime: formEndTime,
      classId: formClassId,
      section: formSection,
      subjectId: formSubjectId,
      roomId: formRoomId,
      teacherId: formTeacherId,
      teacherName: teacher?.name || 'Assigned Teacher',
      notes: formNotes
    };

    if (editingItem) {
      const res = updateRoutine({ ...routinePayload, id: editingItem.id });
      if (!res.success) {
        setConflictError(res.conflictError || 'Schedule conflict detected.');
        return;
      }
    } else {
      const res = addRoutine(routinePayload);
      if (!res.success) {
        setConflictError(res.conflictError || 'Schedule conflict detected.');
        return;
      }
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (routineToDelete) {
      deleteRoutine(routineToDelete.id);
      setRoutineToDelete(null);
    }
  };

  const handleOpenSubstitute = (routine: ClassRoutineItem) => {
    setSubstituteRoutine(routine);
    const another = teachers.find(t => t.id !== routine.teacherId);
    setSubstituteTeacherId(another ? another.id : teachers[0]?.id || '');
    setIsSubstituteModalOpen(true);
  };

  const handleSaveSubstitute = () => {
    if (!substituteRoutine) return;
    const sub = teachers.find(t => t.id === substituteTeacherId);
    if (!sub) return;

    assignSubstituteTeacher(substituteRoutine.id, sub.id, sub.name);
    setIsSubstituteModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-emerald-950 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-rose-600" />
            <span>{language === 'bn' ? 'মাস্টার ক্লাস রুটিন ব্যবস্থাপনা' : 'Master Class Routine Management'}</span>
          </h1>
          <p className="text-xs text-emerald-700 mt-0.5">
            {language === 'bn'
              ? 'সাপ্তাহিক ক্লাস শিডিউল তৈরি, শিক্ষক ও কক্ষের সময় সংঘাত যাচাই এবং বিকল্প শিক্ষক নিয়োগ।'
              : 'Configure weekly routine schedules, detect teacher/room conflicts, and assign substitute teachers.'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 py-2.5 px-5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? 'নতুন ক্লাস যোগ করুন' : 'Schedule New Class'}</span>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="p-4 rounded-3xl bg-white border border-emerald-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
            <Filter className="w-3.5 h-3.5 text-rose-600" />
            <span>{language === 'bn' ? 'ফিল্টার:' : 'Filter:'}</span>
          </div>

          {/* Day Selector */}
          <select
            value={selectedDay}
            onChange={e => setSelectedDay(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-emerald-950 font-bold focus:outline-none focus:border-rose-500 cursor-pointer"
          >
            <option value="ALL">{language === 'bn' ? 'সব দিন' : 'All Days'}</option>
            {days.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} {d.id === new Date().getDay() ? (language === 'bn' ? '(আজকে)' : '(Today)') : ''}
              </option>
            ))}
          </select>

          {/* Teacher Selector */}
          <select
            value={selectedTeacherId}
            onChange={e => setSelectedTeacherId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-emerald-950 font-bold focus:outline-none focus:border-rose-500 cursor-pointer"
          >
            <option value="ALL">{language === 'bn' ? 'সব শিক্ষক' : 'All Teachers'}</option>
            {teachers.map(t => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Class Selector */}
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-emerald-950 font-bold focus:outline-none focus:border-rose-500 cursor-pointer"
          >
            <option value="ALL">{language === 'bn' ? 'সব শ্রেণি' : 'All Classes'}</option>
            {ALL_CLASSES.map(cls => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-emerald-700 font-medium">
          {language === 'bn'
            ? `মোট ${filteredRoutines.length} টি ক্লাস তালিকাভুক্ত`
            : `${filteredRoutines.length} routine slots scheduled`}
        </span>
      </div>

      {/* ROUTINE TABLE / CARDS */}
      <div className="bg-white border border-emerald-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-emerald-50/70 border-b border-emerald-200 text-emerald-900 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-bold">{language === 'bn' ? 'দিন ও সময়' : 'Day & Time'}</th>
                <th className="py-3.5 px-4 font-bold">{language === 'bn' ? 'শ্রেণি ও বিষয়' : 'Class & Subject'}</th>
                <th className="py-3.5 px-4 font-bold">{language === 'bn' ? 'কক্ষ নম্বর' : 'Room'}</th>
                <th className="py-3.5 px-4 font-bold">{language === 'bn' ? 'নিযুক্ত শিক্ষক' : 'Assigned Teacher'}</th>
                <th className="py-3.5 px-4 font-bold">{language === 'bn' ? 'বিকল্প শিক্ষক' : 'Substitute'}</th>
                <th className="py-3.5 px-4 font-bold text-right">{language === 'bn' ? 'কার্যক্রম' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {filteredRoutines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-emerald-700">
                    <Calendar className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
                    <p className="font-bold">{language === 'bn' ? 'কোনো রুটিন পাওয়া যায়নি।' : 'No routine classes match the selected filter.'}</p>
                  </td>
                </tr>
              ) : (
                filteredRoutines.map(r => {
                  const dayObj = days.find(d => d.id === r.dayOfWeek);
                  return (
                    <tr key={r.id} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-emerald-950 block">{dayObj?.name}</span>
                        <span className="text-[11px] text-emerald-700 font-mono flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-rose-600 inline" />
                          {r.startTime} - {r.endTime}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-emerald-950 block">
                          {r.classId} {r.section ? `(${r.section})` : ''}
                        </span>
                        <span className="text-[11px] text-emerald-700 font-medium">
                          {r.subjectId}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 font-mono text-[11px] font-bold">
                          {r.roomId}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-emerald-950 block">{r.teacherName}</span>
                        <span className="text-[10px] text-emerald-600">{r.teacherId}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        {r.substituteTeacherName ? (
                          <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-[11px] font-bold">
                            <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                            <span>{r.substituteTeacherName}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenSubstitute(r)}
                            className="text-[11px] text-emerald-700 hover:text-rose-600 font-bold underline cursor-pointer"
                          >
                            {language === 'bn' ? '+ বিকল্প শিক্ষক নিয়োগ' : '+ Assign Sub'}
                          </button>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(r)}
                          className="p-1.5 rounded-xl text-emerald-700 hover:text-emerald-950 hover:bg-emerald-100 transition-colors cursor-pointer"
                          title={language === 'bn' ? 'সম্পাদনা করুন' : 'Edit Class'}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setRoutineToDelete(r)}
                          className="p-1.5 rounded-xl text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors cursor-pointer"
                          title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete Class'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT ROUTINE MODAL WITH CONFLICT CHECKING */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm">
          <div className="bg-white border border-emerald-200 rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
              <h3 className="text-sm font-extrabold text-emerald-950">
                {editingItem
                  ? (language === 'bn' ? 'রুটিন ক্লাস সম্পাদনা করুন' : 'Edit Scheduled Class')
                  : (language === 'bn' ? 'নতুন রুটিন ক্লাস যোগ করুন' : 'Schedule New Class')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-emerald-700 hover:text-emerald-950 p-1 rounded-xl cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Validation Conflict Alert */}
            {conflictError && (
              <div className="p-3 my-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-semibold">{conflictError}</span>
              </div>
            )}

            <form onSubmit={handleSaveRoutine} className="space-y-3 my-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                    {language === 'bn' ? 'সপ্তাহের দিন' : 'Day of Week'}
                  </label>
                  <select
                    value={formDay}
                    onChange={e => setFormDay(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-950 font-bold focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    {days.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                    {language === 'bn' ? 'নিযুক্ত শিক্ষক' : 'Assigned Teacher'}
                  </label>
                  <select
                    value={formTeacherId}
                    onChange={e => setFormTeacherId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-950 font-bold focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                    {language === 'bn' ? 'শুরুর সময়' : 'Start Time'}
                  </label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={e => setFormStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-200 text-xs text-emerald-950 font-mono font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                    {language === 'bn' ? 'শেষের সময়' : 'End Time'}
                  </label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={e => setFormEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-200 text-xs text-emerald-950 font-mono font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                    {language === 'bn' ? 'শ্রেণি (Class)' : 'Class'}
                  </label>
                  <select
                    value={formClassId}
                    onChange={e => setFormClassId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-950 font-bold focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    {ALL_CLASSES.map(cls => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                    {language === 'bn' ? 'শাখা (Section)' : 'Section'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. A, B, Science"
                    value={formSection}
                    onChange={e => setFormSection(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-200 text-xs text-emerald-950 font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                    {language === 'bn' ? 'বিষয়' : 'Subject'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. English, Math"
                    value={formSubjectId}
                    onChange={e => setFormSubjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-200 text-xs text-emerald-950 font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                    {language === 'bn' ? 'শ্রেণিকক্ষ / রুম' : 'Classroom / Room'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Room 203"
                    value={formRoomId}
                    onChange={e => setFormRoomId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-200 text-xs text-emerald-950 font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                  {language === 'bn' ? 'বিশেষ নির্দেশনা / নোট' : 'Notes / Instructions'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'শিক্ষকের জন্য কোনো নির্দেশনা...' : 'Optional notes for teacher...'}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-200 text-xs text-emerald-950 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-900 border border-emerald-200 cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md cursor-pointer"
                >
                  {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Routine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN SUBSTITUTE TEACHER MODAL */}
      {isSubstituteModalOpen && substituteRoutine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm">
          <div className="bg-white border border-emerald-200 rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
              <h3 className="text-sm font-extrabold text-emerald-950">
                {language === 'bn' ? 'বিকল্প শিক্ষক নিয়োগ করুন' : 'Assign Substitute Teacher'}
              </h3>
              <button
                onClick={() => setIsSubstituteModalOpen(false)}
                className="text-emerald-700 hover:text-emerald-950 p-1 rounded-xl cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 space-y-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                <div className="font-bold text-emerald-950">
                  {substituteRoutine.classId} {substituteRoutine.section ? `(${substituteRoutine.section})` : ''} • {substituteRoutine.subjectId}
                </div>
                <div className="text-emerald-700">
                  {substituteRoutine.roomId} • {substituteRoutine.startTime} - {substituteRoutine.endTime}
                </div>
                <div className="text-rose-700 text-[11px] font-bold">
                  {language === 'bn'
                    ? `মূল শিক্ষক: ${substituteRoutine.teacherName}`
                    : `Regular Teacher: ${substituteRoutine.teacherName}`}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-800 mb-1">
                  {language === 'bn' ? 'বিকল্প শিক্ষক নির্বাচন করুন' : 'Select Substitute Teacher'}
                </label>
                <select
                  value={substituteTeacherId}
                  onChange={e => setSubstituteTeacherId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-950 font-bold focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  {teachers
                    .filter(t => t.id !== substituteRoutine.teacherId)
                    .map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.department})
                      </option>
                    ))}
                </select>
              </div>

              <p className="text-[11px] text-emerald-700">
                {language === 'bn'
                  ? 'বিকল্প শিক্ষক অবিলম্বে তাদের ড্যাশবোর্ডে এই ক্লাসটি দেখতে পাবেন এবং হাজিরা দিতে পারবেন।'
                  : 'The substitute teacher will immediately see this class on their dashboard with Start & Attend enabled.'}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSubstituteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-900 border border-emerald-200 cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveSubstitute}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md cursor-pointer"
              >
                {language === 'bn' ? 'নিয়োগ ও নোটিশ পাঠান' : 'Assign & Dispatch Notice'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE ROUTINE MODAL (Mandatory Dialog) */}
      {routineToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm">
          <div className="bg-white border-2 border-rose-500 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-950 text-sm">
                  {language === 'bn' ? 'রুটিন স্লটটি মুছে ফেলতে চান?' : 'Delete this routine slot?'}
                </h3>
                <p className="text-xs text-emerald-700">
                  {language === 'bn' ? 'এই ক্লাস শিডিউলটি রুটিন থেকে সরানো হবে।' : 'This class will be removed from the master schedule.'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-200 text-xs space-y-1">
              <span className="font-bold block text-emerald-950">
                {routineToDelete.classId} • {routineToDelete.subjectId}
              </span>
              <span className="text-[11px] text-emerald-700 block">
                {routineToDelete.roomId} | {routineToDelete.startTime} - {routineToDelete.endTime}
              </span>
              <span className="text-[11px] text-emerald-700 block font-medium">
                {language === 'bn' ? 'শিক্ষক:' : 'Teacher:'} {routineToDelete.teacherName}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setRoutineToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold border border-emerald-200 cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                {language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
