/**
 * TeachFlow Live Classes Real-Time Monitor
 * Live tracking of ongoing classroom sessions across all grades and rooms.
 */

import React, { useState, useEffect } from 'react';
import { Radio, Clock, CheckCircle2, MapPin, User, Calendar, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTodayDateString } from '../../services/storage';

export const LiveClassesMonitor: React.FC = () => {
  const { routines, classSessions } = useApp();
  const [nowTime, setNowTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNowTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = getTodayDateString();
  const todayDay = nowTime.getDay();

  const todaySessions = classSessions.filter(s => s.date === todayStr);
  const runningSessions = todaySessions.filter(s => s.status === 'RUNNING');
  const completedSessions = todaySessions.filter(s => s.status === 'COMPLETED');

  // Find upcoming scheduled classes today that have not been started or completed
  const todayRoutines = routines.filter(r => r.dayOfWeek === todayDay);
  const upcomingRoutines = todayRoutines.filter(r => {
    const isStarted = todaySessions.some(s => s.routineId === r.id);
    return !isStarted;
  });

  const calculateLiveDuration = (actualStart?: string) => {
    if (!actualStart) return '0 min';
    const [sh, sm] = actualStart.split(':').map(Number);
    const startMs = new Date().setHours(sh, sm, 0, 0);
    const diffSec = Math.max(0, Math.floor((nowTime.getTime() - startMs) / 1000));
    const mins = Math.floor(diffSec / 60);
    const secs = diffSec % 60;
    return `${mins}m ${String(secs).padStart(2, '0')}s`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Live Classroom Monitor
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time status of academic sessions across Dhaka Model Academy & College.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono self-start sm:self-auto">
          Sync Status: <span className="text-emerald-400 font-bold">Active</span>
        </div>
      </div>

      {/* Synchronized Notice Info */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0" />
        <span>
          Note: Classes started offline by teachers will appear on this live monitor as soon as the teacher device connects and syncs.
        </span>
      </div>

      {/* SECTION 1: ACTIVELY RUNNING CLASSES */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
          <Radio className="w-4 h-4" />
          <span>Active In Classrooms ({runningSessions.length})</span>
        </h2>

        {runningSessions.length === 0 ? (
          <div className="p-10 rounded-3xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
            No classes are currently in progress.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {runningSessions.map(sess => (
              <div
                key={sess.id}
                className="p-6 rounded-3xl bg-slate-900 border-2 border-emerald-500/40 shadow-xl shadow-emerald-950/20 relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>RUNNING</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                    Live: {calculateLiveDuration(sess.actualStart)}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                    {sess.classId} {sess.section ? `• ${sess.section}` : ''}
                  </p>
                  <h3 className="text-2xl font-black text-white">{sess.subjectId}</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Teacher</span>
                    <span className="font-semibold text-white flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {sess.teacherName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Room</span>
                    <span className="font-semibold text-indigo-300 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      {sess.roomId}
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-400 font-mono">
                  Started at {sess.actualStart} • Scheduled: {sess.scheduledStart} - {sess.scheduledEnd}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: UPCOMING CLASSES TODAY */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>Upcoming Scheduled Classes Today ({upcomingRoutines.length})</span>
        </h2>

        {upcomingRoutines.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No further classes scheduled for today.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingRoutines.map(r => (
              <div
                key={r.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-indigo-400">
                    {r.startTime} – {r.endTime}
                  </span>
                  <span className="text-slate-400">{r.roomId}</span>
                </div>
                <div className="font-bold text-white text-sm">
                  {r.classId} • {r.subjectId}
                </div>
                <p className="text-xs text-slate-400">
                  Teacher: <span className="text-slate-300">{r.teacherName}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 3: COMPLETED CLASSES TODAY */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Completed Classes Today ({completedSessions.length})</span>
        </h2>

        {completedSessions.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No classes have ended yet today.</p>
        ) : (
          <div className="space-y-2">
            {completedSessions.map(s => (
              <div
                key={s.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white text-sm">
                    {s.classId} • {s.subjectId} ({s.roomId})
                  </span>
                  <p className="text-slate-400 mt-0.5">
                    Teacher: {s.teacherName} • Started: {s.actualStart} • Ended: {s.actualEnd}
                  </p>
                </div>
                <span className="font-mono font-semibold text-slate-300 px-3 py-1 rounded-full bg-slate-800">
                  Duration: {s.durationMinutes || 45} mins
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
