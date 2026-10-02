/**
 * TeachFlow Student Evaluation & Student of the Month System
 * Enables Class Teachers and Admins to:
 * 1. Manage Students (Search by Name, Class, Roll or Student ID)
 * 2. Enter Weekly Class Test (C.T.) Marks with automatic grading
 * 3. Submit Weekly Teacher Behavioral & Academic Reports for each student
 * 4. Calculate automatic weighted ranking for "Student of the Month" (মাসের সেরা ছাত্র)
 * 5. Publish awards, display digital certificates, and announce school-wide
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  Users,
  Search,
  Plus,
  Edit2,
  CheckCircle2,
  Star,
  Trophy,
  FileCheck,
  TrendingUp,
  Filter,
  Calendar,
  Sparkles,
  BookOpen,
  UserCheck,
  Printer,
  ChevronRight,
  ShieldAlert,
  Save,
  Trash2,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Student, WeeklyCTMark, WeeklyStudentReport, StudentOfTheMonthRecord, ALL_CLASSES } from '../../types';

export const StudentEvaluationView: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    students,
    weeklyCTMarks,
    weeklyStudentReports,
    evaluationSettings,
    studentOfTheMonthRecords,
    addStudent,
    updateStudent,
    deleteStudent,
    saveCTMark,
    deleteCTMark,
    saveStudentReport,
    updateEvaluationSettings,
    publishStudentOfTheMonth,
    language
  } = useApp();

  const [activeTab, setActiveTab] = useState<'CT_MARKS' | 'WEEKLY_REPORT' | 'STUDENT_OF_MONTH' | 'STUDENT_DIRECTORY'>('CT_MARKS');

  // Filters
  const [selectedClass, setSelectedClass] = useState<string>('Class 8');
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('October');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedSubject, setSelectedSubject] = useState<string>('General Science');

  // New / Edit Student Modal
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentFormName, setStudentFormName] = useState('');
  const [studentFormRoll, setStudentFormRoll] = useState('');
  const [studentFormClass, setStudentFormClass] = useState('Class 8');
  const [studentFormSection, setStudentFormSection] = useState('A');
  const [studentFormGuardian, setStudentFormGuardian] = useState('');
  const [studentFormContact, setStudentFormContact] = useState('');
  const [studentFormRemarks, setStudentFormRemarks] = useState('');

  // Weekly CT Marks Form State (per student ID)
  const [ctMarksInputs, setCtMarksInputs] = useState<Record<string, { marks: number; total: number }>>({});
  const [ctSaveSuccess, setCtSaveSuccess] = useState(false);

  // Weekly Report Form State (per student ID)
  const [reportInputs, setReportInputs] = useState<Record<string, {
    discipline: number;
    homework: number;
    punctuality: number;
    participation: number;
    remarks: string;
  }>>({});
  const [reportSaveSuccess, setReportSaveSuccess] = useState(false);

  // Certificate Modal State
  const [activeCertificate, setActiveCertificate] = useState<StudentOfTheMonthRecord | null>(null);

  // Deletion Modal States
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [ctMarkToDelete, setCtMarkToDelete] = useState<{ markId: string; studentName: string } | null>(null);

  const classesList = ALL_CLASSES;
  const subjectsList = ['General Science', 'Mathematics', 'English', 'Bangla', 'Social Science', 'Religion & Ethics'];
  const monthsList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Available subjects based on role: Teachers only see their assigned subjects, Admins see all
  const availableSubjects = useMemo(() => {
    if (!currentUser || currentUser.role === 'ADMIN') {
      return subjectsList;
    }
    const assigned = currentUser.assignedSubjects && currentUser.assignedSubjects.length > 0
      ? currentUser.assignedSubjects
      : [];
    if (assigned.length > 0) return assigned;
    if (currentUser.department) return [currentUser.department];
    return ['General Science'];
  }, [currentUser]);

  // Synchronize selectedSubject with teacher's assigned subjects
  useEffect(() => {
    if (availableSubjects.length > 0 && !availableSubjects.includes(selectedSubject)) {
      setSelectedSubject(availableSubjects[0]);
    }
  }, [availableSubjects, selectedSubject]);

  // Filter students by selected class, section, and search query
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (s.isArchived) return false;
      if (selectedClass && s.classId !== selectedClass) return false;
      if (selectedSection && s.section !== selectedSection) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (s.name || '').toLowerCase().includes(q);
        const matchRoll = String(s.roll ?? '').toLowerCase().includes(q);
        const matchId = (s.studentId || s.id || '').toLowerCase().includes(q);
        return matchName || matchRoll || matchId;
      }
      return true;
    }).sort((a, b) => Number(a.roll) - Number(b.roll));
  }, [students, selectedClass, selectedSection, searchQuery]);

  // Open Add Student Modal
  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setStudentFormName('');
    setStudentFormRoll(String(filteredStudents.length + 1));
    setStudentFormClass(selectedClass);
    setStudentFormSection(selectedSection);
    setStudentFormGuardian('');
    setStudentFormContact('');
    setStudentFormRemarks('');
    setIsStudentModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setStudentFormName(student.name);
    setStudentFormRoll(String(student.roll ?? ''));
    setStudentFormClass(student.classId);
    setStudentFormSection(student.section);
    setStudentFormGuardian(student.guardianName || '');
    setStudentFormContact(student.contactNumber || '');
    setStudentFormRemarks(student.teacherRemarks || '');
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = () => {
    if (!studentFormName.trim() || !studentFormRoll.trim()) return;

    if (editingStudent) {
      updateStudent({
        ...editingStudent,
        name: studentFormName.trim(),
        roll: studentFormRoll.trim(),
        classId: studentFormClass,
        section: studentFormSection,
        guardianName: studentFormGuardian.trim(),
        contactNumber: studentFormContact.trim(),
        teacherRemarks: studentFormRemarks.trim()
      });
    } else {
      addStudent({
        name: studentFormName.trim(),
        roll: studentFormRoll.trim(),
        classId: studentFormClass,
        section: studentFormSection,
        guardianName: studentFormGuardian.trim(),
        contactNumber: studentFormContact.trim(),
        gender: 'MALE',
        attendancePercentage: 95,
        teacherRemarks: studentFormRemarks.trim()
      });
    }
    setIsStudentModalOpen(false);
  };

  // Handler for saving CT marks for a student
  const handleSaveCTForStudent = (student: Student) => {
    const markInfo = ctMarksInputs[student.id];
    const obtainedMarks = markInfo ? markInfo.marks : 18;
    const totalMarks = markInfo ? markInfo.total : 20;

    saveCTMark({
      studentId: student.id,
      studentName: student.name,
      studentRoll: student.roll,
      classId: student.classId,
      section: student.section,
      subjectId: selectedSubject,
      weekNumber: selectedWeek,
      month: selectedMonth,
      academicYear: '2025',
      obtainedMarks,
      totalMarks,
      evaluatedByTeacherId: currentUser?.id || 't1',
      evaluatedByTeacherName: currentUser?.name || 'Class Teacher',
      evaluatedDate: new Date().toISOString().split('T')[0]
    });

    setCtSaveSuccess(true);
    setTimeout(() => setCtSaveSuccess(false), 2000);
  };

  // Bulk save all CT marks currently in the list
  const handleSaveAllCTMarks = () => {
    filteredStudents.forEach(student => {
      handleSaveCTForStudent(student);
    });
  };

  // Handler for saving Weekly Report for a student
  const handleSaveReportForStudent = (student: Student) => {
    const report = reportInputs[student.id] || {
      discipline: 9,
      homework: 9,
      punctuality: 10,
      participation: 9,
      remarks: 'মনোযোগী ও ক্লাসে নিয়মিত অংশগ্রহণ করে।'
    };

    saveStudentReport({
      studentId: student.id,
      studentName: student.name,
      studentRoll: student.roll,
      classId: student.classId,
      section: student.section,
      weekNumber: selectedWeek,
      month: selectedMonth,
      academicYear: '2025',
      disciplineScore: report.discipline,
      homeworkCompletionScore: report.homework,
      punctualityScore: report.punctuality,
      classParticipationScore: report.participation,
      teacherRemarks: report.remarks,
      evaluatedByTeacherId: currentUser?.id || 't1',
      evaluatedByTeacherName: currentUser?.name || 'Class Teacher',
      evaluatedDate: new Date().toISOString().split('T')[0]
    });

    setReportSaveSuccess(true);
    setTimeout(() => setReportSaveSuccess(false), 2000);
  };

  // Calculate Student of the Month scores and leaderboard
  const studentOfTheMonthRanking = useMemo(() => {
    return filteredStudents.map(student => {
      // 1. Calculate Average CT percentage for this student this month
      const studentCTs = weeklyCTMarks.filter(
        m => m.studentId === student.id && m.month === selectedMonth
      );
      let ctAvgPct = 85; // default fallback if no tests yet
      if (studentCTs.length > 0) {
        const totalObtained = studentCTs.reduce((sum, c) => sum + c.obtainedMarks, 0);
        const totalPossible = studentCTs.reduce((sum, c) => sum + c.totalMarks, 0);
        ctAvgPct = totalPossible > 0 ? (totalObtained / totalPossible) * 100 : 85;
      }

      // 2. Calculate Weekly Teacher Evaluation average
      const studentReports = weeklyStudentReports.filter(
        r => r.studentId === student.id && r.month === selectedMonth
      );
      let disciplineAvg = 9;
      let homeworkAvg = 9;
      let punctualityAvg = 9.5;
      let participationAvg = 9;
      let teacherNotes = 'পড়াশোনায় নিয়মিত ও শিক্ষকগণের প্রতি অত্যন্ত শ্রদ্ধাশীল।';

      if (studentReports.length > 0) {
        disciplineAvg = studentReports.reduce((s, r) => s + r.disciplineScore, 0) / studentReports.length;
        homeworkAvg = studentReports.reduce((s, r) => s + r.homeworkCompletionScore, 0) / studentReports.length;
        punctualityAvg = studentReports.reduce((s, r) => s + r.punctualityScore, 0) / studentReports.length;
        participationAvg = studentReports.reduce((s, r) => s + r.classParticipationScore, 0) / studentReports.length;
        teacherNotes = studentReports[studentReports.length - 1].teacherRemarks || teacherNotes;
      }

      // 3. Attendance percentage
      const attendancePct = student.attendancePercentage || 95;

      // 4. Composite weighted score
      // Default weights: CT (40%) + Attendance (30%) + Discipline (15%) + Homework (15%)
      const ctComponent = (ctAvgPct * evaluationSettings.ctWeight) / 100;
      const attendanceComponent = (attendancePct * evaluationSettings.attendanceWeight) / 100;
      const disciplineComponent = ((disciplineAvg * 10) * evaluationSettings.disciplineWeight) / 100;
      const homeworkComponent = ((homeworkAvg * 10) * evaluationSettings.homeworkWeight) / 100;

      const totalScore = Math.min(100, Math.round((ctComponent + attendanceComponent + disciplineComponent + homeworkComponent) * 10) / 10);

      return {
        student,
        ctAvgPct: Math.round(ctAvgPct),
        attendancePct,
        disciplineAvg: Math.round(disciplineAvg * 10) / 10,
        homeworkAvg: Math.round(homeworkAvg * 10) / 10,
        totalScore,
        teacherNotes
      };
    }).sort((a, b) => b.totalScore - a.totalScore);
  }, [filteredStudents, weeklyCTMarks, weeklyStudentReports, selectedMonth, evaluationSettings]);

  // Current published record for this class & month
  const publishedRecord = studentOfTheMonthRecords.find(
    r => r.classId === selectedClass && r.month === selectedMonth
  );

  const topCandidate = studentOfTheMonthRanking[0];

  const handlePublishWinner = (candidate: typeof studentOfTheMonthRanking[0]) => {
    const record: StudentOfTheMonthRecord = {
      id: `som_${selectedClass}_${selectedMonth}_${Date.now()}`,
      studentId: candidate.student.id,
      studentName: candidate.student.name,
      studentRoll: candidate.student.roll,
      roll: candidate.student.roll,
      classId: candidate.student.classId,
      section: candidate.student.section,
      month: selectedMonth,
      academicYear: '2025',
      totalScore: candidate.totalScore,
      finalScore: candidate.totalScore,
      ctAverage: candidate.ctAvgPct,
      attendancePercentage: candidate.attendancePct,
      disciplineScore: candidate.disciplineAvg,
      homeworkScore: candidate.homeworkAvg,
      nominatedByTeacherName: currentUser?.name || 'Class Teacher',
      teacherRemarks: candidate.teacherNotes,
      principalRemarks: 'অনুকরণীয় মেধা, সদাচার এবং নিয়মিত উপস্থিতির জন্য গর্বিতভাবে পুরস্কৃত।',
      announcedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      publishedBy: currentUser?.name || 'Admin',
      isPublished: true
    };

    publishStudentOfTheMonth(record);
    setActiveCertificate(record);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-emerald-950 tracking-tight">
                {language === 'bn' ? 'শিক্ষার্থী মূল্যায়ন ও স্টুডেন্ট অফ দ্যা মান্থ' : 'Student Evaluation & Student of the Month'}
              </h1>
              <p className="text-xs text-emerald-700 mt-0.5">
                {language === 'bn'
                  ? 'সাপ্তাহিক সিটি পরীক্ষার নম্বর, আচরণ মূল্যায়ন ও প্রতি মাসের সেরা শিক্ষার্থী নির্বাচন।'
                  : 'Weekly CT marks entry, teacher behavior reports, and monthly award nomination.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddStudent}
            className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? 'নতুন শিক্ষার্থী যুক্ত করুন' : 'Add Student'}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-emerald-50 border border-emerald-200 rounded-2xl overflow-x-auto text-xs font-bold shadow-inner">
        <button
          onClick={() => setActiveTab('CT_MARKS')}
          className={`flex items-center gap-1.5 py-2.5 px-4 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'CT_MARKS'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-emerald-900 hover:text-emerald-950'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{language === 'bn' ? 'সাপ্তাহিক সিটি (C.T.) নম্বর' : 'Weekly CT Marks'}</span>
        </button>

        <button
          onClick={() => setActiveTab('WEEKLY_REPORT')}
          className={`flex items-center gap-1.5 py-2.5 px-4 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'WEEKLY_REPORT'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-emerald-900 hover:text-emerald-950'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>{language === 'bn' ? 'শিক্ষকের সাপ্তাহিক মূল্যায়ন রিপোর্ট' : 'Weekly Teacher Report'}</span>
        </button>

        <button
          onClick={() => setActiveTab('STUDENT_OF_MONTH')}
          className={`flex items-center gap-1.5 py-2.5 px-4 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'STUDENT_OF_MONTH'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-emerald-900 hover:text-emerald-950'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-300" />
          <span>{language === 'bn' ? '🏆 স্টুডেন্ট অফ দ্যা মান্থ' : '🏆 Student of the Month'}</span>
          {publishedRecord && (
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('STUDENT_DIRECTORY')}
          className={`flex items-center gap-1.5 py-2.5 px-4 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'STUDENT_DIRECTORY'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-emerald-900 hover:text-emerald-950'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{language === 'bn' ? 'শিক্ষার্থী তালিকা ও প্রোফাইল' : 'Student Directory'}</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px]">
            {filteredStudents.length}
          </span>
        </button>
      </div>

      {/* FILTER BAR: Class, Section, Month, Week, Search */}
      <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-sm grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        {/* Class selector */}
        <div>
          <label className="block text-emerald-800 font-bold mb-1">
            {language === 'bn' ? 'শ্রেণী' : 'Class'}
          </label>
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-300 font-bold text-emerald-950 focus:outline-none focus:border-rose-600 cursor-pointer"
          >
            {classesList.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Section */}
        <div>
          <label className="block text-emerald-800 font-bold mb-1">
            {language === 'bn' ? 'শাখা' : 'Section'}
          </label>
          <select
            value={selectedSection}
            onChange={e => setSelectedSection(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-300 font-bold text-emerald-950 focus:outline-none focus:border-rose-600 cursor-pointer"
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
          </select>
        </div>

        {/* Month */}
        <div>
          <label className="block text-emerald-800 font-bold mb-1">
            {language === 'bn' ? 'মাস' : 'Month'}
          </label>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-300 font-bold text-emerald-950 focus:outline-none focus:border-rose-600 cursor-pointer"
          >
            {monthsList.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Week (For CT and Reports) */}
        {(activeTab === 'CT_MARKS' || activeTab === 'WEEKLY_REPORT') && (
          <div>
            <label className="block text-emerald-800 font-bold mb-1">
              {language === 'bn' ? 'সপ্তাহ' : 'Week'}
            </label>
            <select
              value={selectedWeek}
              onChange={e => setSelectedWeek(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-300 font-bold text-emerald-950 focus:outline-none focus:border-rose-600 cursor-pointer"
            >
              <option value={1}>{language === 'bn' ? '১ম সপ্তাহ (Week 1)' : 'Week 1'}</option>
              <option value={2}>{language === 'bn' ? '২য় সপ্তাহ (Week 2)' : 'Week 2'}</option>
              <option value={3}>{language === 'bn' ? '৩য় সপ্তাহ (Week 3)' : 'Week 3'}</option>
              <option value={4}>{language === 'bn' ? '৪র্থ সপ্তাহ (Week 4)' : 'Week 4'}</option>
            </select>
          </div>
        )}

        {/* Search by Roll or Name */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-emerald-800 font-bold mb-1">
            {language === 'bn' ? 'নাম বা রোল খুঁজুন' : 'Search Name/Roll'}
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'bn' ? 'রোল বা নাম...' : 'Roll or Name...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-emerald-300 text-xs font-bold text-emerald-950 focus:outline-none focus:border-rose-600"
            />
          </div>
        </div>
      </div>

      {/* TAB 1: WEEKLY CT MARKS ENTRY */}
      {activeTab === 'CT_MARKS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <div>
              <h3 className="font-extrabold text-base text-emerald-950 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-rose-600" />
                <span>
                  {selectedClass} ({selectedSection}) — {selectedMonth} (সপ্তাহ {selectedWeek}) সিটি পরীক্ষার নম্বর প্রদান
                </span>
              </h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                {language === 'bn'
                  ? 'প্রতিটি শিক্ষার্থীর প্রাপ্ত নম্বর লিখুন। এটি স্বয়ংক্রিয়ভাবে জিপিএ ও মাসের সেরা শিক্ষার্থী হিসেবে গণনা করা হবে।'
                  : 'Enter marks for each student. This feeds into monthly weighted ranking.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Role-Based Access Badge */}
              {currentUser?.role === 'ADMIN' ? (
                <div className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px] flex items-center gap-1.5">
                  <span>👑 {language === 'bn' ? 'অ্যাডমিন ভিউ: সকল বিষয়' : 'Admin: All Subjects'}</span>
                </div>
              ) : (
                <div className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-[11px] flex items-center gap-1.5">
                  <span>🔒 {language === 'bn' ? 'শিক্ষক নির্ধারিত বিষয়' : 'Assigned Subject'}</span>
                </div>
              )}

              {/* Subject selector */}
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 font-bold text-xs text-emerald-950 cursor-pointer"
              >
                {availableSubjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <button
                onClick={handleSaveAllCTMarks}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'সকল নম্বর সংরক্ষণ' : 'Save All Marks'}</span>
              </button>
            </div>
          </div>

          {/* Access Note */}
          <div className="p-3 rounded-2xl bg-white border border-emerald-200 text-xs flex items-center justify-between text-emerald-900 shadow-sm">
            <span>
              {currentUser?.role === 'ADMIN'
                ? (language === 'bn' ? '👑 অ্যাডমিন হিসেবে আপনি সকল বিষয়ের সিটি পরীক্ষার নম্বর দেখতে ও সংরক্ষণ করতে পারবেন।' : '👑 As Admin, you have global access to view and manage marks for all subjects.')
                : (language === 'bn' ? `🔒 শিক্ষক মোড: আপনি শুধুমাত্র আপনার নির্ধারিত বিষয় (${availableSubjects.join(', ')}) এর নম্বর দেখতে ও সংরক্ষণ করতে পারবেন।` : `🔒 Teacher Mode: You can only view and manage CT marks for your assigned subject(s): ${availableSubjects.join(', ')}.`)}
            </span>
          </div>

          {ctSaveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{language === 'bn' ? 'সিটি পরীক্ষার নম্বর সফলভাবে সংরক্ষিত হয়েছে!' : 'CT Marks successfully saved!'}</span>
            </div>
          )}

          {/* Marks Table */}
          <div className="bg-white rounded-3xl border border-emerald-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-emerald-50/80 text-emerald-900 font-bold border-b border-emerald-200 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-16">{language === 'bn' ? 'রোল' : 'Roll'}</th>
                    <th className="py-3 px-4">{language === 'bn' ? 'শিক্ষার্থীর নাম' : 'Student Name'}</th>
                    <th className="py-3 px-4">{language === 'bn' ? 'বিষয়' : 'Subject'}</th>
                    <th className="py-3 px-4 w-32">{language === 'bn' ? 'প্রাপ্ত নম্বর' : 'Obtained Marks'}</th>
                    <th className="py-3 px-4 w-28">{language === 'bn' ? 'মোট নম্বর' : 'Total'}</th>
                    <th className="py-3 px-4 w-24">{language === 'bn' ? 'শতকরা / গ্রেড' : 'Grade'}</th>
                    <th className="py-3 px-4 text-right w-24">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100">
                  {filteredStudents.map(student => {
                    // Check if mark already exists
                    const existing = weeklyCTMarks.find(
                      m => m.studentId === student.id &&
                           m.subjectId === selectedSubject &&
                           m.month === selectedMonth &&
                           m.weekNumber === selectedWeek
                    );

                    const inputVal = ctMarksInputs[student.id]?.marks ?? (existing ? existing.obtainedMarks : 18);
                    const totalVal = ctMarksInputs[student.id]?.total ?? (existing ? existing.totalMarks : 20);
                    const pct = totalVal > 0 ? Math.round((inputVal / totalVal) * 100) : 0;

                    let gradeBadge = 'bg-emerald-100 text-emerald-800';
                    let gradeText = 'A+';
                    if (pct < 40) { gradeBadge = 'bg-rose-100 text-rose-800'; gradeText = 'F'; }
                    else if (pct < 60) { gradeBadge = 'bg-amber-100 text-amber-800'; gradeText = 'B'; }
                    else if (pct < 80) { gradeBadge = 'bg-emerald-50 text-emerald-700'; gradeText = 'A'; }

                    return (
                      <tr key={student.id} className="hover:bg-emerald-50/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-emerald-950">
                          #{student.roll}
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-950">
                          {student.name}
                        </td>
                        <td className="py-3 px-4 text-emerald-700 font-medium">
                          {selectedSubject}
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            min="0"
                            max={totalVal}
                            value={inputVal}
                            onChange={e => {
                              const val = Math.min(totalVal, Math.max(0, Number(e.target.value)));
                              setCtMarksInputs(prev => ({
                                ...prev,
                                [student.id]: { marks: val, total: totalVal }
                              }));
                            }}
                            className="w-20 px-2.5 py-1.5 rounded-xl bg-white border border-emerald-300 font-mono font-bold text-emerald-950 text-center focus:outline-none focus:border-rose-600 shadow-inner"
                          />
                        </td>
                        <td className="py-3 px-4 font-mono text-emerald-800 font-bold">
                          / {totalVal}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${gradeBadge}`}>
                            {gradeText} ({pct}%)
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSaveCTForStudent(student)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                            >
                              {language === 'bn' ? 'সংরক্ষণ' : 'Save'}
                            </button>
                            {existing && (
                              <button
                                onClick={() => setCtMarkToDelete({ markId: existing.id, studentName: student.name })}
                                className="p-1.5 rounded-xl text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors cursor-pointer"
                                title={language === 'bn' ? 'নম্বর মুছুন' : 'Delete mark'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WEEKLY TEACHER EVALUATION REPORT */}
      {activeTab === 'WEEKLY_REPORT' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <h3 className="font-extrabold text-base text-emerald-950 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-rose-600" />
              <span>
                {selectedClass} ({selectedSection}) — {selectedMonth} (সপ্তাহ {selectedWeek}) শিক্ষক মূল্যায়ন রিপোর্ট
              </span>
            </h3>
            <p className="text-xs text-emerald-700 mt-0.5">
              {language === 'bn'
                ? 'আচরণ, বাড়ির কাজ, সময়ানুবর্তিতা ও ক্লাসে সক্রিয় অংশগ্রহণের ভিত্তিতে রেটিং (১-১০) ও মন্তব্য দিন।'
                : 'Rate each student on discipline, homework, punctuality, and participation (1-10) with teacher remarks.'}
            </p>
          </div>

          {reportSaveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{language === 'bn' ? 'শিক্ষার্থী মূল্যায়ন সফলভাবে সংরক্ষিত হয়েছে!' : 'Weekly report saved!'}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStudents.map(student => {
              const existing = weeklyStudentReports.find(
                r => r.studentId === student.id &&
                     r.month === selectedMonth &&
                     r.weekNumber === selectedWeek
              );

              const currentData = reportInputs[student.id] || {
                discipline: existing ? existing.disciplineScore : 9,
                homework: existing ? existing.homeworkCompletionScore : 9,
                punctuality: existing ? existing.punctualityScore : 10,
                participation: existing ? existing.classParticipationScore : 9,
                remarks: existing ? existing.teacherRemarks : 'মনোযোগী, ক্লাসে সময়মত আসে ও বাড়ির কাজ নিয়মিত করে।'
              };

              const updateStudentField = (field: string, val: any) => {
                setReportInputs(prev => ({
                  ...prev,
                  [student.id]: {
                    ...currentData,
                    [field]: val
                  }
                }));
              };

              return (
                <div
                  key={student.id}
                  className="p-5 rounded-3xl bg-white border border-emerald-200 shadow-sm hover:border-emerald-300 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                    <div>
                      <span className="font-mono text-xs font-bold text-rose-600 mr-2">
                        Roll: {student.roll}
                      </span>
                      <h4 className="font-extrabold text-base text-emerald-950 inline">
                        {student.name}
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      উপস্থিতি: {student.attendancePercentage || 95}%
                    </span>
                  </div>

                  {/* Rating inputs grid */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-emerald-900 font-bold">{language === 'bn' ? 'আচরণ ও শৃঙ্খলা' : 'Discipline'}</span>
                        <span className="font-mono font-bold text-rose-600">{currentData.discipline}/10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={currentData.discipline}
                        onChange={e => updateStudentField('discipline', Number(e.target.value))}
                        className="w-full accent-rose-600 cursor-pointer"
                      />
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-emerald-900 font-bold">{language === 'bn' ? 'বাড়ির কাজ' : 'Homework'}</span>
                        <span className="font-mono font-bold text-rose-600">{currentData.homework}/10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={currentData.homework}
                        onChange={e => updateStudentField('homework', Number(e.target.value))}
                        className="w-full accent-rose-600 cursor-pointer"
                      />
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-emerald-900 font-bold">{language === 'bn' ? 'সময়নিষ্ঠতা' : 'Punctuality'}</span>
                        <span className="font-mono font-bold text-rose-600">{currentData.punctuality}/10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={currentData.punctuality}
                        onChange={e => updateStudentField('punctuality', Number(e.target.value))}
                        className="w-full accent-rose-600 cursor-pointer"
                      />
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-emerald-900 font-bold">{language === 'bn' ? 'সক্রিয় অংশগ্রহণ' : 'Participation'}</span>
                        <span className="font-mono font-bold text-rose-600">{currentData.participation}/10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={currentData.participation}
                        onChange={e => updateStudentField('participation', Number(e.target.value))}
                        className="w-full accent-rose-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Teacher remarks */}
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                      {language === 'bn' ? 'শ্রেণী শিক্ষকের মন্তব্য:' : 'Teacher Remarks:'}
                    </label>
                    <input
                      type="text"
                      value={currentData.remarks}
                      onChange={e => updateStudentField('remarks', e.target.value)}
                      placeholder={language === 'bn' ? 'শিক্ষার্থীর আচরণ ও পড়াশোনা সম্পর্কে মন্তব্য লিখুন...' : 'Remarks on progress...'}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-xs text-emerald-950 focus:outline-none focus:border-rose-600"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleSaveReportForStudent(student)}
                      className="py-1.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'রিপোর্ট সংরক্ষণ' : 'Save Report'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: STUDENT OF THE MONTH SELECTION & LEADERBOARD */}
      {activeTab === 'STUDENT_OF_MONTH' && (
        <div className="space-y-6">
          {/* Winner Spotlight Banner if Published */}
          {publishedRecord && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-400 to-rose-600 text-white shadow-xl relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="w-20 h-20 rounded-full bg-white text-amber-600 flex items-center justify-center font-black text-3xl shadow-xl ring-4 ring-white/50 shrink-0">
                    🏆
                  </div>
                  <div>
                    <span className="px-3 py-1 rounded-full bg-white/25 text-white text-xs font-black tracking-wider uppercase backdrop-blur-sm">
                      {publishedRecord.month} {publishedRecord.academicYear} • {language === 'bn' ? 'মাসের সেরা শিক্ষার্থী' : 'STUDENT OF THE MONTH'}
                    </span>
                    <h2 className="text-3xl font-black text-white mt-1">
                      {publishedRecord.studentName}
                    </h2>
                    <p className="text-sm text-white/90 font-medium">
                      {publishedRecord.classId} ({publishedRecord.section}) • Roll #{publishedRecord.studentRoll} • {language === 'bn' ? 'মোট স্কোর:' : 'Score:'} <strong>{publishedRecord.totalScore}%</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveCertificate(publishedRecord)}
                    className="py-3 px-5 rounded-2xl bg-white text-emerald-950 font-black text-xs shadow-lg hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Award className="w-4 h-4 text-rose-600" />
                    <span>{language === 'bn' ? 'ডিজিটাল সার্টিফিকেট দেখুন' : 'View Certificate'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Ranking & Nomination Table */}
          <div className="bg-white rounded-3xl border border-emerald-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-100">
              <div>
                <h3 className="text-lg font-black text-emerald-950 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span>
                    {selectedClass} ({selectedSection}) — {selectedMonth} {language === 'bn' ? 'মাসের স্বয়ংক্রিয় র‍্যাংকিং তালিকা' : 'Monthly Automated Ranking'}
                  </span>
                </h3>
                <p className="text-xs text-emerald-700 mt-0.5">
                  {language === 'bn'
                    ? `গণনার সূত্র: সিটি পরীক্ষা (${evaluationSettings.ctWeight}%) + উপস্থিতি (${evaluationSettings.attendanceWeight}%) + আচরণ (${evaluationSettings.disciplineWeight}%) + বাড়ির কাজ (${evaluationSettings.homeworkWeight}%)`
                    : `Formula: CT (${evaluationSettings.ctWeight}%) + Attendance (${evaluationSettings.attendanceWeight}%) + Discipline (${evaluationSettings.disciplineWeight}%) + Homework (${evaluationSettings.homeworkWeight}%)`}
                </p>
              </div>

              {topCandidate && (
                <button
                  onClick={() => handlePublishWinner(topCandidate)}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{language === 'bn' ? '১ম স্থানাধিকারীকে সেরা ঘোষণা করুন' : 'Award #1 Candidate'}</span>
                </button>
              )}
            </div>

            {/* Candidates Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-emerald-50 text-emerald-900 font-bold border-b border-emerald-200 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-14">{language === 'bn' ? 'র‍্যাংক' : 'Rank'}</th>
                    <th className="py-3 px-4">{language === 'bn' ? 'শিক্ষার্থী' : 'Student'}</th>
                    <th className="py-3 px-4">{language === 'bn' ? 'সিটি গড়' : 'CT Avg'}</th>
                    <th className="py-3 px-4">{language === 'bn' ? 'উপস্থিতি' : 'Attendance'}</th>
                    <th className="py-3 px-4">{language === 'bn' ? 'আচরণ' : 'Conduct'}</th>
                    <th className="py-3 px-4">{language === 'bn' ? 'বাড়ির কাজ' : 'Homework'}</th>
                    <th className="py-3 px-4">{language === 'bn' ? 'সর্বমোট স্কোর' : 'Total Score'}</th>
                    <th className="py-3 px-4 text-right">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100">
                  {studentOfTheMonthRanking.map((item, index) => {
                    const isRank1 = index === 0;
                    const isRank2 = index === 1;
                    const isRank3 = index === 2;

                    return (
                      <tr
                        key={item.student.id}
                        className={`transition-colors ${
                          isRank1 ? 'bg-amber-50/70 font-bold' : 'hover:bg-emerald-50/50'
                        }`}
                      >
                        <td className="py-3 px-4">
                          {isRank1 ? (
                            <span className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center shadow">
                              🥇 1
                            </span>
                          ) : isRank2 ? (
                            <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-900 font-black text-xs flex items-center justify-center shadow">
                              🥈 2
                            </span>
                          ) : isRank3 ? (
                            <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center shadow">
                              🥉 3
                            </span>
                          ) : (
                            <span className="font-mono text-emerald-800 font-bold px-2">
                              #{index + 1}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-black text-emerald-950 text-sm">
                            {item.student.name}
                          </div>
                          <div className="text-[11px] text-emerald-700 font-mono">
                            Roll: {item.student.roll} • {item.student.classId}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-900">
                          {item.ctAvgPct}%
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-900">
                          {item.attendancePct}%
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-900">
                          {item.disciplineAvg}/10
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-900">
                          {item.homeworkAvg}/10
                        </td>
                        <td className="py-3 px-4 font-mono font-black text-rose-600 text-sm">
                          {item.totalScore}%
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handlePublishWinner(item)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                          >
                            {language === 'bn' ? 'পুরস্কৃত করুন' : 'Award'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STUDENT DIRECTORY & PROFILES */}
      {activeTab === 'STUDENT_DIRECTORY' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <div>
              <h3 className="font-extrabold text-base text-emerald-950 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700" />
                <span>
                  {selectedClass} ({selectedSection}) — {language === 'bn' ? 'শিক্ষার্থী তালিকা' : 'Student Roster'} ({filteredStudents.length})
                </span>
              </h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                {language === 'bn'
                  ? 'শিক্ষার্থীদের পূর্ণাঙ্গ প্রোফাইল, অভিভাবকের যোগাযোগ নম্বর ও একাডেমিক তথ্য।'
                  : 'Manage student information and parent emergency contacts.'}
              </p>
            </div>
            <button
              onClick={handleOpenAddStudent}
              className="py-2 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'bn' ? 'শিক্ষার্থী যুক্ত করুন' : 'Add Student'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredStudents.map(student => (
              <div
                key={student.id}
                className="p-5 rounded-3xl bg-white border border-emerald-200 hover:border-emerald-300 shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs flex items-center justify-center font-mono">
                      #{student.roll}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="p-1.5 rounded-lg text-emerald-700 hover:text-emerald-950 hover:bg-emerald-50 cursor-pointer"
                        title={language === 'bn' ? 'সম্পাদনা করুন' : 'Edit student'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setStudentToDelete(student)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                        title={language === 'bn' ? 'শিক্ষার্থী মুছুন' : 'Delete student'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-extrabold text-base text-emerald-950">
                    {student.name}
                  </h4>
                  <p className="text-xs text-emerald-700 font-mono mt-0.5">
                    {student.classId} • Section {student.section}
                  </p>

                  <div className="mt-3 pt-3 border-t border-emerald-100 space-y-1.5 text-xs text-emerald-900">
                    <div className="flex justify-between">
                      <span className="text-emerald-700">{language === 'bn' ? 'অভিভাবক:' : 'Guardian:'}</span>
                      <span className="font-bold">{student.guardianName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-700">{language === 'bn' ? 'যোগাযোগ:' : 'Phone:'}</span>
                      <span className="font-mono font-bold">{student.contactNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-700">{language === 'bn' ? 'হাজিরা:' : 'Attendance:'}</span>
                      <span className="font-mono font-bold text-rose-600">{student.attendancePercentage || 95}%</span>
                    </div>
                    {student.teacherRemarks && (
                      <div className="mt-2 pt-2 border-t border-emerald-100 text-[11px]">
                        <span className="font-bold text-emerald-950 block">{language === 'bn' ? 'শিক্ষক মন্তব্য:' : "Teacher's Remarks:"}</span>
                        <p className="text-emerald-800 italic mt-0.5 leading-relaxed bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                          &ldquo;{student.teacherRemarks}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STUDENT OF THE MONTH DIGITAL CERTIFICATE MODAL */}
      <AnimatePresence>
        {activeCertificate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-8 border-double border-amber-500 rounded-3xl p-6 sm:p-10 max-w-xl w-full shadow-2xl relative my-auto text-center space-y-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveCertificate(null)}
                className="absolute top-4 right-4 p-2 rounded-full text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Certificate Seal & Header */}
              <div className="space-y-1">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-white flex items-center justify-center mx-auto shadow-lg text-2xl">
                  🏆
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest text-amber-700 mt-2">
                  TEACHFLOW ACADEMIC EXCELLENCE RECOGNITION
                </h4>
                <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 uppercase tracking-tight">
                  {language === 'bn' ? 'মাসের সেরা শিক্ষার্থী সনদ' : 'Certificate of Achievement'}
                </h2>
                <p className="text-xs text-emerald-700 font-bold">
                  {language === 'bn' ? 'স্টুডেন্ট অফ দ্যা মান্থ' : 'STUDENT OF THE MONTH'} — {activeCertificate.month} {activeCertificate.academicYear}
                </p>
              </div>

              {/* Recipient Details */}
              <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <p className="text-xs text-emerald-800">
                  {language === 'bn' ? 'এই সনদটি অত্যন্ত আনন্দের সাথে প্রদান করা হচ্ছে:' : 'This certificate is proudly presented to:'}
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-rose-600 underline decoration-amber-400 decoration-2 underline-offset-4">
                  {activeCertificate.studentName}
                </h3>
                <p className="text-xs text-emerald-950 font-bold">
                  {activeCertificate.classId} (Section {activeCertificate.section}) • Roll #{activeCertificate.studentRoll}
                </p>
                <p className="text-xs text-emerald-800 italic pt-1">
                  &quot;{activeCertificate.principalRemarks || 'উচ্চ একাডেমিক ফলাফল, অনুকরণীয় শিষ্টাচার ও শতভাগ উপস্থিতির স্বীকৃতিস্বরূপ।'}&quot;
                </p>
              </div>

              {/* Performance Scores Matrix */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 block">{language === 'bn' ? 'সিটি পরীক্ষা' : 'CT Marks'}</span>
                  <span className="font-black text-emerald-950">{activeCertificate.ctAverage}%</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 block">{language === 'bn' ? 'উপস্থিতি' : 'Attendance'}</span>
                  <span className="font-black text-emerald-950">{activeCertificate.attendancePercentage}%</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 block">{language === 'bn' ? 'শৃঙ্খলা' : 'Discipline'}</span>
                  <span className="font-black text-emerald-950">{activeCertificate.disciplineScore}/10</span>
                </div>
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-300">
                  <span className="text-[10px] text-amber-800 block font-bold">{language === 'bn' ? 'মোট স্কোর' : 'Total Score'}</span>
                  <span className="font-black text-rose-600 text-sm">{activeCertificate.totalScore}%</span>
                </div>
              </div>

              {/* Signatures Row */}
              <div className="flex items-center justify-between pt-6 border-t border-emerald-200 text-xs">
                <div className="text-center">
                  <div className="w-24 h-0.5 bg-emerald-900 mx-auto mb-1" />
                  <span className="font-bold text-emerald-950">{activeCertificate.nominatedByTeacherName}</span>
                  <p className="text-[10px] text-emerald-700">{language === 'bn' ? 'শ্রেণী শিক্ষক' : 'Class Teacher'}</p>
                </div>

                <div className="text-center">
                  <div className="w-24 h-0.5 bg-emerald-900 mx-auto mb-1" />
                  <span className="font-bold text-emerald-950">Principal / Headmaster</span>
                  <p className="text-[10px] text-emerald-700">{language === 'bn' ? 'অধ্যক্ষ / প্রধান শিক্ষক' : 'School Authority'}</p>
                </div>
              </div>

              {/* Print / Download Button */}
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="py-2.5 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>{language === 'bn' ? 'সনদ প্রিন্ট / ডাউনলোড করুন' : 'Print Certificate'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD / EDIT STUDENT MODAL */}
      <AnimatePresence>
        {isStudentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-2 border-emerald-500 rounded-3xl p-6 max-w-md w-full shadow-2xl relative my-auto space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                <h3 className="font-extrabold text-base text-emerald-950 flex items-center gap-2">
                  <Users className="w-5 h-5 text-rose-600" />
                  <span>
                    {editingStudent
                      ? (language === 'bn' ? 'শিক্ষার্থী তথ্য সম্পাদনা' : 'Edit Student')
                      : (language === 'bn' ? 'নতুন শিক্ষার্থী যুক্ত করুন' : 'Add New Student')}
                  </span>
                </h3>
                <button
                  onClick={() => setIsStudentModalOpen(false)}
                  className="p-1.5 rounded-full text-emerald-800 hover:text-emerald-950 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1">
                  {language === 'bn' ? 'শিক্ষার্থীর পূর্ণ নাম' : 'Student Full Name'} *
                </label>
                <input
                  type="text"
                  placeholder="e.g. তানভীর হাসান / Tanvir Hasan"
                  value={studentFormName}
                  onChange={e => setStudentFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-emerald-300 font-bold text-xs text-emerald-950 focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-emerald-900 mb-1">
                    {language === 'bn' ? 'রোল নম্বর' : 'Roll'} *
                  </label>
                  <input
                    type="text"
                    placeholder="1"
                    value={studentFormRoll}
                    onChange={e => setStudentFormRoll(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-300 font-mono font-bold text-xs text-emerald-950 text-center focus:outline-none focus:border-rose-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-900 mb-1">
                    {language === 'bn' ? 'শ্রেণী' : 'Class'}
                  </label>
                  <select
                    value={studentFormClass}
                    onChange={e => setStudentFormClass(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-white border border-emerald-300 font-bold text-xs text-emerald-950 focus:outline-none focus:border-rose-600"
                  >
                    {classesList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-900 mb-1">
                    {language === 'bn' ? 'শাখা' : 'Section'}
                  </label>
                  <select
                    value={studentFormSection}
                    onChange={e => setStudentFormSection(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-white border border-emerald-300 font-bold text-xs text-emerald-950 focus:outline-none focus:border-rose-600"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1">
                  {language === 'bn' ? 'অভিভাবকের নাম' : 'Guardian Name'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. মোঃ রফিকুল ইসলাম"
                  value={studentFormGuardian}
                  onChange={e => setStudentFormGuardian(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-emerald-300 text-xs text-emerald-950 focus:outline-none focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1">
                  {language === 'bn' ? 'অভিভাবকের মোবাইল নম্বর' : 'Emergency Contact Phone'}
                </label>
                <input
                  type="text"
                  placeholder="017XXXXXXXX"
                  value={studentFormContact}
                  onChange={e => setStudentFormContact(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-emerald-300 font-mono text-xs text-emerald-950 focus:outline-none focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1">
                  {language === 'bn' ? 'শিক্ষক মন্তব্য' : "Teacher's Remarks / Observations"}
                </label>
                <textarea
                  rows={2}
                  placeholder={language === 'bn' ? 'শিক্ষার্থী সম্পর্কে শিক্ষকের বিশেষ মন্তব্য বা পর্যবেক্ষণ...' : "Teacher's special notes or observations about the student..."}
                  value={studentFormRemarks}
                  onChange={e => setStudentFormRemarks(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-emerald-300 text-xs text-emerald-950 focus:outline-none focus:border-rose-600 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-emerald-100">
                <button
                  onClick={() => setIsStudentModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  onClick={handleSaveStudent}
                  disabled={!studentFormName.trim() || !studentFormRoll.trim()}
                  className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow transition-all cursor-pointer disabled:opacity-50"
                >
                  {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Student'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Student Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm">
          <div className="bg-white border border-rose-200 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-center text-emerald-950">
              {language === 'bn' ? 'শিক্ষার্থীর তথ্য মুছে ফেলতে চান?' : 'Delete this student?'}
            </h3>
            <p className="text-xs text-emerald-700 text-center mt-2 leading-relaxed">
              {language === 'bn'
                ? `আপনি কি নিশ্চিত যে "${studentToDelete.name}" (রোল: ${studentToDelete.roll}, ${studentToDelete.classId}-${studentToDelete.section}) এর তথ্য স্থায়ীভাবে মুছে ফেলতে চান?`
                : `Are you sure you want to permanently delete "${studentToDelete.name}" (Roll: ${studentToDelete.roll}, ${studentToDelete.classId}-${studentToDelete.section})?`}
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setStudentToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-emerald-200 text-emerald-800 font-bold text-xs hover:bg-emerald-50 cursor-pointer transition-colors"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  deleteStudent(studentToDelete.id);
                  setStudentToDelete(null);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {language === 'bn' ? 'স্থায়ীভাবে মুছুন' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete CT Mark Confirmation Modal */}
      {ctMarkToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm">
          <div className="bg-white border border-rose-200 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-center text-emerald-950">
              {language === 'bn' ? 'সিটি পরীক্ষার নম্বর মুছে ফেলতে চান?' : 'Delete this CT mark?'}
            </h3>
            <p className="text-xs text-emerald-700 text-center mt-2 leading-relaxed">
              {language === 'bn'
                ? `আপনি কি "${ctMarkToDelete.studentName}" এর ${selectedSubject} বিষয়ের সিটি পরীক্ষার নম্বরটি মুছে ফেলতে চান?`
                : `Are you sure you want to delete the CT mark for "${ctMarkToDelete.studentName}" in ${selectedSubject}?`}
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setCtMarkToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-emerald-200 text-emerald-800 font-bold text-xs hover:bg-emerald-50 cursor-pointer transition-colors"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  deleteCTMark(ctMarkToDelete.markId);
                  setCtMarkToDelete(null);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
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
