import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Play,
  UserCheck,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ClassRoutineItem, ALL_CLASSES } from '../../types';

interface MyRoutineProps {
  onStartClassDirect?: (routineId: string) => void;
}

export const MyRoutine: React.FC<MyRoutineProps> = ({ onStartClassDirect }) => {
  const { currentUser } = useAuth();
  const {
    routines,
    classSessions,
    startClassOneTap,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    language
  } = useApp();

  const days = [
    { id: 0, name: language === 'bn' ? 'রবিবার' : 'Sunday', short: language === 'bn' ? 'রবি' : 'Sun' },
    { id: 1, name: language === 'bn' ? 'সোমবার' : 'Monday', short: language === 'bn' ? 'সোম' : 'Mon' },
    { id: 2, name: language === 'bn' ? 'মঙ্গলবার' : 'Tuesday', short: language === 'bn' ? 'মঙ্গল' : 'Tue' },
    { id: 3, name: language === 'bn' ? 'বুধবার' : 'Wednesday', short: language === 'bn' ? 'বুধ' : 'Wed' },
    { id: 4, name: language === 'bn' ? 'বৃহস্পতিবার' : 'Thursday', short: language === 'bn' ? 'বৃহঃ' : 'Thu' },
    { id: 5, name: language === 'bn' ? 'শুক্রবার' : 'Friday', short: language === 'bn' ? 'শুক্র' : 'Fri' },
    { id: 6, name: language === 'bn' ? 'শনিবার' : 'Saturday', short: language === 'bn' ? 'শনি' : 'Sat' }
  ];

  const currentDayOfWeek = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState<number>(currentDayOfWeek);

  // Modal State for Teacher Setting Their Own Routine
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRoutine, setEditingRoutine] = useState<ClassRoutineItem | null>(null);
  const [routineToDelete, setRoutineToDelete] = useState<ClassRoutineItem | null>(null);

  // Form fields
  const [formDay, setFormDay] = useState<number>(currentDayOfWeek);
  const [formClassId, setFormClassId] = useState<string>('Class 8');
  const [formSection, setFormSection] = useState<string>('Section A');
  const [formSubjectId, setFormSubjectId] = useState<string>('English');
  const [formRoomId, setFormRoomId] = useState<string>('Room 201');
  const [formStartTime, setFormStartTime] = useState<string>('10:00');
  const [formEndTime, setFormEndTime] = useState<string>('10:45');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  if (!currentUser) return null;

  // Filter routines for this teacher (or substitute teacher) for selected day
  const dayRoutines = routines
    .filter(
      r =>
        (r.teacherId === currentUser.id || r.substituteTeacherId === currentUser.id) &&
        r.dayOfWeek === selectedDay
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleOpenAdd = () => {
    setEditingRoutine(null);
    setFormDay(selectedDay);
    setFormClassId('Class 8');
    setFormSection('Section A');
    setFormSubjectId(currentUser.assignedSubjects?.[0] || 'বাংলা');
    setFormRoomId('Room 201');
    setFormStartTime('10:00');
    setFormEndTime('10:45');
    setFormNotes('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (routine: ClassRoutineItem) => {
    setEditingRoutine(routine);
    setFormDay(routine.dayOfWeek);
    setFormClassId(routine.classId);
    setFormSection(routine.section || 'Section A');
    setFormSubjectId(routine.subjectId);
    setFormRoomId(routine.roomId);
    setFormStartTime(routine.startTime);
    setFormEndTime(routine.endTime);
    setFormNotes(routine.notes || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (formStartTime >= formEndTime) {
      setFormError(language === 'bn' ? 'শুরুর সময় শেষের সময়ের আগে হতে হবে।' : 'Start time must be before end time.');
      return;
    }

    if (editingRoutine) {
      const res = updateRoutine({
        ...editingRoutine,
        dayOfWeek: formDay,
        startTime: formStartTime,
        endTime: formEndTime,
        classId: formClassId,
        section: formSection,
        subjectId: formSubjectId,
        roomId: formRoomId,
        notes: formNotes
      });

      if (res.success) {
        setIsModalOpen(false);
      } else {
        setFormError(res.conflictError || 'আপডেট করতে সমস্যা হয়েছে।');
      }
    } else {
      const res = addRoutine({
        dayOfWeek: formDay,
        startTime: formStartTime,
        endTime: formEndTime,
        classId: formClassId,
        section: formSection,
        subjectId: formSubjectId,
        teacherId: currentUser.id,
        teacherName: currentUser.name,
        roomId: formRoomId,
        notes: formNotes
      });

      if (res.success) {
        setIsModalOpen(false);
      } else {
        setFormError(res.conflictError || 'নতুন ক্লাস যোগ করতে সমস্যা হয়েছে।');
      }
    }
  };

  const handleDelete = (routine: ClassRoutineItem) => {
    setRoutineToDelete(routine);
  };

  const handleConfirmDelete = () => {
    if (routineToDelete) {
      deleteRoutine(routineToDelete.id);
      setRoutineToDelete(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-emerald-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-emerald-950 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-rose-600" />
            <span>{language === 'bn' ? 'আমার ক্লাস রুটিন' : 'My Class Routine'}</span>
          </h1>
          <p className="text-xs text-emerald-700 mt-0.5">
            {language === 'bn'
              ? `${currentUser.name} • নিজের ইচ্ছামত ক্লাস, বিষয় ও সময় সেট করুন`
              : `Customize and manage your personal class schedule freely.`}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? '➕ নিজের ক্লাস সেট করুন' : '➕ Set New Class'}</span>
        </button>
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {days.map(d => {
          const isToday = d.id === currentDayOfWeek;
          const isSelected = d.id === selectedDay;

          return (
            <button
              key={d.id}
              onClick={() => setSelectedDay(d.id)}
              className={`flex flex-col items-center px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 border cursor-pointer ${
                isSelected
                  ? 'bg-rose-600 text-white border-rose-600 shadow-md scale-105'
                  : 'bg-white border-emerald-200 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50 shadow-sm'
              }`}
            >
              <span>{d.short}</span>
              {isToday && (
                <span
                  className={`text-[9px] mt-0.5 font-bold uppercase tracking-wider ${
                    isSelected ? 'text-white' : 'text-rose-600'
                  }`}
                >
                  {language === 'bn' ? 'আজ' : 'Today'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Routine Cards Timeline */}
      <div className="space-y-3">
        {dayRoutines.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-emerald-200 text-center text-emerald-700 shadow-sm space-y-3">
            <Calendar className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-emerald-950">
              {language === 'bn' ? 'এই বারে কোনো ক্লাস সেট করা নেই' : 'No classes scheduled for this day'}
            </h3>
            <p className="text-xs text-emerald-700 max-w-sm mx-auto">
              {language === 'bn'
                ? `আপনি এখনই কয়টা থেকে কয়টা কি ক্লাস নেবেন তা নিজের মতো সেট করতে পারেন।`
                : `You can set what time and what subject you want to teach now.`}
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'bn' ? 'এই বারে ক্লাস যোগ করুন' : 'Add Class for this Day'}</span>
            </button>
          </div>
        ) : (
          dayRoutines.map(routine => {
            const isToday = selectedDay === currentDayOfWeek;
            const session = classSessions.find(
              s => s.routineId === routine.id && s.date === new Date().toISOString().split('T')[0]
            );

            let statusLabel = language === 'bn' ? 'নির্ধারিত' : 'Scheduled';
            let statusStyle = 'bg-white text-emerald-800 border-emerald-200';

            if (session?.status === 'RUNNING') {
              statusLabel = language === 'bn' ? 'লাইভ চলছে' : 'Running Now';
              statusStyle = 'bg-rose-50 text-rose-700 border-rose-300 font-bold';
            } else if (session?.status === 'COMPLETED') {
              statusLabel = language === 'bn' ? 'সম্পন্ন' : 'Completed';
              statusStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200 line-through';
            } else if (routine.substituteTeacherId === currentUser.id) {
              statusLabel = language === 'bn' ? 'সাবস্টিটিউট দায়িত্ব' : 'Substitute Duty';
              statusStyle = 'bg-amber-50 text-amber-800 border-amber-300';
            }

            const canManageThis = routine.teacherId === currentUser.id;

            return (
              <div
                key={routine.id}
                className="p-5 rounded-2xl bg-white border border-emerald-200 hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
              >
                {/* Time & Details */}
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center shrink-0 w-24 shadow-inner">
                    <span className="text-xs font-mono font-bold text-rose-600 block">
                      {routine.startTime}
                    </span>
                    <span className="text-[10px] text-emerald-800 block mt-0.5 font-medium">
                      থেকে {routine.endTime}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-emerald-950">
                        {routine.classId} • {routine.subjectId}
                      </span>
                      {routine.section && (
                        <span className="text-xs text-emerald-700 font-medium">
                          ({routine.section})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-emerald-700 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-600" />
                        <strong className="text-emerald-950">{routine.roomId}</strong>
                      </span>
                      {routine.notes && (
                        <span className="text-emerald-800 truncate max-w-xs">
                          {language === 'bn' ? 'নোট' : 'Note'}: {routine.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions: Start Class, Edit, Delete */}
                <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${statusStyle}`}>
                    {statusLabel}
                  </span>

                  {/* Edit/Delete if teacher's own class */}
                  {canManageThis && (
                    <div className="flex items-center gap-1 border-l border-emerald-200 pl-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(routine)}
                        className="p-1.5 rounded-xl text-emerald-700 hover:text-emerald-950 hover:bg-emerald-50 transition-all cursor-pointer"
                        title={language === 'bn' ? 'ক্লাস সময়/বিষয় পরিবর্তন করুন' : 'Edit schedule'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(routine)}
                        className="p-1.5 rounded-xl text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-all cursor-pointer"
                        title={language === 'bn' ? 'ক্লাস শিডিউল থেকে মুছুন' : 'Delete class'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Start button if today and not yet finished */}
                  {isToday && session?.status !== 'RUNNING' && session?.status !== 'COMPLETED' && (
                    <button
                      onClick={() =>
                        onStartClassDirect
                          ? onStartClassDirect(routine.id)
                          : startClassOneTap(routine.id)
                      }
                      className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{language === 'bn' ? 'ক্লাস শুরু ও হাজিরা' : 'Start & Attend'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Add or Edit Class Schedule */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white border border-emerald-200 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-emerald-950">
                    {editingRoutine
                      ? (language === 'bn' ? 'ক্লাস শিডিউল সম্পাদনা করুন' : 'Edit Class Schedule')
                      : (language === 'bn' ? 'নিজের নতুন ক্লাস সেট করুন' : 'Set Your Class Schedule')}
                  </h3>
                  <span className="text-[11px] text-emerald-700 block">
                    {language === 'bn'
                      ? 'কয়টা থেকে কয়টা কি ক্লাস নেবেন তা নিজের মতো নির্ধারণ করুন'
                      : 'Set starting time, ending time, subject, and room.'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-emerald-600 hover:text-emerald-950 hover:bg-emerald-50 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error banner */}
            {formError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveRoutine} className="space-y-4">
              {/* Day of Week */}
              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1">
                  {language === 'bn' ? 'বার নির্বাচন করুন *' : 'Day of Week *'}
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {days.map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setFormDay(d.id)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        formDay === d.id
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {d.short}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timing: Start and End Time */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs font-extrabold text-emerald-950 block mb-2">
                  ⏰ {language === 'bn' ? 'কয়টা থেকে কয়টা ক্লাস?' : 'Class Timings (From - To)'}
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                      {language === 'bn' ? 'শুরুর সময় (কয়টা থেকে) *' : 'Start Time *'}
                    </label>
                    <input
                      type="time"
                      required
                      value={formStartTime}
                      onChange={e => setFormStartTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-950 text-sm font-mono font-bold focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                      {language === 'bn' ? 'শেষের সময় (কয়টা পর্যন্ত) *' : 'End Time *'}
                    </label>
                    <input
                      type="time"
                      required
                      value={formEndTime}
                      onChange={e => setFormEndTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-950 text-sm font-mono font-bold focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Class & Section */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-900 mb-1">
                    {language === 'bn' ? 'শ্রেণি / গ্রেড *' : 'Class / Grade *'}
                  </label>
                  <select
                    required
                    value={formClassId}
                    onChange={e => setFormClassId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-950 text-xs font-bold focus:ring-2 focus:ring-rose-500 outline-none cursor-pointer"
                  >
                    {ALL_CLASSES.map(cls => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-900 mb-1">
                    {language === 'bn' ? 'শাখা / সেকশন *' : 'Section *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formSection}
                    onChange={e => setFormSection(e.target.value)}
                    placeholder="যেমন: Section A বা পদ্মা"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-950 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
              </div>

              {/* Subject & Room */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-900 mb-1">
                    {language === 'bn' ? 'বিষয় (কি ক্লাস) *' : 'Subject *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formSubjectId}
                    onChange={e => setFormSubjectId(e.target.value)}
                    placeholder="যেমন: গণিত, ইংরেজি, বিজ্ঞান"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-950 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-900 mb-1">
                    {language === 'bn' ? 'রুম নম্বর *' : 'Room No. *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formRoomId}
                    onChange={e => setFormRoomId(e.target.value)}
                    placeholder="যেমন: Room 201"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-950 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1">
                  {language === 'bn' ? 'ঐচ্ছিক বিষয় বিবরণ বা নোট' : 'Optional Notes / Topic'}
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="যেমন: প্রথম সাময়িক সিলেবাস অনুশীলন"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-950 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-emerald-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-emerald-200 text-emerald-800 hover:bg-emerald-50 text-xs font-bold transition-all cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  {editingRoutine
                    ? (language === 'bn' ? 'শিডিউল সংরক্ষণ করুন' : 'Save Changes')
                    : (language === 'bn' ? 'ক্লাস সেট করুন' : 'Save Routine')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL (Rule: Confirmation Dialog for Destructive Actions) */}
      {routineToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm">
          <div className="bg-white border-2 border-rose-500 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-950 text-sm">
                  {language === 'bn' ? 'ক্লাস শিডিউলটি মুছে ফেলতে চান?' : 'Delete this routine class?'}
                </h3>
                <p className="text-xs text-emerald-700">
                  {language === 'bn'
                    ? 'এই ক্লাসটি আপনার রুটিন থেকে স্থায়ীভাবে মুছে যাবে।'
                    : 'This class will be permanently removed from your schedule.'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-200 text-xs space-y-1">
              <span className="font-bold block text-emerald-950">
                {routineToDelete.classId} {routineToDelete.section ? `(${routineToDelete.section})` : ''} • {routineToDelete.subjectId}
              </span>
              <span className="text-[11px] text-emerald-700 block">
                {routineToDelete.roomId} | {routineToDelete.startTime} - {routineToDelete.endTime}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRoutineToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold border border-emerald-200 cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
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

