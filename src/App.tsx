/**
 * TeachFlow Main Application Entry
 * Master layout router, role-based view orchestration, offline status alerts,
 * and class session overlay controllers.
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { SplashScreen } from './components/common/SplashScreen';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { ActiveClassModal } from './components/teacher/ActiveClassModal';
import { QRScannerModal } from './components/teacher/QRScannerModal';
import { LoginScreen } from './components/auth/LoginScreen';

// Teacher Views
import { TeacherHome } from './components/teacher/TeacherHome';
import { MyRoutine } from './components/teacher/MyRoutine';
import { TeacherNotes } from './components/teacher/TeacherNotes';
import { TeacherReports } from './components/teacher/TeacherReports';
import { TeacherAttendance } from './components/teacher/TeacherAttendance';

// Employee Views
import { EmployeeDashboard } from './components/employee/EmployeeDashboard';

// Admin Views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LiveClassesMonitor } from './components/admin/LiveClassesMonitor';
import { AdminRoutineManager } from './components/admin/AdminRoutineManager';
import { AdminTeachers } from './components/admin/AdminTeachers';
import { AdminEmployees } from './components/admin/AdminEmployees';
import { AdminReports } from './components/admin/AdminReports';
import { AdminLeaves } from './components/admin/AdminLeaves';
import { AdminAnalytics } from './components/admin/AdminAnalytics';
import { AdminSettings } from './components/admin/AdminSettings';

// Shared Views
import { LeaveRequestsView } from './components/common/LeaveRequestsView';
import { NoticesView } from './components/common/NoticesView';
import { StudentEvaluationView } from './components/evaluation/StudentEvaluationView';
import { AttendanceReminderBanner } from './components/common/AttendanceReminderBanner';

import { Radio, WifiOff, RefreshCw, User, LogOut, Shield } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser, logout, switchUser, allUsers } = useAuth();
  const {
    activeClassSession,
    isQrScannerOpen,
    setIsQrScannerOpen,
    isOnline,
    toggleOnlineSimulation,
    syncQueue,
    startClassOneTap,
    getNextScheduledClassForTeacher
  } = useApp();

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isActiveClassModalOpen, setIsActiveClassModalOpen] = useState(false);

  // Set default tab when user switches role
  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      setCurrentTab('dashboard');
    } else {
      setCurrentTab('home');
    }
  }, [currentUser?.role]);

  // Open active class modal automatically when a class session begins
  useEffect(() => {
    if (activeClassSession) {
      setIsActiveClassModalOpen(true);
    }
  }, [activeClassSession?.id]);

  if (!currentUser) return null;

  // View resolution
  const renderCurrentView = () => {
    const role = currentUser.role;

    if (role === 'TEACHER') {
      switch (currentTab) {
        case 'home':
          return (
            <TeacherHome
              onNavigateTab={(tab) => {
                if (tab === 'active_class') {
                  setIsActiveClassModalOpen(true);
                } else {
                  setCurrentTab(tab);
                }
              }}
              onOpenRoutine={() => setCurrentTab('routine')}
            />
          );
        case 'routine':
          return (
            <MyRoutine
              onStartClassDirect={async (routineId) => {
                await startClassOneTap(routineId);
                setIsActiveClassModalOpen(true);
              }}
            />
          );
        case 'notes':
          return <TeacherNotes />;
        case 'evaluation':
          return <StudentEvaluationView />;
        case 'reports':
          return <TeacherReports />;
        case 'attendance':
          return <TeacherAttendance />;
        case 'leaves':
          return <LeaveRequestsView />;
        case 'notices':
          return <NoticesView />;
        case 'profile':
          return <MobileProfileView onSelectTab={setCurrentTab} />;
        case 'active_class':
          setIsActiveClassModalOpen(true);
          return (
            <TeacherHome
              onNavigateTab={(tab) => {
                if (tab === 'active_class') {
                  setIsActiveClassModalOpen(true);
                } else {
                  setCurrentTab(tab);
                }
              }}
              onOpenRoutine={() => setCurrentTab('routine')}
            />
          );
        default:
          return (
            <TeacherHome
              onNavigateTab={(tab) => {
                if (tab === 'active_class') {
                  setIsActiveClassModalOpen(true);
                } else {
                  setCurrentTab(tab);
                }
              }}
              onOpenRoutine={() => setCurrentTab('routine')}
            />
          );
      }
    } else if (role === 'EMPLOYEE') {
      switch (currentTab) {
        case 'home':
          return <EmployeeDashboard onNavigateTab={setCurrentTab} />;
        case 'attendance':
          return <EmployeeDashboard onNavigateTab={setCurrentTab} />;
        case 'leaves':
          return <LeaveRequestsView />;
        case 'notices':
          return <NoticesView />;
        case 'profile':
          return <MobileProfileView onSelectTab={setCurrentTab} />;
        default:
          return <EmployeeDashboard onNavigateTab={setCurrentTab} />;
      }
    } else {
      // ADMIN
      switch (currentTab) {
        case 'dashboard':
          return <AdminDashboard onNavigateTab={setCurrentTab} />;
        case 'live':
          return <LiveClassesMonitor />;
        case 'routine':
          return <AdminRoutineManager />;
        case 'teachers':
          return <AdminTeachers />;
        case 'employees':
          return <AdminEmployees />;
        case 'staff':
          return <AdminTeachers />;
        case 'attendance':
          return <AdminAnalytics />;
        case 'reports':
          return <AdminReports />;
        case 'evaluation':
          return <StudentEvaluationView />;
        case 'leaves':
          return <AdminLeaves />;
        case 'notices':
          return <NoticesView />;
        case 'analytics':
          return <AdminAnalytics />;
        case 'audit_logs':
        case 'settings':
          return <AdminSettings />;
        default:
          return <AdminDashboard onNavigateTab={setCurrentTab} />;
      }
    }
  };

  const { language } = useApp();
  const [isMobileFrameView, setIsMobileFrameView] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7faf8] text-emerald-950 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Offline Status Simulation Banner */}
      {!isOnline && (
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 text-white text-xs px-4 py-2 font-bold flex items-center justify-between z-50 sticky top-0 shadow-md">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 animate-pulse" />
            <span>
              <strong>{language === 'bn' ? 'অফলাইন মোড সক্রিয়' : 'Offline Mode Active'}</strong>:{' '}
              {language === 'bn'
                ? 'উপস্থিতি, রিপোর্ট ও রুটিনের সকল পরিবর্তন নিরাপদে আপনার ডিভাইসে সংরক্ষিত হচ্ছে।'
                : 'Attendance, reports, and routine changes are safely saved locally.'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-rose-900 px-2.5 py-0.5 rounded-full font-mono border border-rose-400/50 text-white">
              {syncQueue.length} {language === 'bn' ? 'অপেক্ষমান' : 'queued'}
            </span>
            <button
              onClick={toggleOnlineSimulation}
              className="px-3 py-1 rounded-full bg-white text-rose-700 font-extrabold text-[11px] hover:bg-emerald-50 transition-colors shadow cursor-pointer"
            >
              {language === 'bn' ? 'অনলাইন ও সিঙ্ক করুন' : 'Go Online & Sync'}
            </button>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar onOpenNotices={() => setCurrentTab('notices')} />

      {/* Attendance Notification Banner (8:00 AM - 12:45 PM window) */}
      <AttendanceReminderBanner />

      {/* Persistent Floating Live Class Banner */}
      {activeClassSession && !isActiveClassModalOpen && (
        <div className="sticky top-16 z-30 bg-rose-50 border-b border-rose-200 px-4 py-2.5 flex items-center justify-between text-xs text-rose-950 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
            <span className="font-extrabold text-rose-950">
              {language === 'bn' ? 'ক্লাস চলছে:' : 'CLASS IN PROGRESS:'} {activeClassSession.classId} • {activeClassSession.subjectId} ({activeClassSession.roomId})
            </span>
          </div>
          <button
            onClick={() => setIsActiveClassModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-all cursor-pointer"
          >
            {language === 'bn' ? 'ক্লাস কন্ট্রোল খুলুন' : 'Open Class Controls'}
          </button>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Desktop Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={tab => {
            if (tab === 'active_class') {
              setIsActiveClassModalOpen(true);
            } else {
              setCurrentTab(tab);
            }
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Scrollable Content Canvas */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-7 mb-16 md:mb-0">
          <div className="max-w-5xl mx-auto">
            {renderCurrentView()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'active_class') {
            setIsActiveClassModalOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        onOpenClassTrigger={() => {
          if (activeClassSession) {
            setIsActiveClassModalOpen(true);
          } else {
            const next = getNextScheduledClassForTeacher(currentUser.id);
            if (next?.routine) {
              startClassOneTap(next.routine.id);
              setIsActiveClassModalOpen(true);
            } else {
              setCurrentTab('routine');
            }
          }
        }}
      />

      {/* Active Class Full Screen / Dialog Overlay */}
      {isActiveClassModalOpen && (
        <ActiveClassModal onClose={() => setIsActiveClassModalOpen(false)} />
      )}

      {/* QR Scanner Modal for Instant Attendance */}
      {isQrScannerOpen && (
        <QRScannerModal
          onClose={() => setIsQrScannerOpen(false)}
          onSuccess={() => {
            setIsQrScannerOpen(false);
            setIsActiveClassModalOpen(true);
          }}
        />
      )}
    </div>
  );
};

// Mobile Profile / Account Sub-view in Red, Green & White theme
const MobileProfileView: React.FC<{ onSelectTab: (tab: string) => void }> = ({ onSelectTab }) => {
  const { currentUser, switchUser, allUsers, logout } = useAuth();
  const { isOnline, toggleOnlineSimulation, language, setLanguage } = useApp();

  if (!currentUser) return null;

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-16">
      {/* Profile Card */}
      <div className="p-6 rounded-3xl bg-white border-2 border-emerald-200 text-center space-y-3 shadow-md">
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-600 to-rose-700 border-2 border-rose-300 text-white flex items-center justify-center font-black text-3xl mx-auto shadow-md">
            {currentUser.name.charAt(0)}
          </div>
          <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-600 border-2 border-white" />
        </div>
        <div>
          <h2 className="text-xl font-black text-emerald-950">{currentUser.name}</h2>
          <span className="text-xs text-emerald-700 font-semibold block">{currentUser.designation}</span>
          <span className="text-xs text-rose-600 font-mono font-bold mt-0.5 block">{currentUser.employeeId}</span>
        </div>
        <div className="pt-1 flex items-center justify-center gap-2">
          <span className="px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
            {language === 'bn' ? 'পদবী' : 'Role'}: {currentUser.role}
          </span>
          <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
            {currentUser.department || 'Academic'}
          </span>
        </div>
      </div>

      {/* Language Toggle Card */}
      <div className="p-5 rounded-3xl bg-white border border-emerald-200 flex items-center justify-between shadow-sm">
        <div>
          <span className="font-bold text-emerald-950 text-sm block">
            {language === 'bn' ? 'ভাষা নির্বাচন' : 'Language Selection'}
          </span>
          <span className="text-xs text-emerald-700">
            {language === 'bn' ? 'বাংলা ও ইংরেজি ভাষার মধ্যে পরিবর্তন করুন' : 'Switch between Bengali and English'}
          </span>
        </div>
        <div className="flex items-center gap-1 bg-emerald-50 p-1 rounded-2xl border border-emerald-200">
          <button
            onClick={() => setLanguage('bn')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              language === 'bn' ? 'bg-rose-600 text-white' : 'text-emerald-800 hover:text-emerald-950'
            }`}
          >
            বাংলা
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              language === 'en' ? 'bg-rose-600 text-white' : 'text-emerald-800 hover:text-emerald-950'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Quick Role Switcher for seamless testing */}
      <div className="p-6 rounded-3xl bg-white border border-emerald-200 space-y-3 shadow-md">
        <h3 className="text-sm font-black text-emerald-950 flex items-center gap-2">
          <Shield className="w-4 h-4 text-rose-600" />
          <span>{language === 'bn' ? 'রোল পরিবর্তন (মূল্যায়ন মোড)' : 'Quick Role Switcher (Evaluation Mode)'}</span>
        </h3>
        <p className="text-xs text-emerald-700">
          {language === 'bn'
            ? 'শিক্ষক, প্রধান শিক্ষক (অ্যাডমিন) এবং স্টাফ মোডের মধ্যে এক ক্লিকে পরিবর্তন করুন।'
            : 'Instantly switch personas to evaluate Teacher, Admin, and Employee experiences.'}
        </p>

        <div className="space-y-2 pt-2">
          {allUsers.map(user => (
            <button
              key={user.id}
              onClick={() => switchUser(user.id)}
              className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                user.id === currentUser.id
                  ? 'bg-rose-50 border-rose-400 text-rose-950 font-black ring-1 ring-rose-300'
                  : 'bg-emerald-50/50 border-emerald-200 text-emerald-900 hover:border-emerald-400 hover:bg-emerald-50'
              }`}
            >
              <div>
                <span className="block font-bold text-sm text-emerald-950">{user.name}</span>
                <span className="text-[11px] text-emerald-700">{user.designation}</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-2.5 py-1 rounded-full bg-white text-rose-600 border border-rose-200 font-bold">
                {user.role}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Offline simulation toggle */}
      <div className="p-5 rounded-3xl bg-white border border-emerald-200 flex items-center justify-between text-xs shadow-sm">
        <div>
          <span className="font-bold text-emerald-950 block text-sm">
            {language === 'bn' ? 'অফলাইন মোড সিমুলেটর' : 'Offline Mode Simulator'}
          </span>
          <span className="text-[11px] text-emerald-700 mt-0.5 block">
            {language === 'bn' ? 'নেটওয়ার্ক অবস্থা' : 'Network status'}: {isOnline ? (language === 'bn' ? 'অনলাইন (সংযুক্ত)' : 'Online (Connected)') : (language === 'bn' ? 'অফলাইন (লোকাল)' : 'Offline (Local Only)')}
          </span>
        </div>
        <button
          onClick={toggleOnlineSimulation}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
        >
          {language === 'bn' ? (isOnline ? 'অফলাইন করুন' : 'অনলাইন করুন') : `Toggle ${isOnline ? 'Offline' : 'Online'}`}
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AuthProvider>
      <AppProvider>
        {showSplash ? (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        ) : (
          <AppContent />
        )}
      </AppProvider>
    </AuthProvider>
  );
}

const AppContent: React.FC = () => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7faf8] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-rose-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  return <MainLayout />;
}
