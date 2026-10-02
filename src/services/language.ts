/**
 * TeachFlow Bengali & English Localization Dictionary
 * Empowers authentic Bangla language experience alongside English.
 */

export type Language = 'bn' | 'en';

export const translations = {
  bn: {
    appName: 'টিচফ্লো',
    appTagline: 'শিক্ষক ও বিদ্যালয় ব্যবস্থাপনা মোবাইল অ্যাপ',
    mobileApp: 'মোবাইল অ্যাপ',
    roleTeacher: 'শিক্ষক',
    roleAdmin: 'প্রধান প্রশাসক',
    roleEmployee: 'কর্মচারী',
    
    // Nav Tabs
    tabHome: 'হোম',
    tabRoutine: 'রুটিন',
    tabActiveClass: 'ক্লাস চালু',
    tabNotes: 'নোটস',
    tabReports: 'রিপোর্ট',
    tabAttendance: 'হাজিরা',
    tabLeaves: 'ছুটি',
    tabNotices: 'নোটিশ',
    tabAnalytics: 'অ্যানালিটিক্স',
    tabLive: 'লাইভ ক্লাস',
    tabTeachers: 'শিক্ষকবৃন্দ',
    tabEmployees: 'কর্মচারীবৃন্দ',
    tabSettings: 'সেটিংস',
    tabProfile: 'প্রোফাইল',

    // Actions & Buttons
    startAndAttend: 'ক্লাস শুরু ও হাজিরা দিন',
    punchIn: 'হাজিরা দিন (চেক-ইন)',
    punchOut: 'প্রস্থান (চেক-আউট)',
    checkInSuccessful: 'হাজিরা সফলভাবে গৃহীত হয়েছে',
    endClass: 'ক্লাস সমাপ্ত করুন',
    extendPeriod: 'সময় বৃদ্ধি (+৫ মিনিট)',
    scanQr: 'কিউআর কোড স্ক্যান',
    offlineMode: 'অফলাইন মোড চালু',
    onlineMode: 'অনলাইন মোড চালু',
    quickSync: 'ডাটা সিঙ্ক করুন',
    saveNote: 'নোট সংরক্ষণ করুন',
    submitReport: 'রিপোর্ট পাঠান',
    applyLeave: 'ছুটির আবেদন করুন',
    approve: 'অনুমোদন',
    reject: 'বাতিল',
    filterAll: 'সকল',
    todaySummary: 'আজকের সারসংক্ষেপ',
    switchRole: 'ইউজার পরিবর্তন',
    
    // Statuses
    statusPresent: 'উপস্থিত',
    statusLate: 'বিলম্বিত',
    statusAbsent: 'অনুপস্থিত',
    statusLeave: 'ছুটিতে',
    statusCompleted: 'সম্পন্ন',
    statusInProgress: 'চলমান',
    statusPending: 'অপেক্ষমাণ',
    statusApproved: 'অনুমোদিত',
    statusRejected: 'প্রত্যাখ্যাত',

    // Mobile specific
    mobileSimulator: 'মোবাইল ফ্রেম',
    fullScreen: 'ফুল স্ক্রিন',
    battery: '১০০%',
    welcomeBack: 'স্বাগতম',
    nextClass: 'পরবর্তী ক্লাস',
    myRoutine: 'আমার সাপ্তাহিক রুটিন',
    privateNotesNotice: '🔒 এটি আপনার ব্যক্তিগত গোপনীয় নোট। প্রশাসক এটি দেখতে পারবেন না।',
    reportsNotice: 'অধ্যক্ষ ও প্রধান প্রশাসকের দপ্তরে আনুষ্ঠানিক প্রতিবেদন।'
  },
  en: {
    appName: 'TeachFlow',
    appTagline: 'School Staff & Teacher Mobile Management',
    mobileApp: 'Mobile App',
    roleTeacher: 'Teacher',
    roleAdmin: 'Administrator',
    roleEmployee: 'Staff / Employee',
    
    // Nav Tabs
    tabHome: 'Home',
    tabRoutine: 'Routine',
    tabActiveClass: 'Live Class',
    tabNotes: 'Notes',
    tabReports: 'Reports',
    tabAttendance: 'Attendance',
    tabLeaves: 'Leaves',
    tabNotices: 'Notices',
    tabAnalytics: 'Analytics',
    tabLive: 'Live Class',
    tabTeachers: 'Faculty',
    tabEmployees: 'Staff',
    tabSettings: 'Settings',
    tabProfile: 'Profile',

    // Actions & Buttons
    startAndAttend: 'Start Class & Attend',
    punchIn: 'Check-In Attendance',
    punchOut: 'Check-Out (End of Day)',
    checkInSuccessful: 'Attendance Recorded Successfully',
    endClass: 'End Class Session',
    extendPeriod: 'Extend (+5 min)',
    scanQr: 'Scan QR Attendance',
    offlineMode: 'Offline Mode Active',
    onlineMode: 'Online Mode Active',
    quickSync: 'Sync Local Data',
    saveNote: 'Save Lesson Note',
    submitReport: 'Submit Official Report',
    applyLeave: 'Apply for Leave',
    approve: 'Approve',
    reject: 'Decline',
    filterAll: 'All',
    todaySummary: "Today's Summary",
    switchRole: 'Switch Role',

    // Statuses
    statusPresent: 'Present',
    statusLate: 'Late',
    statusAbsent: 'Absent',
    statusLeave: 'On Leave',
    statusCompleted: 'Completed',
    statusInProgress: 'In Progress',
    statusPending: 'Pending',
    statusApproved: 'Approved',
    statusRejected: 'Rejected',

    // Mobile specific
    mobileSimulator: 'Mobile Frame',
    fullScreen: 'Full Width',
    battery: '100%',
    welcomeBack: 'Welcome back',
    nextClass: 'Next Class',
    myRoutine: 'My Weekly Routine',
    privateNotesNotice: '🔒 Strictly private to you. Invisible to Principal & Admins.',
    reportsNotice: 'Official submissions directly routed to Principal & Admins.'
  }
};
