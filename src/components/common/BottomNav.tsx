/**
 * TeachFlow Mobile Bottom Navigation
 * Features Red & Green aesthetic, thumb-optimized touch targets,
 * bilingual Bengali/English labels, and elevated Class/Attendance quick trigger.
 */

import React from 'react';
import {
  Home,
  Calendar,
  Lock,
  FileText,
  User,
  Radio,
  Clock,
  Briefcase,
  Users,
  Settings,
  Play
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenClassTrigger?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab, onOpenClassTrigger }) => {
  const { currentUser } = useAuth();
  const { language, activeClassSession } = useApp();
  const role = currentUser?.role;

  let tabs = [];

  if (role === 'TEACHER') {
    tabs = [
      { id: 'home', label: language === 'bn' ? 'হোম' : 'Home', icon: Home },
      { id: 'routine', label: language === 'bn' ? 'রুটিন' : 'Routine', icon: Calendar },
      { id: 'active_class_action', label: language === 'bn' ? 'ক্লাস/হাজিরা' : 'Class', isCenterAction: true },
      { id: 'notes', label: language === 'bn' ? 'নোটস' : 'Notes', icon: Lock, badge: language === 'bn' ? 'গোপন' : 'Private' },
      { id: 'profile', label: language === 'bn' ? 'মেনু' : 'Menu', icon: User }
    ];
  } else if (role === 'EMPLOYEE') {
    tabs = [
      { id: 'home', label: language === 'bn' ? 'হোম' : 'Home', icon: Home },
      { id: 'attendance', label: language === 'bn' ? 'হাজিরা' : 'Attendance', icon: Clock },
      { id: 'leaves', label: language === 'bn' ? 'ছুটি' : 'Leaves', icon: Briefcase },
      { id: 'notices', label: language === 'bn' ? 'নোটিশ' : 'Notices', icon: FileText },
      { id: 'profile', label: language === 'bn' ? 'প্রোফাইল' : 'Profile', icon: User }
    ];
  } else {
    // ADMIN
    tabs = [
      { id: 'dashboard', label: language === 'bn' ? 'ওভারভিউ' : 'Overview', icon: Home },
      { id: 'live', label: language === 'bn' ? 'লাইভ' : 'Live', icon: Radio, pulse: true },
      { id: 'routine', label: language === 'bn' ? 'রুটিন' : 'Routine', icon: Calendar },
      { id: 'staff', label: language === 'bn' ? 'স্টাফ' : 'Staff', icon: Users },
      { id: 'settings', label: language === 'bn' ? 'সেটিংস' : 'Settings', icon: Settings }
    ];
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-emerald-200 shadow-[0_-4px_20px_rgba(6,78,59,0.08)]">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-1">
        {tabs.map(tab => {
          if (tab.isCenterAction) {
            return (
              <button
                key="center-action"
                onClick={() => {
                  if (onOpenClassTrigger) onOpenClassTrigger();
                  else onSelectTab('active_class');
                }}
                className="relative -top-3 flex flex-col items-center justify-center p-1.5 touch-active group cursor-pointer"
                title={language === 'bn' ? 'হাজিরা ও ক্লাস পরিচালনা' : 'Start & Attend Class'}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg border-2 ${
                  activeClassSession
                    ? 'bg-rose-600 border-white shadow-rose-600/40 animate-pulse'
                    : 'bg-gradient-to-tr from-emerald-600 to-rose-600 border-white shadow-emerald-700/30'
                }`}>
                  <Play className="w-5 h-5 ml-0.5 fill-current" />
                </div>
                <span className="text-[10px] mt-0.5 font-bold text-rose-600 whitespace-nowrap">
                  {tab.label}
                </span>
              </button>
            );
          }

          const Icon = tab.icon!;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-all touch-active cursor-pointer ${
                isActive ? 'text-emerald-700 font-extrabold' : 'text-emerald-800/60 hover:text-emerald-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-emerald-700' : ''}`} />
                {tab.pulse && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-600 border border-white animate-pulse" />
                )}
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 px-1 text-[7px] font-bold rounded-full bg-rose-100 text-rose-700 border border-rose-300 scale-75">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 transition-all ${isActive ? 'text-emerald-700 font-bold' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-rose-600 rounded-full shadow-sm" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
