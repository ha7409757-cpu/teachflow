/**
 * TeachFlow School Configuration & Audit Center
 * Manage school profile, timing parameters, 2-admin rule enforcement,
 * and review security audit trail.
 */

import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Clock,
  Building,
  Save,
  CheckCircle2,
  Lock,
  List,
  UserCheck,
  UserPlus,
  Trash2,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const AdminSettings: React.FC = () => {
  const { allUsers, approveUser, deleteUser } = useAuth();
  const { settings, updateSchoolSettings, auditLogs, language } = useApp();

  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [schoolCode, setSchoolCode] = useState(settings.schoolCode);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [defaultDuration, setDefaultDuration] = useState(settings.defaultClassDurationMinutes);
  const [lateThreshold, setLateThreshold] = useState(settings.lateThresholdMinutes);
  const [reminderMinutes, setReminderMinutes] = useState(settings.reminderMinutesBeforeClass);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const admins = allUsers.filter(u => u.role === 'ADMIN');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolSettings({
      schoolName,
      tagline,
      schoolCode,
      address,
      phone,
      email,
      defaultClassDurationMinutes: Number(defaultDuration),
      lateThresholdMinutes: Number(lateThreshold),
      reminderMinutesBeforeClass: Number(reminderMinutes)
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-emerald-200 pb-4">
        <h1 className="text-2xl font-extrabold text-emerald-950 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-rose-600" />
          <span>{language === 'bn' ? 'বিদ্যালয় সেটিংস ও সিস্টেম নিরাপত্তা' : 'School Settings & System Security'}</span>
        </h1>
        <p className="text-xs text-emerald-700 mt-0.5">
          {language === 'bn' ? 'প্রাতিষ্ঠানিক প্রোফাইল, ক্লাস সময়সূচী এবং প্রশাসনিক নিরাপত্তা সেটিংস।' : 'General institutional configuration, class timing rules, and admin security guardrails.'}
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in zoom-in duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>{language === 'bn' ? 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে।' : 'School settings updated successfully.'}</span>
        </div>
      )}

      {/* SECTION 1: STRICT 2-ADMIN POLICY ENFORCEMENT */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-emerald-200 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-600">
              <ShieldCheck className="w-5 h-5" />
              <h2 className="text-base font-black text-emerald-950 uppercase tracking-tight">
                {language === 'bn' ? 'প্রশাসনিক শাসন: সর্বোচ্চ ২ জন অ্যাডমিন' : 'Administrative Governance: Exactly 2 Admins Enforced'}
              </h2>
            </div>
            <p className="text-xs text-emerald-700 mt-1 max-w-2xl leading-relaxed">
              {language === 'bn' 
                ? 'TeachFlow সিস্টেমে সর্বোচ্চ ২ জন অ্যাডমিন একাউন্ট অনুমোদিত। এটি ডাটা নিরাপত্তা এবং জবাবদিহিতা নিশ্চিত করতে সাহায্য করে।' 
                : 'To guarantee accountability, prevent administrative privilege proliferation, and protect institutional data, TeachFlow enforces a hard limit of exactly two Administrator accounts.'}
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 font-mono">
            {admins.length} / 2 ACTIVE
          </span>
        </div>

        {/* Current Admins List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {admins.map((adm, idx) => (
            <div
              key={adm.id}
              className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-white text-emerald-700 border border-emerald-200 flex items-center justify-center font-black text-sm shadow-sm">
                #{idx + 1}
              </div>
              <div className="truncate">
                <span className="font-black text-emerald-950 text-sm block truncate">{adm.name}</span>
                <span className="text-[11px] text-emerald-700 block font-bold">{adm.designation}</span>
                <span className="text-[10px] text-emerald-600 font-mono block opacity-80">{adm.email}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-[10px] font-bold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100 flex items-center gap-2">
          <Lock className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'সিস্টেম সুরক্ষা সক্রিয়: ৩য় কোনো অ্যাডমিন একাউন্ট তৈরি করা সম্ভব নয়।' : 'System Guardrail Active: The system blocks any attempt to provision a 3rd admin account.'}</span>
        </div>
      </section>

      {/* SECTION 2: SCHOOL PROFILE SETTINGS FORM */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-emerald-200 shadow-sm space-y-5">
          <h2 className="text-base font-black text-emerald-950 flex items-center gap-2 uppercase tracking-tight">
            <Building className="w-5 h-5 text-rose-600" />
            <span>{language === 'bn' ? 'প্রাতিষ্ঠানিক প্রোফাইল' : 'Institutional Profile'}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-emerald-800 uppercase">{language === 'bn' ? 'প্রতিষ্ঠানের নাম' : 'School Name'}</label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-950 font-bold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-emerald-800 uppercase">{language === 'bn' ? 'মটো / ট্যাগলাইন' : 'Motto / Tagline'}</label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-950 font-bold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-emerald-800 uppercase">{language === 'bn' ? 'EIIN নম্বর' : 'School Code / EIIN'}</label>
              <input
                type="text"
                value={schoolCode}
                onChange={e => setSchoolCode(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-950 font-mono font-bold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-emerald-800 uppercase">{language === 'bn' ? 'অফিশিয়াল ইমেইল' : 'Official Email'}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-950 font-bold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-emerald-800 uppercase">{language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-950 font-bold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-emerald-800 uppercase">{language === 'bn' ? 'ঠিকানা' : 'Campus Address'}</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-950 font-bold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: CLASS & ATTENDANCE PARAMETERS */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-emerald-200 shadow-sm space-y-5">
          <h2 className="text-base font-black text-emerald-950 flex items-center gap-2 uppercase tracking-tight">
            <Clock className="w-5 h-5 text-rose-600" />
            <span>{language === 'bn' ? 'অ্যাকাডেমিক সময়সীমা সেটিংস' : 'Academic Timing Parameters'}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-emerald-800 uppercase">
                {language === 'bn' ? 'পিরিয়ড সময় (মিনিট)' : 'Default Period Duration (mins)'}
              </label>
              <input
                type="number"
                min={15}
                max={120}
                value={defaultDuration}
                onChange={e => setDefaultDuration(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-950 font-bold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-emerald-800 uppercase">
                {language === 'bn' ? 'বিলম্বিত উপস্থিতি (মিনিট)' : 'Late Arrival Threshold (mins)'}
              </label>
              <input
                type="number"
                min={0}
                max={60}
                value={lateThreshold}
                onChange={e => setLateThreshold(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-950 font-bold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-emerald-800 uppercase">
                {language === 'bn' ? 'ক্লাস শুরুর আগে নোটিশ' : 'Class Starting Reminder (mins)'}
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={reminderMinutes}
                onChange={e => setReminderMinutes(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-950 font-bold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 py-3.5 px-8 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-black text-sm shadow-lg shadow-rose-500/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'bn' ? 'সেটিংস সেভ করুন' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* SECTION 4: PENDING ACCOUNT REQUESTS (Already handled in Directory but good here too) */}
      <section className="p-6 sm:p-8 rounded-3xl bg-amber-50 border-2 border-amber-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-emerald-950 flex items-center gap-2 uppercase tracking-tight">
              <UserPlus className="w-5 h-5 text-rose-600" />
              <span>{language === 'bn' ? 'অনুমোদনের জন্য অপেক্ষমাণ একাউন্ট' : 'Pending Account Requests'}</span>
            </h2>
            <p className="text-xs text-emerald-700 mt-1">
              {language === 'bn' ? 'নতুন ব্যবহারকারীদের রেজিস্ট্রেশন আবেদনগুলো এখান থেকে অনুমোদন করুন।' : 'Review and approve new user registration requests before they can access the system.'}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-200 text-amber-900 border border-amber-300 font-mono">
            {allUsers.filter(u => u.status === 'PENDING').length} PENDING
          </span>
        </div>

        <div className="space-y-3 pt-2">
          {allUsers.filter(u => u.status === 'PENDING').length === 0 ? (
            <div className="p-8 text-center bg-white/50 rounded-2xl border border-dashed border-amber-300">
              <UserCheck className="w-8 h-8 text-amber-300 mx-auto mb-2" />
              <p className="text-xs text-amber-800 font-bold">{language === 'bn' ? 'বর্তমানে কোনো পেন্ডিং আবেদন নেই।' : 'No pending registration requests at the moment.'}</p>
            </div>
          ) : (
            allUsers.filter(u => u.status === 'PENDING').map(user => (
              <div key={user.id} className="p-5 rounded-2xl bg-white border border-amber-200 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-lg border border-amber-200 shadow-inner">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-black text-emerald-950 text-base block leading-tight">{user.name}</span>
                      <span className="text-[11px] text-emerald-700 block font-bold mt-0.5">
                        {user.role} • {user.designation} • {user.email}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => approveUser(user.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'অনুমোদন দিন' : 'Approve'}</span>
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[11px] font-bold transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'বাতিল' : 'Reject'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* SECTION 5: SYSTEM ACCESS & SECURITY */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-emerald-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-emerald-950 flex items-center gap-2 uppercase tracking-tight">
              <Lock className="w-5 h-5 text-rose-600" />
              <span>{language === 'bn' ? 'সিস্টেম এক্সেস ও পাসওয়ার্ড' : 'System Access & Security'}</span>
            </h2>
            <p className="text-xs text-emerald-700 mt-1">
              {language === 'bn' ? 'অ্যাডমিন সিকিউরিটি পিন (PIN) পরিবর্তন করুন।' : 'Manage administrative credentials and security PIN.'}
            </p>
          </div>
        </div>

        <AdminPinManager />
      </section>

      {/* SECTION 6: SECURITY AUDIT TRAIL */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-emerald-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-emerald-950 flex items-center gap-2 uppercase tracking-tight">
              <List className="w-5 h-5 text-rose-600" />
              <span>{language === 'bn' ? 'প্রশাসনিক অডিট লগ' : 'Administrative Audit Trail'}</span>
            </h2>
            <p className="text-xs text-emerald-700 mt-1">
              {language === 'bn' ? 'সিস্টেমের গুরুত্বপূর্ণ ইভেন্ট এবং কার্যক্রমের ইতিহাস।' : 'Immutable operational log of administrative operations and class events.'}
            </p>
          </div>

          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-inner">
            {language === 'bn' ? 'ব্যক্তিগত নোট বাদে' : 'Private Notes Strictly Omitted'}
          </span>
        </div>

        <div className="divide-y divide-emerald-100 max-h-80 overflow-y-auto pt-2 bg-emerald-50/30 rounded-2xl border border-emerald-100 px-4">
          {auditLogs.length === 0 ? (
            <p className="text-xs text-emerald-500 py-8 text-center font-bold">{language === 'bn' ? 'কোনো অডিট লগ নেই।' : 'No audit logs recorded yet.'}</p>
          ) : (
            auditLogs.slice(0, 30).map(log => (
              <div key={log.id} className="py-3.5 flex items-center justify-between text-xs group">
                <div className="space-y-0.5">
                  <span className="font-black text-emerald-900 block group-hover:text-rose-600 transition-colors uppercase tracking-wide text-[10px]">{log.action}</span>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    By <strong className="text-emerald-950">{log.actorName}</strong> ({log.actorRole}) • {log.details}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-500 font-mono font-bold whitespace-nowrap ml-4">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

const AdminPinManager: React.FC = () => {
  const { currentUser, changePin } = useAuth();
  const { language } = useApp();
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPin !== confirmPin) {
      setError(language === 'bn' ? 'নতুন পিন দুটি মেলেনি।' : 'New PINs do not match.');
      return;
    }

    const res = await changePin(oldPin, newPin);
    if (res.success) {
      setSuccess(true);
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    } else {
      setError(res.error || (language === 'bn' ? 'পিন পরিবর্তন করা সম্ভব হয়নি।' : 'Failed to change PIN.'));
    }
  };

  return (
    <div className="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-[11px] font-black text-emerald-800 uppercase">{language === 'bn' ? 'বর্তমান অ্যাডমিন পিন' : 'Current Admin PIN'}</label>
          <input
            type="password"
            maxLength={6}
            required
            value={oldPin}
            onChange={e => setOldPin(e.target.value.replace(/\D/g, ''))}
            placeholder="****"
            className="w-full px-4 py-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-sm text-emerald-950 font-mono font-black focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black text-emerald-800 uppercase">{language === 'bn' ? 'নতুন পিন' : 'New Security PIN'}</label>
            <input
              type="password"
              maxLength={6}
              required
              value={newPin}
              onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
              placeholder="****"
              className="w-full px-4 py-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-sm text-emerald-950 font-mono font-black focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black text-emerald-800 uppercase">{language === 'bn' ? 'নিশ্চিত করুন' : 'Confirm New PIN'}</label>
            <input
              type="password"
              maxLength={6}
              required
              value={confirmPin}
              onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              placeholder="****"
              className="w-full px-4 py-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-sm text-emerald-950 font-mono font-black focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
            />
          </div>
        </div>

        {error && <p className="text-[11px] text-rose-600 font-black bg-rose-50 p-2.5 rounded-lg border border-rose-100">{error}</p>}
        {success && <p className="text-[11px] text-emerald-700 font-black bg-emerald-100 p-2.5 rounded-lg border border-emerald-200">{language === 'bn' ? 'পিন সফলভাবে আপডেট হয়েছে!' : 'Admin PIN updated successfully!'}</p>}

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm transition-all active:scale-[0.98] shadow-lg shadow-rose-500/20"
        >
          {language === 'bn' ? 'অ্যাডমিন এক্সেস পিন আপডেট করুন' : 'Update Admin Access PIN'}
        </button>
      </form>
    </div>
  );
};
