/**
 * TeachFlow QR Scanner Component
 * Supports classroom QR scanning with camera simulation and instant room QR triggers
 * styled in Red & Green theme with Bengali support.
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { QrCode, Camera, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface QRScannerModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ onClose, onSuccess }) => {
  const { startClassByQr, language } = useApp();
  const { currentUser } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [status, setStatus] = useState<'IDLE' | 'SCANNING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [verifiedDetails, setVerifiedDetails] = useState<{ room: string; classId?: string; subject?: string } | null>(null);

  const sampleRooms = [
    { code: 'Room 203', label: language === 'bn' ? 'রুম ২০৩ (ইংরেজি / ৮ম শ্রেণি)' : 'Room 203 (English / Class 8)' },
    { code: 'Room 204', label: language === 'bn' ? 'রুম ২০৪ (গণিত / ৭ম শ্রেণি)' : 'Room 204 (Math / Class 7)' },
    { code: 'Room 201', label: language === 'bn' ? 'রুম ২০১ (ইংরেজি / ৯ম শ্রেণি)' : 'Room 201 (English / Class 9)' },
    { code: 'ICT Lab', label: language === 'bn' ? 'আইসিটি ল্যাব (কম্পিউটিং / ৬ষ্ঠ শ্রেণি)' : 'ICT Lab (Computing / Class 6)' },
    { code: 'Room 101', label: language === 'bn' ? 'রুম ১০১ (বাংলা / ৬ষ্ঠ শ্রেণি)' : 'Room 101 (Bangla / Class 6)' },
    { code: 'Science Lab', label: language === 'bn' ? 'বিজ্ঞান ল্যাব (বিজ্ঞান / ৮ম শ্রেণি)' : 'Science Lab (Science / Class 8)' }
  ];

  const handleScanRoom = async (roomCode: string) => {
    setSelectedRoom(roomCode);
    setStatus('SCANNING');
    setErrorMessage('');

    // Simulate camera scan focus duration
    await new Promise(res => setTimeout(res, 600));

    const result = await startClassByQr(roomCode);

    if (result.success && result.session) {
      setVerifiedDetails({
        room: roomCode,
        classId: result.session.classId,
        subject: result.session.subjectId
      });
      setStatus('SUCCESS');
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
      }, 1200);
    } else {
      setStatus('ERROR');
      setErrorMessage(
        result.error ||
          (language === 'bn'
            ? 'অবৈধ কিউআর কোড অথবা এই সময়ে কোনো ক্লাস নির্ধারিত নেই।'
            : 'Invalid QR code or no class scheduled.')
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border-2 border-emerald-500 rounded-3xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-emerald-50 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 mb-3 shadow-sm">
            <QrCode className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-emerald-950 tracking-tight">
            {language === 'bn' ? 'শ্রেণিকক্ষের কিউআর স্ক্যান' : 'Scan Classroom QR'}
          </h3>
          <p className="text-xs text-emerald-700 mt-1">
            {language === 'bn'
              ? 'শ্রেণিকক্ষের দরজায় লাগানো কিউআর কোডের দিকে ক্যামেরা তাক করুন।'
              : 'Point camera at the QR code posted at the classroom entrance.'}
          </p>
        </div>

        {/* Simulated Camera Viewport */}
        <div className="relative aspect-square max-w-[250px] mx-auto rounded-3xl bg-emerald-50/60 border-2 border-emerald-400 flex items-center justify-center overflow-hidden mb-6 shadow-inner">
          {/* Corner Markers in Rose Red */}
          <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-rose-500" />
          <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-rose-500" />
          <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-rose-500" />
          <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-rose-500" />

          {status === 'SCANNING' && (
            <div className="absolute inset-x-0 h-1 bg-rose-600 shadow-md shadow-rose-600/50 animate-scan-line" />
          )}

          {status === 'IDLE' && (
            <div className="flex flex-col items-center gap-2 text-emerald-700 text-center px-4">
              <Camera className="w-10 h-10 animate-pulse-subtle" />
              <span className="text-xs font-semibold">{language === 'bn' ? 'ক্যামেরা সক্রিয়' : 'Camera Feed Ready'}</span>
            </div>
          )}

          {status === 'SCANNING' && (
            <div className="flex flex-col items-center gap-2 text-rose-600">
              <span className="text-xs font-bold uppercase tracking-wider">
                {language === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying Schedule...'}
              </span>
              <span className="text-[11px] text-emerald-800 font-mono font-bold">{selectedRoom}</span>
            </div>
          )}

          {status === 'SUCCESS' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-2 text-emerald-700 text-center px-4"
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              <span className="text-sm font-black">
                {language === 'bn' ? '✓ শ্রেণিকক্ষ যাচাই সম্পন্ন' : '✓ ROOM VERIFIED'}
              </span>
              <span className="text-xs text-emerald-950 font-bold">
                {verifiedDetails?.room} • {verifiedDetails?.classId}
              </span>
            </motion.div>
          )}

          {status === 'ERROR' && (
            <div className="flex flex-col items-center gap-2 text-rose-600 text-center px-4">
              <AlertCircle className="w-10 h-10" />
              <span className="text-xs font-bold">
                {language === 'bn' ? 'যাচাই ব্যর্থ হয়েছে' : 'Verification Failed'}
              </span>
            </div>
          )}
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Instant Classroom QR Picker for seamless testing */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider text-center">
            {language === 'bn' ? 'সরাসরি রুম সিলেক্ট করে টেস্ট করুন' : 'Tap Classroom QR to Check-in'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {sampleRooms.map(room => (
              <button
                key={room.code}
                onClick={() => handleScanRoom(room.code)}
                disabled={status === 'SCANNING' || status === 'SUCCESS'}
                className="p-2.5 rounded-2xl bg-emerald-50/50 hover:bg-rose-50 hover:border-rose-300 border border-emerald-200 text-left transition-all text-xs active:scale-[0.98] cursor-pointer"
              >
                <div className="font-bold text-emerald-950 truncate">{room.code}</div>
                <div className="text-[10px] text-emerald-700 truncate">{room.label}</div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

