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
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const AdminSettings: React.FC = () => {
  const { allUsers } = useAuth();
  const { settings, updateSchoolSettings, auditLogs } = useApp();

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
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          <span>School Settings & System Security</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          General institutional configuration, class timing rules, and admin security guardrails.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>School settings updated successfully.</span>
        </div>
      )}

      {/* SECTION 1: STRICT 2-ADMIN POLICY ENFORCEMENT (Rule 10 & 11) */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
              <h2 className="text-base font-bold text-white">
                Administrative Governance: Exactly 2 Admins Enforced
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              To guarantee accountability, prevent administrative privilege proliferation, and protect institutional data, TeachFlow enforces a hard limit of exactly two Administrator accounts.
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/40 font-mono">
            {admins.length} / 2 ACTIVE
          </span>
        </div>

        {/* Current Admins List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {admins.map((adm, idx) => (
            <div
              key={adm.id}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                #{idx + 1}
              </div>
              <div className="truncate">
                <span className="font-bold text-white text-sm block truncate">{adm.name}</span>
                <span className="text-xs text-slate-400 block">{adm.designation}</span>
                <span className="text-[11px] text-slate-500 font-mono block">{adm.email}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-[11px] text-slate-500 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          🔒 System Guardrail Active: The user registration controller blocks any attempt to provision a 3rd admin account.
        </div>
      </section>

      {/* SECTION 2: SCHOOL PROFILE SETTINGS FORM */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-400" />
            <span>Institutional Profile</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">School Name</label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Motto / Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">School Code / EIIN</label>
              <input
                type="text"
                value={schoolCode}
                onChange={e => setSchoolCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Official Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Campus Address</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: CLASS & ATTENDANCE PARAMETERS */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <span>Academic Timing Parameters</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Default Period Duration (mins)
              </label>
              <input
                type="number"
                min={15}
                max={120}
                value={defaultDuration}
                onChange={e => setDefaultDuration(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Late Arrival Threshold (mins)
              </label>
              <input
                type="number"
                min={0}
                max={60}
                value={lateThreshold}
                onChange={e => setLateThreshold(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Class Starting Reminder (mins)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={reminderMinutes}
                onChange={e => setReminderMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </form>

      {/* SECTION 4: SECURITY AUDIT TRAIL */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <List className="w-5 h-5 text-indigo-400" />
              <span>Administrative Audit Trail</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Immutable operational log of administrative operations and class events.
            </p>
          </div>

          <span className="text-[10px] text-indigo-300 bg-indigo-950 px-3 py-1 rounded-full border border-indigo-500/30">
            Private Notes Strictly Omitted
          </span>
        </div>

        <div className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto pt-2">
          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No audit logs recorded yet.</p>
          ) : (
            auditLogs.slice(0, 15).map(log => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-white block">{log.action}</span>
                  <span className="text-[11px] text-slate-400">
                    By {log.actorName} ({log.actorRole}) • {log.target}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
