/**
 * TeachFlow Teacher Private Notes
 * Strict Privacy Architecture:
 * - Admin, other teachers, and employees have ZERO access.
 * - Private notes are isolated strictly to the authenticated teacher's private local store.
 * - Features custom in-app deletion modal (NO window.confirm), soft delete / trash,
 *   note restoration, permanent deletion, and empty trash controls in Red & Green theme with Bengali support.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Plus,
  Pin,
  PinOff,
  Trash2,
  Archive,
  Search,
  Tag,
  CheckCircle2,
  ShieldCheck,
  Edit3,
  X,
  RotateCcw,
  AlertTriangle,
  Flame,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { PrivateTeacherNote } from '../../types';

export const TeacherNotes: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    getTeacherPrivateNotes,
    saveTeacherPrivateNote,
    deleteTeacherPrivateNote,
    restoreTeacherPrivateNote,
    emptyTeacherNotesTrash,
    language
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PINNED' | 'ARCHIVED' | 'TRASH'>('ALL');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Note editor modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<PrivateTeacherNote | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTagsInput, setNoteTagsInput] = useState('');
  const [isNotePinned, setIsNotePinned] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVING' | 'SAVED'>('IDLE');

  // Custom Delete Confirmation Modal state (Replaces window.confirm)
  const [pendingDeleteNote, setPendingDeleteNote] = useState<PrivateTeacherNote | null>(null);
  const [isPermanentDeleteConfirm, setIsPermanentDeleteConfirm] = useState(false);
  const [showEmptyTrashConfirm, setShowEmptyTrashConfirm] = useState(false);

  if (!currentUser || currentUser.role !== 'TEACHER') {
    return (
      <div className="p-8 text-center text-rose-400 bg-rose-950/30 rounded-2xl border border-rose-800">
        <Lock className="w-10 h-10 mx-auto mb-2 text-rose-400" />
        <h3 className="font-bold">{language === 'bn' ? 'প্রবেশাধিকার সংরক্ষিত' : 'Access Restricted'}</h3>
        <p className="text-xs text-rose-300 mt-1">
          {language === 'bn'
            ? 'ব্যক্তিগত নোট শুধুমাত্র অনুমোদিত শিক্ষকরাই দেখতে পারেন।'
            : 'Private notes can only be accessed by authenticated teachers.'}
        </p>
      </div>
    );
  }

  // Get all notes including soft-deleted ones for the trash tab
  const allNotes = getTeacherPrivateNotes(true);
  const activeNotes = allNotes.filter(n => !n.isDeleted);
  const trashNotes = allNotes.filter(n => n.isDeleted);

  // Extract all unique tags from active notes
  const allTags = Array.from(
    new Set(activeNotes.flatMap(n => n.tags || []))
  );

  // Filter notes based on active tab and search
  const filteredNotes = (activeFilter === 'TRASH' ? trashNotes : activeNotes).filter(note => {
    if (activeFilter === 'PINNED' && !note.isPinned) return false;
    if (activeFilter === 'ARCHIVED' && !note.isArchived) return false;
    if (activeFilter === 'ALL' && note.isArchived) return false;

    if (selectedTag && !note.tags.includes(selectedTag)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = note.title.toLowerCase().includes(q);
      const matchContent = note.content.toLowerCase().includes(q);
      const matchTag = note.tags.some(t => t.toLowerCase().includes(q));
      return matchTitle || matchContent || matchTag;
    }

    return true;
  });

  const handleOpenNewNote = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteTagsInput('');
    setIsNotePinned(false);
    setSaveStatus('IDLE');
    setIsEditorOpen(true);
  };

  const handleEditNote = (note: PrivateTeacherNote) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteTagsInput(note.tags.join(', '));
    setIsNotePinned(note.isPinned);
    setSaveStatus('IDLE');
    setIsEditorOpen(true);
  };

  const handleSaveNote = () => {
    if (!noteTitle.trim() && !noteContent.trim()) return;

    setSaveStatus('SAVING');

    const tags = noteTagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    saveTeacherPrivateNote({
      id: editingNote?.id,
      title: noteTitle.trim() || (language === 'bn' ? 'শিরোনামহীন নোট' : 'Untitled Note'),
      content: noteContent.trim(),
      tags,
      isPinned: isNotePinned,
      isArchived: editingNote?.isArchived || false
    });

    setSaveStatus('SAVED');
    setTimeout(() => {
      setIsEditorOpen(false);
    }, 400);
  };

  const handleTogglePin = (note: PrivateTeacherNote) => {
    saveTeacherPrivateNote({
      ...note,
      isPinned: !note.isPinned
    });
  };

  const handleToggleArchive = (note: PrivateTeacherNote) => {
    saveTeacherPrivateNote({
      ...note,
      isArchived: !note.isArchived
    });
  };

  // Open custom in-app confirmation modal
  const handleInitiateDelete = (note: PrivateTeacherNote, permanent: boolean = false) => {
    setPendingDeleteNote(note);
    setIsPermanentDeleteConfirm(permanent);
  };

  const handleConfirmDelete = () => {
    if (!pendingDeleteNote) return;
    deleteTeacherPrivateNote(pendingDeleteNote.id, isPermanentDeleteConfirm);
    setPendingDeleteNote(null);
    setIsPermanentDeleteConfirm(false);
  };

  const handleRestore = (noteId: string) => {
    restoreTeacherPrivateNote(noteId);
  };

  const handleEmptyTrash = () => {
    emptyTeacherNotesTrash();
    setShowEmptyTrashConfirm(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Privacy Guarantee Banner */}
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-emerald-200 text-xs text-emerald-800 shadow-sm">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <div className="flex-1">
          <span className="font-bold text-emerald-950">
            {language === 'bn' ? 'সম্পূর্ণ ব্যক্তিগত শিক্ষক স্থান' : 'Private Teacher Workspace'}
          </span>: {language === 'bn'
            ? 'আপনার নোট সম্পূর্ণ নিরাপদ এবং শুধু আপনার একাউন্টে সুরক্ষিত। প্রশাসন বা অন্য কারো এখানে প্রবেশের সুযোগ নেই।'
            : 'Your notes are encrypted and stored strictly for your account. School administrators and other staff have zero access or visibility.'}
        </div>
      </div>

      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-emerald-950 tracking-tight flex items-center gap-2">
            <Lock className="w-6 h-6 text-rose-600" />
            <span>{language === 'bn' ? 'আমার ব্যক্তিগত নোট' : 'My Private Notes'}</span>
          </h1>
          <p className="text-xs text-emerald-700 mt-0.5">
            {language === 'bn'
              ? 'পাঠদানের পরিকল্পনা, শিক্ষার্থী পর্যবেক্ষণ, ব্যক্তিগত মেমো ও গুরুত্বপূর্ণ টীকা।'
              : 'Lesson ideas, student observations, personal plans, and reminders.'}
          </p>
        </div>

        <button
          onClick={handleOpenNewNote}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? 'নতুন নোট তৈরি করুন' : 'New Private Note'}</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'bn' ? 'কীওয়ার্ড বা ট্যাগ দিয়ে নোট খুঁজুন...' : 'Search private notes by keyword or tag...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-emerald-200 text-xs text-emerald-950 placeholder:text-emerald-700/60 focus:outline-none focus:border-rose-600 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-emerald-950 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs self-stretch sm:self-auto shadow-inner overflow-x-auto">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeFilter === 'ALL'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-emerald-800 hover:text-emerald-950'
            }`}
          >
            {language === 'bn' ? 'সকল' : 'All'} ({activeNotes.filter(n => !n.isArchived).length})
          </button>
          <button
            onClick={() => setActiveFilter('PINNED')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer ${
              activeFilter === 'PINNED'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-emerald-800 hover:text-emerald-950'
            }`}
          >
            <Pin className="w-3 h-3" />
            <span>{language === 'bn' ? 'পিন করা' : 'Pinned'}</span>
          </button>
          <button
            onClick={() => setActiveFilter('ARCHIVED')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer ${
              activeFilter === 'ARCHIVED'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-emerald-800 hover:text-emerald-950'
            }`}
          >
            <Archive className="w-3 h-3" />
            <span>{language === 'bn' ? 'আর্কাইভ' : 'Archived'}</span>
          </button>
          <button
            onClick={() => setActiveFilter('TRASH')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer ${
              activeFilter === 'TRASH'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-emerald-800 hover:text-rose-700'
            }`}
          >
            <Trash2 className="w-3 h-3" />
            <span>{language === 'bn' ? 'মুছে ফেলা' : 'Trash'}</span>
            {trashNotes.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeFilter === 'TRASH' ? 'bg-white text-rose-600' : 'bg-rose-100 text-rose-700'
              }`}>
                {trashNotes.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Trash Tab Notice & Empty Trash Button */}
      {activeFilter === 'TRASH' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              {language === 'bn'
                ? 'মুছে ফেলা নোটগুলো রিসাইকেল বিনে রয়েছে। চাইলে যেকোনো সময় ফিরিয়ে আনতে পারেন অথবা স্থায়ীভাবে মুছে ফেলতে পারেন।'
                : 'Items in trash can be restored or permanently removed forever.'}
            </span>
          </div>

          {trashNotes.length > 0 && (
            <button
              onClick={() => setShowEmptyTrashConfirm(true)}
              className="py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm self-start sm:self-auto transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'রিসাইকেল বিন খালি করুন' : 'Empty Trash'}</span>
            </button>
          )}
        </div>
      )}

      {/* Tag Filter Pills if any exist */}
      {activeFilter !== 'TRASH' && allTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-emerald-800 flex items-center gap-1 shrink-0 mr-1 font-bold">
            <Tag className="w-3 h-3 text-rose-600" /> {language === 'bn' ? 'ট্যাগ:' : 'Tags:'}
          </span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-2.5 py-1 rounded-full border text-[11px] font-bold transition-colors shrink-0 cursor-pointer ${
              selectedTag === null
                ? 'bg-rose-600 border-rose-600 text-white'
                : 'bg-white border-emerald-200 text-emerald-800 hover:text-emerald-950 shadow-sm'
            }`}
          >
            {language === 'bn' ? 'সব ট্যাগ' : 'All Tags'}
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-2.5 py-1 rounded-full border text-[11px] font-bold transition-colors shrink-0 cursor-pointer ${
                selectedTag === tag
                  ? 'bg-rose-600 border-rose-600 text-white'
                  : 'bg-white border-emerald-200 text-emerald-800 hover:text-emerald-950 shadow-sm'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-emerald-200 text-center shadow-sm">
          {activeFilter === 'TRASH' ? (
            <>
              <Trash2 className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-emerald-950">
                {language === 'bn' ? 'রিসাইকেল বিন সম্পূর্ণ খালি' : 'Trash is empty'}
              </h3>
              <p className="text-xs text-emerald-700 mt-1 max-w-sm mx-auto">
                {language === 'bn'
                  ? 'আপনার কোনো অপ্রয়োজনীয় বা মুছে ফেলা নোট নেই।'
                  : 'You have no deleted notes in the trash bin.'}
              </p>
            </>
          ) : (
            <>
              <Lock className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-emerald-950">
                {language === 'bn' ? 'কোনো ব্যক্তিগত নোট পাওয়া যায়নি' : 'No private notes found'}
              </h3>
              <p className="text-xs text-emerald-700 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? (language === 'bn' ? 'অনুসন্ধানের সাথে কোনো নোট মিলছে না।' : 'No notes match your search criteria.')
                  : (language === 'bn' ? 'পাঠদানের ভাবনা ও দরকারি তথ্য লিখে রাখুন। শুধুমাত্র আপনিই তা দেখতে পারবেন।' : 'Write down lesson ideas, thoughts, or reminders. Only you can view them.')}
              </p>
              <button
                onClick={handleOpenNewNote}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'bn' ? 'প্রথম নোট লিখুন' : 'Create First Note'}</span>
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map(note => {
            const isNoteDeleted = !!note.isDeleted;

            return (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`relative rounded-3xl p-5 border transition-all flex flex-col justify-between shadow-sm ${
                  isNoteDeleted
                    ? 'bg-rose-50/40 border-rose-200'
                    : note.isPinned
                    ? 'bg-rose-50/50 border-rose-300 ring-2 ring-rose-200'
                    : 'bg-white border-emerald-200 hover:border-emerald-400 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Top Bar on Note Card */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-extrabold text-base text-emerald-950 line-clamp-2">
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                      {!isNoteDeleted && (
                        <>
                          <button
                            onClick={() => handleTogglePin(note)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              note.isPinned
                                ? 'text-rose-600 bg-rose-100 hover:bg-rose-200'
                                : 'text-emerald-700 hover:text-emerald-950 hover:bg-emerald-50'
                            }`}
                            title={note.isPinned ? 'Unpin' : 'Pin note'}
                          >
                            {note.isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleToggleArchive(note)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              note.isArchived
                                ? 'text-rose-600 bg-rose-100'
                                : 'text-emerald-700 hover:text-emerald-950 hover:bg-emerald-50'
                            }`}
                            title={note.isArchived ? 'Unarchive' : 'Archive note'}
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Note Content preview */}
                  <p className="text-xs text-emerald-900/80 whitespace-pre-wrap line-clamp-6 leading-relaxed mb-4">
                    {note.content}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-emerald-100 space-y-2">
                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map(t => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-800"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions & Timestamp */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-emerald-700 font-mono">
                      {new Date(note.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>

                    {isNoteDeleted ? (
                      /* Actions for notes in Trash */
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleRestore(note.id)}
                          className="px-2.5 py-1 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                          title={language === 'bn' ? 'পুনরুদ্ধার করুন' : 'Restore note'}
                        >
                          <RotateCcw className="w-3 h-3 text-emerald-700" />
                          <span>{language === 'bn' ? 'পুনরুদ্ধার' : 'Restore'}</span>
                        </button>
                        <button
                          onClick={() => handleInitiateDelete(note, true)}
                          className="px-2.5 py-1 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                          title={language === 'bn' ? 'স্থায়ীভাবে মুছুন' : 'Delete permanently'}
                        >
                          <Trash2 className="w-3 h-3 text-rose-700" />
                          <span>{language === 'bn' ? 'স্থায়ী ডিলিট' : 'Delete'}</span>
                        </button>
                      </div>
                    ) : (
                      /* Actions for active notes */
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditNote(note)}
                          className="p-1.5 rounded-lg text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title={language === 'bn' ? 'সম্পাদনা' : 'Edit note'}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleInitiateDelete(note, false)}
                          className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors cursor-pointer"
                          title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete note'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* CUSTOM IN-APP DELETE CONFIRMATION MODAL (Replaces window.confirm completely) */}
      <AnimatePresence>
        {pendingDeleteNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-2 border-rose-400 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-extrabold text-base text-rose-950">
                  {isPermanentDeleteConfirm
                    ? (language === 'bn' ? 'নোটটি স্থায়ীভাবে মুছে ফেলতে চান?' : 'Delete this note permanently?')
                    : (language === 'bn' ? 'নোটটি মুছে ফেলতে চান?' : 'Delete this note?')}
                </h3>
                <p className="text-xs text-rose-800 mt-1">
                  <strong>&quot;{pendingDeleteNote.title}&quot;</strong>
                </p>
                <p className="text-[11px] text-emerald-800 mt-2">
                  {isPermanentDeleteConfirm
                    ? (language === 'bn'
                        ? 'সতর্কতা: এটি আর কখনো ফিরিয়ে আনা সম্ভব হবে না।'
                        : 'Warning: This action cannot be undone. The note will be permanently purged.')
                    : (language === 'bn'
                        ? 'এটি রিসাইকেল বিনে চলে যাবে। চাইলে পরবর্তীতে যেকোনো সময় পুনরুদ্ধার করতে পারবেন।'
                        : 'This note will move to Trash. You can restore it anytime.')}
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => {
                    setPendingDeleteNote(null);
                    setIsPermanentDeleteConfirm(false);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold text-xs transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  {isPermanentDeleteConfirm
                    ? (language === 'bn' ? 'হ্যাঁ, স্থায়ীভাবে মুছুন' : 'Delete Forever')
                    : (language === 'bn' ? 'হ্যাঁ, মুছে ফেলুন' : 'Move to Trash')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EMPTY TRASH CONFIRMATION MODAL */}
      <AnimatePresence>
        {showEmptyTrashConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-2 border-rose-500 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-extrabold text-base text-rose-950">
                  {language === 'bn' ? 'রিসাইকেল বিন সম্পূর্ণ খালি করবেন?' : 'Empty entire Trash bin?'}
                </h3>
                <p className="text-xs text-rose-800 mt-1">
                  {language === 'bn'
                    ? `রিসাইকেল বিনে থাকা মোট ${trashNotes.length} টি নোট স্থায়ীভাবে মুছে ফেলা হবে।`
                    : `All ${trashNotes.length} notes in trash will be permanently purged.`}
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setShowEmptyTrashConfirm(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold text-xs transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  onClick={handleEmptyTrash}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'হ্যাঁ, খালি করুন' : 'Yes, Empty Trash'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NOTE EDITOR MODAL */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white border-2 border-emerald-500 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative my-auto space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                <h3 className="font-extrabold text-lg text-emerald-950 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-rose-600" />
                  <span>
                    {editingNote
                      ? (language === 'bn' ? 'নোট সম্পাদনা' : 'Edit Note')
                      : (language === 'bn' ? 'নতুন ব্যক্তিগত নোট' : 'New Private Note')}
                  </span>
                </h3>
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-1.5 rounded-full text-emerald-700 hover:text-emerald-950 hover:bg-emerald-50 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Title input */}
              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1">
                  {language === 'bn' ? 'নোটের শিরোনাম' : 'Note Title'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'যেমন: অষ্টম শ্রেণীর বিজ্ঞান পাঠ পরিকল্পনা...' : 'e.g., Class 8 Science lesson plan...'}
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-emerald-300 text-sm font-bold text-emerald-950 focus:outline-none focus:border-rose-600"
                />
              </div>

              {/* Content textarea */}
              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1">
                  {language === 'bn' ? 'নোটের বিবরণ / বিষয়বস্তু' : 'Content / Body'}
                </label>
                <textarea
                  rows={6}
                  placeholder={language === 'bn' ? 'আপনার চিন্তাভাবনা, পর্যবেক্ষণ বা নোট লিখুন...' : 'Write your private observation, ideas or memo here...'}
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-white border border-emerald-300 text-xs text-emerald-950 focus:outline-none focus:border-rose-600 resize-none leading-relaxed"
                />
              </div>

              {/* Tags & Pin Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold text-emerald-900 mb-1">
                    {language === 'bn' ? 'ট্যাগ (কমা দিয়ে আলাদা করুন)' : 'Tags (comma separated)'}
                  </label>
                  <input
                    type="text"
                    placeholder="Science, Class8, Exam"
                    value={noteTagsInput}
                    onChange={e => setNoteTagsInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-300 text-xs text-emerald-950 focus:outline-none focus:border-rose-600"
                  />
                </div>

                <div className="flex items-center gap-2 sm:pt-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-emerald-950">
                    <input
                      type="checkbox"
                      checked={isNotePinned}
                      onChange={e => setIsNotePinned(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-emerald-300"
                    />
                    <span>{language === 'bn' ? 'উপরে পিন করে রাখুন' : 'Pin to top'}</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-emerald-100">
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  onClick={handleSaveNote}
                  disabled={saveStatus === 'SAVING' || (!noteTitle.trim() && !noteContent.trim())}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {saveStatus === 'SAVING' ? (
                    <span>{language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
                  ) : saveStatus === 'SAVED' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{language === 'bn' ? 'সংরক্ষিত!' : 'Saved!'}</span>
                    </>
                  ) : (
                    <span>{language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Note'}</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
