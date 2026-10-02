/**
 * TeachFlow Admin Leave Requests Review
 * Process staff leave applications with Approve/Reject actions and notes.
 */

import React, { useState } from 'react';
import { Briefcase, Check, X, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LeaveRequest } from '../../types';

export const AdminLeaves: React.FC = () => {
  const { leaveRequests, updateLeaveStatus, deleteLeaveRequest } = useApp();

  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [leaveToDelete, setLeaveToDelete] = useState<LeaveRequest | null>(null);
  const [adminNote, setAdminNote] = useState('');

  const filtered = leaveRequests.filter(l => {
    if (filter !== 'ALL' && l.status !== filter) return false;
    return true;
  });

  const handleApprove = (id: string) => {
    updateLeaveStatus(id, 'APPROVED', adminNote.trim() || undefined);
    setSelectedLeave(null);
    setAdminNote('');
  };

  const handleReject = (id: string) => {
    updateLeaveStatus(id, 'REJECTED', adminNote.trim() || undefined);
    setSelectedLeave(null);
    setAdminNote('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-400" />
            <span>Staff Leave Applications</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Approve or decline leave requests submitted by faculty and employees.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs self-start sm:self-auto">
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'PENDING' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending ({leaveRequests.filter(l => l.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setFilter('APPROVED')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'APPROVED' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('REJECTED')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'REJECTED' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Rejected
          </button>
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center text-slate-400">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No leave requests</h3>
            <p className="text-xs text-slate-400 mt-1">No requests match this filter.</p>
          </div>
        ) : (
          filtered.map(leave => (
            <div
              key={leave.id}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-base">{leave.userName}</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                    {leave.leaveType} Leave
                  </span>
                  <span className="text-xs text-slate-400">
                    ({leave.daysCount} {leave.daysCount === 1 ? 'day' : 'days'})
                  </span>
                </div>

                <p className="text-xs text-indigo-300 font-mono">
                  {leave.startDate} to {leave.endDate}
                </p>

                <p className="text-xs text-slate-300 mt-1">
                  Reason: <span className="text-slate-200">{leave.reason}</span>
                </p>

                {leave.adminNotes && (
                  <p className="text-[11px] text-emerald-300 bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/30">
                    Admin note: {leave.adminNotes}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                {leave.status === 'PENDING' ? (
                  <>
                    <button
                      onClick={() => handleReject(leave.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700 text-xs font-semibold transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(leave.id)}
                      className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  </>
                ) : (
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                      leave.status === 'APPROVED'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-950 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {leave.status}
                  </span>
                )}

                <button
                  onClick={() => setLeaveToDelete(leave)}
                  className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Delete leave request"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CONFIRM DELETE LEAVE MODAL */}
      {leaveToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Delete Leave Request?</h3>
                <p className="text-xs text-slate-400">Permanently delete this leave application.</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <span className="font-semibold block text-white">{leaveToDelete.userName}</span>
              <span className="text-slate-400 block font-mono text-[11px]">{leaveToDelete.leaveType} • {leaveToDelete.startDate} to {leaveToDelete.endDate}</span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setLeaveToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteLeaveRequest(leaveToDelete.id);
                  setLeaveToDelete(null);
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
