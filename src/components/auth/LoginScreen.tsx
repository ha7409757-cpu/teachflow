/**
 * TeachFlow PIN-based Authentication & Registration Screen
 * Allows users to enter with their own personal PIN, or register a new account with custom PIN.
 * Pure Red, Green, and White aesthetic.
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Lock,
  User,
  KeyRound,
  UserPlus,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  School,
  Delete,
  Eye,
  EyeOff
} from 'lucide-react';

interface LoginScreenProps {
  onSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const { allUsers, loginWithPin, registerUser, canCreateAdmin, isLoading } = useAuth();
  const { settings, language } = useApp();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login state
  const [selectedUserId, setSelectedUserId] = useState<string>(allUsers[0]?.id || '');
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register state
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('TEACHER');
  const [regPhone, setRegPhone] = useState('');
  const [regDesignation, setRegDesignation] = useState('সহকারী শিক্ষক');
  const [regDepartment, setRegDepartment] = useState('বিজ্ঞান ও গণিত');
  const [regPin, setRegPin] = useState('');
  const [regConfirmPin, setRegConfirmPin] = useState('');
  const [regError, setRegError] = useState<string | null>(null);

  const selectedUser = allUsers.find(u => u.id === selectedUserId) || allUsers[0];

  const handleKeypadPress = (digit: string) => {
    if (enteredPin.length < 6) {
      setEnteredPin(prev => prev + digit);
      setLoginError(null);
    }
  };

  const handleBackspace = () => {
    setEnteredPin(prev => prev.slice(0, -1));
    setLoginError(null);
  };

  const handlePinLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedUser) {
      setLoginError(language === 'bn' ? 'দয়া করে একটি অ্যাকাউন্ট নির্বাচন করুন।' : 'Please select an account.');
      return;
    }
    if (!enteredPin) {
      setLoginError(language === 'bn' ? 'দয়া করে আপনার পিন লিখুন।' : 'Please enter your PIN.');
      return;
    }

    setLoginError(null);
    const res = await loginWithPin(selectedUser.id, enteredPin);
    if (res.success) {
      setEnteredPin('');
      if (onSuccess) onSuccess();
    } else {
      setLoginError(res.error || 'ভুল পিন নম্বর!');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim()) {
      setRegError(language === 'bn' ? 'আপনার পূর্ণ নাম লিখুন।' : 'Please enter your full name.');
      return;
    }
    if (!regPhone.trim()) {
      setRegError(language === 'bn' ? 'মোবাইল নম্বর লিখুন।' : 'Please enter your phone number.');
      return;
    }
    if (regPin.length < 4) {
      setRegError(language === 'bn' ? 'পিন কমপক্ষে ৪ সংখ্যার হতে হবে।' : 'PIN must be at least 4 digits.');
      return;
    }
    if (regPin !== regConfirmPin) {
      setRegError(language === 'bn' ? 'দুইবার দেওয়া পিন মেলেনি।' : 'PIN confirmation does not match.');
      return;
    }
    if (regRole === 'ADMIN' && !canCreateAdmin()) {
      setRegError(
        language === 'bn'
          ? 'সিস্টেমে সর্বোচ্চ ২ জন প্রধান শিক্ষক/অ্যাডমিন অ্যাকাউন্ট অনুমোদিত।'
          : 'Maximum 2 admin accounts allowed.'
      );
      return;
    }

    const res = await registerUser({
      name: regName.trim(),
      phone: regPhone.trim(),
      role: regRole,
      designation: regDesignation.trim(),
      department: regDepartment.trim(),
      pin: regPin.trim()
    });

    if (res.success) {
      if (onSuccess) onSuccess();
    } else {
      setRegError(res.error || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] text-emerald-950 flex flex-col items-center justify-center p-4 selection:bg-rose-500 selection:text-white">
      {/* Branding Header */}
      <div className="text-center mb-6 max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white border-2 border-rose-500 shadow-lg shadow-rose-500/10 mb-3">
          <School className="w-8 h-8 text-rose-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
          {settings.schoolName || 'TeachFlow School'}
        </h1>
        <p className="text-xs text-emerald-700 font-medium mt-1">
          {language === 'bn'
            ? 'সুরক্ষিত পিন কোড দিয়ে নিজের অ্যাকাউন্টে প্রবেশ করুন অথবা নতুন অ্যাকাউন্ট তৈরি করুন'
            : 'Enter with your personal PIN or create your individual account'}
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white border border-emerald-200 rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
        {/* Toggle Mode: Login vs Register */}
        <div className="flex p-1 rounded-2xl bg-emerald-50 border border-emerald-200">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setLoginError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'LOGIN'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-emerald-800 hover:text-emerald-950'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'পিন দিয়ে প্রবেশ' : 'PIN Login'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('REGISTER');
              setRegError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'REGISTER'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-emerald-800 hover:text-emerald-950'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'নতুন একাউন্ট খুলুন' : 'Create Account'}</span>
          </button>
        </div>

        {/* ================= MODE: LOGIN ================= */}
        {mode === 'LOGIN' && (
          <div className="space-y-5">
            {/* Account Selector */}
            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1.5">
                {language === 'bn' ? '১. আপনার অ্যাকাউন্ট নির্বাচন করুন:' : '1. Select Your Account:'}
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {allUsers.map(user => {
                  const isSelected = (selectedUser?.id || allUsers[0]?.id) === user.id;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setLoginError(null);
                        setEnteredPin('');
                      }}
                      className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                          : 'bg-white border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          user.role === 'ADMIN'
                            ? 'bg-rose-100 text-rose-700'
                            : user.role === 'TEACHER'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {user.name.slice(0, 1)}
                        </div>
                        <div className="truncate">
                          <span className="font-bold text-xs text-emerald-950 block truncate">
                            {user.name}
                          </span>
                          <span className="text-[10px] text-emerald-700 block truncate">
                            {user.designation} • {user.employeeId}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                        user.role === 'ADMIN'
                          ? 'bg-rose-100 text-rose-700'
                          : user.role === 'TEACHER'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {user.role === 'ADMIN' ? 'অ্যাডমিন' : user.role === 'TEACHER' ? 'শিক্ষক' : 'কর্মচারী'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PIN Entry Display */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-emerald-900">
                  {language === 'bn' ? '২. আপনার ৪-সংখ্যার পিন (PIN) দিন:' : '2. Enter 4-Digit Security PIN:'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-[11px] text-emerald-700 hover:text-emerald-950 font-medium flex items-center gap-1 cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPin ? 'লুকান' : 'দেখান'}</span>
                </button>
              </div>

              {/* PIN Box Dots */}
              <div className="flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                {[0, 1, 2, 3].map(index => {
                  const hasValue = enteredPin.length > index;
                  return (
                    <div
                      key={index}
                      className={`w-11 h-12 rounded-xl border-2 flex items-center justify-center font-mono text-xl font-black transition-all ${
                        hasValue
                          ? 'bg-white border-rose-500 text-rose-600 shadow-sm scale-105'
                          : 'bg-white/60 border-emerald-200 text-emerald-300'
                      }`}
                    >
                      {hasValue ? (showPin ? enteredPin[index] : '●') : ''}
                    </div>
                  );
                })}
              </div>

              {/* Error message */}
              {loginError && (
                <div className="mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{loginError}</span>
                </div>
              )}
            </div>

            {/* Digital Keypad for Quick Mobile / Touch Entry */}
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadPress(num)}
                  className="py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-950 text-lg font-black border border-emerald-200 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setEnteredPin('')}
                className="py-3 rounded-2xl bg-white hover:bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                {language === 'bn' ? 'ক্লিয়ার' : 'Clear'}
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-950 text-lg font-black border border-emerald-200 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="py-3 rounded-2xl bg-white hover:bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 transition-all cursor-pointer shadow-sm active:scale-95"
                title="Backspace"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              disabled={isLoading || enteredPin.length < 4}
              onClick={() => handlePinLogin()}
              className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isLoading ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন ও অ্যাকাউন্টে প্রবেশ করুন'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Helper Note */}
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 text-center">
              💡 <strong>টিপস:</strong> ডেমো সকল ইউজারের ডিফল্ট পিন <strong className="text-rose-600 font-mono font-bold">1234</strong>। আপনি চাইলে "নতুন একাউন্ট খুলুন" থেকে নিজের পছন্দমত পিন দিয়ে নতুন একাউন্ট খুলে প্রবেশ করতে পারেন।
            </div>
          </div>
        )}

        {/* ================= MODE: REGISTER ================= */}
        {mode === 'REGISTER' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-emerald-950 mb-1">
                {language === 'bn' ? 'নতুন অ্যাকাউন্ট নিবন্ধন ফর্ম' : 'Create Your Personal Profile'}
              </h3>
              <p className="text-[11px] text-emerald-700">
                {language === 'bn'
                  ? 'আপনার নিজের নাম ও পছন্দের সিক্রেট পিন দিয়ে অ্যাকাউন্ট তৈরি করুন।'
                  : 'Register your account with your own custom security PIN.'}
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1">
                {language === 'bn' ? 'আপনার পূর্ণ নাম *' : 'Full Name *'}
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={e => setRegName(e.target.value)}
                placeholder={language === 'bn' ? 'যেমন: মোহাম্মদ আরিফুল ইসলাম' : 'e.g. John Doe'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-950 text-xs focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1">
                {language === 'bn' ? 'আপনার ভূমিকা (Role) *' : 'Select Role *'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { role: 'TEACHER' as UserRole, label: language === 'bn' ? 'শিক্ষক' : 'Teacher' },
                  { role: 'EMPLOYEE' as UserRole, label: language === 'bn' ? 'কর্মচারী' : 'Staff' },
                  { role: 'ADMIN' as UserRole, label: language === 'bn' ? 'প্রধান শিক্ষক' : 'Principal' }
                ].map(r => (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => {
                      setRegRole(r.role);
                      if (r.role === 'TEACHER') {
                        setRegDesignation('সহকারী শিক্ষক');
                        setRegDepartment('বিজ্ঞান ও গণিত');
                      } else if (r.role === 'EMPLOYEE') {
                        setRegDesignation('অফিস সহকারী');
                        setRegDepartment('প্রশাসন');
                      } else {
                        setRegDesignation('প্রধান শিক্ষক');
                        setRegDepartment('প্রশাসন');
                      }
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      regRole === r.role
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Phone */}
            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1">
                {language === 'bn' ? 'মোবাইল নম্বর *' : 'Mobile Phone *'}
              </label>
              <input
                type="tel"
                required
                value={regPhone}
                onChange={e => setRegPhone(e.target.value)}
                placeholder="01711-XXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-950 text-xs focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
              />
            </div>

            {/* Designation & Department */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1">
                  {language === 'bn' ? 'পদবী' : 'Designation'}
                </label>
                <input
                  type="text"
                  value={regDesignation}
                  onChange={e => setRegDesignation(e.target.value)}
                  placeholder="পদবী"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-950 text-xs focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1">
                  {language === 'bn' ? 'বিভাগ / বিষয়' : 'Department'}
                </label>
                <input
                  type="text"
                  value={regDepartment}
                  onChange={e => setRegDepartment(e.target.value)}
                  placeholder="বিভাগ"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-950 text-xs focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                />
              </div>
            </div>

            {/* Custom PIN Setup */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
              <span className="text-xs font-black text-rose-700 block">
                🔐 {language === 'bn' ? 'আপনার ব্যক্তিগত সিক্রেট পিন নির্ধারণ করুন:' : 'Set Your Personal PIN:'}
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                    {language === 'bn' ? '৪-সংখ্যার পিন *' : '4-Digit PIN *'}
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={regPin}
                    onChange={e => setRegPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="যেমন: 5678"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-950 text-center font-mono font-black text-base tracking-widest focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                    {language === 'bn' ? 'পিন নিশ্চিত করুন *' : 'Confirm PIN *'}
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={regConfirmPin}
                    onChange={e => setRegConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="পুনরায় দিন"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-950 text-center font-mono font-black text-base tracking-widest focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {regError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{regError}</span>
              </div>
            )}

            {/* Register Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isLoading ? 'তৈরি করা হচ্ছে...' : 'অ্যাকাউন্ট তৈরি করুন ও লগইন করুন'}</span>
            </button>
          </form>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center mt-6 text-xs text-emerald-700">
        TeachFlow • {settings.tagline || 'Teach. Track. Manage.'}
      </div>
    </div>
  );
};
