/**
 * TeachFlow Leave Management View (For Teachers & Employees)
 * Allows staff to apply for leaves and track approval status in Red & Green theme with Bengali support.
 */

import React, { useState } from 'react';
import { Briefcase, Plus, Calendar, Clock, CheckCircle2, AlertCircle, X, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { LeaveRequest } from '../../types';

export const LeaveRequestsView: React.FC = () => {
  const { currentUser } = useAuth();
  const { leaveRequests, submitLeaveRequest, deleteLeaveRequest, language } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState<LeaveRequest | null>(null);
  const [leaveType, setLeaveType] = useState<LeaveRequest['leaveType']>('CASUAL');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');

  if (!currentUser) return null;

  const myLeaves = leaveRequests.filter(l => l.userId === currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    // Calculate days
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const diffDays = Math.max(1, Math.round((end - start) / (1000 * 3600 * 24)) + 1);

    submitLeaveRequest({
      leaveType,
      startDate,
      endDate,
      daysCount: diffDays,
      reason: reason.trim()
    });

    setReason('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-emerald-950 tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-rose-600" />
            <span>{language === 'bn' ? 'ছুটি ব্যবস্থাপনা' : 'Leave Management'}</span>
          </h1>
          <p className="text-xs text-emerald-700 mt-0.5">
            {language === 'bn'
              ? 'ছুটির আবেদন জমা দিন এবং প্রশাসনের অনুমোদনের অবস্থা পর্যবেক্ষণ করুন।'
              : 'Submit leave applications and monitor approval from Administration.'}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 py-2.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-md self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? 'ছুটির আবেদন করুন' : 'Apply for Leave'}</span>
        </button>
      </div>

      {/* Leaves List */}
      <div className="space-y-3">
        {myLeaves.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-emerald-200 text-center text-emerald-700 shadow-sm">
            <Calendar className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-emerald-950">
              {language === 'bn' ? 'কোনো আবেদন পাওয়া যায়নি' : 'No leave requests found'}
            </h3>
            <p className="text-xs text-emerald-700 mt-1">
              {language === 'bn'
                ? 'আপনি এখনও কোনো ছুটির আবেদন জমা দেননি।'
                : "You haven't submitted any leave requests yet."}
            </p>
          </div>
        ) : (
          myLeaves.map(leave => (
            <div
              key={leave.id}
              className="p-5 rounded-2xl bg-white border border-emerald-200 hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-emerald-950">
                    {leave.leaveType} {language === 'bn' ? 'ছুটি' : 'Leave'} ({leave.daysCount} {language === 'bn' ? 'দিন' : leave.daysCount === 1 ? 'day' : 'days'})
                  </span>
                  <span className="text-xs text-emerald-700 font-mono">
                    {leave.startDate} {language === 'bn' ? 'থেকে' : 'to'} {leave.endDate}
                  </span>
                </div>
                <p className="text-xs text-emerald-900">{leave.reason}</p>

                {leave.adminNotes && (
                  <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    {language === 'bn' ? 'প্রশাসনিক মন্তব্য' : 'Admin note'}: {leave.adminNotes}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    leave.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : leave.status === 'REJECTED'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  {leave.status === 'APPROVED' && language === 'bn'
                    ? 'অনুমোদিত'
                    : leave.status === 'REJECTED' && language === 'bn'
                    ? 'প্রত্যাখ্যাত'
                    : leave.status === 'PENDING' && language === 'bn'
                    ? 'বিবেচনাধীন'
                    : leave.status}
                </span>

                <button
                  onClick={() => setLeaveToDelete(leave)}
                  className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                  title={language === 'bn' ? 'ছুটির আবেদন মুছুন' : 'Delete leave request'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Apply Leave Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm">
          <div className="bg-white border-2 border-emerald-500 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
              <h3 className="text-base font-bold text-emerald-950">
                {language === 'bn' ? 'ছুটির আবেদন ফর্ম' : 'Apply for Leave'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-emerald-700 hover:text-emerald-950 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 my-4">
              <div>
                <label className="block text-xs font-bold text-emerald-950 mb-1">
                  {language === 'bn' ? 'ছুটির ধরন' : 'Leave Type'}
                </label>
                <select
                  value={leaveType}
                  onChange={e => setLeaveType(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-emerald-300 text-xs text-emerald-950 focus:outline-none focus:border-rose-600 shadow-sm"
                >
                  <option value="CASUAL">{language === 'bn' ? 'নৈমিত্তিক ছুটি (Casual)' : 'Casual Leave'}</option>
                  <option value="SICK">{language === 'bn' ? 'অসুস্থতাজনিত ছুটি (Sick)' : 'Sick Leave'}</option>
                  <option value="EMERGENCY">{language === 'bn' ? 'জরুরি ছুটি (Emergency)' : 'Emergency Leave'}</option>
                  <option value="MATERNITY">{language === 'bn' ? 'মাতৃত্বকালীন / পিতৃত্বকালীন ছুটি' : 'Maternity / Paternity Leave'}</option>
                  <option value="OTHER">{language === 'bn' ? 'অন্যান্য ছুটি (Other)' : 'Other Leave'}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-950 mb-1">
                    {language === 'bn' ? 'শুরুর তারিখ' : 'Start Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-emerald-300 text-xs text-emerald-950 focus:outline-none focus:border-rose-600 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-950 mb-1">
                    {language === 'bn' ? 'শেষ তারিখ' : 'End Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-emerald-300 text-xs text-emerald-950 focus:outline-none focus:border-rose-600 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-950 mb-1">
                  {language === 'bn' ? 'ছুটির কারণ' : 'Reason for Leave'}
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={language === 'bn' ? 'ছুটি নেওয়ার বিশদ কারণ লিখুন...' : 'Explain the reason for your leave...'}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-emerald-300 text-xs text-emerald-950 placeholder:text-emerald-700/60 focus:outline-none focus:border-rose-600 resize-none font-sans shadow-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
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
                  {language === 'bn' ? 'আবেদন জমা দিন' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE LEAVE REQUEST MODAL */}
      {leaveToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm">
          <div className="bg-white border-2 border-rose-500 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-950 text-sm">
                  {language === 'bn' ? 'ছুটির আবেদনটি মুছবেন?' : 'Delete leave request?'}
                </h3>
                <p className="text-xs text-emerald-700">
                  {language === 'bn' ? 'এই ছুটির আবেদনটি তালিকা থেকে চিরতরে মুছে যাবে।' : 'This leave request will be permanently removed.'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-200 text-xs">
              <span className="font-bold block text-emerald-950">{leaveToDelete.leaveType} Leave ({leaveToDelete.daysCount} days)</span>
              <span className="text-[11px] text-emerald-700 block mt-1">{leaveToDelete.startDate} to {leaveToDelete.endDate}</span>
              <span className="text-[11px] text-emerald-800 block mt-0.5 italic">"{leaveToDelete.reason}"</span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setLeaveToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold border border-emerald-200 cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  deleteLeaveRequest(leaveToDelete.id);
                  setLeaveToDelete(null);
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
