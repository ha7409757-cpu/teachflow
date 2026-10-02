/**
 * TeachFlow Desktop Collapsible Sidebar
 * Provides structured navigation for Admin, Teacher, and Employee in Red & Green theme with Bengali support.
 */

import React from 'react';
import {
  Home,
  Calendar,
  Radio,
  Lock,
  FileText,
  Clock,
  Briefcase,
  Users,
  Bell,
  BarChart2,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse
}) => {
  const { currentUser } = useAuth();
  const { activeClassSession, leaveRequests, adminReports, language } = useApp();
  const role = currentUser?.role;

  const pendingLeaves = leaveRequests.filter(l => l.status === 'PENDING').length;
  const pendingReports = adminReports.filter(r => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW').length;

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
    isPrivate?: boolean;
    isActiveClass?: boolean;
  }

  let navItems: NavItem[] = [];

  if (role === 'TEACHER') {
    navItems = [
      { id: 'home', label: language === 'bn' ? 'হোম ড্যাশবোর্ড' : 'Dashboard', icon: Home },
      { id: 'routine', label: language === 'bn' ? 'আমার রুটিন' : 'My Routine', icon: Calendar },
      ...(activeClassSession ? [{
        id: 'active_class',
        label: language === 'bn' ? 'লাইভ ক্লাস' : 'Active Class',
        icon: Radio,
        badge: language === 'bn' ? 'লাইভ' : 'LIVE',
        badgeColor: 'bg-rose-100 text-rose-700 border-rose-300',
        isActiveClass: true
      }] : []),
      {
        id: 'notes',
        label: language === 'bn' ? 'ব্যক্তিগত নোট' : 'Private Notes',
        icon: Lock,
        badge: language === 'bn' ? 'ব্যক্তিগত' : 'Private',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        isPrivate: true
      },
      {
        id: 'evaluation',
        label: language === 'bn' ? 'ছাত্র মূল্যায়ন ও সেরা ছাত্র' : 'Student Evaluation',
        icon: Award,
        badge: 'SOM',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
      },
      { id: 'reports', label: language === 'bn' ? 'রিপোর্ট ও ফাইল পাঠান' : 'Send Report / Files', icon: FileText },
      { id: 'attendance', label: language === 'bn' ? 'আমার হাজিরা' : 'My Attendance', icon: Clock },
      { id: 'leaves', label: language === 'bn' ? 'ছুটির আবেদন' : 'Leave Requests', icon: Briefcase },
      { id: 'notices', label: language === 'bn' ? 'নোটিশ বোর্ড' : 'Notices', icon: Bell }
    ];
  } else if (role === 'EMPLOYEE') {
    navItems = [
      { id: 'home', label: language === 'bn' ? 'ড্যাশবোর্ড ও চেক-ইন' : 'Dashboard & Check-In', icon: Home },
      { id: 'attendance', label: language === 'bn' ? 'হাজিরার ইতিহাস' : 'Attendance History', icon: Clock },
      { id: 'leaves', label: language === 'bn' ? 'ছুটির আবেদন' : 'Leave Requests', icon: Briefcase },
      { id: 'notices', label: language === 'bn' ? 'নোটিশ বোর্ড' : 'Notices', icon: Bell }
    ];
  } else {
    // ADMIN
    navItems = [
      { id: 'dashboard', label: language === 'bn' ? 'ওভারভিউ ড্যাশবোর্ড' : 'Overview', icon: Home },
      {
        id: 'live',
        label: language === 'bn' ? 'লাইভ ক্লাসরুম' : 'Live Classes',
        icon: Radio,
        badge: language === 'bn' ? 'লাইভ' : 'Live',
        badgeColor: 'bg-rose-100 text-rose-700 border-rose-300'
      },
      { id: 'routine', label: language === 'bn' ? 'রুটিন ব্যবস্থাপনা' : 'Routine Management', icon: Calendar },
      { id: 'teachers', label: language === 'bn' ? 'শিক্ষক তালিকা' : 'Teachers', icon: Users },
      { id: 'employees', label: language === 'bn' ? 'কর্মচারী তালিকা' : 'Employees', icon: UserCheck },
      {
        id: 'evaluation',
        label: language === 'bn' ? 'স্টুডেন্ট অফ দ্যা মান্থ' : 'Student of Month',
        icon: Award,
        badge: 'Awards',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
      },
      { id: 'attendance', label: language === 'bn' ? 'হাজিরা লগ' : 'Attendance Logs', icon: Clock },
      {
        id: 'leaves',
        label: language === 'bn' ? 'ছুটির অনুমোদন' : 'Leave Approvals',
        icon: Briefcase,
        badge: pendingLeaves > 0 ? pendingLeaves : undefined,
        badgeColor: 'bg-rose-100 text-rose-700 border-rose-300'
      },
      {
        id: 'reports',
        label: language === 'bn' ? 'জমা দেওয়া রিপোর্ট' : 'Submitted Reports',
        icon: FileText,
        badge: pendingReports > 0 ? pendingReports : undefined,
        badgeColor: 'bg-rose-100 text-rose-700 border-rose-300'
      },
      { id: 'notices', label: language === 'bn' ? 'বিদ্যালয় নোটিশ' : 'School Notices', icon: Bell },
      { id: 'analytics', label: language === 'bn' ? 'বিশ্লেষণ ও এক্সপোর্ট' : 'Analytics & Export', icon: BarChart2 },
      { id: 'audit_logs', label: language === 'bn' ? 'অডিট লগ' : 'Audit Logs', icon: ShieldCheck },
      { id: 'settings', label: language === 'bn' ? 'বিদ্যালয় সেটিংস' : 'School Settings', icon: Settings }
    ];
  }

  return (
    <aside
      className={`hidden md:flex flex-col shrink-0 bg-white border-r border-emerald-200 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse button */}
      <div className="flex items-center justify-end p-3 border-b border-emerald-100">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-xl text-emerald-700 hover:text-emerald-950 hover:bg-emerald-50 transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-none">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-emerald-700'}`} />

              {!isCollapsed && (
                <>
                  <span className="truncate flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        item.badgeColor || 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer info in sidebar */}
      {!isCollapsed && (
        <div className="p-4 m-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs">
          <div className="flex items-center gap-2 text-rose-600 font-black mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>টিচফ্লো • TeachFlow</span>
          </div>
          <p className="text-[11px] text-emerald-800 font-medium leading-tight">
            {language === 'bn' ? 'কম চাপ, সহজ পাঠদান।' : 'Less Tapping. More Teaching.'}
          </p>
        </div>
      )}
    </aside>
  );
};
