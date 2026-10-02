/**
 * TeachFlow Active Class Screen / Modal
 * Displays live digital timer, elapsed & remaining time,
 * class details, automatic class-end alarm alert, extend class controls (+5, +10, +15 min),
 * and End Class confirmation with Red & Green styling and Bengali support.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Radio,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  X,
  Bell,
  Volume2,
  VolumeX,
  Plus,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { ClassSession } from '../../types';
import { useApp } from '../../context/AppContext';
import { audioService } from '../../services/audio';

interface ActiveClassModalProps {
  session?: ClassSession;
  onClose?: () => void;
}

export const ActiveClassModal: React.FC<ActiveClassModalProps> = ({ session: propSession, onClose }) => {
  const {
    activeClassSession,
    endClassSession,
    extendClassSession,
    isClassEndAlarmActive,
    dismissClassEndAlarm,
    language
  } = useApp();

  const session = propSession || activeClassSession;

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isEnding, setIsEnding] = useState<boolean>(false);
  const [isExtending, setIsExtending] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [showCustomExtend, setShowCustomExtend] = useState<boolean>(false);
  const [customExtendMinutes, setCustomExtendMinutes] = useState<number>(10);
  const [alarmDismissedLocally, setAlarmDismissedLocally] = useState<boolean>(false);

  // Live timer tick
  useEffect(() => {
    if (!session || !session.actualStart) return;
    const calculateElapsed = () => {
      const [sh, sm] = session.actualStart.split(':').map(Number);
      const now = new Date();
      const startMs = new Date().setHours(sh, sm, 0, 0);
      const nowMs = now.getTime();
      return Math.max(0, Math.floor((nowMs - startMs) / 1000));
    };

    setElapsedSeconds(calculateElapsed());

    const interval = setInterval(() => {
      setElapsedSeconds(calculateElapsed());
    }, 1000);

    return () => clearInterval(interval);
  }, [session?.actualStart]);

  if (!session) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-md">
        <div className="bg-emerald-950 border border-emerald-800 rounded-3xl p-6 text-center max-w-sm w-full">
          <p className="text-white font-bold mb-4">
            {language === 'bn' ? 'কোনো চলমান ক্লাস পাওয়া যায়নি' : 'No active class in session'}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    );
  }

  // Calculate scheduled total duration
  let scheduledDurationMinutes = session.durationMinutes || 45;
  if (session.scheduledStart && session.scheduledEnd) {
    const [sh, sm] = session.scheduledStart.split(':').map(Number);
    const [eh, em] = session.scheduledEnd.split(':').map(Number);
    if (!isNaN(sh) && !isNaN(sm) && !isNaN(eh) && !isNaN(em)) {
      const diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff > 0) scheduledDurationMinutes = diff;
    }
  }

  const scheduledDurationSec = scheduledDurationMinutes * 60;
  const remainingSeconds = Math.max(0, scheduledDurationSec - elapsedSeconds);
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / scheduledDurationSec) * 100));
  const isTimeOver = remainingSeconds === 0;

  // Active alarm condition
  const shouldShowAlarm = (isClassEndAlarmActive || isTimeOver) && !alarmDismissedLocally;

  const formatSeconds = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleEndClass = async () => {
    setIsEnding(true);
    await endClassSession(session.id);
    setIsEnding(false);
    if (onClose) onClose();
  };

  const handleExtend = async (minutes: number) => {
    setIsExtending(true);
    setAlarmDismissedLocally(true);
    dismissClassEndAlarm();
    await extendClassSession(session.id, minutes);
    setIsExtending(false);
    setShowCustomExtend(false);
  };

  const handleTestAlarm = () => {
    audioService.playClassEndAlarm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border-2 border-emerald-500 rounded-3xl p-5 sm:p-7 max-w-lg w-full mx-auto shadow-2xl relative overflow-hidden my-auto">
        {/* Close / Minimize Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-emerald-700 hover:text-emerald-950 hover:bg-emerald-50 transition-colors z-10 cursor-pointer"
            title={language === 'bn' ? 'মিনিমাইজ করুন' : 'Minimize'}
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* ALARM BANNER (When time is up or alarm fired) */}
        <AnimatePresence>
          {shouldShowAlarm && (
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-rose-700 text-white shadow-lg border border-rose-300 relative overflow-hidden"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white/20 rounded-xl animate-bounce">
                    <Bell className="w-5 h-5 text-amber-200 fill-amber-300" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-white flex items-center gap-1.5">
                      <span>{language === 'bn' ? 'ক্লাস সমাপ্তির অ্যালার্ম বাজছে!' : 'Class End Alarm Ringing!'}</span>
                    </h4>
                    <p className="text-[11px] text-rose-100 font-medium mt-0.5">
                      {language === 'bn'
                        ? 'নির্ধারিত সময় পূর্ণ হয়েছে। ক্লাস সমাপ্ত করুন অথবা সময় বৃদ্ধি করুন।'
                        : 'Scheduled time completed. End class or extend duration below.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setAlarmDismissedLocally(true);
                      dismissClassEndAlarm();
                    }}
                    className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors cursor-pointer"
                    title={language === 'bn' ? 'অ্যালার্ম নিঃশব্দ করুন' : 'Mute alarm'}
                  >
                    <VolumeX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Badge */}
        <div className="flex items-center justify-between mb-4 pr-8">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-300 text-rose-700 text-xs font-bold shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
            <span>{language === 'bn' ? 'লাইভ ক্লাস চলমান' : 'CLASS IN PROGRESS'}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-800 font-mono">
              {language === 'bn' ? 'রুম:' : 'Room:'} <strong className="text-emerald-950">{session.roomId}</strong>
            </span>
          </div>
        </div>

        {/* Class & Subject Heading */}
        <div className="text-center mb-5">
          <p className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">
            {session.classId} {session.section ? `• ${session.section}` : ''}
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
            {session.subjectId}
          </h2>
          <p className="text-xs text-emerald-700 mt-1">
            {language === 'bn' ? 'শিক্ষক:' : 'Teacher:'} <span className="text-emerald-950 font-bold">{session.teacherName}</span>
          </p>
        </div>

        {/* Live Digital Timer Display */}
        <div className={`flex flex-col items-center justify-center p-5 rounded-2xl border shadow-inner mb-4 transition-colors ${
          isTimeOver
            ? 'bg-rose-50/80 border-rose-300'
            : 'bg-emerald-50/80 border-emerald-200'
        }`}>
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              {language === 'bn' ? 'চলমান সময়' : 'Elapsed Time'}
            </span>
            <button
              onClick={handleTestAlarm}
              className="text-[11px] font-bold text-emerald-700 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
              title="Test school bell chime"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'অ্যালার্ম পরীক্ষা' : 'Test Bell'}</span>
            </button>
          </div>

          <div className={`text-5xl sm:text-6xl font-black font-mono tracking-tight transition-colors ${
            isTimeOver ? 'text-rose-600 animate-pulse' : 'text-emerald-950'
          }`}>
            {formatSeconds(elapsedSeconds)}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-emerald-200 h-2.5 rounded-full mt-3 overflow-hidden border border-emerald-300">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isTimeOver
                  ? 'bg-rose-600'
                  : 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-rose-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between w-full text-xs text-emerald-800 mt-2.5 font-mono">
            <span>{language === 'bn' ? 'শুরু:' : 'Started:'} {session.actualStart || session.scheduledStart}</span>
            <span>
              {remainingSeconds > 0 ? (
                <span className="text-rose-600 font-bold">
                  {Math.ceil(remainingSeconds / 60)} {language === 'bn' ? 'মিনিট বাকি' : 'min remaining'}
                </span>
              ) : (
                <span className="text-rose-700 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                  {language === 'bn' ? 'নির্ধারিত সময় সমাপ্ত' : 'Time Ended'}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Extension Badge (If class was previously extended) */}
        {session.extendedMinutes && session.extendedMinutes > 0 && (
          <div className="mb-4 p-2.5 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-between text-xs text-amber-900 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>
                <strong>{language === 'bn' ? 'সময় বর্ধিত:' : 'Extended:'}</strong> +{session.extendedMinutes} {language === 'bn' ? 'মিনিট' : 'mins'}
              </span>
            </div>
            <span className="font-mono text-[11px] text-amber-800">
              {session.originalScheduledEnd ? `${session.originalScheduledEnd} ➔ ` : ''}{session.scheduledEnd}
            </span>
          </div>
        )}

        {/* EXTEND CLASS CONTROLS */}
        <div className="mb-5 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span>{language === 'bn' ? 'ক্লাসের সময় বৃদ্ধি করুন (Extend Time)' : 'Extend Class Duration'}</span>
            </span>
            <span className="text-[11px] text-emerald-700 font-mono">
              {language === 'bn' ? 'নির্ধারিত সমাপ্তি:' : 'End at:'} {session.scheduledEnd}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleExtend(5)}
              disabled={isExtending}
              className="py-2 px-1 rounded-xl bg-white hover:bg-emerald-600 hover:text-white border border-emerald-300 text-emerald-900 font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer text-center"
            >
              +5 {language === 'bn' ? 'মি.' : 'min'}
            </button>
            <button
              onClick={() => handleExtend(10)}
              disabled={isExtending}
              className="py-2 px-1 rounded-xl bg-white hover:bg-emerald-600 hover:text-white border border-emerald-300 text-emerald-900 font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer text-center"
            >
              +10 {language === 'bn' ? 'মি.' : 'min'}
            </button>
            <button
              onClick={() => handleExtend(15)}
              disabled={isExtending}
              className="py-2 px-1 rounded-xl bg-white hover:bg-emerald-600 hover:text-white border border-emerald-300 text-emerald-900 font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer text-center"
            >
              +15 {language === 'bn' ? 'মি.' : 'min'}
            </button>
            <button
              onClick={() => setShowCustomExtend(!showCustomExtend)}
              className="py-2 px-1 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs border border-emerald-300 transition-all cursor-pointer text-center"
            >
              {language === 'bn' ? 'অন্যান্য' : 'Custom'}
            </button>
          </div>

          {/* Custom extend input row */}
          {showCustomExtend && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2.5 pt-2.5 border-t border-emerald-200 flex items-center gap-2"
            >
              <input
                type="number"
                min="1"
                max="60"
                value={customExtendMinutes}
                onChange={e => setCustomExtendMinutes(Math.max(1, Number(e.target.value)))}
                className="w-20 px-2.5 py-1.5 rounded-xl bg-white border border-emerald-300 text-xs font-bold text-emerald-950 text-center focus:outline-none focus:border-rose-600"
              />
              <span className="text-xs text-emerald-800">{language === 'bn' ? 'মিনিট যোগ করুন' : 'minutes to add'}</span>
              <button
                onClick={() => handleExtend(customExtendMinutes)}
                disabled={isExtending}
                className="ml-auto py-1.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow transition-colors cursor-pointer"
              >
                {isExtending
                  ? (language === 'bn' ? 'যুক্ত হচ্ছে...' : 'Adding...')
                  : (language === 'bn' ? 'নিশ্চিত' : 'Apply')}
              </button>
            </motion.div>
          )}
        </div>

        {/* Classroom Status Chips */}
        <div className="grid grid-cols-2 gap-2.5 mb-5 text-xs">
          <div className="p-3 rounded-2xl bg-white border border-emerald-200 shadow-sm">
            <span className="text-emerald-700 block mb-0.5">{language === 'bn' ? 'নির্ধারিত স্লট' : 'Scheduled Slot'}</span>
            <span className="font-bold text-emerald-950">
              {session.scheduledStart} – {session.scheduledEnd}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-white border border-emerald-200 shadow-sm">
            <span className="text-emerald-700 block mb-0.5">{language === 'bn' ? 'হাজিরা রেকর্ড' : 'Attendance Status'}</span>
            <span className="font-bold text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {language === 'bn' ? 'স্বয়ংক্রিয়ভাবে সম্পন্ন' : 'Auto-Recorded'}
            </span>
          </div>
        </div>

        {/* PRIMARY ACTION: END CLASS IN RED */}
        {!showConfirmation ? (
          <div className="space-y-2">
            <button
              onClick={() => setShowConfirmation(true)}
              className="w-full py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-extrabold text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{language === 'bn' ? 'ক্লাস সমাপ্ত করুন (END CLASS)' : 'END CLASS'}</span>
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-center space-y-3"
          >
            <p className="text-sm font-bold text-rose-950">
              {language === 'bn' ? 'আপনি কি এখনই এই ক্লাসটি শেষ করতে চান?' : 'Confirm ending this class session now?'}
            </p>
            <p className="text-xs text-rose-800">
              {language === 'bn'
                ? `মোট স্থায়ীকাল: ${formatSeconds(elapsedSeconds)}। সমাপ্ত করার পর হাজিরা ও সেশন সংরক্ষণ হবে।`
                : `Total duration: ${formatSeconds(elapsedSeconds)}. Session and attendance will be archived.`}
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                {language === 'bn' ? 'ক্লাস চালিয়ে যান' : 'Continue Class'}
              </button>
              <button
                onClick={handleEndClass}
                disabled={isEnding}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                {isEnding
                  ? (language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Recording...')
                  : (language === 'bn' ? 'হ্যাঁ, ক্লাস সমাপ্ত' : 'Yes, End Class')}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
