/**
 * SyncStatusBadge & Network Control Component
 * Visually communicates offline status, sync queue progress,
 * and enables testing offline mode with a direct toggle in Red & Green theme with Bengali support.
 */

import React from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SyncStatusBadge: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const {
    isOnline,
    toggleOnlineStatus,
    syncState,
    pendingSyncCount,
    lastSyncTime,
    triggerManualSync,
    language
  } = useApp();

  return (
    <div className="flex items-center gap-2">
      {/* Network Online/Offline Toggle Button */}
      <button
        onClick={toggleOnlineStatus}
        title={
          isOnline
            ? (language === 'bn' ? 'অনলাইন মোড চালু। অফলাইন মোড পরীক্ষা করতে ক্লিক করুন।' : 'Simulating Online. Click to simulate Offline mode.')
            : (language === 'bn' ? 'অফলাইন মোড চালু। অনলাইন মোড চালু করতে ক্লিক করুন।' : 'Simulating Offline. Click to simulate Online mode.')
        }
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-200 border cursor-pointer ${
          isOnline
            ? 'bg-emerald-800 border-emerald-600 text-white hover:bg-emerald-900'
            : 'bg-rose-600 border-rose-400 text-white hover:bg-rose-700 animate-pulse'
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="w-3.5 h-3.5 text-emerald-200" />
            <span className={compact ? 'hidden sm:inline' : ''}>
              {language === 'bn' ? 'অনলাইন' : 'Online'}
            </span>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5 text-white" />
            <span className={compact ? 'hidden sm:inline' : ''}>
              {language === 'bn' ? 'অফলাইন মোড' : 'Offline Mode'}
            </span>
          </>
        )}
      </button>

      {/* Sync State Pill */}
      <button
        onClick={triggerManualSync}
        disabled={!isOnline || syncState === 'SYNCING'}
        title={
          language === 'bn'
            ? `সিঙ্ক অবস্থা: ${syncState}। সর্বশেষ সিঙ্ক: ${lastSyncTime}। ম্যানুয়াল সিঙ্কের জন্য ক্লিক করুন।`
            : `Sync Status: ${syncState}. Last Sync: ${lastSyncTime}. Click to sync.`
        }
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors border cursor-pointer ${
          syncState === 'SYNCING'
            ? 'bg-white border-rose-300 text-rose-700'
            : syncState === 'WAITING_TO_SYNC'
            ? 'bg-rose-100 border-rose-300 text-rose-700 hover:bg-rose-200'
            : syncState === 'ERROR'
            ? 'bg-rose-100 border-rose-400 text-rose-700'
            : 'bg-emerald-800 border-emerald-600 text-emerald-100 hover:bg-emerald-900'
        }`}
      >
        {syncState === 'SYNCING' && (
          <>
            <RefreshCw className="w-3.5 h-3.5 text-rose-600 animate-spin" />
            <span className={compact ? 'hidden md:inline' : ''}>
              {language === 'bn' ? 'সিঙ্ক হচ্ছে...' : 'Syncing...'}
            </span>
          </>
        )}
        {syncState === 'WAITING_TO_SYNC' && (
          <>
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            <span>
              {pendingSyncCount} {compact ? '' : (language === 'bn' ? 'অপেক্ষমান' : 'Queued')}
            </span>
          </>
        )}
        {syncState === 'SYNCED' && (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            <span className={compact ? 'hidden lg:inline' : ''}>
              {language === 'bn' ? 'সিঙ্ক সম্পন্ন' : 'Synced'}
            </span>
          </>
        )}
        {syncState === 'ERROR' && (
          <>
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>{language === 'bn' ? 'পুনরায় চেষ্টা' : 'Sync Retry'}</span>
          </>
        )}
      </button>
    </div>
  );
};
