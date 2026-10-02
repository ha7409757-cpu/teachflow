/**
 * TeachFlow Admin Reports & Submissions Review
 * View and review official teacher submissions, incident reports, and attached files.
 */

import React, { useState } from 'react';
import {
  FileText,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  User,
  Filter,
  X,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminReport } from '../../types';

export const AdminReports: React.FC = () => {
  const { adminReports, updateReportStatus, deleteAdminReport } = useApp();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUBMITTED' | 'UNDER_REVIEW' | 'REVIEWED'>('ALL');
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);
  const [reportToDelete, setReportToDelete] = useState<AdminReport | null>(null);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [statusInput, setStatusInput] = useState<AdminReport['status']>('REVIEWED');

  const filtered = adminReports.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    return true;
  }).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  const handleOpenReview = (report: AdminReport) => {
    setSelectedReport(report);
    setFeedbackInput(report.adminFeedback || '');
    setStatusInput(report.status === 'SUBMITTED' ? 'REVIEWED' : report.status);
  };

  const handleSaveReview = () => {
    if (!selectedReport) return;
    updateReportStatus(selectedReport.id, statusInput, feedbackInput.trim() || undefined);
    setSelectedReport(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            <span>Staff Reports & Teacher Submissions</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Review incident logs, student evaluations, and syllabi submitted by teachers.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({adminReports.length})
          </button>
          <button
            onClick={() => setStatusFilter('SUBMITTED')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === 'SUBMITTED' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('REVIEWED')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === 'REVIEWED' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Reviewed
          </button>
        </div>
      </div>

      {/* Privacy distinction reassurance */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          Reports listed here are official items intentionally submitted to the administration. Teacher personal notebook entries remain strictly inaccessible and isolated.
        </span>
      </div>

      {/* Reports Feed */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center text-slate-400">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No reports found</h3>
            <p className="text-xs text-slate-400 mt-1">There are no reports under this filter.</p>
          </div>
        ) : (
          filtered.map(report => (
            <div
              key={report.id}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{report.title}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                      {report.reportType.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Submitted by <strong className="text-slate-200">{report.teacherName}</strong> • {new Date(report.submittedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                      report.status === 'REVIEWED'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                        : report.status === 'UNDER_REVIEW'
                        ? 'bg-indigo-950 text-indigo-300 border-indigo-500/40'
                        : 'bg-amber-950 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {report.status.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => handleOpenReview(report)}
                    className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
                  >
                    Review & Respond
                  </button>
                  <button
                    onClick={() => setReportToDelete(report)}
                    className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete report"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {report.studentName && (
                <div className="text-xs text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl inline-block border border-slate-800">
                  Student: <strong className="text-white">{report.studentName}</strong> • Class: {report.className}
                </div>
              )}

              <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                {report.description}
              </p>

              {/* Attachment Pill */}
              {report.attachmentName && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-indigo-300 max-w-fit">
                  <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-semibold text-slate-200">{report.attachmentName}</span>
                  <span className="text-[10px] text-slate-400">({report.attachmentSize})</span>
                </div>
              )}

              {/* Admin feedback if given */}
              {report.adminFeedback && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 space-y-0.5">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Office Feedback:</span>
                  </span>
                  <p className="font-sans text-emerald-200/90">{report.adminFeedback}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* REVIEW & RESPOND MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Review Teacher Submission</h3>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 my-4">
              <div>
                <span className="text-xs text-slate-400 block">Report</span>
                <h4 className="text-base font-bold text-white">{selectedReport.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  By {selectedReport.teacherName} • Category: {selectedReport.reportType}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Update Status
                </label>
                <select
                  value={statusInput}
                  onChange={e => setStatusInput(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="SUBMITTED">Pending / Submitted</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="REVIEWED">Reviewed & Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Admin Feedback / Instructions to Teacher
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter response, feedback, or administrative decisions..."
                  value={feedbackInput}
                  onChange={e => setFeedbackInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none font-sans"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveReview}
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30"
              >
                Save Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE REPORT MODAL */}
      {reportToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Delete Teacher Report?</h3>
                <p className="text-xs text-slate-400">Permanently delete this submission and all attached data.</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <span className="font-semibold block text-white">{reportToDelete.title}</span>
              <span className="text-slate-400 block font-mono text-[11px]">Submitted by {reportToDelete.teacherName}</span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setReportToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteAdminReport(reportToDelete.id);
                  setReportToDelete(null);
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
