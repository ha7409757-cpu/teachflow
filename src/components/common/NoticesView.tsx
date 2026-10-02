/**
 * TeachFlow Notices & Official Announcements
 * Displays school board notices, priority flags, routine updates,
 * and allows Admins to broadcast messages in Red & Green theme with Bengali support.
 */

import React, { useState } from 'react';
import { Bell, Plus, AlertTriangle, AlertCircle, Info, Calendar, Check, X, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Notice } from '../../types';

export const NoticesView: React.FC = () => {
  const { currentUser } = useAuth();
  const { notices, createNotice, deleteNotice, markNoticeAsRead, language } = useApp();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState<Notice | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<Notice['priority']>('GENERAL');
  const [targetAudience, setTargetAudience] = useState<Notice['targetAudience']>('ALL');

  if (!currentUser) return null;

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    createNotice({
      title: title.trim(),
      content: content.trim(),
      priority,
      targetAudience
    });

    setTitle('');
    setContent('');
    setIsCreateModalOpen(false);
  };

  const getPriorityBadge = (p: Notice['priority']) => {
    switch (p) {
      case 'EMERGENCY':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'IMPORTANT':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'ROUTINE_CHANGE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'MEETING':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  const getPriorityLabel = (p: Notice['priority']) => {
    if (language === 'bn') {
      switch (p) {
        case 'EMERGENCY': return 'জরুরি';
        case 'IMPORTANT': return 'গুরুত্বপূর্ণ';
        case 'ROUTINE_CHANGE': return 'রুটিন পরিবর্তন';
        case 'MEETING': return 'সভা';
        default: return 'সাধারণ';
      }
    }
    return p.replace('_', ' ');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-emerald-950 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-rose-600" />
            <span>{language === 'bn' ? 'বিদ্যালয় নোটিশ ও বুলেটিন' : 'School Notices & Bulletins'}</span>
          </h1>
          <p className="text-xs text-emerald-700 mt-0.5">
            {language === 'bn'
              ? 'বিদ্যালয় প্রশাসনের অফিসিয়াল ঘোষণা ও গুরুত্বপূর্ণ নোটিশ।'
              : 'Official announcements from the administration of Dhaka Model Academy & College.'}
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 py-2.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-md self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? 'নোটিশ প্রকাশ করুন' : 'Publish Notice'}</span>
          </button>
        )}
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {notices.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-emerald-200 text-center text-emerald-700 shadow-sm">
            <Bell className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-emerald-950">
              {language === 'bn' ? 'কোনো নোটিশ নেই' : 'No active notices'}
            </h3>
            <p className="text-xs text-emerald-700 mt-1">
              {language === 'bn' ? 'বর্তমানে কোনো সক্রিয় নোটিশ নেই।' : 'There are no school notices at this time.'}
            </p>
          </div>
        ) : (
          notices.map(notice => {
            const isRead = Array.isArray(notice.readByUserIds) && currentUser ? notice.readByUserIds.includes(currentUser.id) : false;

            return (
              <div
                key={notice.id}
                onClick={() => !isRead && markNoticeAsRead(notice.id)}
                className={`p-6 rounded-2xl bg-white border transition-all cursor-pointer shadow-sm ${
                  !isRead ? 'border-rose-400 bg-rose-50/30' : 'border-emerald-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {!isRead && <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />}
                    <h3 className="text-base font-bold text-emerald-950">{notice.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getPriorityBadge(
                        notice.priority
                      )}`}
                    >
                      {getPriorityLabel(notice.priority)}
                    </span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                      {language === 'bn' ? 'লক্ষ্য:' : 'Audience:'} {notice.targetAudience}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-emerald-900 leading-relaxed font-sans mt-2">
                  {notice.content}
                </p>

                <div className="flex items-center justify-between text-[11px] text-emerald-700 pt-3 mt-3 border-t border-emerald-100">
                  <div className="flex items-center gap-2">
                    <span>{language === 'bn' ? 'প্রণেতা' : 'Author'}: {notice.authorName}</span>
                    {currentUser.role === 'ADMIN' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setNoticeToDelete(notice);
                        }}
                        className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
                        title={language === 'bn' ? 'নোটিশ মুছুন' : 'Delete notice'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'মুছুন' : 'Delete'}</span>
                      </button>
                    )}
                  </div>
                  <span>
                    {new Date(notice.createdAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Admin Publish Notice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm">
          <div className="bg-white border-2 border-emerald-500 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
              <h3 className="text-base font-bold text-emerald-950">
                {language === 'bn' ? 'বিদ্যালয় নোটিশ প্রকাশ করুন' : 'Publish School Notice'}
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-emerald-700 hover:text-emerald-950 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-4 my-4">
              <div>
                <label className="block text-xs font-bold text-emerald-950 mb-1">
                  {language === 'bn' ? 'নোটিশের শিরোনাম' : 'Notice Title'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'bn' ? 'উদা: অর্ধবার্ষিক পরীক্ষার প্রশ্নপত্র জমা দেওয়ার তারিখ' : 'e.g. Mid-Term Question Paper Submission Deadline'}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-emerald-300 text-xs text-emerald-950 placeholder:text-emerald-700/60 focus:outline-none focus:border-rose-600 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-950 mb-1">
                    {language === 'bn' ? 'অগ্রাধিকার (Priority)' : 'Priority'}
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-emerald-300 text-xs text-emerald-950 focus:outline-none focus:border-rose-600 shadow-sm"
                  >
                    <option value="GENERAL">{language === 'bn' ? 'সাধারণ নোটিশ' : 'General Notice'}</option>
                    <option value="IMPORTANT">{language === 'bn' ? 'গুরুত্বপূর্ণ' : 'Important'}</option>
                    <option value="EMERGENCY">{language === 'bn' ? 'জরুরি' : 'Emergency'}</option>
                    <option value="ROUTINE_CHANGE">{language === 'bn' ? 'রুটিন পরিবর্তন' : 'Routine Change'}</option>
                    <option value="MEETING">{language === 'bn' ? 'সভা ঘোষণা' : 'Meeting Announcement'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-950 mb-1">
                    {language === 'bn' ? 'উদ্দিষ্ট প্রাপক' : 'Target Audience'}
                  </label>
                  <select
                    value={targetAudience}
                    onChange={e => setTargetAudience(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-emerald-300 text-xs text-emerald-950 focus:outline-none focus:border-rose-600 shadow-sm"
                  >
                    <option value="ALL">{language === 'bn' ? 'সকল কর্মী (শিক্ষক ও কর্মচারী)' : 'All Staff (Teachers + Employees)'}</option>
                    <option value="TEACHERS">{language === 'bn' ? 'শুধুমাত্র শিক্ষক' : 'Teachers Only'}</option>
                    <option value="EMPLOYEES">{language === 'bn' ? 'শুধুমাত্র কর্মচারী' : 'Employees Only'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-950 mb-1">
                  {language === 'bn' ? 'নোটিশের বিস্তারিত বক্তব্য' : 'Notice Content'}
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder={language === 'bn' ? 'বিদ্যালয়ের কর্মীদের জন্য সম্পূর্ণ নোটিশটি লিখুন...' : 'Enter full announcement text for school staff...'}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-emerald-300 text-xs text-emerald-950 placeholder:text-emerald-700/60 focus:outline-none focus:border-rose-600 resize-none font-sans shadow-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-900 border border-emerald-200 cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md cursor-pointer"
                >
                  {language === 'bn' ? 'নোটিশ প্রকাশ করুন' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE NOTICE MODAL */}
      {noticeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm">
          <div className="bg-white border-2 border-rose-500 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-950 text-sm">
                  {language === 'bn' ? 'নোটিশটি মুছে ফেলতে চান?' : 'Delete this notice?'}
                </h3>
                <p className="text-xs text-emerald-700">
                  {language === 'bn' ? 'এই নোটিশটি স্কুল বোর্ড থেকে মুছে ফেলা হবে।' : 'This notice will be removed from the school notice board.'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-200 text-xs">
              <span className="font-bold block text-emerald-950">{noticeToDelete.title}</span>
              <span className="text-[11px] text-emerald-700 block mt-1 line-clamp-2">{noticeToDelete.content}</span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setNoticeToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold border border-emerald-200 cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  deleteNotice(noticeToDelete.id);
                  setNoticeToDelete(null);
                }}
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
