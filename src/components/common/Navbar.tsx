/**
 * TeachFlow Top Navigation Bar
 * Features Red & Green brand identity, digital school clock, live sync status,
 * language switcher (বাংলা / English), mobile frame toggle, instant role switcher, and profile menu.
 */

import React, { useState } from 'react';
import {
  Globe,
  Bell,
  LogOut,
  ChevronDown,
  Shield,
  BookOpen,
  Briefcase,
  Smartphone,
  Monitor,
  Languages,
  Check,
  KeyRound,
  Lock,
  X,
  AlertCircle,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { SyncStatusBadge } from './SyncStatusBadge';
import { DigitalClock } from './DigitalClock';
import { ShareModal } from './ShareModal';

interface NavbarProps {
  onOpenNotices?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNotices }) => {
  const { currentUser, logout, switchUser, allUsers, changePin } = useAuth();
  const { settings, notices, language, setLanguage, t, isMobileFrame, setIsMobileFrame } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSwitchDropdown, setShowSwitchDropdown] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Change PIN modal state
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState<boolean>(false);

  const unreadNoticesCount = notices.filter(
    n => currentUser && Array.isArray(n.readByUserIds) && !n.readByUserIds.includes(currentUser.id)
  ).length;

  const handleChangePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    setPinSuccess(false);

    if (!oldPin || !newPin) {
      setPinError(language === 'bn' ? 'সকল ঘর পূরণ করুন।' : 'Please fill all fields.');
      return;
    }

    const res = await changePin(oldPin, newPin);
    if (res.success) {
      setPinSuccess(true);
      setOldPin('');
      setNewPin('');
      setTimeout(() => {
        setIsPinModalOpen(false);
        setPinSuccess(false);
      }, 1500);
    } else {
      setPinError(res.error || 'পিন পরিবর্তন করা যায়নি।');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-emerald-700 border-b border-emerald-800 shadow-md shadow-emerald-900/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand & School info with Red-Green-White Identity */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-white border border-emerald-300 shadow-sm text-emerald-700 font-bold shrink-0">
            <Globe className="w-5 h-5 text-emerald-600" />
            {/* Red Circle Accent */}
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-600 border-2 border-white shadow-sm animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-white">
                {language === 'bn' ? 'টিচ' : 'Teach'}<span className="text-rose-200 font-extrabold">{language === 'bn' ? 'ফ্লো' : 'Flow'}</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-emerald-800 text-emerald-100 border border-emerald-600">
                {currentUser?.role === 'TEACHER' ? (language === 'bn' ? 'শিক্ষক' : 'TEACHER') :
                 currentUser?.role === 'ADMIN' ? (language === 'bn' ? 'প্রশাসক' : 'ADMIN') :
                 (language === 'bn' ? 'কর্মচারী' : 'STAFF')}
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/90 truncate max-w-[130px] sm:max-w-[220px] font-medium">
              {settings.schoolName}
            </p>
          </div>
        </div>

        {/* Center Clock (Desktop & Tablet) */}
        <div className="hidden md:flex items-center">
          <DigitalClock />
        </div>

        {/* Right Controls: Sync badge, Language, Mobile toggle, Role Switcher, Notifications, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Offline/Online & Sync Status */}
          <SyncStatusBadge compact />

          {/* Share & Mobile Install Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-sm border border-rose-500 transition-all touch-active cursor-pointer"
            title="Share App with Friends / বন্ধুদের সাথে শেয়ার ও মোবাইল ইনস্টল"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'bn' ? 'শেয়ার' : 'Share'}</span>
          </button>

          {/* Language Switcher (বাংলা / EN) */}
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-xs font-bold text-white border border-emerald-600 transition-all touch-active cursor-pointer"
            title="Toggle Language / ভাষা পরিবর্তন করুন"
          >
            <Languages className="w-3.5 h-3.5 text-rose-300" />
            <span className="text-xs">{language === 'bn' ? 'EN' : 'বাং'}</span>
          </button>

          {/* Desktop/Mobile Frame Toggle (Visible on larger screens) */}
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-xs font-medium text-emerald-100 border border-emerald-600 transition-all"
            title={isMobileFrame ? 'Switch to Full Screen View' : 'Switch to Smartphone App Frame'}
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-emerald-200" />
                <span className="text-[11px]">{language === 'bn' ? 'ফুল স্ক্রিন' : 'Desktop'}</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-rose-300" />
                <span className="text-[11px]">{language === 'bn' ? 'মোবাইল ফ্রেম' : 'Mobile'}</span>
              </>
            )}
          </button>

          {/* Instant Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-xs text-white border border-emerald-600 transition-colors cursor-pointer"
              title="Quickly switch between Admin, Teachers, and Employees"
            >
              {currentUser?.role === 'ADMIN' && <Shield className="w-3.5 h-3.5 text-rose-300" />}
              {currentUser?.role === 'TEACHER' && <BookOpen className="w-3.5 h-3.5 text-emerald-200" />}
              {currentUser?.role === 'EMPLOYEE' && <Briefcase className="w-3.5 h-3.5 text-amber-200" />}
              <span className="hidden sm:inline font-semibold">
                {currentUser?.role === 'ADMIN' ? (language === 'bn' ? 'এডমিন' : 'Admin') :
                 currentUser?.role === 'TEACHER' ? (language === 'bn' ? 'শিক্ষক' : 'Teacher') :
                 (language === 'bn' ? 'স্টাফ' : 'Staff')}
              </span>
              <ChevronDown className="w-3 h-3 text-emerald-200" />
            </button>

            {showSwitchDropdown && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white border border-emerald-200 rounded-2xl shadow-2xl py-2 z-50 text-xs"
                onMouseLeave={() => setShowSwitchDropdown(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-bold text-emerald-800 border-b border-emerald-100 uppercase tracking-wider flex items-center justify-between">
                  <span>{language === 'bn' ? 'ইউজার পরিবর্তন করুন' : 'Switch Active Persona'}</span>
                  <span className="text-[10px] text-rose-600 font-bold">{language === 'bn' ? 'সরাসরি' : 'Live'}</span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-emerald-50">
                  {allUsers.map(user => {
                    const isSelected = user.id === currentUser?.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => {
                          switchUser(user.id);
                          setShowSwitchDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors hover:bg-emerald-50 cursor-pointer ${
                          isSelected ? 'bg-emerald-100/80 text-emerald-900 font-bold' : 'text-emerald-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              user.role === 'ADMIN'
                                ? 'bg-rose-600 shadow-sm'
                                : user.role === 'TEACHER'
                                ? 'bg-emerald-600 shadow-sm'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <div className="truncate">
                            <p className="font-bold text-emerald-950 truncate">{user.name}</p>
                            <p className="text-[10px] text-emerald-600 truncate">
                              {user.role} • {user.designation}
                            </p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-700 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Notices Bell with Red Notification Badge */}
          <button
            onClick={onOpenNotices}
            className="relative p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
            title={language === 'bn' ? 'বিদ্যালয়ের নোটিশ বোর্ড' : 'School Notices'}
          >
            <Bell className="w-4 h-4" />
            {unreadNoticesCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-white animate-pulse shadow-sm shadow-rose-500/60" />
            )}
          </button>

          {/* Profile & Logout */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-rose-400 transition-all cursor-pointer"
            >
              <img
                src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={currentUser?.name || 'User'}
                className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
              />
            </button>

            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-60 bg-white border border-emerald-200 rounded-2xl shadow-2xl py-2 z-50 text-xs"
                onMouseLeave={() => setShowUserMenu(false)}
              >
                <div className="px-3 py-2 border-b border-emerald-100">
                  <p className="font-bold text-emerald-950 truncate">{currentUser?.name}</p>
                  <p className="text-[11px] text-emerald-600 truncate">{currentUser?.email}</p>
                  <p className="text-[10px] text-rose-600 font-bold font-mono mt-0.5">
                    {currentUser?.employeeId} • PIN: {currentUser?.pin || '1234'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    setOldPin('');
                    setNewPin('');
                    setPinError(null);
                    setPinSuccess(false);
                    setIsPinModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-emerald-900 hover:bg-emerald-50 font-bold transition-colors text-left cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-rose-600" />
                  <span>{language === 'bn' ? 'আমার পিন পরিবর্তন করুন' : 'Change My PIN'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 font-bold transition-colors text-left cursor-pointer border-t border-emerald-100"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'লগআউট ও লক করুন' : 'Lock & Sign Out'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change PIN Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white border border-emerald-200 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-950">
                    {language === 'bn' ? 'ব্যক্তিগত পিন পরিবর্তন' : 'Change Security PIN'}
                  </h3>
                  <span className="text-[10px] text-emerald-700">
                    {language === 'bn' ? 'নিজের অ্যাকাউন্টের পিন আপডেট করুন' : 'Update your personal login PIN'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPinModalOpen(false)}
                className="p-1 rounded-lg text-emerald-600 hover:text-emerald-950 hover:bg-emerald-50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {pinSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-emerald-950">
                  {language === 'bn' ? 'পিন সফলভাবে পরিবর্তিত হয়েছে!' : 'PIN successfully updated!'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleChangePinSubmit} className="space-y-3.5">
                {pinError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{pinError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-emerald-900 mb-1">
                    {language === 'bn' ? 'বর্তমান পিন (Current PIN) *' : 'Current PIN *'}
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={oldPin}
                    onChange={e => setOldPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="বর্তমান ৪ সংখ্যার পিন"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-950 text-center font-mono font-bold text-sm tracking-widest focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-900 mb-1">
                    {language === 'bn' ? 'নতুন পিন (New PIN) *' : 'New PIN *'}
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={newPin}
                    onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="নতুন ৪ সংখ্যার পিন"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-950 text-center font-mono font-bold text-sm tracking-widest focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPinModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-bold cursor-pointer"
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    {language === 'bn' ? 'পিন আপডেট করুন' : 'Update PIN'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Share & Mobile Install Modal */}
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
    </header>
  );
};
