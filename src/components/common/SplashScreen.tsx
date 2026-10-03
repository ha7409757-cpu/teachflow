/**
 * TeachFlow Startup Splash Animation
 * Features Red & Green branding and Bengali welcome.
 */

import React from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-rose-50 text-emerald-950 select-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col items-center max-w-sm px-6 text-center">
        {/* Animated Red-Green Brand Icon */}
        <motion.div
          className="relative flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-700 border-2 border-emerald-400 shadow-xl shadow-emerald-600/20 mb-6"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <GraduationCap className="w-12 h-12 text-white" />
          {/* Ruby Red Badge */}
          <motion.div
            className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center shadow-md shadow-rose-600/30"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </motion.div>
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          className="text-3xl font-black tracking-tight text-emerald-950 mb-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          টিচ<span className="text-rose-600">ফ্লো</span>{' '}
          <span className="text-xs font-semibold text-emerald-700 block sm:inline font-mono">TeachFlow</span>
        </motion.h1>

        {/* Bengali Tagline */}
        <motion.p
          className="text-xs font-bold text-emerald-800 tracking-wide mb-8"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          স্মার্ট স্কুল ও ক্লাস ম্যানেজমেন্ট সিস্টেম
        </motion.p>

        {/* Red-Green Loading Bar */}
        <motion.div
          className="w-44 h-1.5 bg-emerald-100 border border-emerald-300 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-600 via-rose-600 to-emerald-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
            onAnimationComplete={onComplete}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};
