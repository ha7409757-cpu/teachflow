/**
 * TeachFlow Teacher Reports & File Submission to Admin
 * Distinct from Private Notes: This module intentionally sends official reports,
 * student observations, and files to the School Administration in Red & Green theme with Bengali support.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Upload,
  Send,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  User,
  X,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ReportType, AdminReport } from '../../types';

export const TeacherReports: React.FC = () => {
  const { currentUser } = useAuth();
  const { adminReports, submitReportToAdmin, deleteAdminReport, settings, language } = useApp();

  const [activeTab, setActiveTab] = useState<'NEW_REPORT' | 'MY_REPORTS'>('NEW_REPORT');
  const [reportToDelete, setReportToDelete] = useState<AdminReport | null>(null);
  
  // Form fields
  const [reportType, setReportType] = useState<ReportType>('STUDENT_OBSERVATION');
  const [title, setTitle] = useState('');
  const [studentName, setStudentName] = useState('');
  const [className, setClassName] = useState('Class 8 - Section A');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<AdminReport['priority']>('MEDIUM');
  const [attachment, setAttachment] = useState<{ name: string; size: string; type: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!currentUser) return null;

  // Filter reports submitted by current teacher
  const myReports = adminReports.filter(r => r.teacherId === currentUser.id);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size against school settings
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > settings.maxFileSizeMb) {
      alert(language === 'bn' 
        ? `ফাইলের আকার সর্বোচ্চ অনুমোদিত সীমা ${settings.maxFileSizeMb} MB এর বেশি।`
        : `File size exceeds maximum allowed limit of ${settings.maxFileSizeMb} MB.`);
      return;
    }

    const formattedSize = sizeMb < 1 
      ? `${Math.round(file.size / 1024)} KB`
      : `${sizeMb.toFixed(1)} MB`;

    setAttachment({
      name: file.name,
      size: formattedSize,
      type: file.type || 'application/octet-stream'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);

    await submitReportToAdmin({
      reportType,
      title: title.trim(),
      description: description.trim(),
      studentName: studentName.trim() || undefined,
      className: className.trim() || undefined,
      priority,
      attachmentName: attachment?.name,
      attachmentSize: attachment?.size,
      attachmentType: attachment?.type
    });

    setIsSubmitting(false);
    setSubmitSuccess(true);

    // Reset fields
    setTitle('');
    setDescription('');
    setStudentName('');
    setAttachment(null);

    setTimeout(() => {
      setSubmitSuccess(false);
      setActiveTab('MY_REPORTS');
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-emerald-950 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-rose-600" />
            <span>{language === 'bn' ? 'প্রশাসনে রিপোর্ট পাঠান' : 'Send Report to Admin'}</span>
          </h1>
          <p className="text-xs text-emerald-700 mt-0.5">
            {language === 'bn'
              ? 'শিক্ষার্থী পর্যবেক্ষণ, ঘটনা রিপোর্ট বা পাঠ অগ্রগতি প্রতিবেদন সরাসরি স্কুল অফিসে পাঠান।'
              : 'Submit student observations, incident reports, or lesson documentation directly to the school office.'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs self-start sm:self-auto shadow-inner">
          <button
            onClick={() => setActiveTab('NEW_REPORT')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              activeTab === 'NEW_REPORT'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-emerald-800 hover:text-emerald-950'
            }`}
          >
            {language === 'bn' ? 'নতুন জমা দিন' : 'New Submission'}
          </button>
          <button
            onClick={() => setActiveTab('MY_REPORTS')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'MY_REPORTS'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-emerald-800 hover:text-emerald-950'
            }`}
          >
            <span>{language === 'bn' ? 'আমার জমাকৃত রিপোর্ট' : 'My Submitted Reports'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white text-[10px] text-emerald-800 font-bold border border-emerald-300">
              {myReports.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'NEW_REPORT' ? (
        <div className="bg-white border border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          {submitSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center space-y-3"
            >
              <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
              <h3 className="text-xl font-bold text-emerald-950">
                {language === 'bn' ? 'রিপোর্ট সফলভাবে জমা হয়েছে' : 'Report Submitted to Admin'}
              </h3>
              <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                {language === 'bn'
                  ? 'আপনার রিপোর্ট নিরাপদে পাঠানো হয়েছে। প্রশাসন দ্রুত তা পর্যালোচনা করবে।'
                  : 'Your report has been securely transmitted. The administration will review it promptly.'}
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Report Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-950 mb-1.5">
                    {language === 'bn' ? 'রিপোর্টের ক্যাটাগরি' : 'Report Category'}
                  </label>
                  <select
                    value={reportType}
                    onChange={e => setReportType(e.target.value as ReportType)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-emerald-300 text-xs text-emerald-950 focus:outline-none focus:border-rose-600 shadow-sm"
                  >
                    <option value="STUDENT_OBSERVATION">{language === 'bn' ? 'শিক্ষার্থী পর্যবেক্ষণ' : 'Student Observation'}</option>
                    <option value="INCIDENT_REPORT">{language === 'bn' ? 'ঘটনার বিবরণ (ইনসিডেন্ট)' : 'Incident Report'}</option>
                    <option value="LESSON_PLAN">{language === 'bn' ? 'পাঠ পরিকল্পনা / সিলেবাস অগ্রগতি' : 'Lesson Plan / Syllabus Progress'}</option>
                    <option value="ACADEMIC_PROGRESS">{language === 'bn' ? 'একাডেমিক অগ্রগতি মূল্যায়ন' : 'Academic Progress Assessment'}</option>
                    <option value="HOMEWORK_ISSUE">{language === 'bn' ? 'হোমওয়ার্ক ও শৃঙ্খলা সমস্যা' : 'Homework & Discipline Issue'}</option>
                    <option value="PARENT_COMMUNICATION">{language === 'bn' ? 'অভিভাবক যোগাযোগ ও ফলোআপ' : 'Parent Communication Follow-up'}</option>
                    <option value="GENERAL_REPORT">{language === 'bn' ? 'সাধারণ স্টাফ রিপোর্ট' : 'General Staff Report'}</option>
                    <option value="SUGGESTION">{language === 'bn' ? 'প্রশাসনিক পরামর্শ' : 'Administrative Suggestion'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-950 mb-1.5">
                    {language === 'bn' ? 'অগ্রাধিকার স্তর' : 'Priority Level'}
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-emerald-300 text-xs text-emerald-950 focus:outline-none focus:border-rose-600 shadow-sm"
                  >
                    <option value="LOW">{language === 'bn' ? 'সাধারণ - নিয়মিত' : 'Low - Routine'}</option>
                    <option value="MEDIUM">{language === 'bn' ? 'মাঝারি - সাধারণ পর্যালোচনা' : 'Medium - Standard Review'}</option>
                    <option value="HIGH">{language === 'bn' ? 'উচ্চ - দ্রুত পদক্ষেপ প্রয়োজন' : 'High - Needs Action'}</option>
                    <option value="URGENT">{language === 'bn' ? 'জরুরি - অবিলম্বে দৃষ্টি আকর্ষণ' : 'Urgent - Immediate Attention'}</option>
                  </select>
                </div>
              </div>

              {/* Conditional Student / Class fields */}
              {(reportType === 'STUDENT_OBSERVATION' || reportType === 'HOMEWORK_ISSUE' || reportType === 'ACADEMIC_PROGRESS') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                  <div>
                    <label className="block text-xs font-bold text-emerald-950 mb-1">
                      {language === 'bn' ? 'শিক্ষার্থীর নাম ও রোল (ঐচ্ছিক)' : 'Student Name & Roll (Optional)'}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'bn' ? 'উদা: তানভীর হোসেন (রোল ১৪)' : 'e.g. Tanvir Hossain (Roll 14)'}
                      value={studentName}
                      onChange={e => setStudentName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-xs text-emerald-950 focus:outline-none focus:border-rose-600 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-950 mb-1">
                      {language === 'bn' ? 'শ্রেণি ও শাখা' : 'Class & Section'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Class 8 - Section A"
                      value={className}
                      onChange={e => setClassName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-xs text-emerald-950 focus:outline-none focus:border-rose-600 shadow-sm"
                    />
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-emerald-950 mb-1.5">
                  {language === 'bn' ? 'রিপোর্টের শিরোনাম' : 'Report Title'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'bn' ? 'উদা: ৮ম শ্রেণির অর্ধবার্ষিকী পরীক্ষার ইংরেজি প্রস্তুতি মূল্যায়ন' : 'e.g. English comprehension assessment for Class 8 Mid-term prep'}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-emerald-300 text-xs text-emerald-950 focus:outline-none focus:border-rose-600 shadow-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-emerald-950 mb-1.5">
                  {language === 'bn' ? 'বিস্তারিত বিবরণ' : 'Detailed Description'}
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder={language === 'bn' ? 'শ্রেণিকক্ষের পর্যবেক্ষণ বা প্রশাসনের জন্য প্রয়োজনীয় সুপারিশ বিস্তারিত লিখুন...' : 'Provide complete details, classroom observations, or recommendations for the administration...'}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-emerald-300 text-xs text-emerald-950 focus:outline-none focus:border-rose-600 resize-none font-sans shadow-sm"
                />
              </div>

              {/* File Attachment */}
              <div>
                <label className="block text-xs font-bold text-emerald-950 mb-1.5">
                  {language === 'bn' ? 'নথি বা ছবি সংযুক্ত করুন (ঐচ্ছিক)' : 'Attach Document / Photo (Optional)'}
                </label>
                
                {attachment ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-800">
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="font-bold text-emerald-950 truncate">{attachment.name}</span>
                      <span className="text-[10px] text-emerald-700">({attachment.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      className="p-1 rounded text-emerald-700 hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-emerald-300 rounded-2xl hover:border-rose-500 bg-emerald-50/40 cursor-pointer transition-colors">
                    <Upload className="w-6 h-6 text-emerald-600 mb-1" />
                    <span className="text-xs text-emerald-900 font-bold">
                      {language === 'bn' ? 'PDF, DOCX, XLSX বা ছবি আপলোড করতে ট্যাপ করুন' : 'Click to upload PDF, DOCX, XLSX, or Photo'}
                    </span>
                    <span className="text-[10px] text-emerald-700 mt-0.5">
                      {language === 'bn' ? `সর্বোচ্চ ফাইল সাইজ: ${settings.maxFileSizeMb} MB` : `Max file size: ${settings.maxFileSizeMb} MB`}
                    </span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                    />
                  </label>
                )}
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? (language === 'bn' ? 'প্রশাসনে পাঠানো হচ্ছে...' : 'Sending to Admin...')
                      : (language === 'bn' ? 'প্রশাসনে পাঠান' : 'SEND TO ADMIN')}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* MY SUBMITTED REPORTS LIST */
        <div className="space-y-4">
          {myReports.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-emerald-200 text-center shadow-sm">
              <FileCheck className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-emerald-950">
                {language === 'bn' ? 'কোনো রিপোর্ট জমা দেওয়া হয়নি' : 'No reports submitted yet'}
              </h3>
              <p className="text-xs text-emerald-700 mt-1 max-w-sm mx-auto">
                {language === 'bn'
                  ? 'প্রশাসনে আপনার পাঠানো রিপোর্ট ও তাদের পর্যালোচনার অবস্থা এখানে দেখতে পাবেন।'
                  : 'Reports you send to the administration will appear here along with their review status.'}
              </p>
              <button
                onClick={() => setActiveTab('NEW_REPORT')}
                className="mt-4 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white cursor-pointer shadow-md"
              >
                {language === 'bn' ? 'রিপোর্ট জমা দিন' : 'Submit a Report'}
              </button>
            </div>
          ) : (
            myReports.map(report => (
              <div
                key={report.id}
                className="p-5 rounded-2xl bg-white border border-emerald-200 space-y-3 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-950">{report.title}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {report.reportType.replace('_', ' ')}
                      </span>
                    </div>
                    {report.studentName && (
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        {language === 'bn' ? 'শিক্ষার্থী' : 'Student'}: <span className="text-emerald-950 font-bold">{report.studentName}</span> • {report.className}
                      </p>
                    )}
                  </div>

                  {/* Review Status Badge */}
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border self-start sm:self-auto ${
                      report.status === 'REVIEWED'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : report.status === 'UNDER_REVIEW'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    {report.status === 'REVIEWED' && language === 'bn'
                      ? 'পর্যালোচিত'
                      : report.status === 'UNDER_REVIEW' && language === 'bn'
                      ? 'পর্যালোচনাধীন'
                      : report.status === 'PENDING' && language === 'bn'
                      ? 'অপেক্ষমান'
                      : report.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-emerald-900 leading-relaxed font-sans">
                  {report.description}
                </p>

                {/* Attachment Pill if any */}
                {report.attachmentName && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                    <Paperclip className="w-3.5 h-3.5 text-rose-600" />
                    <span className="font-semibold">{report.attachmentName}</span>
                    <span className="text-[10px] text-emerald-700">({report.attachmentSize})</span>
                  </div>
                )}

                {/* Admin Feedback note if reviewed */}
                {report.adminFeedback && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950">
                    <span className="font-bold text-rose-700 block mb-0.5">
                      {language === 'bn' ? `প্রশাসনিক মতামত (${report.reviewedBy || 'অফিস'}):` : `Admin Feedback (${report.reviewedBy || 'Office'}):`}
                    </span>
                    {report.adminFeedback}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-emerald-700 pt-2 border-t border-emerald-100">
                  <div className="flex items-center gap-3">
                    <span>
                      {language === 'bn' ? 'জমাদানের সময়' : 'Submitted'}: {new Date(report.submittedAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      onClick={() => setReportToDelete(report)}
                      className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
                      title={language === 'bn' ? 'রিপোর্টটি মুছুন' : 'Delete report'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'মুছুন' : 'Delete'}</span>
                    </button>
                  </div>
                  <span>{language === 'bn' ? 'অগ্রাধিকার' : 'Priority'}: {report.priority}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CONFIRM DELETE REPORT MODAL */}
      {reportToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm">
          <div className="bg-white border-2 border-rose-500 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-950 text-sm">
                  {language === 'bn' ? 'রিপোর্টটি মুছে ফেলতে চান?' : 'Delete this report?'}
                </h3>
                <p className="text-xs text-emerald-700">
                  {language === 'bn' ? 'এই রিপোর্টটি প্রশাসনিক তালিকা থেকে চিরতরে মুছে ফেলা হবে।' : 'This report will be permanently removed from administrative records.'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-200 text-xs">
              <span className="font-bold block text-emerald-950">{reportToDelete.title}</span>
              <span className="text-[11px] text-emerald-700 block mt-1 line-clamp-2">{reportToDelete.description}</span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setReportToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold border border-emerald-200 cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  deleteAdminReport(reportToDelete.id);
                  setReportToDelete(null);
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
